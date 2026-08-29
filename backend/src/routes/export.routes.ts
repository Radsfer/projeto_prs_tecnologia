import { Router } from 'express';
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { requireAuth } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';
import { isValidISODate, toDate } from '../lib/date';

const router = Router();

const querySchema = z.object({
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(isValidISODate, 'from inválido').optional(),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(isValidISODate, 'to inválido').optional(),
  machineId: z.string().uuid().optional(),
  operatorId: z.string().uuid().optional(),
});

const round2 = (n: number): number => Math.round(n * 100) / 100;
const dateKey = (d: Date): string => d.toISOString().slice(0, 10);
const toDDMMYYYY = (iso: string): string => iso.split('-').reverse().join('/');

function csvEscape(v: string | number): string {
  const s = String(v);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

// GET /api/export — exporta a linha do tempo da manufatura em CSV (REQ-FUNC-010).
// UTF-8 (com BOM para compatibilidade com Excel/Power BI/Fabric), datas DD/MM/AAAA
// e valor produtivo concatenado à unidade de medida. Exclusivo do GESTOR.
router.get('/', requireAuth, requireRole('GESTOR'), async (req, res, next) => {
  try {
    const q = querySchema.parse(req.query);

    const where: Prisma.ProductionRecordWhereInput = {};
    if (q.from || q.to) {
      const dateWhere: { gte?: Date; lte?: Date } = {};
      if (q.from) dateWhere.gte = toDate(q.from);
      if (q.to) dateWhere.lte = toDate(q.to);
      where.date = dateWhere;
    }
    if (q.machineId) where.machineId = q.machineId;
    if (q.operatorId) where.userId = q.operatorId;

    const records = await prisma.productionRecord.findMany({
      where,
      include: { machine: true, shift: true, user: true },
      orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
    });

    const targets = records.length
      ? await prisma.target.findMany({
          where: { OR: records.map((r) => ({ machineId: r.machineId, shiftId: r.shiftId, date: r.date })) },
        })
      : [];
    const targetMap = new Map(targets.map((t) => [`${t.machineId}|${t.shiftId}|${dateKey(t.date)}`, t]));

    const header = ['data', 'maquina', 'codigo', 'turno', 'operador', 'producao', 'meta', 'eficiencia', 'parada_minutos'];

    const rows = records.map((r) => {
      const target = targetMap.get(`${r.machineId}|${r.shiftId}|${dateKey(r.date)}`);
      const efficiency = target ? round2((r.quantity / target.quantity) * 100) : '';
      return [
        toDDMMYYYY(dateKey(r.date)),
        r.machine.name,
        r.machine.code,
        r.shift.name,
        r.user?.name ?? '',
        `${r.quantity} ${r.machine.unit}`, // concatenação literal da grandeza
        target ? `${target.quantity} ${r.machine.unit}` : '',
        efficiency,
        r.downtimeMinutes,
      ];
    });

    const csv = `\uFEFF${[header, ...rows].map((row) => row.map(csvEscape).join(',')).join('\n')}\n`;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="prodtrack-apontamentos.csv"');
    res.send(csv);
  } catch (e) {
    next(e);
  }
});

export default router;
