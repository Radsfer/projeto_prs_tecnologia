import express from 'express';

const app = express();
const port = Number(process.env.MOCK_PORT ?? 3001);

// UUIDs das máquinas pré-cadastradas no seed do backend
// (ver backend/prisma/seed.ts — MACHINE_IDS).
const MACHINE_IDS = [
  '11111111-1111-4111-8111-111111111111',
  '22222222-2222-4222-8222-222222222222',
  '33333333-3333-4333-8333-333333333333',
];

const STATUSES = ['RUNNING', 'IDLE', 'FAULT'] as const;

// Estado "gêmeo digital" por máquina: contador acumulado de ciclos.
const counters = new Map<string, number>();

app.get('/mock', (_req, res) => {
  const now = new Date();

  // Rotaciona entre as máquinas a cada 5s, simulando várias estações de coleta.
  const machineId = MACHINE_IDS[Math.floor(now.getTime() / 5000) % MACHINE_IDS.length];

  const prev = counters.get(machineId) ?? 0;
  const increment = Math.floor(Math.random() * 50) + 1;
  counters.set(machineId, prev + increment);

  // Estado operacional: majoritariamente RUNNING; FAULT esporádico.
  const roll = Math.random();
  const status = roll < 0.85 ? 'RUNNING' : roll < 0.95 ? 'IDLE' : 'FAULT';

  res.json({
    machine_id: machineId,
    timestamp: now.toISOString(), // ISO 8601, UTC
    status_operacional: status,
    ciclos_produzidos: increment, // volume desde a última leitura
  });
});

app.listen(port, () => {
  console.log(`Mock IoT rodando em http://localhost:${port}/mock`);
});
