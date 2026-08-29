# Ficha de Requisito

> **Norma de referência:** ISO/IEC/IEEE 29148:2018 (Seções 5.2.5 e 5.2.8)

---

## Identificação

| Campo | Valor |
|-------|-------|
| **ID** | `REQ-FUNC-003` |
| **Nome** | `Segmentação Temporal em Turnos Operacionais` |
| **Tipo** | `Funcional` |
| **Prioridade** | `Essencial` |
| **Status** | `Proposto` |
| **Versão** | `1.0` |

---

## Descrição

### Texto do Requisito
> O sistema deve permitir ao gestor cadastrar e manter turnos operacionais, exigindo um nome unívoco e os horários de início e término em formatação estrita HH:MM, com validação da coerência cronológica entre as marcações realizada no backend.

`O sistema deve cadastrar turnos com nome único e horários de início/término em HH:MM, rejeitando marcações cronologicamente incoerentes.`

### Condições de Aplicação
- Condição 1: `A requisição é autenticada por um usuário com perfil de gestor.`
- Condição 2: `O nome do turno não coincide com o de outro turno cadastrado.`
- Condição 3: `Os horários são fornecidos no formato HH:MM e o horário de término é posterior ao de início.`

---

## Rastreabilidade

| Campo | Valor |
|-------|-------|
| **Fonte (Source)** | Especificação Arquitetural — "Modelagem de Domínio e Gestão de Ativos Industriais" |
| **Requisito Pai** | `—` |
| **Requisitos Filhos** | `REQ-FUNC-004` (meta referencia turno), `REQ-FUNC-005` (apontamento referencia turno), `REQ-FUNC-006` (índice por turno) |
| **Casos de Uso / Histórias Relacionadas** | `UC-SHIFT-001` (CRUD de turnos) |

---

## Justificativa (Rationale)

> Turnos atuam como a segunda dimensão da matriz analítica, permitindo correlacionar desempenho do equipamento à alocação de mão de obra e a períodos de manutenção. A validação cronológica previne a criação de períodos logicamente impossíveis que distorceriam os indicadores.

`Atende à necessidade de discretizar a produção no tempo para análise de desempenho por período de trabalho.`

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
Funcionalidade: Cadastro de turnos
  Cenário: Cadastro válido
    Dado um gestor autenticado
    Quando envia nome único, início "06:00" e término "14:00"
    Então o sistema retorna HTTP 201 com o turno criado

  Cenário: Horários incoerentes
    Dado o gestor envia início "22:00" e término "06:00" sem tratamento de virada de dia
    Quando o backend valida a coerência cronológica
    Então o sistema rejeita com erro de validação

  Cenário: Nome duplicado
    Dado um nome de turno já cadastrado
    Quando o gestor envia novo turno com esse nome
    Então o sistema rejeita com erro de conflito
```

### Casos de Teste Associados
| ID do Teste | Descrição | Resultado Esperado |
|-------------|-----------|--------------------|
| TEST-001 | Cadastro com nome único e horários válidos | HTTP 201 |
| TEST-002 | Término anterior ao início | Erro de validação |
| TEST-003 | Formato diferente de HH:MM | Erro de validação |
| TEST-004 | Nome de turno duplicado | Rejeição com conflito |

---

## Análise de Conformidade com a Norma

| Característica | Atende? | Observações |
|----------------|---------|-------------|
| **Necessary (Necessário)** | [x] Sim [ ] Não | Sem turnos, a matriz analítica fica incompleta. |
| **Appropriate (Apropriado)** | [x] Sim [ ] Não | Especifica regras, não o design da tela. |
| **Unambiguous (Não ambíguo)** | [x] Sim [ ] Não | Formato HH:MM e regra cronológica explícitos. |
| **Complete (Completo)** | [x] Sim [ ] Não | Cobre cadastro, unicidade e validação. |
| **Singular (Singular)** | [x] Sim [ ] Não | Trata exclusivamente de turnos. |
| **Feasible (Factível)** | [x] Sim [ ] Não | Validação de horário é trivial no backend. |
| **Verifiable (Verificável)** | [x] Sim [ ] Não | Comprovável via testes de API. |
| **Correct (Correto)** | [x] Sim [ ] Não | Reflete a discretização temporal da produção. |
| **Conforming (Conforme)** | [x] Sim [ ] Não | Segue o template aprovado. |

---

## Informações Complementares

### Restrições e Dependências
- `Nome do turno deve ser unívoco.`
- `Formato de horário estrito: HH:MM (24 horas).`

### Notas e Suposições
- `Supõe-se que turnos não cruzam a virada de dia sem regra adicional; turnos noturnos devem ser modelados explicitamente.`
- `Assume-se que a listagem de turnos ativos é acessível também ao operador (catálogo auxiliar).`

### Anexos / Referências
- `—`

---

## Histórico de Alterações

| Versão | Data | Autor | Alteração |
|--------|------|-------|-----------|
| 1.0 | 29/08/2026 | `Rafael Adolfo Silva Ferreira` | Criação inicial |
