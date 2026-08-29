import { PrismaClient, Role, Unit } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// UUIDs fixos das máquinas seed — o mock-iot emite estes MESMOS IDs
// (ver mock-iot/src/server.ts). Mantê-los sincronizados garante que a
// telemetria simulada seja correlacionada a máquinas pré-cadastradas.
export const MACHINE_IDS = {
  prensa: '11111111-1111-4111-8111-111111111111',
  injetora: '22222222-2222-4222-8222-222222222222',
  misturador: '33333333-3333-4333-8333-333333333333',
};

async function main() {
  const gestorPassword = await bcrypt.hash(process.env.GESTOR_PASSWORD ?? 'Gestor@123', 10);
  const operadorPassword = await bcrypt.hash(process.env.OPERADOR_PASSWORD ?? 'Operador@123', 10);

  await prisma.user.upsert({
    where: { email: process.env.GESTOR_EMAIL ?? 'gestor@prs.com.br' },
    update: {},
    create: {
      email: process.env.GESTOR_EMAIL ?? 'gestor@prs.com.br',
      name: 'Gestor de Produção',
      password: gestorPassword,
      role: Role.GESTOR,
    },
  });

  await prisma.user.upsert({
    where: { email: process.env.OPERADOR_EMAIL ?? 'operador@prs.com.br' },
    update: {},
    create: {
      email: process.env.OPERADOR_EMAIL ?? 'operador@prs.com.br',
      name: 'Operador de Chão de Fábrica',
      password: operadorPassword,
      role: Role.OPERADOR,
    },
  });

  const machines = [
    { id: MACHINE_IDS.prensa, name: 'Prensa Hidráulica', code: 'PRENSA-01', unit: Unit.pieces },
    { id: MACHINE_IDS.injetora, name: 'Injetora de Plástico', code: 'INJET-01', unit: Unit.pieces },
    { id: MACHINE_IDS.misturador, name: 'Misturador Químico', code: 'MIST-01', unit: Unit.liters },
  ];

  for (const m of machines) {
    await prisma.machine.upsert({
      where: { code: m.code },
      update: { id: m.id, name: m.name, unit: m.unit },
      create: m,
    });
  }

  const shifts = [
    { name: 'Turno Madrugada', startTime: '00:00', endTime: '06:00' },
    { name: 'Turno Manhã', startTime: '06:00', endTime: '14:00' },
    { name: 'Turno Tarde', startTime: '14:00', endTime: '22:00' },
    { name: 'Turno Noite', startTime: '22:00', endTime: '23:59' },
  ];

  for (const s of shifts) {
    await prisma.shift.upsert({
      where: { name: s.name },
      update: { startTime: s.startTime, endTime: s.endTime },
      create: s,
    });
  }

  console.log(`Seed concluído: 2 usuários, ${machines.length} máquinas, ${shifts.length} turnos.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
