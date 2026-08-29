import { NextFunction, Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';
import { ApiError } from '../lib/api-error';

// Handler global de erros: converte ApiError/ZodError/erros do Prisma em respostas HTTP.
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof ApiError) {
    res.status(err.status).json({ error: err.message });
    return;
  }

  if (err instanceof ZodError) {
    res.status(400).json({ error: 'Dados inválidos', details: err.issues });
    return;
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      res.status(409).json({ error: 'Registro duplicado (violação de unicidade)' });
      return;
    }
    if (err.code === 'P2003') {
      res.status(400).json({ error: 'Referência inválida a outro registro' });
      return;
    }
    if (err.code === 'P2025') {
      res.status(404).json({ error: 'Registro não encontrado' });
      return;
    }
  }

  console.error(err);
  res.status(500).json({ error: 'Erro interno do servidor' });
}
