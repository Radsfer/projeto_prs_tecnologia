import express from 'express';
import authRoutes from './routes/auth.routes';
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

  // 404 para rotas desconhecidas.
  app.use((_req, res) => {
    res.status(404).json({ error: 'Rota não encontrada' });
  });

  app.use(errorHandler);

  return app;
}
