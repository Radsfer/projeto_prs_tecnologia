# Ficha de Requisito

> **Norma de referência:** ISO/IEC/IEEE 29148:2018 (Seções 5.2.5 e 5.2.8)

---

## Identificação

| Campo | Valor |
|-------|-------|
| **ID** | `REQ-FUNC-009` |
| **Nome** | `Controle de Acesso Baseado em Perfis Estritos` |
| **Tipo** | `Funcional / Segurança` |
| **Prioridade** | `Essencial` |
| **Status** | `Proposto` |
| **Versão** | `1.0` |

---

## Descrição

### Texto do Requisito
> O sistema deve impor Controle de Acesso Baseado em Funções (RBAC) binário com perfis de gestor e operador por meio de middlewares que decodificam o JWT e aplicam a matriz de permissões: o gestor detém privilégios totais (POST, PUT, DELETE) sobre endpoints administrativos e analíticos; o operador tem leitura (GET) restrita a catálogos auxiliares e escrita (POST) restrita ao registro de apontamentos, devendo qualquer tentativa de acesso indevido resultar em HTTP 403 com registro em log de auditoria.

`O sistema deve restringir rotas por perfil (gestor/operador) via middleware, retornando HTTP 403 e registrando em auditoria qualquer tentativa de acesso não autorizado.`

### Condições de Aplicação
- Condição 1: `A requisição contém um JWT válido no cabeçalho de autorização.`
- Condição 2: `O perfil (role) é decodificado a partir do token.`
- Condição 3: `A rota acessada é protegida por RBAC.`

---

## Rastreabilidade

| Campo | Valor |
|-------|-------|
| **Fonte (Source)** | Especificação Arquitetural — "Fundamentos de Segurança e Governança de Acessos" |
| **Requisito Pai** | `REQ-FUNC-001` (consome a role do token) |
| **Requisitos Filhos** | `—` |
| **Casos de Uso / Histórias Relacionadas** | `UC-RBAC-001` (Autorização por perfil) |

---

## Justificativa (Rationale)

> O princípio do menor privilégio impede que dados estratégicos (metas financeiras, eficiências) vazem para o chão de fábrica sem contextualização. A imposição por middlewares centraliza e audita a governança de acesso.

`Atende à necessidade de segregação estrita entre gestão e operação.`

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
Funcionalidade: Controle de acesso por perfil
  Cenário: Gestor acessa rota administrativa
    Dado um token com role de gestor
    Quando acessa /api/machines com método POST/PUT/DELETE
    Então o sistema processa a requisição

  Cenário: Operador acessa rota administrativa
    Dado um token com role de operador
    Quando acessa /api/machines ou /api/dashboard
    Então o sistema retorna HTTP 403
    E registra a tentativa de violação em log de auditoria

  Cenário: Operador acessa catálogo e apontamento
    Dado um token com role de operador
    Quando acessa GET de máquinas/turnos ativos ou POST de apontamento
    Então o sistema processa a requisição
```

### Casos de Teste Associados
| ID do Teste | Descrição | Resultado Esperado |
|-------------|-----------|--------------------|
| TEST-001 | Gestor em rota administrativa | Requisição processada |
| TEST-002 | Operador em /api/dashboard | HTTP 403 + log de auditoria |
| TEST-003 | Operador em POST /api/apontamentos | Requisição processada |
| TEST-004 | Operador em GET catálogos ativos | Requisição processada |
| TEST-005 | Token ausente ou inválido | HTTP 401 |

---

## Análise de Conformidade com a Norma

| Característica | Atende? | Observações |
|----------------|---------|-------------|
| **Necessary (Necessário)** | [x] Sim [ ] Não | Governança de acesso é pilar de segurança. |
| **Appropriate (Apropriado)** | [x] Sim [ ] Não | Especifica a matriz, não a implementação. |
| **Unambiguous (Não ambíguo)** | [x] Sim [ ] Não | Perfis, verbos e rotas definidos. |
| **Complete (Completo)** | [x] Sim [ ] Não | Cobre gestor, operador e violação. |
| **Singular (Singular)** | [x] Sim [ ] Não | Trata exclusivamente de RBAC. |
| **Feasible (Factível)** | [x] Sim [ ] Não | Middlewares são padrão no Express. |
| **Verifiable (Verificável)** | [x] Sim [ ] Não | Comprovável via testes de autorização. |
| **Correct (Correto)** | [x] Sim [ ] Não | Reflete o princípio do menor privilégio. |
| **Conforming (Conforme)** | [x] Sim [ ] Não | Segue o template aprovado. |

---

## Informações Complementares

### Restrições e Dependências
- `Depende do JWT emitido em REQ-FUNC-001.`
- `A matriz de permissões é binária (gestor/operador) no MVP.`
- `Tentativas de violação devem persistir na matriz AuditLog (REQ-NFR-005).`

### Notas e Suposições
- `Supõe-se que o operador não possui acesso a rotas analíticas (/api/dashboard) nem administrativas (/api/machines).`
- `Assume-se que o gestor possui privilégios omnipotentes no escopo do MVP.`

### Anexos / Referências
- `Especificação Arquitetural — Controle de Acesso Baseado em Perfis Estritos`

---

## Histórico de Alterações

| Versão | Data | Autor | Alteração |
|--------|------|-------|-----------|
| 1.0 | 29/08/2026 | `Rafael Adolfo Silva Ferreira` | Criação inicial |
