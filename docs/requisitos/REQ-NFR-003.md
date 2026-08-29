# Ficha de Requisito

> **Norma de referência:** ISO/IEC/IEEE 29148:2018 (Seções 5.2.5 e 5.2.8)

---

## Identificação

| Campo | Valor |
|-------|-------|
| **ID** | `REQ-NFR-003` |
| **Nome** | `Portabilidade e Execução Local via Docker` |
| **Tipo** | `Portabilidade / Restrição de Design` |
| **Prioridade** | `Essencial` |
| **Status** | `Proposto` |
| **Versão** | `1.0` |

---

## Descrição

### Texto do Requisito
> O ambiente de desenvolvimento deve operar de forma íntegra localmente dependendo exclusivamente da presença do Docker, sem exigir instalação local de linguagens, frameworks ou banco de dados no hospedeiro, sendo provisionado pela duplicação do arquivo .env.example para .env e execução do comando de orquestração unificado.

`O ambiente local deve ser provisionado somente com Docker, via .env (a partir de .env.example) e comando de orquestração unificado, sem instalações adicionais no hospedeiro.`

### Condições de Aplicação
- Condição 1: `O Docker Engine está presente no hospedeiro.`
- Condição 2: `O arquivo .env foi gerado a partir de .env.example.`
- Condição 3: `O comando de orquestração (ex.: docker compose up --build) é executado.`

---

## Rastreabilidade

| Campo | Valor |
|-------|-------|
| **Fonte (Source)** | Especificação Arquitetural — "Execução Local, Continuidade de Desenvolvimento e Documentação" |
| **Requisito Pai** | `—` |
| **Requisitos Filhos** | `REQ-NFR-004` (exceção: Mock externo consumido pelo backend local) |
| **Casos de Uso / Histórias Relacionadas** | `—` |

---

## Justificativa (Rationale)

> O provisionamento simplificado acelera o onboarding de novos desenvolvedores e avaliadores técnicos, eliminando discrepâncias entre ambientes. A paridade local/produção via Docker reduz falhas de "funciona na minha máquina".

`Atende à necessidade de onboarding rápido e reprodutibilidade do ambiente.`

---

## Critérios de Verificação e Aceitação

### Método de Verificação
- [ ] Inspeção / Revisão
- [ ] Teste
- [x] Demonstração
- [ ] Análise
- [ ] Simulação

### Critérios de Aceitação (Gherkin / BDD recomendado)
```gherkin
Funcionalidade: Provisionamento do ambiente local
  Cenário: Subida sem instalações locais
    Dado um hospedeiro com Docker, sem Node/PostgreSQL instalados
    Quando o desenvolvedor copia .env.example para .env e executa o comando de orquestração
    Então a API responde em localhost:3333
    E o frontend web responde em localhost:3000
    E o PostgreSQL responde em localhost:5432
```

### Casos de Teste Associados
| ID do Teste | Descrição | Resultado Esperado |
|-------------|-----------|--------------------|
| TEST-001 | Provisionamento apenas com Docker | Serviços sobem nas portas 3333/3000/5432 |
| TEST-002 | Sem Node/PostgreSQL no hospedeiro | Ambiente funciona mesmo assim |

---

## Análise de Conformidade com a Norma

| Característica | Atende? | Observações |
|----------------|---------|-------------|
| **Necessary (Necessário)** | [x] Sim [ ] Não | Provisionamento é prioridade máxima. |
| **Appropriate (Apropriado)** | [x] Sim [ ] Não | Restrição de design no nível correto. |
| **Unambiguous (Não ambíguo)** | [x] Sim [ ] Não | Portas e passos determinados. |
| **Complete (Completo)** | [x] Sim [ ] Não | Cobre pré-condição, passos e resultado. |
| **Singular (Singular)** | [x] Sim [ ] Não | Trata exclusivamente de portabilidade local. |
| **Feasible (Factível)** | [x] Sim [ ] Não | Docker Compose é padrão consolidado. |
| **Verifiable (Verificável)** | [x] Sim [ ] Não | Comprovável por demonstração. |
| **Correct (Correto)** | [x] Sim [ ] Não | Reflete a exigência de paridade de ambientes. |
| **Conforming (Conforme)** | [x] Sim [ ] Não | Segue o template aprovado. |

---

## Informações Complementares

### Restrições e Dependências
- `Dependência única: Docker Engine.`
- `Portas locais: API 3333, web 3000, PostgreSQL 5432.`
- `Exceção: o Mock de IoT é consumido externamente (REQ-NFR-004), com instrução para subir localmente em caso de ausência de internet.`

### Notas e Suposições
- `Supõe-se que o README documenta exaustivamente os passos e as credenciais sintéticas.`
- `Assume-se que o comando de orquestração unificado é docker compose up --build.`

### Anexos / Referências
- `README.md do repositório (a ser produzido)`

---

## Histórico de Alterações

| Versão | Data | Autor | Alteração |
|--------|------|-------|-----------|
| 1.0 | 29/08/2026 | `Rafael Adolfo Silva Ferreira` | Criação inicial |
