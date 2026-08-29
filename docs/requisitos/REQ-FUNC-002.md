# Ficha de Requisito

> **Norma de referência:** ISO/IEC/IEEE 29148:2018 (Seções 5.2.5 e 5.2.8)

---

## Identificação

| Campo | Valor |
|-------|-------|
| **ID** | `REQ-FUNC-002` |
| **Nome** | `Catalogação Parametrizada de Máquinas` |
| **Tipo** | `Funcional` |
| **Prioridade** | `Essencial` |
| **Status** | `Proposto` |
| **Versão** | `1.0` |

---

## Descrição

### Texto do Requisito
> O sistema deve permitir ao gestor cadastrar, editar e inativar logicamente máquinas, exigindo um nome de identificação entre três e cem caracteres, um código alfanumérico único e a vinculação obrigatória a uma unidade de medida de produção restrita a peças (pieces), quilogramas (kg), litros (liters) ou metros (meters).

`O sistema deve cadastrar máquinas com nome (3–100 caracteres), código alfanumérico único e unidade de medida restrita ao ENUM {pieces, kg, liters, meters}, suportando inativação lógica sem exclusão física.`

### Condições de Aplicação
- Condição 1: `A requisição é autenticada por um usuário com perfil de gestor.`
- Condição 2: `O código alfanumérico informado não pertence a outra máquina na base de dados.`
- Condição 3: `A unidade de medida informada pertence ao conjunto permitido (pieces, kg, liters, meters).`

---

## Rastreabilidade

| Campo | Valor |
|-------|-------|
| **Fonte (Source)** | Especificação Arquitetural — "Modelagem de Domínio e Gestão de Ativos Industriais" |
| **Requisito Pai** | `—` |
| **Requisitos Filhos** | `REQ-FUNC-004` (meta herda a unidade da máquina), `REQ-FUNC-005` (apontamento referencia máquina), `REQ-FUNC-007` (segregação por unidade) |
| **Casos de Uso / Histórias Relacionadas** | `UC-MACHINE-001` (CRUD de máquinas) |

---

## Justificativa (Rationale)

> O código alfanumérico único serve como chave primária de negócios, permitindo rastreabilidade visual no chão de fábrica e auditoria física. A restrição da unidade de medida a um ENUM previne que painéis analíticos somem grandezas incompatíveis (ex.: litros com peças), evitando insights gerenciais adulterados. A inativação lógica preserva as chaves estrangeiras dos apontamentos históricos.

`Atende à necessidade de uma ontologia de ativos íntegra e tipada para alimentar a camada analítica.`

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
Funcionalidade: Cadastro de máquinas
  Cenário: Cadastro válido
    Dado um gestor autenticado
    Quando envia nome (3–100 caracteres), código único e unidade "pieces"
    Então o sistema retorna HTTP 201 com a máquina criada

  Cenário: Código duplicado
    Dado um código alfanumérico já cadastrado
    Quando o gestor envia nova máquina com esse código
    Então o sistema rejeita com erro de conflito

  Cenário: Unidade inválida
    Dado o gestor envia unidade fora do ENUM permitido
    Quando o backend valida a entrada
    Então o sistema rejeita com erro de validação

  Cenário: Inativação lógica
    Dado uma máquina com apontamentos históricos
    Quando o gestor inativa a máquina
    Então o estado lógico muda para inativo
    E os apontamentos existentes permanecem íntegros
```

### Casos de Teste Associados
| ID do Teste | Descrição | Resultado Esperado |
|-------------|-----------|--------------------|
| TEST-001 | Cadastro com nome, código e unidade válidos | HTTP 201 |
| TEST-002 | Código alfanumérico duplicado | Rejeição com conflito |
| TEST-003 | Nome fora do intervalo 3–100 | Erro de validação |
| TEST-004 | Unidade fora do ENUM | Erro de validação |
| TEST-005 | Inativação preserva histórico | Estado inativo; apontamentos intactos |

---

## Análise de Conformidade com a Norma

| Característica | Atende? | Observações |
|----------------|---------|-------------|
| **Necessary (Necessário)** | [x] Sim [ ] Não | Máquina é a entidade raiz da ontologia do sistema. |
| **Appropriate (Apropriado)** | [x] Sim [ ] Não | Define regras de negócio sem impor design. |
| **Unambiguous (Não ambíguo)** | [x] Sim [ ] Não | Intervalo de nome, unicidade e ENUM determinados. |
| **Complete (Completo)** | [x] Sim [ ] Não | Cobre cadastro, validação, duplicidade e inativação. |
| **Singular (Singular)** | [x] Sim [ ] Não | Trata exclusivamente da gestão de máquinas. |
| **Feasible (Factível)** | [x] Sim [ ] Não | ENUM e unicidade são nativos no PostgreSQL/Prisma. |
| **Verifiable (Verificável)** | [x] Sim [ ] Não | Comprovável via testes de API. |
| **Correct (Correto)** | [x] Sim [ ] Não | Reflete fielmente o domínio industrial. |
| **Conforming (Conforme)** | [x] Sim [ ] Não | Segue o template aprovado. |

---

## Informações Complementares

### Restrições e Dependências
- `Unicidade do código alfanumérico imposta por constraint no banco.`
- `Unidade de medida implementada como ENUM nativo do PostgreSQL ou validação via Prisma.`
- `Exclusão física vedada: inativação lógica obrigatória para preservar integridade referencial.`

### Notas e Suposições
- `Assume-se que o código alfanumérico é imutável após o cadastro (chave de negócios).`
- `Supõe-se que a unidade de medida define a interpretação de todos os valores de produção vinculados à máquina.`

### Anexos / Referências
- `Documentação PostgreSQL — tipos ENUM e constraints`

---

## Histórico de Alterações

| Versão | Data | Autor | Alteração |
|--------|------|-------|-----------|
| 1.0 | 29/08/2026 | `PRS Tecnologia` | Criação inicial |
