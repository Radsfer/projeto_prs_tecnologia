import { env } from '../config/env';
import { ingestTelemetry } from '../services/iot.service';

let inFlight = false;

// Um pulso de polling: interroga o Mock de IoT com timeout e tolerância a falhas.
async function poll(): Promise<void> {
  if (inFlight) return; // evita sobreposição de pulsos
  inFlight = true;
  try {
    const res = await fetch(env.MOCK_URL, {
      signal: AbortSignal.timeout(env.MOCK_TIMEOUT_MS),
      headers: { Accept: 'application/json' },
    });

    if (!res.ok) {
      console.error(`[iot] mock respondeu HTTP ${res.status}`);
      return;
    }

    const payload: unknown = await res.json();
    await ingestTelemetry(payload);
  } catch (e) {
    // Falha silenciada no log; a recuperação ocorre no pulso subsequente (REQ-NFR-004).
    const name = e instanceof Error ? e.name : 'Erro';
    console.error(`[iot] poll falhou/abortado (${name})`);
  } finally {
    inFlight = false;
  }
}

export function startIotWorker(): void {
  console.log(`[iot] worker iniciado — poll a cada ${env.POLL_INTERVAL_MS}ms, timeout ${env.MOCK_TIMEOUT_MS}ms`);
  void poll();
  setInterval(() => {
    void poll();
  }, env.POLL_INTERVAL_MS);
}
