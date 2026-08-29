# Ficha de Requisito

> **Norma de referência:** ISO/IEC/IEEE 29148:2018 (Seções 5.2.5 e 5.2.8)

---

## Identificação

| Campo | Valor |
|-------|-------|
| **ID** | `REQ-NFR-005` |
| **Nome** | `Conformidade LGPD e Governança de Dados` |
| **Tipo** | `Conformidade / Segurança` |
| **Prioridade** | `Essencial` |
| **Status** | `Proposto` |
| **Versão** | `1.0` |

---

## Descrição

### Texto do Requisito
> O sistema deve adotar exclusão lógica (soft delete) acoplada à anonimização estrita: ao descartar as credenciais de um usuário da base ativa, a chave estrangeira dos apontamentos que ele manipulou não deve ser apagada nem tornada nula; os dados pessoais identificáveis (nome e e-mail) devem ser transmutados por strings enigmáticas ou UUIDs sem valor de rastreio, preservando o histórico estrutural, com a transição registrada na matriz AuditLog.

`O sistema deve anonimizar usuários via soft delete, substituindo nome e e-mail por valores sem rastreio, preservando chaves estrangeiras e registrando a transição em AuditLog.`

### Condições de Aplicação
- Condição 1: `O usuário solicita ou demanda o descarte de suas credenciais da base ativa.`
- Condição 2: `Existem apontamentos cuja chave estrangeira referencia o usuário.`
- Condição 3: `A operação é executada por um perfil autorizado.`

---

## Rastreabilidade

| Campo | Valor |
|-------|-------|
| **Fonte (Source)** | Especificação Arquitetural — "Imutabilidade e Governança Sob a LGPD" |
| **Requisito Pai** | `—` |
| **Requisitos Filhos** | `REQ-FUNC-009` (violações também registradas em AuditLog) |
| **Casos de Uso / Histórias Relacionadas** | `UC-GDPR-001` (Anonimização e soft delete) |

---

## Justificativa (Rationale)

> A LGPD garante o direito ao esquecimento, mas apagar chaves estrangeiras fragmentaria o custeio financeiro do período. A anonimização preserva o histórico estrutural enquanto elimina o rastreio pessoal, conciliando privacidade e imutabilidade do inventário produtivo.

`Atende à necessidade de conformidade legal sem romper a integridade histórica.`

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
Funcionalidade: Anonimização e soft delete
  Cenário: Descartar credenciais
    Dado um usuário com apontamentos vinculados
    Quando o sistema executa o descarte de credenciais
    Então nome e e-mail são substituídos por valores sem rastreio
    E as chaves estrangeiras dos apontamentos permanecem intactas
    E a transição é registrada na matriz AuditLog
```

### Casos de Teste Associados
| ID do Teste | Descrição | Resultado Esperado |
|-------------|-----------|--------------------|
| TEST-001 | Soft delete de usuário | Registro marcado como excluído logicamente |
| TEST-002 | Anonimização de nome/e-mail | Valores sem rastreio (UUID/string enigmática) |
| TEST-003 | Preservação de chaves estrangeiras | Apontamentos permanecem íntegros |
| TEST-004 | Registro em AuditLog | Transição criptográfica auditável |

---

## Análise de Conformidade com a Norma

| Característica | Atende? | Observações |
|----------------|---------|-------------|
| **Necessary (Necessário)** | [x] Sim [ ] Não | Conformidade LGPD é obrigatória. |
| **Appropriate (Apropriado)** | [x] Sim [ ] Não | Especifica o comportamento legal exigido. |
| **Unambiguous (Não ambíguo)** | [x] Sim [ ] Não | Soft delete e anonimização definidos. |
| **Complete (Completo)** | [x] Sim [ ] Não | Cobre descarte, anonimização e auditoria. |
| **Singular (Singular)** | [x] Sim [ ] Não | Trata exclusivamente de governança de dados. |
| **Feasible (Factível)** | [x] Sim [ ] Não | Viável com soft delete e substituição de campos. |
| **Verifiable (Verificável)** | [x] Sim [ ] Não | Comprovável por teste e inspeção. |
| **Correct (Correto)** | [x] Sim [ ] Não | Reflete a exigência legal e de integridade. |
| **Conforming (Conforme)** | [x] Sim [ ] Não | Segue o template aprovado. |

---

## Informações Complementares

### Restrições e Dependências
- `Proibido apagar ou anular a chave estrangeira dos apontamentos.`
- `Depende da matriz AuditLog para registro irrefutável.`
- `Relacionamentos com dimensões usam ON DELETE RESTRICT.`

### Notas e Suposições
- `Supõe-se que nome completo e e-mail são os únicos dados pessoais identificáveis no escopo do MVP.`
- `Assume-se que a anonimização é irreversível para os dados transmutados.`

### Anexos / Referências
- `Lei nº 13.709/2018 (LGPD)`

---

## Histórico de Alterações

| Versão | Data | Autor | Alteração |
|--------|------|-------|-----------|
| 1.0 | 29/08/2026 | `Rafael Adolfo Silva Ferreira` | Criação inicial |
