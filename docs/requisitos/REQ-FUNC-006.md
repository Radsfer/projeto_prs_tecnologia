# Ficha de Requisito

> **Norma de referência:** ISO/IEC/IEEE 29148:2018 (Seções 5.2.5 e 5.2.8)

---

## Identificação

| Campo | Valor |
|-------|-------|
| **ID** | `REQ-FUNC-006` |
| **Nome** | `Matriz de Auditoria e Filtros de Listagem` |
| **Tipo** | `Funcional / Performance` |
| **Prioridade** | `Essencial` |
| **Status** | `Proposto` |
| **Versão** | `1.0` |

---

## Descrição

### Texto do Requisito
> O sistema deve fornecer aos gestores uma listagem paginada de todos os apontamentos, suportando filtros combinados por período cronológico, máquina e operador, delegando a consulta ao banco de dados por deslocamento e limite (Offset/Limit) com índices B-Tree em data, identificador de máquina e turno, e retornando para cada registro a eficiência unitária calculada sob demanda e o valor produtivo concatenado à sua unidade de medida.

`O sistema deve listar apontamentos de forma paginada e filtrável (período, máquina, operador), com paginação Offset/Limit apoiada em índices B-Tree, injetando eficiência unitária e unidade de medida em cada registro.`

### Condições de Aplicação
- Condição 1: `A requisição é autenticada por um usuário com perfil de gestor.`
- Condição 2: `A base pode conter até 100.000 registros contínuos.`
- Condição 3: `Os filtros podem ser combinados livremente entre período, máquina e operador.`

---

## Rastreabilidade

| Campo | Valor |
|-------|-------|
| **Fonte (Source)** | Especificação Arquitetural — "Auditoria, Visualização Analítica e Dashboards Estratégicos" |
| **Requisito Pai** | `—` |
| **Requisitos Filhos** | `REQ-FUNC-010` (exportação CSV estende a auditoria), `REQ-NFR-001` (limite de latência) |
| **Casos de Uso / Histórias Relacionadas** | `UC-AUDIT-001` (Listagem e filtro de apontamentos) |

---

## Justificativa (Rationale)

> A auditoria é a porta de exploração do histórico produtivo. Delegar o processamento ao banco (Offset/Limit + índices B-Tree) evita materializar 100.000 registros na memória do Node.js, garantindo resposta em menos de um segundo e permitindo a composição de filtros para isolar gargalos microscópicos.

`Atende à necessidade de exploração histórica performática e combinável sobre grandes volumes.`

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
Funcionalidade: Listagem de apontamentos
  Cenário: Paginação padrão
    Dado um gestor autenticado e registros na base
    Quando solicita uma página com tamanho definido
    Então o sistema retorna a página correspondente com metadados de paginação

  Cenário: Filtros combinados
    Dado o gestor informa período, máquina e operador
    Quando solicita a listagem filtrada
    Então o sistema retorna somente os registros que atendem a todos os filtros

  Cenário: Eficiência e unidade por registro
    Dado um registro retornado
    Quando o backend serializa a resposta
    Então cada item contém eficiência unitária calculada e valor concatenado à unidade
```

### Casos de Teste Associados
| ID do Teste | Descrição | Resultado Esperado |
|-------------|-----------|--------------------|
| TEST-001 | Paginação com Offset/Limit | Página correta e metadados de paginação |
| TEST-002 | Filtro por período | Somente registros no intervalo |
| TEST-003 | Filtro combinado período+máquina+operador | Interseção correta |
| TEST-004 | Eficiência unitária calculada | Valor percentual correto por registro |
| TEST-005 | Volume de 100.000 registros | Resposta em menos de 1 segundo |

---

## Análise de Conformidade com a Norma

| Característica | Atende? | Observações |
|----------------|---------|-------------|
| **Necessary (Necessário)** | [x] Sim [ ] Não | Auditoria é requisito de rastreabilidade e decisão. |
| **Appropriate (Apropriado)** | [x] Sim [ ] Não | Especifica paginação e filtros, não o SQL. |
| **Unambiguous (Não ambíguo)** | [x] Sim [ ] Não | Filtros e paginação definidos. |
| **Complete (Completo)** | [x] Sim [ ] Não | Cobre paginação, filtros e serialização. |
| **Singular (Singular)** | [x] Sim [ ] Não | Trata exclusivamente da listagem de auditoria. |
| **Feasible (Factível)** | [x] Sim [ ] Não | Offset/Limit e índices B-Tree são nativos. |
| **Verifiable (Verificável)** | [x] Sim [ ] Não | Comprovável via testes e análise de plano de consulta. |
| **Correct (Correto)** | [x] Sim [ ] Não | Reflete a necessidade de exploração histórica. |
| **Conforming (Conforme)** | [x] Sim [ ] Não | Segue o template aprovado. |

---

## Informações Complementares

### Restrições e Dependências
- `Índices B-Tree obrigatórios: apontamentos(date, machineId, shiftId).`
- `O processamento não pode ocorrer em memória na camada Node.js.`
- `Restrito ao perfil gestor (REQ-FUNC-009).`

### Notas e Suposições
- `Supõe-se paginação por offset/limit, não cursor.`
- `Assume-se que a eficiência unitária é calculada sob demanda na serialização.`

### Anexos / Referências
- `Documentação Prisma — paginação e índices`

---

## Histórico de Alterações

| Versão | Data | Autor | Alteração |
|--------|------|-------|-----------|
| 1.0 | 29/08/2026 | `PRS Tecnologia` | Criação inicial |
