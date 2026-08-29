import { Router } from 'express';
import { randomUUID } from 'node:crypto';
import { prisma } from '../lib/prisma';
import { audit } from '../lib/audit';
import { ApiError } from '../lib/api-error';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';

const router = Router();

// Gestão de usuários: exclusiva do GESTOR.
router.use(requireAuth, requireRole('GESTOR'));

// GET /api/users — lista usuários (sem expor hash de senha).
router.get('/', async (_req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        active: true,
        anonymized: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });
    res.json({ users });
  } catch (e) {
    next(e);
  }
});

// DELETE /api/users/:id — exclusão lógica + anonimização (LGPD, REQ-NFR-005).
// Preserva a chave estrangeira nos apontamentos e transmuta os dados pessoais
// identificáveis (nome/e-mail) por valores sem rastreio. Registra em AuditLog.
router.delete('/:id', async (req: AuthenticatedRequest, res, next) => {
  try {
    if (req.params.id === req.user?.id) {
      throw new ApiError(400, 'Não é possível anonimizar a própria conta');
    }

    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user) throw new ApiError(404, 'Usuário não encontrado');
    if (user.anonymized) throw new ApiError(400, 'Usuário já anonimizado');

    const anon = randomUUID();

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        active: false,
        anonymized: true,
        name: `Usuário anonimizado ${anon.slice(0, 8)}`,
        email: `anon-${anon}@anon.local`,
        password: `anon-${anon}`, // credencial inutilizada
      },
      select: { id: true, email: true, name: true, role: true, active: true, anonymized: true },
    });

    // Transição criptográfica auditável (REQ-NFR-005).
    await audit('USER_ANONYMIZED', `user_id=${user.id}`, req.user?.id ?? null);

    res.json({ user: updated });
  } catch (e) {
    next(e);
  }
});

export default router;
