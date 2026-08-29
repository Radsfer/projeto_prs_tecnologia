import { NextFunction, Request, Response } from 'express';
import { verifyToken } from '../lib/jwt';
import { ApiError } from '../lib/api-error';

export interface AuthenticatedRequest extends Request {
  user?: { id: string; role: string };
}

// Valida o JWT do cabeçalho Authorization e anexa id/role à requisição.
// Não consulta o banco: o payload (UUID + role) é suficiente (REQ-FUNC-001).
export function requireAuth(req: AuthenticatedRequest, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return next(new ApiError(401, 'Não autenticado'));
  }

  try {
    const payload = verifyToken(header.slice('Bearer '.length));
    req.user = { id: payload.sub, role: payload.role };
    return next();
  } catch {
    return next(new ApiError(401, 'Token inválido ou expirado'));
  }
}
