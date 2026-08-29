# Ficha de Requisito

> **Norma de referência:** ISO/IEC/IEEE 29148:2018 (Seções 5.2.5 e 5.2.8)

---

## Identificação

| Campo | Valor |
|-------|-------|
| **ID** | `REQ-NFR-001` |
| **Nome** | `Desempenho e Escalabilidade` |
| **Tipo** | `Performance` |
| **Prioridade** | `Essencial` |
| **Status** | `Proposto` |
| **Versão** | `1.0` |

---

## Descrição

### Texto do Requisito
> O sistema deve sustentar cinquenta sessões gerenciais concorrentes com latência de API inferior a um segundo no percentil 95 das transações, suportar a paginação de mais de cem mil registros de apontamentos sem degradação do tempo de resposta (menor que um segundo) e carregar o dashboard de uma fatia de trinta dias em menos de dois segundos.

`O sistema deve atender: 50 sessões concorrentes com p95 < 1s; paginação de 100.000+ registros < 1s; dashboard de 30 dias < 2s.`

### Condições de Aplicação
- Condição 1: `O ambiente de execução atende à infraestrutura prevista (VPS/Docker).`
- Condição 2: `Os índices B-Tree e otimizações de cache estão configurados.`
- Condição 3: `O volume de apontamentos acumulado supera cem mil registros.`

---

## Rastreabilidade

| Campo | Valor |
|-------|-------|
| **Fonte (Source)** | Especificação Arquitetural — "Persistência, Qualidade de Software" |
| **Requisito Pai** | `—` |
| **Requisitos Filhos** | `REQ-FUNC-006` (paginação delegada ao banco), `REQ-FUNC-007` (cache do dashboard) |
| **Casos de Uso / Histórias Relacionadas** | `—` |

---

## Justificativa (Rationale)

> Latência elevada degrada a experiência gerencial e inviabiliza a tomada de decisão reativa. Os limites numéricos garantem que a arquitetura (índices B-Tree, agregação no banco, cache) suporte o crescimento do histórico sem refatoração estrutural.

`Atende à necessidade de responsividade sob carga e volume crescentes.`

---

## Critérios de Verificação e Aceitação

### Método de Verificação
- [ ] Inspeção / Revisão
- [x] Teste
- [ ] Demonstração
- [x] Análise
- [x] Simulação

### Critérios de Aceitação (Gherkin / BDD recomendado)
```gherkin
Funcionalidade: Desempenho do sistema
  Cenário: Concorrência gerencial
    Dado 50 sessões gerenciais concorrentes
    Quando realizam transações de API
    Então o p95 da latência é inferior a 1 segundo

  Cenário: Paginação em volume
    Dado mais de 100.000 registros de apontamentos
    Quando o gestor pagina a auditoria
    Então cada página responde em menos de 1 segundo

  Cenário: Dashboard de 30 dias
    Dado uma fatia temporal de 30 dias
    Quando o gestor consulta o dashboard
    Então o carregamento ocorre em menos de 2 segundos
```

### Casos de Teste Associados
| ID do Teste | Descrição | Resultado Esperado |
|-------------|-----------|--------------------|
| TEST-001 | 50 sessões concorrentes | p95 < 1s |
| TEST-002 | Paginação com 100.000+ registros | < 1s por página |
| TEST-003 | Dashboard de 30 dias | < 2s |

---

## Análise de Conformidade com a Norma

| Característica | Atende? | Observações |
|----------------|---------|-------------|
| **Necessary (Necessário)** | [x] Sim [ ] Não | Desempenho é requisito não-funcional crítico. |
| **Appropriate (Apropriado)** | [x] Sim [ ] Não | Métricas quantitativas no nível correto. |
| **Unambiguous (Não ambíguo)** | [x] Sim [ ] Não | Limites numéricos explícitos. |
| **Complete (Completo)** | [x] Sim [ ] Não | Cobre concorrência, paginação e dashboard. |
| **Singular (Singular)** | [x] Sim [ ] Não | Trata exclusivamente de desempenho. |
| **Feasible (Factível)** | [x] Sim [ ] Não | Atingível com a stack prevista. |
| **Verifiable (Verificável)** | [x] Sim [ ] Não | Comprovável via testes de carga e análise. |
| **Correct (Correto)** | [x] Sim [ ] Não | Reflete a exigência de latência do negócio. |
| **Conforming (Conforme)** | [x] Sim [ ] Não | Segue o template aprovado. |

---

## Informações Complementares

### Restrições e Dependências
- `Depende de índices B-Tree em date, machineId, shiftId (REQ-FUNC-006).`
- `Depende de cache para o dashboard (REQ-FUNC-007).`
- `O processamento não pode ocorrer em memória na camada Node.js.`

### Notas e Suposições
- `Supõe-se infraestrutura de produção dimensionada conforme especificação (VPS + Docker).`
- `Assume-se que o p95 é medido sobre transações de API em condições normais de pico.`

### Anexos / Referências
- `Especificação Arquitetural — Design de Persistência e Otimização`

---

## Histórico de Alterações

| Versão | Data | Autor | Alteração |
|--------|------|-------|-----------|
| 1.0 | 29/08/2026 | `PRS Tecnologia` | Criação inicial |
