import { createApp } from './app';
import { env } from './config/env';
import { startIotWorker } from './workers/iot.worker';

const app = createApp();

app.listen(env.PORT, () => {
  console.log(`ProdTrack API rodando na porta ${env.PORT}`);
});

startIotWorker();
