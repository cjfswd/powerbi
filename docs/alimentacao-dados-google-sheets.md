# Guia de Alimentação de Dados — Google Sheets

> Dashboard: **Unimed Nova Iguaçu / Camperj — Faturamento 2025**
> Arquivo: `src/data/mock.ts` (substituído por integração real)

---

## Visão Geral

O dashboard consome dados de **uma planilha Google Sheets** com **múltiplas abas**. Cada aba corresponde a um conjunto de dados exibido no painel. A integração lê os valores diretamente e os transforma nos formatos esperados pelo frontend.

```
Planilha principal
├── Aba: Pacientes
├── Aba: Faturamento_Mensal
├── Aba: Procedimentos
├── Aba: Municipios
├── Aba: Operadoras
├── Aba: Distribuicao_Assistencia
├── Aba: Acomodacao
└── Aba: Perfil_Sexo
```

---

## Estrutura das Abas

### 1. `Pacientes`

Tabela principal. Cada linha representa um paciente. É a fonte dos dados analíticos, filtros e expansão de horas.

| Coluna | Tipo | Obrigatório | Valores aceitos | Descrição |
|---|---|---|---|---|
| `id` | Inteiro | Sim | Único, sequencial | Identificador do paciente |
| `nome` | Texto | Sim | — | Nome completo do paciente |
| `municipio` | Texto | Sim | Ver lista¹ | Município de residência |
| `status` | Texto | Sim | `Internação` \| `Alta` \| `Óbito` \| `Ouvidoria` | Status clínico atual |
| `custo` | Decimal | Sim | Positivo, ponto como separador | Custo total do paciente em R$ |
| `operadora` | Texto | Sim | `Unimed Nova Iguaçu` \| `Camperj` | Operadora de saúde responsável |
| `acomodacao` | Texto | Sim | `ID` \| `AD` | Tipo de acomodação (`ID` = Internação Domiciliar, `AD` = Atendimento Domiciliar) |
| `horas_3h` | Decimal | Não | Positivo ou vazio | Valor faturado no turno de 3h |
| `horas_6h` | Decimal | Não | Positivo ou vazio | Valor faturado no turno de 6h |
| `horas_12h` | Decimal | Não | Positivo ou vazio | Valor faturado no turno de 12h |
| `horas_24h` | Decimal | Não | Positivo ou vazio | Valor faturado no turno de 24h |

> ¹ **Municípios válidos:** Nova Iguaçu, Rio de Janeiro, Belford Roxo, S. J. de Meriti, Queimados, Mesquita *(lista extensível)*

**Exemplo de linha:**
```
id    | nome         | municipio   | status    | custo     | operadora          | acomodacao | horas_3h | horas_6h | horas_12h | horas_24h
1     | João Silva   | Nova Iguaçu | Internação| 45230.50  | Unimed Nova Iguaçu | ID         | 5230.50  | 8500.00  | 15000.00  | 16500.00
2     | Maria Santos | Rio de Janeiro | Alta   | 38500.00  | Camperj            | AD         |          |          |           |
```

---

### 2. `Faturamento_Mensal`

Série histórica de faturamento por mês. Alimenta o gráfico de área na aba **Visão Geral**.

| Coluna | Tipo | Obrigatório | Valores aceitos | Descrição |
|---|---|---|---|---|
| `mes` | Texto | Sim | `Jan`, `Fev`, `Mar`, `Abr`, `Mai`, `Jun`, `Jul`, `Ago`, `Set`, `Out`, `Nov`, `Dez` | Abreviação do mês em português |
| `ano` | Inteiro | Sim | Ex: `2025` | Ano de referência |
| `valor` | Decimal | Sim | Positivo | Valor total faturado no mês em R$ |

**Exemplo:**
```
mes | ano  | valor
Jan | 2025 | 680000.00
Fev | 2025 | 720000.00
Mar | 2025 | 810000.00
```

---

### 3. `Procedimentos`

Lista de procedimentos médicos e seus valores totais faturados. Alimenta o gráfico de barras e a tabela na aba **Procedimentos**.

