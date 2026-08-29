import express from 'express';
import authRoutes from './routes/auth.routes';
import machinesRoutes from './routes/machines.routes';
import shiftsRoutes from './routes/shifts.routes';
import targetsRoutes from './routes/targets.routes';
import recordsRoutes from './routes/records.routes';
import dashboardRoutes from './routes/dashboard.routes';
import exportRoutes from './routes/export.routes';
import catalogRoutes from './routes/catalog.routes';
import { errorHandler } from './middleware/error';

// Cria a aplicação Express (sem iniciar o listener), para facilitar testes.
export function createApp() {
  const app = express();

  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.json({
      status: 'ok',
      service: 'prodtrack-backend',
      timestamp: new Date().toISOString(),
    });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/machines', machinesRoutes);
  app.use('/api/shifts', shiftsRoutes);
  app.use('/api/targets', targetsRoutes);
  app.use('/api/records', recordsRoutes);
  app.use('/api/dashboard', dashboardRoutes);
  app.use('/api/export', exportRoutes);
  app.use('/api/catalog', catalogRoutes);

  // 404 para rotas desconhecidas.
  app.use((_req, res) => {
    res.status(404).json({ error: 'Rota não encontrada' });
  });

  app.use(errorHandler);

  return app;
}
