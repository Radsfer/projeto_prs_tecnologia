import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { requireAuth } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';

const router = Router();

const machineSchema = z.object({
  name: z.string().min(3, 'Nome deve ter de 3 a 100 caracteres').max(100, 'Nome deve ter de 3 a 100 caracteres'),
  code: z.string().regex(/^[A-Za-z0-9-]+$/, 'Código deve ser alfanumérico').max(50),
  unit: z.enum(['pieces', 'kg', 'liters', 'meters']),
});

const machineUpdateSchema = machineSchema.partial().extend({
  active: z.boolean().optional(),
});

// Gestão de máquinas: exclusiva do perfil GESTOR (REQ-FUNC-002, REQ-FUNC-009).
router.use(requireAuth, requireRole('GESTOR'));

// GET /api/machines — lista todas (inclusive inativas).
router.get('/', async (_req, res, next) => {
  try {
    const machines = await prisma.machine.findMany({ orderBy: { name: 'asc' } });
    res.json({ machines });
  } catch (e) {
    next(e);
  }
});

// POST /api/machines — cadastra máquina (código único, unidade do ENUM).
router.post('/', async (req, res, next) => {
  try {
    const data = machineSchema.parse(req.body);
    const machine = await prisma.machine.create({ data });
    res.status(201).json({ machine });
  } catch (e) {
    next(e);
  }
});

// PUT /api/machines/:id — edita máquina (permite reativar).
router.put('/:id', async (req, res, next) => {
  try {
    const data = machineUpdateSchema.parse(req.body);
    const machine = await prisma.machine.update({ where: { id: req.params.id }, data });
    res.json({ machine });
  } catch (e) {
    next(e);
  }
});

// DELETE /api/machines/:id — inativação lógica (preserva chaves estrangeiras/histórico).
router.delete('/:id', async (req, res, next) => {
  try {
    const machine = await prisma.machine.update({ where: { id: req.params.id }, data: { active: false } });
    res.json({ machine });
  } catch (e) {
    next(e);
  }
});

export default router;
