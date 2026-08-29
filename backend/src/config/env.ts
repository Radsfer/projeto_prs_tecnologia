// Configuração central de variáveis de ambiente (com defaults de demo).

export const env = {
  PORT: Number(process.env.PORT ?? 3333),
  JWT_SECRET: process.env.JWT_SECRET ?? 'prodtrack-dev-secret',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN ?? '24h',
  MOCK_URL: process.env.MOCK_URL ?? 'http://localhost:3001/mock',
  MOCK_TIMEOUT_MS: Number(process.env.MOCK_TIMEOUT_MS ?? 3000),
  POLL_INTERVAL_MS: Number(process.env.POLL_INTERVAL_MS ?? 7000),
};
