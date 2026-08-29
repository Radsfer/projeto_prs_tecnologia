# Ficha de Requisito

> **Norma de referência:** ISO/IEC/IEEE 29148:2018 (Seções 5.2.5 e 5.2.8)

---

## Identificação

| Campo | Valor |
|-------|-------|
| **ID** | `REQ-NFR-004` |
| **Nome** | `Confiabilidade e Resiliência da Integração IIoT` |
| **Tipo** | `Confiabilidade` |
| **Prioridade** | `Essencial` |
| **Status** | `Proposto` |
| **Versão** | `1.0` |

---

## Descrição

### Texto do Requisito
> O backend deve instanciar um worker agendado que realiza polling assíncrono do endpoint /mock com timeout de três mil milissegundos, abortando preventivamente a conexão em caso de indisponibilidade transitória ou resposta excessiva e registrando a falha em log, com recuperação transparente no pulso subsequente; a ingestão deve validar o payload (machine_id UUID, timestamp ISO 8601 UTC, status_operacional em RUNNING/IDLE/FAULT, ciclos_produzidos inteiro), descartar eventos de máquina desconhecida via auditoria e consolidar ciclos por transação bancária com bloqueio otimista ou serializável.

`O worker de polling deve usar timeout de 3000ms, tolerar falhas com recuperação no próximo pulso, validar o payload e consolidar ciclos em transação com controle de concorrência.`

### Condições de Aplicação
- Condição 1: `O serviço Mock responde em https://prs.adolfo.tec.br/mock.`
- Condição 2: `O worker executa em regime não assistido por temporizador/cron.`
- Condição 3: `A consolidação de ciclos pode concorrer com o registro manual do operador (REQ-FUNC-005).`

---

## Rastreabilidade

| Campo | Valor |
|-------|-------|
| **Fonte (Source)** | Especificação Arquitetural — "Engenharia de Integração IIoT" |
| **Requisito Pai** | `REQ-NFR-003` (exceção do Mock externo) |
| **Requisitos Filhos** | `—` |
| **Casos de Uso / Histórias Relacionadas** | `UC-IIOT-001` (Ingestão de telemetria) |

---

## Justificativa (Rationale)

> A telemetria simulada reproduz os desafios de sistemas distribuídos: idempotência, partições de rede e condições de corrida. O timeout de 3s evita esgotar o pool de conexões do Node.js; o polling (em vez de webhooks) simplifica firewalls industriais; e o controle de concorrência impede que o acréscimo automático corrompa o registro manual.

`Atende à necessidade de ingestão resiliente e íntegra de sinais de máquinas.`

---

## Critérios de Verificação e Aceitação

### Método de Verificação
- [ ] Inspeção / Revisão
- [x] Teste
- [ ] Demonstração
- [ ] Análise
- [x] Simulação

### Critérios de Aceitação (Gherkin / BDD recomendado)
```gherkin
Funcionalidade: Ingestão de telemetria IIoT
  Cenário: Polling bem-sucedido
    Dado o Mock disponível e payload válido
    Quando o worker interroga o endpoint /mock
    Então o sistema consolida os ciclos produzidos em transação

  Cenário: Timeout de resposta
    Dado o Mock com resposta superior a 3000ms
    Quando o worker interroga o endpoint
    Então o sistema aborta a conexão e registra a falha em log
    E recupera transparentemente no próximo pulso

  Cenário: Máquina desconhecida
    Dado um machine_id não cadastrado
    Quando o backend valida o payload
    Então o evento é registrado em auditoria e descartado

  Cenário: Concorrência com registro manual
    Dado acréscimo automático e apontamento manual simultâneos
    Quando ambos tentam persistir na mesma máquina/turno
    Então o controle de concorrência impede sobreposição de dados
```

### Casos de Teste Associados
| ID do Teste | Descrição | Resultado Esperado |
|-------------|-----------|--------------------|
| TEST-001 | Polling com payload válido | Consolidação transacional correta |
| TEST-002 | Resposta > 3000ms | Abort + log; recuperação no próximo pulso |
| TEST-003 | machine_id desconhecido | Auditoria + descarte |
| TEST-004 | timestamp fora de UTC | Validação rejeita o evento |
| TEST-005 | status_operacional FAULT | Inicia contador de parada não programada |

---

## Análise de Conformidade com a Norma

| Característica | Atende? | Observações |
|----------------|---------|-------------|
| **Necessary (Necessário)** | [x] Sim [ ] Não | Integração IIoT é diferencial do produto. |
| **Appropriate (Apropriado)** | [x] Sim [ ] Não | Especifica contrato e resiliência. |
| **Unambiguous (Não ambíguo)** | [x] Sim [ ] Não | Timeout, campos e enums definidos. |
| **Complete (Completo)** | [x] Sim [ ] Não | Cobre sucesso, falha, descarte e concorrência. |
| **Singular (Singular)** | [x] Sim [ ] Não | Trata exclusivamente da ingestão IIoT. |
| **Feasible (Factível)** | [x] Sim [ ] Não | Polling e transações são padrão. |
| **Verifiable (Verificável)** | [x] Sim [ ] Não | Comprovável via teste e simulação. |
| **Correct (Correto)** | [x] Sim [ ] Não | Reflete a operação híbrida real. |
| **Conforming (Conforme)** | [x] Sim [ ] Não | Segue o template aprovado. |

---

## Informações Complementares

### Restrições e Dependências
- `Timeout máximo: 3000ms.`
- `Formato do payload obrigatório: JSON com machine_id, timestamp, status_operacional, ciclos_produzidos.`
- `Consolidação exige transação com bloqueio otimista ou serializável no PostgreSQL.`

### Notas e Suposições
- `Supõe-se que o Mock está hospedado publicamente para consumo também pelo ambiente local.`
- `Assume-se que transições para FAULT iniciam contador de paradas não programadas no backend.`

### Anexos / Referências
- `Especificação Arquitetural — Estrutura de Comunicação e Resiliência de Sinais`

---

## Histórico de Alterações

| Versão | Data | Autor | Alteração |
|--------|------|-------|-----------|
| 1.0 | 29/08/2026 | `PRS Tecnologia` | Criação inicial |
