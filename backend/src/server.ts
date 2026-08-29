import { createApp } from './app';
import { env } from './config/env';

const app = createApp();

app.listen(env.PORT, () => {
  console.log(`ProdTrack API rodando na porta ${env.PORT}`);
});
