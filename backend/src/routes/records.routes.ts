import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { ApiError } from '../lib/api-error';
import { isValidISODate, toDate } from '../lib/date';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

const recordSchema = z.object({
  machineId: z.string().uuid('machineId inválido'),
  shiftId: z.string().uuid('shiftId inválido'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve ser YYYY-MM-DD').refine(isValidISODate, 'Data inválida'),
  quantity: z.number().int('Produção deve ser inteira').min(0, 'Produção não pode ser negativa'),
  downtimeMinutes: z.number().int('Parada deve ser inteira').min(0, 'Parada não pode ser negativa'),
});

const round2 = (n: number): number => Math.round(n * 100) / 100;

// Registro de apontamentos (REQ-FUNC-005). Qualquer perfil autenticado pode
// registrar (o gestor é onipotente; o operador tem POST restrito a esta rota).
router.post('/', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const data = recordSchema.parse(req.body);
    const userId = req.user!.id;

    const machine = await prisma.machine.findUnique({ where: { id: data.machineId } });
    if (!machine || !machine.active) {
      throw new ApiError(400, 'Máquina inválida ou inativa');
    }

    const shift = await prisma.shift.findUnique({ where: { id: data.shiftId } });
    if (!shift) {
      throw new ApiError(400, 'Turno inválido');
    }

    // Meta é opcional: ausência NÃO bloqueia a persistência (produção "órfã").
    const target = await prisma.target.findUnique({
      where: {
        machineId_shiftId_date: {
          machineId: data.machineId,
          shiftId: data.shiftId,
          date: toDate(data.date),
        },
      },
    });

    const record = await prisma.productionRecord.create({
      data: {
        machineId: data.machineId,
        shiftId: data.shiftId,
        date: toDate(data.date),
        quantity: data.quantity,
        downtimeMinutes: data.downtimeMinutes,
        source: 'MANUAL',
        userId,
      },
      include: { machine: true, shift: true },
    });

    const efficiency = target ? round2((record.quantity / target.quantity) * 100) : null;

    res.status(201).json({
      record,
      target, // null quando não há meta => sinaliza a omissão do planejamento
      efficiency,
    });
  } catch (e) {
    next(e);
  }
});

export default router;
