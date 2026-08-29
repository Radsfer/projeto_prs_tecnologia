# Ficha de Requisito

> **Norma de referência:** ISO/IEC/IEEE 29148:2018 (Seções 5.2.5 e 5.2.8)

---

## Identificação

| Campo | Valor |
|-------|-------|
| **ID** | `REQ-NFR-002` |
| **Nome** | `Usabilidade e Ergonomia do Aplicativo Móvel` |
| **Tipo** | `Usabilidade` |
| **Prioridade** | `Essencial` |
| **Status** | `Proposto` |
| **Versão** | `1.0` |

---

## Descrição

### Texto do Requisito
> O aplicativo móvel do operador deve apresentar interface minimalista e utilitária, com componentes de interação e botões de dimensões mínimas de 48x48 pixels (dp), garantindo precisão de toque em ambiente industrial adverso.

`O aplicativo móvel deve prover componentes interativos e botões com dimensões mínimas de 48x48 dp.`

### Condições de Aplicação
- Condição 1: `O usuário interage com o aplicativo móvel via tela sensível ao toque.`
- Condição 2: `O ambiente pode impor vibração mecânica e uso de luvas de proteção.`

---

## Rastreabilidade

| Campo | Valor |
|-------|-------|
| **Fonte (Source)** | Especificação Arquitetural — "Aquisição de Dados no Chão de Fábrica" |
| **Requisito Pai** | `—` |
| **Requisitos Filhos** | `REQ-FUNC-005` (aplica a ergonomia no registro) |
| **Casos de Uso / Histórias Relacionadas** | `—` |

---

## Justificativa (Rationale)

> Operadores atuam sob vibração e com EPIs (luvas), onde alvos de toque pequenos geram erros de entrada. A dimensão mínima de 48x48 dp segue diretrizes consolidadas de acessibilidade e ergonomia, reduzindo erros de magnitude nos registros.

`Atende à necessidade de usabilidade confiável em ambiente industrial hostil.`

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
Funcionalidade: Ergonomia do aplicativo móvel
  Cenário: Componentes de toque
    Dado a interface do aplicativo do operador
    Quando inspecionada em qualquer tela
    Então todos os botões e componentes interativos têm no mínimo 48x48 dp
```

### Casos de Teste Associados
| ID do Teste | Descrição | Resultado Esperado |
|-------------|-----------|--------------------|
| TEST-001 | Inspeção de dimensões de botões | Todos ≥ 48x48 dp |
| TEST-002 | Teste de toque com luva | Acionamento preciso dos alvos |

---

## Análise de Conformidade com a Norma

| Característica | Atende? | Observações |
|----------------|---------|-------------|
| **Necessary (Necessário)** | [x] Sim [ ] Não | Ergonomia é condicionante de uso no chão de fábrica. |
| **Appropriate (Apropriado)** | [x] Sim [ ] Não | Especifica medida, não o layout. |
| **Unambiguous (Não ambíguo)** | [x] Sim [ ] Não | Dimensão mínima 48x48 dp explícita. |
| **Complete (Completo)** | [x] Sim [ ] Não | Cobre todos os componentes interativos. |
| **Singular (Singular)** | [x] Sim [ ] Não | Trata exclusivamente de ergonomia. |
| **Feasible (Factível)** | [x] Sim [ ] Não | Viável em React Native. |
| **Verifiable (Verificável)** | [x] Sim [ ] Não | Comprovável por inspeção e teste. |
| **Correct (Correto)** | [x] Sim [ ] Não | Reflete a realidade operacional. |
| **Conforming (Conforme)** | [x] Sim [ ] Não | Segue o template aprovado. |

---

## Informações Complementares

### Restrições e Dependências
- `Aplicável ao aplicativo móvel (React Native).`
- `A dimensão é expressa em dp (density-independent pixels).`

### Notas e Suposições
- `Supõe-se que 48x48 dp é o limiar mínimo aceitável, não o alvo de design.`
- `Assume-se que o espelhamento da unidade de medida reduz erros de magnitude (REQ-FUNC-005).`

### Anexos / Referências
- `Material Design / Apple HIG — diretrizes de alvo de toque`

---

## Histórico de Alterações

| Versão | Data | Autor | Alteração |
|--------|------|-------|-----------|
| 1.0 | 29/08/2026 | `Rafael Adolfo Silva Ferreira` | Criação inicial |
