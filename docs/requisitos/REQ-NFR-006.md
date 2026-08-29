# Ficha de Requisito

> **Norma de referência:** ISO/IEC/IEEE 29148:2018 (Seções 5.2.5 e 5.2.8)

---

## Identificação

| Campo | Valor |
|-------|-------|
| **ID** | `REQ-NFR-006` |
| **Nome** | `Segurança de Infraestrutura e Comunicação` |
| **Tipo** | `Segurança` |
| **Prioridade** | `Essencial` |
| **Status** | `Proposto` |
| **Versão** | `1.0` |

---

## Descrição

### Texto do Requisito
> Em produção, a exposição dos serviços deve ser mediada por proxy reverso (Nginx ou Traefik) que intercepta requisições na porta 443, realiza terminação TLS/SSL e roteia por domínio/path, mantendo o banco de dados PostgreSQL sem exposição pública e restrito à rede virtual interna, aceitando conexões unicamente da API e de ferramentas seguras de migração.

`O ambiente de produção deve expor serviços via HTTPS (proxy reverso, terminação TLS na porta 443) e manter o PostgreSQL isolado na rede interna Docker, sem exposição pública.`

### Condições de Aplicação
- Condição 1: `O ambiente é o de produção, hospedado na VPS sob prs.adolfo.tec.br.`
- Condição 2: `A orquestração usa Docker Compose com rede virtual interna.`
- Condição 3: `As rotas de entrada são definidas por domínio/path (/api, /mock, raiz).`

---

## Rastreabilidade

| Campo | Valor |
|-------|-------|
| **Fonte (Source)** | Especificação Arquitetural — "Orquestração de Infraestrutura, Deploy em VPS" |
| **Requisito Pai** | `—` |
| **Requisitos Filhos** | `—` |
| **Casos de Uso / Histórias Relacionadas** | `—` |

---

## Justificativa (Rationale)

> A segmentação de rede mitiga um dos vetores de ataque mais comuns em VPS: a varredura de portas externas contra o banco. A terminação TLS centralizada no proxy garante tráfego em HTTPS e reduz a superfície de ataque dos contêineres internos.

`Atende à necessidade de isolamento de processos e comunicação criptográfica em produção.`

---

## Critérios de Verificação e Aceitação

### Método de Verificação
- [x] Inspeção / Revisão
- [x] Teste
- [ ] Demonstração
- [x] Análise
- [ ] Simulação

### Critérios de Aceitação (Gherkin / BDD recomendado)
```gherkin
Funcionalidade: Segurança de infraestrutura
  Cenário: Roteamento por domínio/path
    Dado o ambiente de produção em execução
    Quando uma requisição chega na porta 443
    Então o proxy termina o TLS e roteia para /, /api ou /mock conforme o path

  Cenário: Isolamento do banco
    Dado a rede virtual Docker em produção
    Quando um agente externo tenta acessar o PostgreSQL
    Então a conexão é recusada (sem exposição pública)
```

### Casos de Teste Associados
| ID do Teste | Descrição | Resultado Esperado |
|-------------|-----------|--------------------|
| TEST-001 | Terminação TLS na 443 | Tráfego servido em HTTPS |
| TEST-002 | Roteamento de /api e /mock | Rotas corretas por path |
| TEST-003 | Porta 5432 externa | Conexão recusada |
| TEST-004 | Conexão API → banco na rede interna | Sucesso apenas internamente |

---

## Análise de Conformidade com a Norma

| Característica | Atende? | Observações |
|----------------|---------|-------------|
| **Necessary (Necessário)** | [x] Sim [ ] Não | Segurança de produção é inegociável. |
| **Appropriate (Apropriado)** | [x] Sim [ ] Não | Especifica a topologia, não o config. |
| **Unambiguous (Não ambíguo)** | [x] Sim [ ] Não | Porta 443, TLS e isolamento definidos. |
| **Complete (Completo)** | [x] Sim [ ] Não | Cobre proxy, TLS e isolamento do banco. |
| **Singular (Singular)** | [x] Sim [ ] Não | Trata exclusivamente de infraestrutura. |
| **Feasible (Factível)** | [x] Sim [ ] Não | Nginx/Traefik e Docker são consolidados. |
| **Verifiable (Verificável)** | [x] Sim [ ] Não | Comprovável via teste de rede e análise. |
| **Correct (Correto)** | [x] Sim [ ] Não | Reflete a exigência de segurança da VPS. |
| **Conforming (Conforme)** | [x] Sim [ ] Não | Segue o template aprovado. |

---

## Informações Complementares

### Restrições e Dependências
- `Domínio corporativo: prs.adolfo.tec.br.`
- `Proxy reverso: Nginx ou Traefik.`
- `Banco acessível somente pela API e ferramentas seguras de migração.`

### Notas e Suposições
- `Supõe-se que o Mock (/mock) é mantido publicamente acessível para depuração e consumo local.`
- `Assume-se que a infraestrutura é tratada como código (IaC) via Docker Compose.`

### Anexos / Referências
- `Especificação Arquitetural — Topologia de Rede e Proxy Reverso`

---

## Histórico de Alterações

| Versão | Data | Autor | Alteração |
|--------|------|-------|-----------|
| 1.0 | 29/08/2026 | `Rafael Adolfo Silva Ferreira` | Criação inicial |
