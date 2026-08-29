# ProdTrack — Plataforma para Gestão Industrial

Plataforma de apontamento produtivo e gestão industrial (Indústria 4.0) da **PRS Tecnologia**. Digitaliza a coleta de dados do chão de fábrica, harmonizando o registro manual de operadores (aplicativo móvel) com a telemetria simulada de máquinas (Mock de IoT), e estrutura os dados para alimentar ecossistemas analíticos (Power BI Embed, Microsoft Fabric).

> Especificação completa em [`docs/SRS_ProdTrack_v1.0.md`](docs/SRS_ProdTrack_v1.0.md) e fichas de requisitos em [`docs/requisitos/`](docs/requisitos/).

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Backend (API) | Node.js + Express + Prisma ORM |
| Banco de dados | PostgreSQL 16 |
| Mock de IoT | Serviço Node.js (telemetria simulada) |
| Web (Gestor) | React + Vite *(em breve)* |
| Mobile (Operador) | React Native *(em breve)* |
| Infra | Docker + Docker Compose, Nginx (proxy reverso) |

## Como rodar (tudo via Docker)

Pré-requisito: **Docker** (e Docker Compose). Nenhuma instalação de Node.js, banco ou framework é necessária no hospedeiro.

```bash
# 1. Clone o repositório
git clone git@github.com:Radsfer/projeto_prs_tecnologia.git
cd projeto_prs_tecnologia

# 2. Crie o arquivo de ambiente
cp .env.example .env

# 3. Suba a stack (PostgreSQL + backend + Mock IoT)
docker compose up --build
```

Na primeira subida o backend executa as migrações e o seed automaticamente.

### Portas locais

| Serviço | URL |
|---------|-----|
| API (backend) | http://localhost:3333 |
| Mock de IoT | http://localhost:3001/mock |
| PostgreSQL | localhost:5432 |

### Credenciais sintéticas (seed)

| Perfil | E-mail | Senha |
|--------|--------|-------|
| Gestor | `gestor@prs.com.br` | `Gestor@123` |
| Operador | `operador@prs.com.br` | `Operador@123` |

> Credenciais estáticas apenas para demonstração/desenvolvimento local.

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

## Estrutura do repositório

```
.
├── backend/        # API Node.js + Express + Prisma (e worker de polling)
├── mock-iot/       # Serviço simulador de telemetria (IIoT)
├── docs/           # SRS e fichas de requisitos (ISO/IEC/IEEE 29148:2018)
├── docker-compose.yml
└── .env.example
```
