import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { requireAuth } from '../middleware/auth';

const router = Router();

// Catálogos auxiliares para o aplicativo do operador (e também do gestor):
// máquinas ativas e turnos. Disponível para qualquer perfil autenticado.
// (REQ-FUNC-005/009: operador tem GET restrito a catálogos auxiliares.)
router.get('/', requireAuth, async (_req, res, next) => {
  try {
    const [machines, shifts] = await Promise.all([
      prisma.machine.findMany({ where: { active: true }, orderBy: { name: 'asc' } }),
      prisma.shift.findMany({ orderBy: { startTime: 'asc' } }),
    ]);
    res.json({ machines, shifts });
  } catch (e) {
    next(e);
  }
});

export default router;