| Coluna | Tipo | Obrigatório | Valores aceitos | Descrição |
|---|---|---|---|---|
| `procedimento` | Texto | Sim | — | Nome do procedimento |
| `valor` | Decimal | Sim | Positivo | Valor total faturado para esse procedimento em R$ |

**Exemplo:**
```
procedimento          | valor
Pacote Internação     | 4290154.60
Fisioterapia          | 183606.87
Terapia c/ Método     | 65460.00
```

---

### 4. `Municipios`

Faturamento consolidado por município. Alimenta o gráfico e a tabela na aba **Geográfico**.

| Coluna | Tipo | Obrigatório | Valores aceitos | Descrição |
|---|---|---|---|---|
| `municipio` | Texto | Sim | — | Nome do município |
| `valor` | Decimal | Sim | Positivo | Valor total faturado naquele município em R$ |

**Exemplo:**
```
municipio       | valor
Nova Iguaçu     | 2161398.80
Rio de Janeiro  | 834502.62
Belford Roxo    | 395749.30
```

---

### 5. `Operadoras`

Faturamento por operadora de saúde. Alimenta as barras de progresso e a tabela na aba **Operadoras**.

| Coluna | Tipo | Obrigatório | Valores aceitos | Descrição |
|---|---|---|---|---|
| `operadora` | Texto | Sim | — | Nome da operadora |
| `valor` | Decimal | Sim | Positivo | Valor total faturado pela operadora em R$ |

**Exemplo:**
```
operadora           | valor
Unimed Nova Iguaçu  | 3108067.59
Camperj             | 1543878.05
```

---

### 6. `Distribuicao_Assistencia`

Distribuição do faturamento por tipo de assistência/turno. Alimenta o gráfico de donut na aba **Visão Geral**.

| Coluna | Tipo | Obrigatório | Valores aceitos | Descrição |
|---|---|---|---|---|
| `tipo` | Texto | Sim | — | Tipo de assistência (ex: `24h`, `12h`, `Assistência`, `Fisioterapia`) |
| `valor` | Decimal | Sim | Positivo | Valor total faturado para esse tipo em R$ |
| `cor` | Texto | Não | Hex CSS (ex: `#2563eb`) | Cor de exibição no gráfico; se vazio, usa cor padrão da paleta |

**Exemplo:**
```
tipo         | valor      | cor
24h          | 2958329.38 | #2563eb
Assistência  | 384198.79  | #7c3aed
12h          | 250710.30  | #db2777
```

---

### 7. `Acomodacao`

Distribuição entre Internação Domiciliar (ID) e Atendimento Domiciliar (AD). Alimenta o gráfico de donut de acomodação.

| Coluna | Tipo | Obrigatório | Valores aceitos | Descrição |
|---|---|---|---|---|
| `tipo` | Texto | Sim | `ID` \| `AD` | Código do tipo de acomodação |
| `label` | Texto | Sim | — | Rótulo exibido (ex: `Internação Domiciliar`) |
| `valor` | Decimal | Sim | Positivo | Valor total faturado em R$ |
| `cor` | Texto | Não | Hex CSS | Cor no gráfico |

**Exemplo:**
```
tipo | label                   | valor      | cor
ID   | Internação Domiciliar   | 3577064.84 | #2563eb
AD   | Atendimento Domiciliar  | 1074880.80 | #7c3aed
```

---

### 8. `Perfil_Sexo`

Distribuição percentual de pacientes por sexo. Alimenta o gráfico de donut de perfil.

| Coluna | Tipo | Obrigatório | Valores aceitos | Descrição |
|---|---|---|---|---|
| `sexo` | Texto | Sim | `Masculino` \| `Feminino` | Sexo do grupo |
| `percentual` | Decimal | Sim | 0–100, soma deve ser 100 | Percentual do total de pacientes |
| `cor` | Texto | Não | Hex CSS | Cor no gráfico |

**Exemplo:**
```
sexo       | percentual | cor
Masculino  | 69.94      | #2563eb
Feminino   | 30.06      | #db2777
```

