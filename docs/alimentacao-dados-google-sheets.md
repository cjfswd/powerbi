# Guia de Alimentação de Dados — Google Sheets

> Dashboard: **Unimed Nova Iguaçu / Camperj — Faturamento 2025**

---

## Arquitetura em 3 Camadas

A planilha é organizada em três tipos de abas com responsabilidades distintas:

```
CAMADA 1 — ENTRADA (dados brutos, preenchidos pelo usuário)
├── Pacientes               ← cadastro dos pacientes
└── Procedimentos_Realizados ← lançamentos por paciente/mês (tabela de relacionamento)

CAMADA 2 — REFERÊNCIA (listas pré-definidas, fonte dos dropdowns)
├── REF_Operadoras
├── REF_Procedimentos
├── REF_Status
├── REF_Sexo
└── REF_Acomodacao

CAMADA 3 — AGREGAÇÃO (fórmulas automáticas, lidas pelo dashboard)
├── AGG_Municipios
├── AGG_Operadoras
├── AGG_Sexo
├── AGG_Procedimentos
├── AGG_Faturamento_Mensal
└── AGG_Acomodacao
```

> **Regra fundamental:** nenhum valor de agregação é digitado manualmente. Toda aba `AGG_*` é composta exclusivamente por fórmulas que recalculam automaticamente ao adicionar dados nas abas de entrada.

---

## Diagrama de Relacionamento

```
REF_Operadoras ──────────────────────────────┐
REF_Status ──────────────────────────────┐   │
REF_Sexo ────────────────────────────┐   │   │
REF_Acomodacao ──────────────────┐   │   │   │
                                 ▼   ▼   ▼   ▼
                            ┌─────────────────────┐
                            │      Pacientes       │
                            │  id (PK)             │
                            │  nome                │
                            │  municipio (texto)   │
                            │  sexo ▼ dropdown     │
                            │  status ▼ dropdown   │
                            │  operadora ▼ dropdown│
                            │  acomodacao ▼ dropdown│
                            │  data_entrada        │
                            │  data_saida          │
                            └──────────┬───────────┘
                                       │ 1
                                       │ N
                            ┌──────────▼───────────┐
                            │ Procedimentos_        │
                            │ Realizados            │
                            │  id (PK)              │
                            │  paciente_id (FK) ────┘
                            │  procedimento ▼ dropdown
                            │  mes                  │
                            │  ano                  │
                            │  valor                │
                            │  horas_3h             │
                            │  horas_6h             │
                            │  horas_12h            │
                            │  horas_24h            │
                            │  ── campos auto ──    │
                            │  operadora_auto  ←────┤ VLOOKUP
                            │  municipio_auto  ←────┤ VLOOKUP
                            │  sexo_auto       ←────┤ VLOOKUP
                            │  acomodacao_auto ←────┘ VLOOKUP
                            └───────────────────────┘
                                       │
                              SUMIFS / COUNTIFS
                                       │
                  ┌────────────────────▼──────────────────────┐
                  │               AGG_* (fórmulas)             │
                  │  Municipios · Operadoras · Sexo            │
                  │  Procedimentos · Faturamento · Acomodacao  │
                  └────────────────────────────────────────────┘
                                       │
                                  Dashboard
```

**Por que campos `_auto` em `Procedimentos_Realizados`?**
Ao denormalizar operadora, município, sexo e acomodação na tabela de lançamentos via VLOOKUP, qualquer agregação cruzada (ex: *"valor de Fisioterapia para pacientes Femininos da Camperj em Nova Iguaçu"*) pode ser feita com um único `SUMIFS`, sem joins complexos.

---

## Camada 1 — Abas de Entrada

### `Pacientes`

Cadastro mestre. Uma linha por paciente. Campos controlados usam dropdown (Validação de Dados → ver seção de configuração).

