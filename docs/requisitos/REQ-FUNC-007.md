# Ficha de Requisito

> **Norma de referência:** ISO/IEC/IEEE 29148:2018 (Seções 5.2.5 e 5.2.8)

---

## Identificação

| Campo | Valor |
|-------|-------|
| **ID** | `REQ-FUNC-007` |
| **Nome** | `Síntese Analítica em Painéis em Tempo Real` |
| **Tipo** | `Funcional / Performance` |
| **Prioridade** | `Essencial` |
| **Status** | `Proposto` |
| **Versão** | `1.0` |

---

## Descrição

### Texto do Requisito
> O sistema deve fornecer um dashboard web que, para uma janela temporal estipulada pelo usuário, agregue a produção global, a meta consolidada do parque fabril e a eficiência geral (percentual), totalize o tempo de parada em horas absolutas e, na ausência de filtro de máquina, apresente partições secundárias segregando as grandezas por unidade de medida incompatíveis entre si.

`O sistema deve agregar produção, meta, eficiência e horas de parada para a janela temporal escolhida, segregando os totais por unidade de medida quando não houver filtro de máquina.`

### Condições de Aplicação
- Condição 1: `A requisição é autenticada por um usuário com perfil de gestor.`
- Condição 2: `O usuário estipula uma janela temporal (data inicial e final).`
- Condição 3: `O filtro de máquina pode ou não estar presente.`

---

## Rastreabilidade

| Campo | Valor |
|-------|-------|
| **Fonte (Source)** | Especificação Arquitetural — "Auditoria, Visualização Analítica e Dashboards Estratégicos" |
| **Requisito Pai** | `—` |
| **Requisitos Filhos** | `REQ-FUNC-008` (máquinas críticas destacadas no topo do dashboard) |
| **Casos de Uso / Histórias Relacionadas** | `UC-DASH-001` (Consulta ao painel analítico) |

---

## Justificativa (Rationale)

> O dashboard é a entrega de maior valor semântico para a diretoria. A segregação por unidade de medida impede que grandezas incompatíveis (peças, kg, litros, metros) sejam somadas em um total irreal, preservando a exatidão dos indicadores executivos.

`Atende à necessidade de síntese gerencial correta e reativa sobre a produção consolidada.`

---

## Critérios de Verificação e Aceitação

### Método de Verificação
- [x] Inspeção / Revisão
- [x] Teste
- [x] Demonstração
- [ ] Análise
- [ ] Simulação

### Critérios de Aceitação (Gherkin / BDD recomendado)
```gherkin
Funcionalidade: Dashboard analítico
  Cenário: Agregação por janela temporal
    Dado um gestor autenticado e dados no período
    Quando consulta o dashboard com data inicial e final
    Então o sistema retorna produção global, meta consolidada e eficiência percentual
    E totaliza as paradas em horas absolutas

  Cenário: Visão agnóstica de máquina
    Dado o gestor não filtra por máquina
    Quando consulta o dashboard
    Então o sistema apresenta partições segregadas por unidade de medida
```

### Casos de Teste Associados
| ID do Teste | Descrição | Resultado Esperado |
|-------------|-----------|--------------------|
| TEST-001 | Agregação em janela temporal | Produção, meta, eficiência e horas de parada corretas |
| TEST-002 | Eficiência percentual | Quociente produção/meta × 100 correto |
| TEST-003 | Sem filtro de máquina | Partições por unidade de medida |
| TEST-004 | Conversão de minutos em horas | Total de parada em horas correto |

---

## Análise de Conformidade com a Norma

| Característica | Atende? | Observações |
|----------------|---------|-------------|
| **Necessary (Necessário)** | [x] Sim [ ] Não | Dashboard é a entrega de maior valor. |
| **Appropriate (Apropriado)** | [x] Sim [ ] Não | Especifica métricas, não o layout. |
| **Unambiguous (Não ambíguo)** | [x] Sim [ ] Não | Métricas e segregação definidas. |
| **Complete (Completo)** | [x] Sim [ ] Não | Cobre agregação, eficiência e segregação. |
| **Singular (Singular)** | [x] Sim [ ] Não | Trata exclusivamente do dashboard. |
| **Feasible (Factível)** | [x] Sim [ ] Não | Agregações SQL são viáveis. |
| **Verifiable (Verificável)** | [x] Sim [ ] Não | Comprovável via testes e demonstração. |
| **Correct (Correto)** | [x] Sim [ ] Não | Reflete as métricas executivas esperadas. |
| **Conforming (Conforme)** | [x] Sim [ ] Não | Segue o template aprovado. |

---

## Informações Complementares

### Restrições e Dependências
- `Depende de apontamentos, metas e unidades de medida (REQ-FUNC-002/004/005).`
- `Otimizações de cache para carregamento em menos de 2 segundos (REQ-NFR-001).`
- `Restrito ao perfil gestor (REQ-FUNC-009).`

### Notas e Suposições
- `Supõe-se que a eficiência é calculada como (produção real / meta planejada) × 100.`
- `Assume-se que a janela temporal é informada pelo usuário na interface web.`

### Anexos / Referências
- `Especificação Arquitetural — Síntese Analítica em Painéis em Tempo Real`

---

## Histórico de Alterações

| Versão | Data | Autor | Alteração |
|--------|------|-------|-----------|
| 1.0 | 29/08/2026 | `PRS Tecnologia` | Criação inicial |
