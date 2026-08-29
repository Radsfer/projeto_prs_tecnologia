# Plano do Aplicativo Móvel do Operador — ProdTrack

> Status: **planejamento** · Referência: SRS (`docs/SRS_ProdTrack_v1.0.md`), fichas REQ-FUNC-005, REQ-FUNC-008, REQ-FUNC-009 e REQ-NFR-002.

## 1. Objetivo e escopo

Aplicativo móvel para o **perfil Operador**, focado no registro de apontamentos produtivos no chão de fábrica. Escopo enxuto e utilitário: o operador autentica, seleciona máquina e turno a partir de catálogos, informa produção e tempo de parada, e recebe feedback visual quando a eficiência está abaixo de 80%.

Não faz parte do MVP mobile: cadastros administrativos, dashboard analítico, exportação CSV, gestão de metas/usuários (são do Gestor, via web).

## 2. Stack e decisões

| Item | Decisão | Justificativa |
|------|---------|---------------|
| Framework | React Native | Definido no SRS; compartilha mentalidade com o React web |
| Tooling | **Expo** (managed workflow) | Subir no simulador/dispositivo sem toolchain nativo; ideal para demo |
| Navegação | React Navigation (stack nativo) | Padrão do ecossistema |
| Estado/HTTP | Context + `fetch` (mesmo padrão do `web/src/api.ts`) | Consistência com o frontend existente |
| Design system | Reutilizar os tokens do `web` (Archivo, vermelho `#e0402b`, bordas hairline) | Paridade visual + `no-ai-slop` |

## 3. Telas

| Tela | Conteúdo | Endpoint(s) |
|------|----------|-------------|
| **Login** | E-mail + senha; guarda o JWT | `POST /api/auth/login` |
| **Apontamento** (tela principal) | Seleção de máquina, turno e data + produção + parada (min) + unidade espelhada | `GET /api/catalog`, `POST /api/records` |
| **Histórico** (opcional) | Lista os próprios apontamentos recentes | `GET /api/records?operatorId=...` (a expor no futuro, ou via nova rota) |
| **Perfil/Sair** | Nome do operador + logout | — |

### Fluxo principal (Apontamento)

1. Ao abrir, carrega `GET /api/catalog` (máquinas ativas + turnos).
2. Operador escolhe máquina → a **unidade de medida** da máquina é espelhada no campo de quantidade (ex.: "Quantidade (litros)").
3. Informa data (default hoje), produção bruta e minutos de parada.
4. Envia `POST /api/records`.
5. Se a resposta vier com `alert: true` (eficiência < 80%), exibe um **indicador vermelho** persistente no topo + mensagem de contexto.
6. Se `target: null`, mostra aviso neutro ("registrado sem meta de planejamento").

## 4. Autenticação

- Reutilizar o fluxo JWT do backend: `Authorization: Bearer <token>`.
- Armazenar o token de forma segura (`expo-secure-store` em vez de `AsyncStorage`/`localStorage`).
- `401` em qualquer chamada → redirecionar para Login.

## 5. Requisitos de ergonomia (REQ-NFR-002)

- **Todos** os alvos de toque (botões, selects, campos) ≥ **48×48 dp**.
- Componentes grandes, alta legibilidade, sem toque de precisão (luvas/vibração).
- Mínimo de digitação: máquina/turno via `select`/chips; data com picker; valores numéricos com teclado numérico.
- Ação primária (Registrar) em destaque, fixa na parte inferior e alcançável com o polegar.

## 6. Feedback de alerta (REQ-FUNC-008)

- A eficiência é calculada pelo backend e retornada no `POST /api/records`.
- `efficiency < 80` ⇒ faixa/banner vermelho (`--accent`) com o percentual e a meta.
- `efficiency >= 80` ⇒ confirmação sóbria (sem celebração exagerada).
- Sem meta ⇒ estado neutro informativo.

## 7. Direção visual (aplicando `no-ai-slop`)

- Fundo branco (`#ffffff`), texto quase-preto (`#14120f`), 1 acento (vermelho `#e0402b`).
- Sem gradientes, sem sombras genéricas — separação por bordas hairline (`#e5e2dc`).
- Tipografia Archivo (mesma do web); hierarquia por peso, não por gradiente.
- Números/totais com alinhamento tabular; rótulos em sentence case.

## 8. Estrutura de pastas proposta

```
mobile/
├── app.json / app.config.ts
├── package.json
├── App.tsx                  # providers + navegação
├── src/
│   ├── api.ts               # cliente HTTP (paridade com web/src/api.ts)
│   ├── auth.tsx             # contexto de sessão (secure store)
│   ├── theme.ts             # tokens (cores, tipografia, espaçamento)
│   ├── navigation/
│   ├── screens/
│   │   ├── LoginScreen.tsx
│   │   ├── ApontamentoScreen.tsx
│   │   └── HistoricoScreen.tsx
│   └── components/
│       ├── Field.tsx        # input/select >= 48dp
│       ├── PrimaryButton.tsx
│       └── AlertBanner.tsx
```

## 9. Como rodar localmente

1. `cd mobile && npm install`.
2. Ajustar `EXPO_PUBLIC_API_URL` para `http://localhost:3333` (ou o IP da máquina no dispositivo físico).
3. `npx expo start` → abrir no emulador (Android/iOS) ou Expo Go.
4. Backend já precisa estar no ar (`docker compose up`).

> Para o entrevistador, o caminho mais simples é **Expo Go** no celular ou um emulador Android, apontando para a API local.

## 10. Milestones sugeridos

| # | Entrega | Requisitos |
|---|---------|-----------|
| MO-0 | Scaffolding Expo + navegação + login | REQ-FUNC-001 (consumo) |
| MO-1 | Tela de apontamento (catálogo + envio + espelhamento de unidade) | REQ-FUNC-005 |
| MO-2 | Alerta de eficiência < 80% (banner vermelho) | REQ-FUNC-008 |
| MO-3 | Polimento de ergonomia (48dp, teclado numérico, acessibilidade) | REQ-NFR-002 |
| MO-4 | Histórico do operador + logout | REQ-FUNC-009 (escopo de leitura) |

## 11. Pontos em aberto / decisões futuras

- **Histórico do operador**: hoje `GET /api/records` é restrito ao Gestor. Será preciso uma rota de leitura do próprio operador (ex.: `GET /api/records/mine`), ou relaxar o filtro `operatorId` para o próprio usuário.
- **Offline**: fila local de apontamentos para reenvio (fora do MVP; importante em fábrica real).
- **Push/notificações**: alertas proativos de `FAULT` (fora do MVP).
- **Build de produção**: EAS Build / `expo prebuild` para APK/AAB e IPA (fora do escopo de demo).