| Coluna | Tipo | Entrada | Descrição |
|---|---|---|---|
| `id` | Inteiro | Manual | Identificador único, sequencial (1, 2, 3…) |
| `nome` | Texto | Manual | Nome completo do paciente |
| `municipio` | Texto | **Livre** | Município de residência — o usuário digita |
| `data_nascimento` | Data | Manual | Formato `DD/MM/AAAA` |
| `sexo` | Texto | **Dropdown** | Fonte: `REF_Sexo!A:A` |
| `status` | Texto | **Dropdown** | Fonte: `REF_Status!A:A` |
| `operadora` | Texto | **Dropdown** | Fonte: `REF_Operadoras!B:B` |
| `acomodacao` | Texto | **Dropdown** | Fonte: `REF_Acomodacao!A:A` |
| `data_entrada` | Data | Manual | Data de início do atendimento |
| `data_saida` | Data | Opcional | Vazio = paciente ainda ativo |

> **Município é campo livre** pois a lista de municípios é extensa e variável. Os dados geográficos no dashboard são agrupados dinamicamente pelo valor digitado — portanto a grafia deve ser consistente (ex: sempre "Nova Iguaçu", nunca "Nova iguaçu" ou "N. Iguaçu").

**Exemplo:**
```
id | nome          | municipio    | data_nasc  | sexo      | status    | operadora          | acomodacao | data_entrada | data_saida
1  | João Silva    | Nova Iguaçu  | 12/03/1948 | Masculino | Internação| Unimed Nova Iguaçu | ID         | 01/01/2025   |
2  | Maria Santos  | Rio de Janeiro| 05/07/1962| Feminino  | Alta      | Camperj            | AD         | 15/01/2025   | 20/02/2025
```

---

### `Procedimentos_Realizados`

Tabela de relacionamento paciente ↔ procedimento. Um lançamento por procedimento por mês por paciente. Esta aba é a **única fonte de verdade financeira** — todos os valores do dashboard derivam dela.

**Colunas de entrada (preenchidas pelo usuário):**

| Coluna | Tipo | Entrada | Descrição |
|---|---|---|---|
| `id` | Inteiro | Manual | Identificador único do lançamento |
| `paciente_id` | Inteiro | Manual | FK → `Pacientes!id` |
| `procedimento` | Texto | **Dropdown** | Fonte: `REF_Procedimentos!B:B` |
| `mes` | Texto | **Dropdown** | `Jan`, `Fev`, `Mar` … `Dez` |
| `ano` | Inteiro | Manual | Ex: `2025` |
| `valor` | Decimal | Manual | Valor faturado neste lançamento (R$) |
| `horas_3h` | Decimal | Opcional | Valor do turno 3h (só para acomodação ID) |
| `horas_6h` | Decimal | Opcional | Valor do turno 6h |
| `horas_12h` | Decimal | Opcional | Valor do turno 12h |
| `horas_24h` | Decimal | Opcional | Valor do turno 24h |

**Colunas automáticas (fórmulas — não editar):**

Essas colunas buscam dados do cadastro do paciente via `VLOOKUP` ou `INDEX+MATCH`, tornando cruzamentos possíveis com `SUMIFS`.

| Coluna | Fórmula (linha 2) | Descrição |
|---|---|---|
| `operadora_auto` | `=IFERROR(VLOOKUP(B2, Pacientes!$A:$G, 7, 0), "")` | Operadora do paciente |
| `municipio_auto` | `=IFERROR(VLOOKUP(B2, Pacientes!$A:$C, 3, 0), "")` | Município do paciente |
| `sexo_auto` | `=IFERROR(VLOOKUP(B2, Pacientes!$A:$E, 5, 0), "")` | Sexo do paciente |
| `acomodacao_auto` | `=IFERROR(VLOOKUP(B2, Pacientes!$A:$H, 8, 0), "")` | Acomodação do paciente |

> Ajuste os índices de coluna (`7`, `3`, `5`, `8`) conforme a ordem real das colunas na aba `Pacientes`. Recomendado: fixar as fórmulas nas primeiras linhas e usar **Ctrl+D** para copiar para baixo ao adicionar novos lançamentos.

