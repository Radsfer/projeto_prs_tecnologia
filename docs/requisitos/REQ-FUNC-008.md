# Ficha de Requisito

> **Norma de referência:** ISO/IEC/IEEE 29148:2018 (Seções 5.2.5 e 5.2.8)

---

## Identificação

| Campo | Valor |
|-------|-------|
| **ID** | `REQ-FUNC-008` |
| **Nome** | `Disparo de Notificações de Alerta de Eficiência` |
| **Tipo** | `Funcional` |
| **Prioridade** | `Essencial` |
| **Status** | `Proposto` |
| **Versão** | `1.0` |

---

## Descrição

### Texto do Requisito
> O sistema deve avaliar o rendimento no momento da submissão do apontamento e, quando a eficiência for inferior a oitenta por cento (80%) em relação ao alvo planejado, sinalizar a mudança de estado global do equipamento, refletindo um indicador visual vermelho no aplicativo do operador e deslocando a máquina para uma visualização crítica no topo do dashboard gerencial.

`O sistema deve disparar alerta quando a eficiência for inferior a 80%, exibindo indicador vermelho no aplicativo do operador e destacando a máquina no topo do dashboard.`

### Condições de Aplicação
- Condição 1: `Existe meta planejada para a combinação máquina/turno/data do apontamento.`
- Condição 2: `A eficiência calculada (produção real / meta × 100) é inferior a 80%.`
- Condição 3: `O apontamento foi persistido com sucesso.`

---

## Rastreabilidade

| Campo | Valor |
|-------|-------|
| **Fonte (Source)** | Especificação Arquitetural — "Gestão por Exceção, Alertas e Exportação" |
| **Requisito Pai** | `REQ-FUNC-007` (dashboard consome o realce), `REQ-FUNC-005` (disparo no registro) |
| **Requisitos Filhos** | `—` |
| **Casos de Uso / Histórias Relacionadas** | `UC-ALERT-001` (Alerta de baixa eficiência) |

---

## Justificativa (Rationale)

> A gestão por exceção concentra a atenção nos desvios, em vez de exigir monitoramento contínuo. O alerta imediato abaixo de 80% injeta consciência situacional à mão de obra e à gerência, reduzindo perdas materiais nos ciclos subsequentes.

`Atende à necessidade de resposta proativa a subdesempenhos que comprometem o desperdício produtivo.`

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
Funcionalidade: Alerta de eficiência
  Cenário: Eficiência abaixo do limiar
    Dado um apontamento persistido com eficiência de 70%
    Quando o sistema avalia o rendimento
    Então a máquina é marcada como crítica
    E o aplicativo do operador exibe indicador vermelho
    E o dashboard desloca a máquina para o topo

  Cenário: Eficiência no limiar ou acima
    Dado um apontamento persistido com eficiência de 80% ou superior
    Quando o sistema avalia o rendimento
    Então nenhum alerta é disparado
```

### Casos de Teste Associados
| ID do Teste | Descrição | Resultado Esperado |
|-------------|-----------|--------------------|
| TEST-001 | Eficiência 70% | Alerta disparado; indicador vermelho + realce |
| TEST-002 | Eficiência 80% | Sem alerta |
| TEST-003 | Eficiência 95% | Sem alerta |
| TEST-004 | Sem meta | Sem alerta (sem denominador) |

---

## Análise de Conformidade com a Norma

| Característica | Atende? | Observações |
|----------------|---------|-------------|
| **Necessary (Necessário)** | [x] Sim [ ] Não | Proatividade é diferencial do produto. |
| **Appropriate (Apropriado)** | [x] Sim [ ] Não | Especifica limiar e reflexos, não o design. |
| **Unambiguous (Não ambíguo)** | [x] Sim [ ] Não | Limiar de 80% e canais definidos. |
| **Complete (Completo)** | [x] Sim [ ] Não | Cobre disparo, app e dashboard. |
| **Singular (Singular)** | [x] Sim [ ] Não | Trata exclusivamente do alerta de eficiência. |
| **Feasible (Factível)** | [x] Sim [ ] Não | Cálculo e sinalização são triviais. |
| **Verifiable (Verificável)** | [x] Sim [ ] Não | Comprovável via testes de frontend/mobile. |
| **Correct (Correto)** | [x] Sim [ ] Não | Reflete a gestão por exceção. |
| **Conforming (Conforme)** | [x] Sim [ ] Não | Segue o template aprovado. |

---

## Informações Complementares

### Restrições e Dependências
- `Depende de meta existente para calcular a eficiência (REQ-FUNC-004).`
- `O limiar é fixo em 80% no MVP.`
- `A avaliação ocorre em tempo de submissão do apontamento (REQ-FUNC-005).`

### Notas e Suposições
- `Supõe-se que o alerta é um estado derivado, não um registro persistido obrigatório.`
- `Assume-se que o dashboard ordena máquinas críticas no topo.`

### Anexos / Referências
- `Especificação Arquitetural — Disparo de Notificações de Alerta de Eficiência`

---

## Histórico de Alterações

| Versão | Data | Autor | Alteração |
|--------|------|-------|-----------|
| 1.0 | 29/08/2026 | `Rafael Adolfo Silva Ferreira` | Criação inicial |
