# Ficha de Requisito

> **Norma de referência:** ISO/IEC/IEEE 29148:2018 (Seções 5.2.5 e 5.2.8)

---

## Identificação

| Campo | Valor |
|-------|-------|
| **ID** | `REQ-FUNC-001` |
| **Nome** | `Autenticação e Emissão de Token (JWT)` |
| **Tipo** | `Funcional / Segurança` |
| **Prioridade** | `Essencial` |
| **Status** | `Proposto` |
| **Versão** | `1.0` |

---

## Descrição

### Texto do Requisito
> O sistema deve autenticar usuários por e-mail e senha, validar a senha exclusivamente no servidor por meio do algoritmo bcrypt com fator de custo dinâmico e, mediante equivalência criptográfica confirmada, emitir um JSON Web Token (JWT) assinado com o algoritmo HS256 e validade de vinte e quatro horas, cujo payload contenha somente o identificador único (UUID) do usuário e a declaração de perfil (role).

`O sistema deve emitir um JWT válido por 24 horas, assinado em HS256 e contendo apenas UUID e role, após validar a senha com bcrypt no servidor.`

### Condições de Aplicação
- Condição 1: `A requisição de autenticação contém e-mail e senha no formato esperado.`
- Condição 2: `As credenciais fornecidas correspondem a um usuário ativo cadastrado na base de dados.`
- Condição 3: `A senha armazenada foi previamente codificada com bcrypt; nenhuma senha em texto simples é aceita ou armazenada.`

---

## Rastreabilidade

| Campo | Valor |
|-------|-------|
| **Fonte (Source)** | Especificação Arquitetural — "Fundamentos de Segurança e Governança de Acessos" |
| **Requisito Pai** | `—` |
| **Requisitos Filhos** | `REQ-FUNC-009` (RBAC consome a declaração de role do token) |
| **Casos de Uso / Histórias Relacionadas** | `UC-AUTH-001` (Login de gestor/operador) |

---

## Justificativa (Rationale)

> A autenticação é a porta de entrada do sistema. Senhas em texto simples expõem o banco a ataques de força bruta e vazamento; o bcrypt com salting dinâmico torna essas tentativas computacionalmente inviáveis. O JWT de curta validade reduz a janela de vulnerabilidade em dispositivos móveis não gerenciados, e o payload mínimo (UUID e role) permite validar o portador sem consultar o banco a cada interação, otimizando desempenho.

`Atende à necessidade de acesso seguro, rastreável e com baixa latência no fluxo crítico de login.`

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
Funcionalidade: Autenticação de usuários
  Cenário: Login com credenciais válidas
    Dado um usuário ativo com senha codificada em bcrypt
    Quando o cliente envia e-mail e senha corretos para o endpoint de autenticação
    Então o sistema retorna HTTP 200 e um JWT assinado em HS256 com validade de 24 horas
    E o payload do token contém somente UUID e role

  Cenário: Login com credenciais inválidas
    Dado um e-mail ou senha incorretos
    Quando o cliente envia as credenciais para o endpoint de autenticação
    Então o sistema retorna HTTP 401 com a mensagem "Credenciais inválidas"
    E o sistema não revela se o e-mail está cadastrado

  Cenário: Limitação de tentativas
    Dado um mesmo endereço IP que já realizou 100 tentativas em 1 minuto
    Quando o cliente envia uma nova tentativa
    Então o sistema rejeita a requisição por rate limiting
```

### Casos de Teste Associados
| ID do Teste | Descrição | Resultado Esperado |
|-------------|-----------|--------------------|
| TEST-001 | Login com credenciais válidas | HTTP 200 + JWT HS256 válido por 24h |
| TEST-002 | Login com senha incorreta | HTTP 401 "Credenciais inválidas" |
| TEST-003 | Login com e-mail inexistente | HTTP 401 "Credenciais inválidas" (sem distinção) |
| TEST-004 | 101ª tentativa do mesmo IP em 1 min | Bloqueio por rate limiting |
| TEST-005 | Inspeção do banco de dados | Nenhuma senha armazenada em texto simples |

---

## Análise de Conformidade com a Norma

| Característica | Atende? | Observações |
|----------------|---------|-------------|
| **Necessary (Necessário)** | [x] Sim [ ] Não | Sem autenticação, todo o sistema fica exposto. |
| **Appropriate (Apropriado)** | [x] Sim [ ] Não | Especifica comportamento, não o mecanismo interno além do exigido. |
| **Unambiguous (Não ambíguo)** | [x] Sim [ ] Não | Algoritmos, validade e payload estão determinados. |
| **Complete (Completo)** | [x] Sim [ ] Não | Cobre fluxo válido, inválido e limite de tentativas. |
| **Singular (Singular)** | [x] Sim [ ] Não | Trata exclusivamente de autenticação e emissão de token. |
| **Feasible (Factível)** | [x] Sim [ ] Não | bcrypt e JWT são bibliotecas maduras no Node.js. |
| **Verifiable (Verificável)** | [x] Sim [ ] Não | Comprovável via testes de API e inspeção de banco. |
| **Correct (Correto)** | [x] Sim [ ] Não | Reflete fielmente a necessidade de acesso seguro. |
| **Conforming (Conforme)** | [x] Sim [ ] Não | Segue o template aprovado. |

---

## Informações Complementares

### Restrições e Dependências
- `A chave JWT_SECRET deve ser injetada por variável de ambiente; nunca versionada no repositório.`
- `Depende do índice B-Tree em users.email para consulta eficiente na autenticação.`
- `O rate limiting opera por endereço IP (100 tentativas/minuto).`

### Notas e Suposições
- `Assume-se que o e-mail é o identificador único de login.`
- `Supõe-se que o payload do JWT não carrega dados sensíveis além de UUID e role.`

### Anexos / Referências
- `RFC 7519 — JSON Web Token (JWT)`
- `Documentação do bcrypt (node.bcrypt.js)`

---

## Histórico de Alterações

| Versão | Data | Autor | Alteração |
|--------|------|-------|-----------|
| 1.0 | 29/08/2026 | `Rafael Adolfo Silva Ferreira` | Criação inicial |
