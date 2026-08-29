# Ficha de Requisito

> **Norma de referência:** ISO/IEC/IEEE 29148:2018 (Seções 5.2.5 e 5.2.8)

---

## Identificação

| Campo | Valor |
|-------|-------|
| **ID** | `REQ-FUNC-010` |
| **Nome** | `Exportação Tabular Desvinculada e Encoding` |
| **Tipo** | `Funcional` |
| **Prioridade** | `Essencial` |
| **Status** | `Proposto` |
| **Versão** | `1.0` |

---

## Descrição

### Texto do Requisito
> O sistema deve permitir aos gestores exportar a linha do tempo da manufatura em formato CSV gerado pela API, utilizando datas no formato brasileiro DD/MM/AAAA, colunas estruturais detalhando atores produtivos, metas e eficiência, concatenação literal da unidade de medida ao valor nominal (ex.: "450 pieces", "120 kg") e codificação de caracteres UTF-8.

`O sistema deve exportar apontamentos em CSV codificado em UTF-8, com datas em DD/MM/AAAA e valores produtivos concatenados à unidade de medida.`

### Condições de Aplicação
- Condição 1: `A requisição é autenticada por um usuário com perfil de gestor.`
- Condição 2: `O usuário requisita a exportação a partir da interface de auditoria.`
- Condição 3: `Os filtros aplicáveis à auditoria (REQ-FUNC-006) podem delimitar o escopo exportado.`

---

## Rastreabilidade

| Campo | Valor |
|-------|-------|
| **Fonte (Source)** | Especificação Arquitetural — "Gestão por Exceção, Alertas e Exportação" |
| **Requisito Pai** | `REQ-FUNC-006` (extensão da auditoria) |
| **Requisitos Filhos** | `—` |
| **Casos de Uso / Histórias Relacionadas** | `UC-EXPORT-001` (Exportação CSV) |

---

## Justificativa (Rationale)

> O ProdTrack origina os dados primários, mas não é o ambiente final de Data Lake. A exportação em UTF-8 com formatação brasileira de datas e concatenação da unidade mitiga problemas de parseamento no Excel, Power BI Desktop e pipelines do Microsoft Fabric, garantindo interoperabilidade fidedigna.

`Atende à necessidade de portas de extração padronizadas para ecossistemas analíticos externos.`

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
Funcionalidade: Exportação CSV
  Cenário: Exportação válida
    Dado um gestor autenticado e registros na base
    Quando requisita a exportação CSV
    Então o sistema gera um arquivo UTF-8
    E as datas estão no formato DD/MM/AAAA
    E os valores produtivos estão concatenados à unidade de medida

  Cenário: Codificação correta
    Dado o arquivo CSV gerado
    Quando aberto por Excel/Power BI/Fabric
    Então os caracteres são interpretados corretamente sem quebra de encoding
```

### Casos de Teste Associados
| ID do Teste | Descrição | Resultado Esperado |
|-------------|-----------|--------------------|
| TEST-001 | Geração do CSV | Arquivo UTF-8 válido |
| TEST-002 | Formato de data | DD/MM/AAAA em todas as datas |
| TEST-003 | Concatenação de unidade | "450 pieces", "120 kg", etc. |
| TEST-004 | Abertura em Excel/Power BI | Parse correto sem caracteres quebrados |

---

## Análise de Conformidade com a Norma

| Característica | Atende? | Observações |
|----------------|---------|-------------|
| **Necessary (Necessário)** | [x] Sim [ ] Não | Exportação é a porta para o ecossistema analítico. |
| **Appropriate (Apropriado)** | [x] Sim [ ] Não | Especifica formato, não a biblioteca. |
| **Unambiguous (Não ambíguo)** | [x] Sim [ ] Não | Formato de data, unidade e encoding definidos. |
| **Complete (Completo)** | [x] Sim [ ] Não | Cobre formato, conteúdo e encoding. |
| **Singular (Singular)** | [x] Sim [ ] Não | Trata exclusivamente da exportação CSV. |
| **Feasible (Factível)** | [x] Sim [ ] Não | Geração de CSV é padrão no Node.js. |
| **Verifiable (Verificável)** | [x] Sim [ ] Não | Comprovável via testes e inspeção do arquivo. |
| **Correct (Correto)** | [x] Sim [ ] Não | Reflete a interoperabilidade exigida. |
| **Conforming (Conforme)** | [x] Sim [ ] Não | Segue o template aprovado. |

---

## Informações Complementares

### Restrições e Dependências
- `Encoding obrigatório: UTF-8.`
- `Datas no formato brasileiro DD/MM/AAAA.`
- `Restrito ao perfil gestor (REQ-FUNC-009).`

### Notas e Suposições
- `Supõe-se que o CSV é gerado pela API sob demanda, não armazenado.`
- `Assume-se que o separador de colunas segue a convenção padrão de CSV.`

### Anexos / Referências
- `Especificação Arquitetural — Exportação Tabular Desvinculada e Encoding`

---

## Histórico de Alterações

| Versão | Data | Autor | Alteração |
|--------|------|-------|-----------|
| 1.0 | 29/08/2026 | `PRS Tecnologia` | Criação inicial |
