# ProdTrack

Plataforma de apontamento produtivo e gestão industrial (Indústria 4.0), construída para a PRS Tecnologia.

O ProdTrack digitaliza o registro de produção do chão de fábrica. O operador informa a produção e o tempo de parada pelo navegador, e um serviço simulado (Mock de IoT) envia a telemetria das máquinas. Esses dados viram uma base única com painel de eficiência, alertas e exportação CSV, pronta para alimentar Power BI e Microsoft Fabric.

## O que o sistema faz

- Login por perfil: gestor e operador (JWT, senha com bcrypt).
- Cadastro de máquinas, turnos e metas de produção.
- Registro de apontamentos (produção e paradas).
- Painel analítico com eficiência e máquinas críticas (abaixo de 80%).
- Histórico de apontamentos com filtros e exportação CSV.
- Gestão de usuários com anonimização (LGPD).
- Ingestão de telemetria simulada (Mock de IoT) por polling.

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Backend (API) | Node.js + Express + Prisma ORM |
| Banco de dados | PostgreSQL 16 |
| Mock de IoT | Serviço Node.js (telemetria simulada) |
| Web (Gestor + Operador mobile-first) | React + Vite |
| Mobile (Operador) | React Native (em planejamento) |
| Infra | Docker + Docker Compose, Nginx (proxy reverso) |

## Execução local (Docker)

Pré-requisito: Docker e Docker Compose. Não é preciso instalar Node.js, banco ou framework.

```bash
git clone git@github.com:Radsfer/projeto_prs_tecnologia.git
cd projeto_prs_tecnologia
cp .env.example .env
docker compose up --build
```

Na primeira subida o backend executa as migrações e o seed automaticamente.

### Portas locais

| Serviço | URL |
|---------|-----|
| Web (Gestor + Operador) | http://localhost:3000 |
| API (backend) | http://localhost:3333 |
| Mock de IoT | http://localhost:3001/mock |
| PostgreSQL | localhost:5432 |

### Credenciais de demonstração (seed)

| Perfil | E-mail | Senha |
|--------|--------|-------|
| Gestor | `gestor@prs.com.br` | `Gestor@123` |
| Operador | `operador@prs.com.br` | `Operador@123` |

> Credenciais estáticas apenas para desenvolvimento local.

### Como testar

1. Acesse http://localhost:3000.
2. Entre como gestor para ver o painel, cadastrar máquinas, turnos e metas e acompanhar os apontamentos.
3. Entre como operador para registrar um apontamento. O operador cai direto na tela de apontamento, que também funciona pelo navegador do celular.
4. Abra o painel do gestor e aguarde alguns segundos: o Mock de IoT alimenta os dados automaticamente.

## Produção (VPS)

O ProdTrack está publicado em https://prs.adolfo.tec.br:

| Rota | Serviço |
|------|---------|
| `/` | Frontend web (Gestor + Operador mobile-first) |
| `/api` | API (backend) |
| `/mock` | Mock de IoT |

O deploy é feito via GitHub Actions (CI/CD): a cada push na `main`, o pipeline roda build e typecheck e publica na VPS via SSH. O banco fica em rede Docker interna, sem exposição pública.

> As credenciais de produção (acesso do time PRS) não estão neste repositório. São configuradas via `.env` no servidor.

## Segurança

- Credenciais reais ficam apenas no `.env` do servidor (permissão `600`), nunca versionadas.
- `.env.example` contém somente valores de demonstração.
- Senhas com bcrypt, tokens JWT HS256 (24h), RBAC (gestor/operador) e rate limiting no login.
- Banco de dados sem exposição pública (rede interna, acessado só pela API).
- HTTPS/TLS via Let's Encrypt (terminação no proxy reverso).
- Deploy via chave SSH dedicada com comando restrito e host pinado no CI/CD.

## Mock de IoT (placeholder)

O Mock de IoT é um placeholder: simula a telemetria com um formato de dados já modelado, para no futuro plugar os CLPs e sistemas embarcados reais sem mudar o resto da aplicação.

O backend consome o serviço por polling assíncrono (worker agendado). Por padrão o `.env.example` aponta para o mock local (`http://mock-iot:3001/mock`). Para consumir o mock da VPS, mude `MOCK_URL` para `https://prs.adolfo.tec.br/mock`.

### Payload do Mock

```json
{
  "machine_id": "11111111-1111-4111-8111-111111111111",
  "timestamp": "2026-08-29T15:00:00.000Z",
  "status_operacional": "RUNNING",
  "ciclos_produzidos": 42
}
```

- `machine_id`: UUID da máquina cadastrada (desconhecido é descartado com auditoria).
- `timestamp`: ISO 8601 em UTC.
- `status_operacional`: `RUNNING` | `IDLE` | `FAULT`.
- `ciclos_produzidos`: inteiro (volume desde a última leitura).

O worker valida o payload e consolida os ciclos em apontamentos com `source=IOT`, usando transação serializável e incremento atômico para não sobrescrever o registro manual. Timeout de 3s com recuperação no pulso seguinte. Transições para `FAULT` disparam a contagem de parada não programada. Eventos de máquina desconhecida são registrados no `AuditLog` e descartados.

## Estrutura do repositório

```
.
├── backend/                  # API Node.js + Express + Prisma (e worker de polling)
├── mock-iot/                 # Serviço simulador de telemetria (IIoT)
├── web/                      # Frontend React + Vite (Gestor + Operador)
├── docs/                     # SRS e fichas de requisitos (ISO/IEC/IEEE 29148:2018)
├── .github/workflows/        # CI/CD (build + deploy na VPS)
├── docker-compose.yml        # execução local
├── docker-compose.prod.yml   # produção (VPS, sem exposição do banco)
└── .env.example
```
