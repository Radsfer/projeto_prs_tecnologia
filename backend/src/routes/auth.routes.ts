import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { comparePassword } from '../lib/password';
import { signToken } from '../lib/jwt';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// Rate limiting: 100 tentativas/minuto por IP (REQ-FUNC-001).
const loginLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Muitas tentativas de login. Tente novamente em instantes.' },
});

// POST /api/auth/login — autentica por e-mail/senha e emite JWT (HS256, 24h).
router.post('/login', loginLimiter, async (req, res, next) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    // Requisições malformadas também respondem 401 (anti-enumeração de e-mails).
    if (!parsed.success) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const { email, password } = parsed.data;
    const user = await prisma.user.findUnique({ where: { email } });

    // Resposta uniforme: não revela se o e-mail existe ou não.
    if (!user || !user.active || user.anonymized) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const valid = await comparePassword(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const token = signToken({ sub: user.id, role: user.role });

    return res.json({
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });
  } catch (e) {
    return next(e);
  }
});

// GET /api/auth/me — retorna o usuário autenticado (a partir do token).
router.get('/me', requireAuth, (req: AuthenticatedRequest, res) => {
  res.json({ user: req.user });
});

export default router;
