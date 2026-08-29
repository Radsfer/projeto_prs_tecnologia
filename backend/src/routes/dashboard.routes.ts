import { Router } from 'express';
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
});

const round2 = (n: number): number => Math.round(n * 100) / 100;

// GET /api/dashboard — síntese analítica (REQ-FUNC-007) + máquinas críticas (REQ-FUNC-008).
// Exclusivo do perfil GESTOR.
router.get('/', requireAuth, requireRole('GESTOR'), async (req, res, next) => {
  try {
    const q = querySchema.parse(req.query);

    const dateFilter: { gte?: Date; lte?: Date } = {};
    if (q.from) dateFilter.gte = toDate(q.from);
    if (q.to) dateFilter.lte = toDate(q.to);

    const where = {
      ...(Object.keys(dateFilter).length ? { date: dateFilter } : {}),
      ...(q.machineId ? { machineId: q.machineId } : {}),
    };

    const [recordAgg, targetAgg] = await Promise.all([
      prisma.productionRecord.groupBy({
        by: ['machineId'],
        where,
        _sum: { quantity: true, downtimeMinutes: true },
      }),
      prisma.target.groupBy({
        by: ['machineId'],
        where,
        _sum: { quantity: true },
      }),
    ]);

    const recordMap = new Map(recordAgg.map((r) => [r.machineId, { quantity: r._sum.quantity ?? 0, downtimeMinutes: r._sum.downtimeMinutes ?? 0 }]));
    const targetMap = new Map(targetAgg.map((t) => [t.machineId, t._sum.quantity ?? 0]));

    const machineIds = [...new Set([...recordMap.keys(), ...targetMap.keys()])];
    const machines = machineIds.length
      ? await prisma.machine.findMany({ where: { id: { in: machineIds } } })
      : [];
    const machineMap = new Map(machines.map((m) => [m.id, m]));

    const perMachine = machineIds.map((machineId) => {
      const m = machineMap.get(machineId);
      const production = recordMap.get(machineId)?.quantity ?? 0;
      const downtimeMinutes = recordMap.get(machineId)?.downtimeMinutes ?? 0;
      const target = targetMap.get(machineId) ?? 0;
      const efficiency = target > 0 ? round2((production / target) * 100) : null;
      return {
        machineId,
        name: m?.name ?? 'Desconhecida',
        unit: m?.unit ?? 'unknown',
        production,
        target,
        downtimeMinutes,
        downtimeHours: round2(downtimeMinutes / 60),
        efficiency,
      };
    });

    // Máquinas abaixo de 80% => destaque crítico no topo (REQ-FUNC-008).
    const critical = perMachine
      .filter((x) => x.efficiency !== null && x.efficiency < 80)
      .sort((a, b) => (a.efficiency ?? 0) - (b.efficiency ?? 0));

    // Segregação por unidade de medida: não mesclar grandezas incompatíveis (REQ-FUNC-007).
    const byUnitMap = new Map<string, { unit: string; production: number; target: number; downtimeHours: number }>();
    for (const p of perMachine) {
      const u = byUnitMap.get(p.unit) ?? { unit: p.unit, production: 0, target: 0, downtimeHours: 0 };
      u.production += p.production;
      u.target += p.target;
      u.downtimeHours += p.downtimeHours;
      byUnitMap.set(p.unit, u);
    }
    const byUnit = [...byUnitMap.values()].map((u) => ({
      ...u,
      efficiency: u.target > 0 ? round2((u.production / u.target) * 100) : null,
    }));

    // Visão "overall" só é coerente com unidade única (filtro por máquina).
    const overall = q.machineId && byUnit.length === 1 ? byUnit[0] : null;

    res.json({
      window: { from: q.from ?? null, to: q.to ?? null, machineId: q.machineId ?? null },
      overall,
      byUnit,
      critical,
      machines: perMachine,
    });
  } catch (e) {
    next(e);
  }
});

export default router;