**Exemplo:**
```
id | pac_id | procedimento     | mes | ano  | valor     | h_3h     | h_6h  | h_12h  | h_24h    | operadora_auto      | municipio_auto | sexo_auto | acomod_auto
1  | 1      | Pacote Internação| Jan | 2025 | 45230.50  | 5230.50  | 8500  | 15000  | 16500    | Unimed Nova Iguaçu  | Nova Iguaçu    | Masculino | ID
2  | 1      | Fisioterapia     | Jan | 2025 | 3200.00   |          |       |        |          | Unimed Nova Iguaçu  | Nova Iguaçu    | Masculino | ID
3  | 2      | Pacote Internação| Jan | 2025 | 38500.00  |          |       |        |          | Camperj             | Rio de Janeiro | Feminino  | AD
```

---

## Camada 2 — Abas de Referência

Estas abas são as **fontes dos dropdowns**. O usuário configura a Validação de Dados apontando para elas. Novos itens são adicionados nas listas sem necessidade de alterar fórmulas.

### `REF_Operadoras`

| Coluna | Exemplo |
|---|---|
| `id` | 1 |
| `nome` | Unimed Nova Iguaçu |

```
id | nome
1  | Unimed Nova Iguaçu
2  | Camperj
```

### `REF_Procedimentos`

| Coluna | Exemplo | Descrição |
|---|---|---|
| `id` | 1 | Identificador |
| `nome` | Pacote Internação | Nome exibido no dropdown e nas tabelas |
| `categoria` | Internação | Categoria de assistência (usado na `AGG_Acomodacao`) |

```
id | nome                    | categoria
1  | Pacote Internação        | Internação
2  | Fisioterapia            | Reabilitação
3  | Terapia c/ Método       | Reabilitação
4  | Consulta Médica         | Assistência
5  | Enfermagem 24h          | Internação
```

### `REF_Status`

```
valor
Internação
Alta
Óbito
Ouvidoria
```

### `REF_Sexo`

```
valor
Masculino
Feminino
```

### `REF_Acomodacao`

| `codigo` | `label` |
|---|---|
| ID | Internação Domiciliar |
| AD | Atendimento Domiciliar |

---

### Como Configurar Validação de Dados (Dropdowns)

1. Selecione a coluna de destino (ex: coluna `sexo` em `Pacientes`, excluindo o cabeçalho)
2. Menu **Dados → Validação de dados → Adicionar regra**
3. Em **Critérios**, selecione **Menu suspenso (de um intervalo)**
4. Insira o intervalo da aba de referência: ex: `REF_Sexo!A2:A100`
5. Marque **Mostrar aviso** ou **Rejeitar entrada** para evitar valores fora da lista
6. Salvar

| Campo | Intervalo de origem |
|---|---|
| `Pacientes.sexo` | `REF_Sexo!A2:A3` |
| `Pacientes.status` | `REF_Status!A2:A5` |
| `Pacientes.operadora` | `REF_Operadoras!B2:B100` |
| `Pacientes.acomodacao` | `REF_Acomodacao!A2:A3` |
| `Procedimentos_Realizados.procedimento` | `REF_Procedimentos!B2:B100` |
| `Procedimentos_Realizados.mes` | Lista fixa: `Jan,Fev,Mar,Abr,Mai,Jun,Jul,Ago,Set,Out,Nov,Dez` |

---

## Camada 3 — Abas de Agregação (Fórmulas)

Todas as abas `AGG_*` são lidas pelo dashboard. **Nenhuma célula de valor é editada manualmente** — somente as colunas de rótulo/chave (ex: o nome do município na coluna A) são fixas.

Convenção de nomenclatura usada nas fórmulas abaixo:
- `PAC` = aba `Pacientes`
- `PR` = aba `Procedimentos_Realizados`

---

### `AGG_Municipios`

Agrega pacientes e valores por município. O dashboard lê esta aba para o gráfico geográfico.

