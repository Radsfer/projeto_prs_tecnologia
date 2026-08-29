import { Router } from 'express';
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { ApiError } from '../lib/api-error';
import { isValidISODate, toDate } from '../lib/date';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';

const router = Router();

const recordSchema = z.object({
  machineId: z.string().uuid('machineId inválido'),
  shiftId: z.string().uuid('shiftId inválido'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve ser YYYY-MM-DD').refine(isValidISODate, 'Data inválida'),
  quantity: z.number().int('Produção deve ser inteira').min(0, 'Produção não pode ser negativa'),
  downtimeMinutes: z.number().int('Parada deve ser inteira').min(0, 'Parada não pode ser negativa'),
});

const listQuerySchema = z.object({
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(isValidISODate, 'from inválido').optional(),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(isValidISODate, 'to inválido').optional(),
  machineId: z.string().uuid().optional(),
  operatorId: z.string().uuid().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

const round2 = (n: number): number => Math.round(n * 100) / 100;
const dateKey = (d: Date): string => d.toISOString().slice(0, 10);

// GET /api/records — listagem paginada da auditoria (filtros: período, máquina, operador).
// Exclusivo do perfil GESTOR (REQ-FUNC-006, REQ-FUNC-009).
router.get('/', requireAuth, requireRole('GESTOR'), async (req, res, next) => {
  try {
    const q = listQuerySchema.parse(req.query);

    const where: Prisma.ProductionRecordWhereInput = {};
    if (q.from || q.to) {
      const dateWhere: { gte?: Date; lte?: Date } = {};
      if (q.from) dateWhere.gte = toDate(q.from);
      if (q.to) dateWhere.lte = toDate(q.to);
      where.date = dateWhere;
    }
    if (q.machineId) where.machineId = q.machineId;
    if (q.operatorId) where.userId = q.operatorId;

    const [total, records] = await Promise.all([
      prisma.productionRecord.count({ where }),
      prisma.productionRecord.findMany({
        where,
        include: { machine: true, shift: true, user: true },
        orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
        skip: (q.page - 1) * q.pageSize,
        take: q.pageSize,
      }),
    ]);

    // Eficiência unitária: busca as metas da página em lote (evita N+1).
    const targets = records.length
      ? await prisma.target.findMany({
          where: {
            OR: records.map((r) => ({ machineId: r.machineId, shiftId: r.shiftId, date: r.date })),
          },
        })
      : [];

    const targetMap = new Map(
      targets.map((t) => [`${t.machineId}|${t.shiftId}|${dateKey(t.date)}`, t]),
    );

    const items = records.map((r) => {
      const target = targetMap.get(`${r.machineId}|${r.shiftId}|${dateKey(r.date)}`);
      const efficiency = target ? round2((r.quantity / target.quantity) * 100) : null;
      return {
        id: r.id,
        date: dateKey(r.date),
        quantity: r.quantity,
        downtimeMinutes: r.downtimeMinutes,
        source: r.source,
        machine: { id: r.machine.id, name: r.machine.name, code: r.machine.code, unit: r.machine.unit },
        shift: { id: r.shift.id, name: r.shift.name },
        operatorId: r.userId,
        operatorName: r.user ? r.user.name : null,
        quantityWithUnit: `${r.quantity} ${r.machine.unit}`,
        efficiency,
      };
    });

    res.json({
      records: items,
      pagination: {
        page: q.page,
        pageSize: q.pageSize,
        total,
        totalPages: Math.ceil(total / q.pageSize),
      },
    });
  } catch (e) {
    next(e);
  }
});

// POST /api/records — registro de apontamentos (REQ-FUNC-005).
// Qualquer perfil autenticado pode registrar (gestor onipotente; operador tem POST restrito a esta rota).
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
      record: {
        ...record,
        date: dateKey(record.date),
        quantityWithUnit: `${record.quantity} ${record.machine.unit}`,
      },
      target, // null quando não há meta => sinaliza a omissão do planejamento
      efficiency,
      alert: efficiency !== null && efficiency < 80, // REQ-FUNC-008
    });
  } catch (e) {
    next(e);
  }
});

export default router;
