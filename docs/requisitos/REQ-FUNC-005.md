# Ficha de Requisito

> **Norma de referência:** ISO/IEC/IEEE 29148:2018 (Seções 5.2.5 e 5.2.8)

---

## Identificação

| Campo | Valor |
|-------|-------|
| **ID** | `REQ-FUNC-005` |
| **Nome** | `Registro de Apontamentos em Dispositivos Móveis` |
| **Tipo** | `Funcional` |
| **Prioridade** | `Essencial` |
| **Status** | `Proposto` |
| **Versão** | `1.0` |

---

## Descrição

### Texto do Requisito
> O sistema deve permitir ao operador, via aplicativo móvel, registrar apontamentos selecionando máquina e turno ativos, declarando a data e informando a produção bruta alcançada e o tempo consolidado de parada em minutos, espelhando a unidade de medida da máquina no campo de quantidade; a ausência de meta para a combinação máquina/turno/data não deve bloquear a persistência, que ocorrerá integralmente com status HTTP 201 acompanhado de metadados sinalizando a omissão do planejamento.

`O sistema deve persistir apontamentos do operador (máquina, turno, data, quantidade, minutos de parada) mesmo sem meta prévia, retornando HTTP 201 com sinalização de meta ausente no corpo da resposta.`

### Condições de Aplicação
- Condição 1: `A requisição é autenticada por um usuário com perfil de operador.`
- Condição 2: `A máquina e o turno selecionados estão ativos.`
- Condição 3: `Os valores de produção e tempo de parada são numéricos não negativos.`
- Condição 4: `Pode ou não existir meta para a combinação máquina/turno/data informada.`

---

## Rastreabilidade

| Campo | Valor |
|-------|-------|
| **Fonte (Source)** | Especificação Arquitetural — "Aquisição de Dados no Chão de Fábrica e Operação Híbrida" |
| **Requisito Pai** | `—` |
| **Requisitos Filhos** | `REQ-FUNC-008` (alerta disparado no registro), `REQ-FUNC-006` (apontamento listado na auditoria) |
| **Casos de Uso / Histórias Relacionadas** | `UC-RECORD-001` (Registro de apontamento) |

---

## Justificativa (Rationale)

> O apontamento manual provê a riqueza semântica das paradas (downtime) e observações operacionais inviáveis de capturar apenas com sensores. A tolerância à ausência de meta respeita a imprevisibilidade da produção real, permitindo o registro de produção "órfã" de máquinas ativadas emergencialmente, sem perder o dado.

`Atende à necessidade de captura fidedigna do chão de fábrica sem impor pré-condições que bloqueiem a realidade operacional.`

---

## Critérios de Verificação e Aceitação

### Método de Verificação
- [x] Inspeção / Revisão
- [x] Teste
- [ ] Demonstração
- [ ] Análise
- [ ] Simulação

### Critérios de Aceitação (Gherkin / BDD recomendado)
```gherkin
Funcionalidade: Registro de apontamentos
  Cenário: Apontamento com meta existente
    Dado um operador autenticado e meta cadastrada para máquina/turno/data
    Quando envia produção e minutos de parada
    Então o sistema retorna HTTP 201 com o apontamento persistido
    E o corpo da resposta contém a referência à meta

  Cenário: Apontamento sem meta
    Dado um operador autenticado sem meta para máquina/turno/data
    Quando envia produção e minutos de parada
    Então o sistema retorna HTTP 201 com o apontamento persistido
    E o corpo da resposta sinaliza a ausência de planejamento

  Cenário: Máquina ou turno inativo
    Dado o operador seleciona máquina ou turno inativo
    Quando o backend valida a entrada
    Então o sistema rejeita com erro de validação
```

### Casos de Teste Associados
| ID do Teste | Descrição | Resultado Esperado |
|-------------|-----------|--------------------|
| TEST-001 | Apontamento com meta existente | HTTP 201 + referência à meta |
| TEST-002 | Apontamento sem meta | HTTP 201 + sinalização de meta ausente |
| TEST-003 | Máquina inativa | Erro de validação |
| TEST-004 | Valor de produção negativo | Erro de validação |
| TEST-005 | Interface espelha unidade da máquina | Campo de quantidade exibe a unidade correta |

---

## Análise de Conformidade com a Norma

| Característica | Atende? | Observações |
|----------------|---------|-------------|
| **Necessary (Necessário)** | [x] Sim [ ] Não | É a origem primária dos dados de produção. |
| **Appropriate (Apropriado)** | [x] Sim [ ] Não | Especifica o dado a capturar, não o layout. |
| **Unambiguous (Não ambíguo)** | [x] Sim [ ] Não | Campos e comportamento sem meta definidos. |
| **Complete (Completo)** | [x] Sim [ ] Não | Cobre com e sem meta, além de validações. |
| **Singular (Singular)** | [x] Sim [ ] Não | Trata exclusivamente do registro manual. |
| **Feasible (Factível)** | [x] Sim [ ] Não | Persistência transacional é padrão no stack. |
| **Verifiable (Verificável)** | [x] Sim [ ] Não | Comprovável via testes de API e mobile. |
| **Correct (Correto)** | [x] Sim [ ] Não | Reflete a operação híbrida do chão de fábrica. |
| **Conforming (Conforme)** | [x] Sim [ ] Não | Segue o template aprovado. |

---

## Informações Complementares

### Restrições e Dependências
- `Depende de máquinas e turnos ativos (REQ-FUNC-002 e REQ-FUNC-003).`
- `O registro manual concorre com a ingestão IIoT; requer bloqueio otimista ou serializável no PostgreSQL.`
- `A operação de escrita é restrita ao perfil operador (REQ-FUNC-009).`

### Notas e Suposições
- `Supõe-se que a data declarada pelo operador é a data do turno de produção.`
- `Assume-se que produção bruta e parada são os únicos valores quantitativos obrigatórios no MVP.`

### Anexos / Referências
- `Especificação Arquitetural — concorrência entre apontamento manual e Mock IIoT`

---

## Histórico de Alterações

| Versão | Data | Autor | Alteração |
|--------|------|-------|-----------|
| 1.0 | 29/08/2026 | `Rafael Adolfo Silva Ferreira` | Criação inicial |