---

## KPIs Calculados Automaticamente

Os seguintes indicadores **não precisam de aba própria** — são calculados pelo dashboard com base nas outras abas:

| KPI | Fórmula | Fonte |
|---|---|---|
| **Valor Total Pago** | `SUM(Operadoras.valor)` | Aba `Operadoras` |
| **Média Mensal Paga** | `Valor Total / qtd. meses` | Aba `Faturamento_Mensal` |
| **Valor Total Glosado** | Campo direto (futuro) | — |
| **Pacientes Distintos** | `COUNT(Pacientes.id)` | Aba `Pacientes` |
| **Custo Médio por Paciente** | `Valor Total / Pacientes Distintos` | Calculado |

---

## Regras de Validação

1. **Valores monetários:** sempre decimais com ponto (`.`) como separador. Não usar vírgula nem símbolo `R$`.
2. **Colunas obrigatórias:** se uma célula obrigatória estiver vazia, a linha é ignorada na importação.
3. **Status do paciente:** somente os quatro valores definidos (`Internação`, `Alta`, `Óbito`, `Ouvidoria`). Qualquer outro valor causa erro de importação.
4. **Operadora:** deve ser exatamente `Unimed Nova Iguaçu` ou `Camperj` (sensível a maiúsculas/minúsculas e espaços).
5. **Acomodação:** somente `ID` ou `AD`.
6. **Horas de atendimento:** obrigatórias apenas para pacientes com `acomodacao = ID`. Para `AD`, deixar em branco.
7. **Cores (hex):** formato `#RRGGBB` com 6 dígitos. Campo opcional; se ausente, cor padrão é aplicada.
8. **`Perfil_Sexo`:** a soma de `percentual` deve ser exatamente `100.00`.
9. **`Faturamento_Mensal`:** não duplicar o mesmo mês/ano. Ordem cronológica recomendada mas não obrigatória.

---

## Mapeamento Aba → Componente do Dashboard

| Aba Google Sheets | Aba no Dashboard | Componente |
|---|---|---|
| `Pacientes` | Analítico | `<AnaliticoPacientes />` |
| `Pacientes` | Atendimento Horas | `<AtendimentoHorasChart />` |
| `Faturamento_Mensal` | Visão Geral | `<FaturamentoMensalChart />` |
| `Procedimentos` | Procedimentos | `<TipoProcedimentoChart />` + `<ProcedimentoTable />` |
| `Municipios` | Geográfico | `<MunicipioChart />` |
| `Operadoras` | Operadoras | `<OperadoraChart />` |
| `Distribuicao_Assistencia` | Visão Geral | `<DistribuicaoAssistenciaChart />` |
| `Acomodacao` | Visão Geral | `<AcomodacaoChart />` |
| `Perfil_Sexo` | Visão Geral | `<SexoChart />` |

---

## Frequência de Atualização Recomendada

| Aba | Frequência |
|---|---|
| `Pacientes` | Diária ou sob demanda |
| `Faturamento_Mensal` | Mensal (ao fechar o mês) |
| `Procedimentos` | Mensal |
| `Municipios` | Mensal |
| `Operadoras` | Mensal |
| `Distribuicao_Assistencia` | Mensal |
| `Acomodacao` | Mensal |
| `Perfil_Sexo` | Mensal |

---

## Próximos Passos para Integração Técnica

- [ ] Configurar permissão de leitura da planilha via **Google Sheets API v4** (Service Account ou OAuth2)
- [ ] Criar variável de ambiente `VITE_GOOGLE_SHEETS_ID` com o ID da planilha
- [ ] Implementar camada de fetch em `src/lib/sheets.ts` que lê cada aba e transforma nos tipos esperados
- [ ] Substituir as importações de `src/data/mock.ts` pelos hooks de dados reais
- [ ] Adicionar estado de loading/erro nos componentes de visualização
- [ ] Configurar cache e revalidação (ex: a cada 30 minutos ou via botão de atualização manual)