| Coluna | Conteúdo | Fórmula (linha 2) |
|---|---|---|
| `municipio` | Fixo (digitado uma vez) | — |
| `qtd_pacientes` | Contagem de pacientes | `=COUNTIF(PAC!C:C, A2)` |
| `valor_total` | Soma dos lançamentos | `=SUMIF(PR!municipio_auto, A2, PR!valor)` |
| `percentual_valor` | Participação no total | `=IFERROR(C2/SUM(C$2:C$200)*100, 0)` |

> Para municípios adicionais, basta adicionar uma nova linha com o nome e as fórmulas se ajustam. **Nunca delete linhas com municípios ativos.**

---

### `AGG_Operadoras`

| Coluna | Fórmula (linha 2) |
|---|---|
| `operadora` | Fixo (ex: `=REF_Operadoras!B2`) |
| `qtd_pacientes` | `=COUNTIF(PAC!G:G, A2)` |
| `valor_total` | `=SUMIF(PR!operadora_auto, A2, PR!valor)` |
| `percentual_valor` | `=IFERROR(C2/SUM(C$2:C$200)*100, 0)` |

---

### `AGG_Sexo`

| Coluna | Fórmula (linha 2) |
|---|---|
| `sexo` | Fixo (`Masculino` / `Feminino`) |
| `qtd_pacientes` | `=COUNTIF(PAC!E:E, A2)` |
| `percentual_pacientes` | `=IFERROR(B2/SUM(B$2:B$3)*100, 0)` |
| `valor_total` | `=SUMIF(PR!sexo_auto, A2, PR!valor)` |

---

### `AGG_Procedimentos`

| Coluna | Fórmula (linha 2) |
|---|---|
| `procedimento` | Fixo (ex: `=REF_Procedimentos!B2`) |
| `valor_total` | `=SUMIF(PR!procedimento, A2, PR!valor)` |
| `qtd_lancamentos` | `=COUNTIF(PR!procedimento, A2)` |
| `percentual_valor` | `=IFERROR(B2/SUM(B$2:B$200)*100, 0)` |

---

### `AGG_Faturamento_Mensal`

O usuário mantém as colunas `mes` e `ano` (uma linha por mês). A coluna `valor` é calculada automaticamente.

| Coluna | Fórmula (linha 2) |
|---|---|
| `mes` | Fixo (ex: `Jan`) |
| `ano` | Fixo (ex: `2025`) |
| `valor` | `=SUMIFS(PR!valor, PR!mes, A2, PR!ano, B2)` |

```
mes | ano  | valor  (calculado)
Jan | 2025 | =SUMIFS(...)
Fev | 2025 | =SUMIFS(...)
Mar | 2025 | =SUMIFS(...)
```

---

### `AGG_Acomodacao`

| Coluna | Fórmula (linha 2) |
|---|---|
| `codigo` | Fixo (`ID` / `AD`) |
| `label` | `=VLOOKUP(A2, REF_Acomodacao!A:B, 2, 0)` |
| `qtd_pacientes` | `=COUNTIF(PAC!H:H, A2)` |
| `valor_total` | `=SUMIF(PR!acomodacao_auto, A2, PR!valor)` |

---

## Análises Cruzadas com SUMIFS

Com os campos `_auto` em `Procedimentos_Realizados`, qualquer combinação de dimensões é possível diretamente no Sheets. Exemplos:

```
Valor de Fisioterapia para pacientes Femininos:
=SUMIFS(PR!valor, PR!procedimento, "Fisioterapia", PR!sexo_auto, "Feminino")

Valor total da Camperj em Nova Iguaçu em Janeiro/2025:
=SUMIFS(PR!valor, PR!operadora_auto, "Camperj", PR!municipio_auto, "Nova Iguaçu", PR!mes, "Jan", PR!ano, 2025)

Quantidade de pacientes Masculinos com acomodação ID:
=COUNTIFS(PAC!sexo, "Masculino", PAC!acomodacao, "ID")

Evolução mensal de um procedimento específico por operadora:
=SUMIFS(PR!valor, PR!procedimento, "Pacote Internação", PR!operadora_auto, "Unimed Nova Iguaçu", PR!mes, "Mar", PR!ano, 2025)
```

