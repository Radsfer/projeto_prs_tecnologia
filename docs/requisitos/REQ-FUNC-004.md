# Ficha de Requisito

> **Norma de referência:** ISO/IEC/IEEE 29148:2018 (Seções 5.2.5 e 5.2.8)

---

## Identificação

| Campo | Valor |
|-------|-------|
| **ID** | `REQ-FUNC-004` |
| **Nome** | `Formulação de Metas de Produção` |
| **Tipo** | `Funcional` |
| **Prioridade** | `Essencial` |
| **Status** | `Proposto` |
| **Versão** | `1.0` |

---

## Descrição

### Texto do Requisito
> O sistema deve permitir ao gestor definir metas quantitativas de produção vinculadas à unidade de medida da máquina associada, com valor alvo inteiro positivo limitado a 999.999, vedando datas pretéritas e impondo unicidade composta entre máquina, turno e data calendário.

`O sistema deve criar metas com valor inteiro positivo (≤ 999.999), data futura ou presente, e unicidade composta (máquina + turno + data), rejeitando sobreposições com HTTP 409.`

### Condições de Aplicação
- Condição 1: `A requisição é autenticada por um usuário com perfil de gestor.`
- Condição 2: `A máquina e o turno referenciados existem e estão ativos.`
- Condição 3: `A data selecionada não é anterior à data atual.`
- Condição 4: `Não existe meta prévia para a mesma combinação máquina/turno/data.`

---

## Rastreabilidade

| Campo | Valor |
|-------|-------|
| **Fonte (Source)** | Especificação Arquitetural — "Orquestração Analítica e Planejamento de Desempenho" |
| **Requisito Pai** | `—` |
| **Requisitos Filhos** | `REQ-FUNC-005` (apontamento verifica meta), `REQ-FUNC-007` (meta consolidada no dashboard), `REQ-FUNC-008` (alerta por eficiência) |
| **Casos de Uso / Histórias Relacionadas** | `UC-TARGET-001` (CRUD de metas) |

---

## Justificativa (Rationale)

> A meta converte o sistema transacional em orquestrador de produtividade, fornecendo o denominador da eficiência. A unicidade composta tripla impede metas conflitantes para o mesmo período, e a vedação de datas pretéritas impede manipulação retroativa da auditoria de produção.

`Atende à necessidade de um alvo de planejamento íntegro e não ambíguo por máquina/turno/data.`

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
Funcionalidade: Definição de metas de produção
  Cenário: Meta válida
    Dado um gestor autenticado com máquina e turno ativos
    Quando envia valor 500, data futura, máquina "pieces" e turno
    Então o sistema retorna HTTP 201 e a meta representa 500 peças

  Cenário: Sobreposição de meta
    Dado uma meta existente para a mesma máquina/turno/data
    Quando o gestor envia nova meta para essa combinação
    Então o sistema retorna HTTP 409 (conflito)

  Cenário: Data pretérita
    Dado o gestor envia meta com data anterior à atual
    Quando o backend valida a entrada
    Então o sistema rejeita com erro de validação

  Cenário: Valor fora do limite
    Dado o gestor envia valor 0, negativo ou maior que 999.999
    Quando o backend valida a entrada
    Então o sistema rejeita com erro de validação
```

### Casos de Teste Associados
| ID do Teste | Descrição | Resultado Esperado |
|-------------|-----------|--------------------|
| TEST-001 | Meta válida (500 / pieces / data futura) | HTTP 201 |
| TEST-002 | Combinação máquina+turno+data duplicada | HTTP 409 |
| TEST-003 | Data pretérita | Erro de validação |
| TEST-004 | Valor 0, negativo ou > 999.999 | Erro de validação |

---

## Análise de Conformidade com a Norma

| Característica | Atende? | Observações |
|----------------|---------|-------------|
| **Necessary (Necessário)** | [x] Sim [ ] Não | Sem meta não há cálculo de eficiência. |
| **Appropriate (Apropriado)** | [x] Sim [ ] Não | Regras de negócio, sem impor design. |
| **Unambiguous (Não ambíguo)** | [x] Sim [ ] Não | Limite numérico e unicidade explícitos. |
| **Complete (Completo)** | [x] Sim [ ] Não | Cobre valor, data, unidade e unicidade. |
| **Singular (Singular)** | [x] Sim [ ] Não | Trata exclusivamente de metas. |
| **Feasible (Factível)** | [x] Sim [ ] Não | Composite unique constraint é nativo no PostgreSQL. |
| **Verifiable (Verificável)** | [x] Sim [ ] Não | Comprovável via testes de API e banco. |
| **Correct (Correto)** | [x] Sim [ ] Não | Reflete o planejamento de produção. |
| **Conforming (Conforme)** | [x] Sim [ ] Não | Segue o template aprovado. |

---

## Informações Complementares

### Restrições e Dependências
- `Unicidade composta (machineId + shiftId + date) via constraint no banco, processada antes do commit.`
- `A meta herda a unidade de medida da máquina; não há unidade própria da meta.`
- `Depende de máquina e turno existentes (REQ-FUNC-002 e REQ-FUNC-003).`

### Notas e Suposições
- `Supõe-se que metas são criadas/editadas apenas pelo gestor.`
- `Assume-se que a data é comparada em relação à data atual no fuso do servidor.`

### Anexos / Referências
- `Documentação PostgreSQL — composite unique constraint e índices`

---

## Histórico de Alterações

| Versão | Data | Autor | Alteração |
|--------|------|-------|-----------|
| 1.0 | 29/08/2026 | `Rafael Adolfo Silva Ferreira` | Criação inicial |
