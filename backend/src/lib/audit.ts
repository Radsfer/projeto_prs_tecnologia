import { prisma } from './prisma';

// Registra um evento na matriz de auditoria (AuditLog).
// Falhas de auditoria não devem derrubar o fluxo principal.
export async function audit(event: string, details?: string, actorId?: string | null): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        event,
        details: details ?? null,
        actorId: actorId ?? null,
      },
    });
  } catch (e) {
    console.error('Falha ao gravar audit log', e);
  }
}
