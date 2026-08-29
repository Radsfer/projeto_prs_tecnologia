# ProdTrack — Plataforma para Gestão Industrial

Plataforma de apontamento produtivo e gestão industrial (Indústria 4.0) da **PRS Tecnologia**. Digitaliza a coleta de dados do chão de fábrica, harmonizando o registro manual de operadores (aplicativo móvel) com a telemetria simulada de máquinas (Mock de IoT), e estrutura os dados para alimentar ecossistemas analíticos (Power BI Embed, Microsoft Fabric).

> Especificação completa em [`docs/SRS_ProdTrack_v1.0.md`](docs/SRS_ProdTrack_v1.0.md) e fichas de requisitos em [`docs/requisitos/`](docs/requisitos/).

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Backend (API) | Node.js + Express + Prisma ORM |
| Banco de dados | PostgreSQL 16 |
| Mock de IoT | Serviço Node.js (telemetria simulada) |
| Web (Gestor + Operador mobile-first) | React + Vite |
| Mobile (Operador) | React Native *(em planejamento)* |
| Infra | Docker + Docker Compose, Nginx (proxy reverso) |

## Execução local (tudo via Docker)

Pré-requisito: **Docker** (e Docker Compose). Nenhuma instalação de Node.js, banco ou framework é necessária no hospedeiro.

```bash
# 1. Clone o repositório
git clone git@github.com:Radsfer/projeto_prs_tecnologia.git
cd projeto_prs_tecnologia

# 2. Crie o arquivo de ambiente
cp .env.example .env

# 3. Suba a stack (PostgreSQL + backend + Mock IoT + frontend web)
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

### Credenciais sintéticas (seed)

| Perfil | E-mail | Senha |
|--------|--------|-------|
| Gestor | `gestor@prs.com.br` | `Gestor@123` |
| Operador | `operador@prs.com.br` | `Operador@123` |

> Credenciais estáticas apenas para demonstração/desenvolvimento local.

## Produção (VPS)

O ProdTrack está publicado em **https://prs.adolfo.tec.br**:

| Rota | Serviço |
|------|---------|
| `https://prs.adolfo.tec.br/` | Frontend web (Gestor + Operador mobile-first) |
| `https://prs.adolfo.tec.br/api` | API (backend) |
| `https://prs.adolfo.tec.br/mock` | Mock de IoT |

O deploy é feito via **GitHub Actions** (CI/CD): a cada push em `main`, o pipeline roda build + typecheck e publica na VPS via SSH. O banco de dados fica em rede Docker interna, **sem exposição pública**.

> As credenciais de produção (acesso do time PRS) **não** estão neste repositório — são configuradas exclusivamente via `.env` no servidor.

## Segurança

- Credenciais reais ficam apenas no `.env` do servidor (permissão `600`), nunca versionadas.
- `.env.example` contém somente valores de demonstração.
- Senhas com **bcrypt**; tokens **JWT HS256** (24h); **RBAC** (gestor/operador); **rate limiting** no login.
- Banco de dados **sem exposição pública** (rede interna; acessado só pela API).
- **HTTPS/TLS** via Let's Encrypt (terminação no proxy reverso).
- Deploy via **chave SSH dedicada** com comando restrito e host pinado no CI/CD.

## Mock de IoT

O backend consome o serviço de telemetria simulada por **polling assíncrono** (worker agendado). Por padrão o `.env.example` aponta para o mock local (`http://mock-iot:3001/mock`). Para consumir o mock hospedado na VPS, altere `MOCK_URL` para `https://prs.adolfo.tec.br/mock`.

### Payload do Mock

```json
{
  "machine_id": "11111111-1111-4111-8111-111111111111",
  "timestamp": "2026-08-29T15:00:00.000Z",
  "status_operacional": "RUNNING",
  "ciclos_produzidos": 42
}
```

- `machine_id`: UUID da máquina pré-cadastrada (desconhecido ⇒ descartado com auditoria).
- `timestamp`: ISO 8601 em UTC.
- `status_operacional`: `RUNNING` | `IDLE` | `FAULT`.
- `ciclos_produzidos`: inteiro (volume desde a última leitura).

O backend roda um **worker agendado** (polling) que interroga o `/mock`, valida o payload e consolida os ciclos em apontamentos com `source=IOT` (transação serializável + incremento atômico, para não sobrescrever o registro manual). Timeout de 3s com recuperação no pulso seguinte; transições para `FAULT` disparam a contagem de parada não programada. Eventos de máquina desconhecida são registrados no `AuditLog` e descartados.

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
