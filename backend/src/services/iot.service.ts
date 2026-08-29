import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { audit } from '../lib/audit';

// Payload esperado do Mock de IoT (REQ-NFR-004).
const telemetrySchema = z.object({
  machine_id: z.string().uuid('machine_id deve ser UUID'),
  timestamp: z.string().datetime('timestamp deve ser ISO 8601'),
  status_operacional: z.enum(['RUNNING', 'IDLE', 'FAULT']),
  ciclos_produzidos: z.number().int('ciclos_produzidos deve ser inteiro').min(0),
});

// Máquina -> instante (epoch ms) em que entrou em FAULT (parada não programada).
const faultStart = new Map<string, number>();

interface ShiftLike {
  id: string;
  startTime: string;
  endTime: string;
}

// Encontra o turno cujo intervalo contém "hh:mm" (suporta virada de meia-noite).
export function findShiftForTime(shifts: ShiftLike[], hhmm: string): ShiftLike | undefined {
  return shifts.find((s) => {
    if (s.startTime <= s.endTime) return hhmm >= s.startTime && hhmm < s.endTime;
    return hhmm >= s.startTime || hhmm < s.endTime; // cruza a meia-noite
  });
}

// Consolida os ciclos em apontamento (source=IOT) com transação serializável
// e incremento atômico — evita que o acréscimo automático sobreponha o manual.
async function upsertIotRecord(
  machineId: string,
  shiftId: string,
  date: Date,
  ciclos: number,
  downtimeMinutes: number,
): Promise<void> {
  await prisma.$transaction(
    async (tx) => {
      const existing = await tx.productionRecord.findFirst({
        where: { machineId, shiftId, date, source: 'IOT' },
      });

      if (existing) {
        await tx.productionRecord.update({
          where: { id: existing.id },
          data: {
            quantity: { increment: ciclos },
            ...(downtimeMinutes > 0 ? { downtimeMinutes: { increment: downtimeMinutes } } : {}),
          },
        });
      } else {
        await tx.productionRecord.create({
          data: { machineId, shiftId, date, quantity: ciclos, downtimeMinutes, source: 'IOT' },
        });
      }
    },
    { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
  );
}

export async function ingestTelemetry(payload: unknown): Promise<void> {
  const parsed = telemetrySchema.safeParse(payload);
  if (!parsed.success) {
    await audit('IOT_INVALID_PAYLOAD', JSON.stringify(payload));
    return;
  }

  const { machine_id, timestamp, status_operacional, ciclos_produzidos } = parsed.data;

  // Máquina desconhecida => registra na auditoria e descarta.
  const machine = await prisma.machine.findUnique({ where: { id: machine_id } });
  if (!machine || !machine.active) {
    await audit('IOT_UNKNOWN_MACHINE', `machine_id=${machine_id}`);
    return;
  }

  const ts = new Date(timestamp);
  const date = ts.toISOString().slice(0, 10);
  const hhmm = ts.toISOString().slice(11, 16);

  const shifts = await prisma.shift.findMany({ orderBy: { startTime: 'asc' } });
  const shift = findShiftForTime(shifts, hhmm);
  if (!shift) {
    await audit('IOT_NO_SHIFT', `machine_id=${machine_id} hhmm=${hhmm}`);
    return;
  }

  // Parada não programada: mede o tempo em FAULT.
  let downtimeMinutes = 0;
  const epoch = ts.getTime();
  if (status_operacional === 'FAULT') {
    if (!faultStart.has(machine_id)) faultStart.set(machine_id, epoch);
  } else if (faultStart.has(machine_id)) {
    const started = faultStart.get(machine_id)!;
    downtimeMinutes = Math.max(0, Math.round((epoch - started) / 60000));
    faultStart.delete(machine_id);
  }

  await upsertIotRecord(machine_id, shift.id, new Date(`${date}T00:00:00Z`), ciclos_produzidos, downtimeMinutes);
}
