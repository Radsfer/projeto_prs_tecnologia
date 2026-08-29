import { NextFunction, Response } from 'express';
import { ApiError } from '../lib/api-error';
import { audit } from '../lib/audit';
import { AuthenticatedRequest } from './auth';

// RBAC binário (gestor/operador). Exige um dos perfis informados.
// Tentativas de acesso indevido são registradas no AuditLog (REQ-FUNC-009).
export function requireRole(...roles: string[]) {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
    const role = req.user?.role;

    if (!role || !roles.includes(role)) {
      void audit(
        'ACCESS_DENIED',
        `${req.method} ${req.originalUrl} requer [${roles.join(', ')}], mas o perfil é "${role ?? 'nenhum'}"`,
        req.user?.id ?? null,
      );
      return next(new ApiError(403, 'Acesso proibido'));
    }

    return next();
  };
}