---

## KPIs Calculados pelo Dashboard

Não exigem aba própria — derivados das abas de agregação:

| KPI | Origem | Cálculo |
|---|---|---|
| **Valor Total Pago** | `AGG_Operadoras` | `SUM(valor_total)` |
| **Média Mensal** | `AGG_Faturamento_Mensal` | `Valor Total / COUNT(meses)` |
| **Valor Total Glosado** | Futura coluna em `PR` | `SUM(glosa)` — a implementar |
| **Pacientes Distintos** | `Pacientes` | `COUNTA(id) - 1` |
| **Custo Médio/Paciente** | Calculado | `Valor Total / Pacientes Distintos` |

---

## Mapeamento Aba → Componente do Dashboard

| Aba Google Sheets | Aba no Dashboard | Componente |
|---|---|---|
| `Pacientes` | Analítico | `<AnaliticoPacientes />` |
| `Procedimentos_Realizados` | Atendimento Horas | `<AtendimentoHorasChart />` |
| `AGG_Faturamento_Mensal` | Visão Geral | `<FaturamentoMensalChart />` |
| `AGG_Procedimentos` | Procedimentos | `<TipoProcedimentoChart />` + `<ProcedimentoTable />` |
| `AGG_Municipios` | Geográfico | `<MunicipioChart />` |
| `AGG_Operadoras` | Operadoras | `<OperadoraChart />` |
| `AGG_Acomodacao` | Visão Geral | `<AcomodacaoChart />` |
| `AGG_Sexo` | Visão Geral | `<SexoChart />` |

---

## Frequência de Atualização

| Aba | Quem atualiza | Frequência |
|---|---|---|
| `Pacientes` | Equipe clínica/administrativa | A cada admissão, alta ou mudança de status |
| `Procedimentos_Realizados` | Equipe de faturamento | Ao fechar o faturamento mensal |
| `REF_*` | Administrador | Ao cadastrar nova operadora ou procedimento |
| `AGG_*` | Automático (fórmulas) | Tempo real — recalculam ao salvar qualquer dado |

---

## Regras de Consistência de Dados

1. **`paciente_id` em `Procedimentos_Realizados`** deve sempre existir em `Pacientes!id`. Sem FK nativa no Sheets — validar manualmente ou via script Apps Script.
2. **Município** deve ser escrito de forma idêntica em todos os lançamentos do mesmo paciente (maiúsculas, acentuação). Recomendado padronizar uma lista informal de referência.
3. **Valores monetários:** ponto (`.`) como separador decimal. Sem `R$` ou `.` para milhar.
4. **Meses:** apenas as abreviações definidas (`Jan`, `Fev`…). Nunca numerais (`01`, `1`).
5. **Não deletar linhas** nas abas `AGG_*`. Apenas adicionar ou deixar com valor zero.
6. **Campos `_auto`** em `Procedimentos_Realizados` não devem ser editados manualmente — são sempre recalculados por fórmula.
7. **`data_saida` vazia** = paciente ativo. Nunca preencher com data futura.

---

## Próximos Passos para Integração Técnica

- [ ] Criar a planilha Google Sheets com todas as abas descritas
- [ ] Configurar Validação de Dados (dropdowns) para campos controlados
- [ ] Configurar permissão de leitura via **Google Sheets API v4** (Service Account)
- [ ] Criar variável de ambiente `VITE_GOOGLE_SHEETS_ID` com o ID da planilha
- [ ] Implementar `src/lib/sheets.ts` — lê as abas `AGG_*` e `Pacientes` e mapeia para os tipos do frontend
- [ ] Substituir importações de `src/data/mock.ts` por hooks de dados reais
- [ ] Adicionar estados de loading e erro nos componentes de visualização
- [ ] Configurar cache/revalidação (ex: a cada 30 min ou via botão manual)
- [ ] Avaliar Apps Script para validação de FK (`paciente_id` ↔ `Pacientes`)
