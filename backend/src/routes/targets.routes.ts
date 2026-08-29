import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { ApiError } from '../lib/api-error';
import { todayISO, isValidISODate, toDate } from '../lib/date';
import { requireAuth } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';

const router = Router();

const targetFields = z.object({
  machineId: z.string().uuid('machineId inválido'),
  shiftId: z.string().uuid('shiftId inválido'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve ser YYYY-MM-DD').refine(isValidISODate, 'Data inválida'),
  quantity: z.number().int('Quantidade deve ser inteira').positive('Quantidade deve ser positiva').max(999999, 'Quantidade máxima: 999999'),
});

const include = { machine: true, shift: true };

function ensureNotPast(date: string): void {
  if (date < todayISO()) {
    throw new ApiError(400, 'Data não pode ser pretérita');
  }
}

// Metas de produção: exclusivas do perfil GESTOR (REQ-FUNC-004, REQ-FUNC-009).
router.use(requireAuth, requireRole('GESTOR'));

// GET /api/targets — lista metas (filtros opcionais: machineId, shiftId, date).
router.get('/', async (req, res, next) => {
  try {
    const { machineId, shiftId, date } = req.query;
    const where: Record<string, unknown> = {};
    if (typeof machineId === 'string') where.machineId = machineId;
    if (typeof shiftId === 'string') where.shiftId = shiftId;
    if (typeof date === 'string') where.date = toDate(date);

    const targets = await prisma.target.findMany({
      where,
      include,
      orderBy: { date: 'desc' },
    });
    res.json({ targets });
  } catch (e) {
    next(e);
  }
});

// POST /api/targets — cria meta (unicidade composta máquina+turno+data => 409).
router.post('/', async (req, res, next) => {
  try {
    const data = targetFields.parse(req.body);
    ensureNotPast(data.date);

    const target = await prisma.target.create({
      data: {
        machineId: data.machineId,
        shiftId: data.shiftId,
        date: toDate(data.date),
        quantity: data.quantity,
      },
      include,
    });
    res.status(201).json({ target });
  } catch (e) {
    next(e);
  }
});

// PUT /api/targets/:id — edita meta.
router.put('/:id', async (req, res, next) => {
  try {
    const data = targetFields.partial().parse(req.body);
    if (data.date) ensureNotPast(data.date);

    const target = await prisma.target.update({
      where: { id: req.params.id },
      data: {
        ...(data.machineId ? { machineId: data.machineId } : {}),
        ...(data.shiftId ? { shiftId: data.shiftId } : {}),
        ...(data.date ? { date: toDate(data.date) } : {}),
        ...(data.quantity !== undefined ? { quantity: data.quantity } : {}),
      },
      include,
    });
    res.json({ target });
  } catch (e) {
    next(e);
  }
});

// DELETE /api/targets/:id — remove meta.
router.delete('/:id', async (req, res, next) => {
  try {
    await prisma.target.delete({ where: { id: req.params.id } });
    res.status(204).end();
  } catch (e) {
    next(e);
  }
});

export default router;
