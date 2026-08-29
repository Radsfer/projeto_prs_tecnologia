import express from 'express';

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

  return app;
}
