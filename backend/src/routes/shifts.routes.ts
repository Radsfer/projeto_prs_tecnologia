import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { ApiError } from '../lib/api-error';
import { requireAuth } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';

const router = Router();

const HHMM = /^([01]\d|2[0-3]):[0-5]\d$/;

const shiftFields = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(100),
  startTime: z.string().regex(HHMM, 'Formato deve ser HH:MM'),
  endTime: z.string().regex(HHMM, 'Formato deve ser HH:MM'),
});

const shiftSchema = shiftFields.refine((d) => d.endTime > d.startTime, {
  message: 'Horário de término deve ser posterior ao início',
  path: ['endTime'],
});

// Gestão de turnos: exclusiva do perfil GESTOR (REQ-FUNC-003, REQ-FUNC-009).
router.use(requireAuth, requireRole('GESTOR'));

// GET /api/shifts — lista todos os turnos.
router.get('/', async (_req, res, next) => {
  try {
    const shifts = await prisma.shift.findMany({ orderBy: { startTime: 'asc' } });
    res.json({ shifts });
  } catch (e) {
    next(e);
  }
});

// POST /api/shifts — cadastra turno (nome único, horários HH:MM coerentes).
router.post('/', async (req, res, next) => {
  try {
    const data = shiftSchema.parse(req.body);
    const shift = await prisma.shift.create({ data });
    res.status(201).json({ shift });
  } catch (e) {
    next(e);
  }
});

// PUT /api/shifts/:id — edita turno (valida coerência cronológica ao mesclar).
router.put('/:id', async (req, res, next) => {
  try {
    const data = shiftFields.partial().parse(req.body);

    if (data.startTime || data.endTime) {
      const existing = await prisma.shift.findUnique({ where: { id: req.params.id } });
      if (!existing) throw new ApiError(404, 'Turno não encontrado');
      const start = data.startTime ?? existing.startTime;
      const end = data.endTime ?? existing.endTime;
      if (end <= start) {
        throw new ApiError(400, 'Horário de término deve ser posterior ao início');
      }
    }

    const shift = await prisma.shift.update({ where: { id: req.params.id }, data });
    res.json({ shift });
  } catch (e) {
    next(e);
  }
});

export default router;
