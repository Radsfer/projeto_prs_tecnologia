import { PrismaClient } from '@prisma/client';

// Singleton do Prisma Client compartilhado por toda a aplicação.
export const prisma = new PrismaClient();
