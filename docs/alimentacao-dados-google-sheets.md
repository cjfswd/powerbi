# Guia de Alimentação de Dados — Google Sheets

> Dashboard: **Unimed Nova Iguaçu / Camperj — Faturamento 2025**

---

## Arquitetura em 3 Camadas

```
CAMADA 1 — ENTRADA (dados brutos, preenchidos pelo usuário)
├── Pacientes                 ← cadastro dos pacientes
└── Procedimentos_Realizados  ← lançamentos mensais por paciente (N:N)

CAMADA 2 — REFERÊNCIA (listas pré-definidas, fonte dos dropdowns)
├── REF_Operadoras
├── REF_Procedimentos
├── REF_Status
├── REF_Sexo
├── REF_Acomodacao
└── REF_PacoteHoras

CAMADA 3 — AGREGAÇÃO (fórmulas automáticas, lidas pelo dashboard)
├── AGG_Municipios
├── AGG_Operadoras
├── AGG_Sexo
├── AGG_Procedimentos
├── AGG_Faturamento_Mensal
├── AGG_Acomodacao
└── AGG_PacoteHoras
```

> **Regra fundamental:** as abas `AGG_*` são 100% fórmulas — nenhum valor é digitado manualmente nelas.

---

## Diagrama de Relacionamento

```
REF_Operadoras ──────────────────────────────────────────┐
REF_Status ──────────────────────────────────────────┐   │
REF_Sexo ────────────────────────────────────────┐   │   │
REF_Acomodacao ──────────────────────────────┐   │   │   │
REF_PacoteHoras ──────────────────────────┐  │   │   │   │
                                          ▼  ▼   ▼   ▼   ▼
                                   ┌──────────────────────────┐
                                   │         Pacientes         │
                                   │  id (PK)                  │
                                   │  nome                     │
                                   │  municipio (texto livre)  │
                                   │  data_nascimento          │
                                   │  sexo ▼ dropdown          │
                                   │  operadora ▼ dropdown     │
                                   │  acomodacao ▼ dropdown    │
                                   │  status ▼ dropdown        │
                                   │  pacote_horas ▼ dropdown  │
                                   │  data_entrada             │
                                   │  data_saida               │
                                   └──────────┬───────────────┘
                                              │ 1
                                              │ N
                         ┌────────────────────▼──────────────────────────┐
                         │           Procedimentos_Realizados             │
                         │  id (PK)                                       │
                         │  paciente_id (FK)                              │
                         │  procedimento ▼ dropdown                       │
                         │  mes ▼ dropdown                                │
                         │  ano                                           │
                         │  quantidade                                    │
                         │  valor_unitario                                │
                         │  valor_total  [= quantidade * valor_unitario]  │
                         └───────────────────────────────────────────────┘
                                              │ SUMPRODUCT (join inline)
                         ┌────────────────────▼──────────────────────────┐
                         │               AGG_* (fórmulas)                 │
                         └───────────────────────────────────────────────┘
```

---

## Camada 1 — Abas de Entrada

### `Pacientes`

Cadastro mestre. **Uma linha por paciente.** Campos controlados usam dropdown.

**Layout de colunas (ordem obrigatória para os VLOOKUPs funcionarem):**

```
A  | B    | C         | D               | E    | F         | G          | H      | I            | J            | K
id | nome | municipio | data_nascimento | sexo | operadora | acomodacao | status | pacote_horas | data_entrada | data_saida
```

| Coluna | Tipo | Entrada | Descrição |
|---|---|---|---|
| A `id` | Inteiro | Manual | Identificador único, sequencial (1, 2, 3…) |
| B `nome` | Texto | Manual | Nome completo do paciente |
| C `municipio` | Texto | **Livre** | Município de residência — o usuário digita |
| D `data_nascimento` | Data | Manual | Formato `DD/MM/AAAA` |
| E `sexo` | Texto | **Dropdown** | Fonte: `REF_Sexo` |
| F `operadora` | Texto | **Dropdown** | Fonte: `REF_Operadoras` |
| G `acomodacao` | Texto | **Dropdown** | Fonte: `REF_Acomodacao` (`ID` ou `AD`) |
| H `status` | Texto | **Dropdown** | Fonte: `REF_Status` — atualizar a cada mudança clínica |
| I `pacote_horas` | Texto | **Dropdown** | Fonte: `REF_PacoteHoras` — atualizar a cada mudança de pacote |
| J `data_entrada` | Data | Manual | Data de início do atendimento |
| K `data_saida` | Data | Opcional | Vazio = paciente ativo |

> **Município é campo livre** — mantenha grafia consistente (ex: sempre "Nova Iguaçu"). O dashboard agrupa pelo valor digitado.

**Exemplo:**
```
id | nome         | municipio     | nasc       | sexo      | operadora          | acomod | status     | pacote | entrada    | saida
1  | João Silva   | Nova Iguaçu   | 12/03/1948 | Masculino | Unimed Nova Iguaçu | ID     | Internação | 24h    | 01/01/2025 |
2  | Maria Santos | Rio de Janeiro| 05/07/1962 | Feminino  | Camperj            | AD     | Alta       | 12h    | 15/01/2025 | 20/02/2025
```

---

### `Procedimentos_Realizados`

Tabela de relacionamento paciente ↔ procedimento. Um lançamento por procedimento por mês por paciente. Fonte financeira de todo o dashboard.

**Colunas de entrada (preenchidas pelo usuário):**

| Coluna | Tipo | Entrada | Descrição |
|---|---|---|---|
| A `id` | Inteiro | Manual | Identificador único do lançamento |
| B `paciente_id` | Inteiro | Manual | FK → `Pacientes.id` |
| C `procedimento` | Texto | **Dropdown** | Fonte: `REF_Procedimentos` |
| D `mes` | Texto | **Dropdown** | `Jan` … `Dez` |
| E `ano` | Inteiro | Manual | Ex: `2025` |
| F `quantidade` | Inteiro | Manual | Nº de execuções do procedimento no mês |
| G `valor_unitario` | Decimal | Manual | Valor de uma execução (R$) |

**Coluna calculada por fórmula (não editar):**

| Coluna | Fórmula (linha 2) | Descrição |
|---|---|---|
| H `valor_total` | `=IF(F2="","",F2*G2)` | `quantidade × valor_unitario` |

**Exemplo:**
```
id | pac | procedimento      | mes | ano  | qtd | unit     | total
1  | 1   | Pacote Internação | Jan | 2025 | 1   | 40000.00 | 40000.00
2  | 1   | Fisioterapia      | Jan | 2025 | 8   | 400.00   | 3200.00
3  | 1   | Fisioterapia      | Fev | 2025 | 6   | 400.00   | 2400.00
4  | 2   | Consulta Médica   | Jan | 2025 | 2   | 350.00   | 700.00
```

---

## Camada 2 — Abas de Referência

### `REF_Operadoras`
```
id | nome
1  | Unimed Nova Iguaçu
2  | Camperj
```

### `REF_Procedimentos`
```
id | nome                  | categoria
1  | Pacote Internação      | Internação
2  | Fisioterapia          | Reabilitação
3  | Terapia c/ Método     | Reabilitação
4  | Consulta Médica       | Assistência
5  | Enfermagem 24h        | Internação
```

### `REF_Status`
```
Internação
Alta
Óbito
Ouvidoria
```

### `REF_Sexo`
```
Masculino
Feminino
```

### `REF_Acomodacao`
```
codigo | label
ID     | Internação Domiciliar
AD     | Atendimento Domiciliar
```

### `REF_PacoteHoras`
```
valor | label
3h    | Pacote 3 horas/dia
6h    | Pacote 6 horas/dia
12h   | Pacote 12 horas/dia
24h   | Pacote 24 horas/dia (integral)
```

---

### Configuração de Validação de Dados (Dropdowns)

| Campo | Intervalo de origem |
|---|---|
| `Pacientes.sexo` (col E) | `REF_Sexo!A2:A3` |
| `Pacientes.operadora` (col F) | `REF_Operadoras!B2:B100` |
| `Pacientes.acomodacao` (col G) | `REF_Acomodacao!A2:A3` |
| `Pacientes.status` (col H) | `REF_Status!A2:A10` |
| `Pacientes.pacote_horas` (col I) | `REF_PacoteHoras!A2:A5` |
| `Procedimentos_Realizados.procedimento` (col C) | `REF_Procedimentos!B2:B100` |
| `Procedimentos_Realizados.mes` (col D) | Lista fixa: `Jan,Fev,Mar,Abr,Mai,Jun,Jul,Ago,Set,Out,Nov,Dez` |

---

## Camada 3 — Abas de Agregação (Fórmulas)

Convenções:
- `PAC` = `Pacientes`
- `PR` = `Procedimentos_Realizados`

---

> **Por que SUMPRODUCT nas AGGs?** `Procedimentos_Realizados` só contém dados da transação — sem colunas derivadas. O join com `Pacientes` é feito inline pelas fórmulas abaixo. `SUMPRODUCT` multiplica dois arrays: um booleano (paciente pertence à dimensão?) e os valores, somando o resultado.

### `AGG_Municipios`

| Coluna | Fórmula (linha 2) |
|---|---|
| A `municipio` | Fixo (digitado uma vez por município) |
| B `qtd_pacientes` | `=COUNTIF(PAC!C:C, A2)` |
| C `valor_total` | `=SUMPRODUCT((IFERROR(VLOOKUP(PR!$B$2:$B$9999,PAC!$A:$C,3,0),"")=A2)*PR!$H$2:$H$9999)` |
| D `percentual_valor` | `=IFERROR(C2/SUM(C$2:C$200)*100, 0)` |

### `AGG_Operadoras`

| Coluna | Fórmula (linha 2) |
|---|---|
| A `operadora` | `=REF_Operadoras!B2` |
| B `qtd_pacientes` | `=COUNTIF(PAC!F:F, A2)` |
| C `valor_total` | `=SUMPRODUCT((IFERROR(VLOOKUP(PR!$B$2:$B$9999,PAC!$A:$F,6,0),"")=A2)*PR!$H$2:$H$9999)` |
| D `percentual_valor` | `=IFERROR(C2/SUM(C$2:C$200)*100, 0)` |

### `AGG_Sexo`

| Coluna | Fórmula (linha 2) |
|---|---|
| A `sexo` | Fixo (`Masculino` / `Feminino`) |
| B `qtd_pacientes` | `=COUNTIF(PAC!E:E, A2)` |
| C `percentual_pacientes` | `=IFERROR(B2/SUM(B$2:B$3)*100, 0)` |
| D `valor_total` | `=SUMPRODUCT((IFERROR(VLOOKUP(PR!$B$2:$B$9999,PAC!$A:$E,5,0),"")=A2)*PR!$H$2:$H$9999)` |

### `AGG_Procedimentos`

| Coluna | Fórmula (linha 2) |
|---|---|
| A `procedimento` | `=REF_Procedimentos!B2` |
| B `qtd_realizacoes` | `=SUMIF(PR!C:C, A2, PR!F:F)` |
| C `valor_total` | `=SUMIF(PR!C:C, A2, PR!H:H)` |
| D `valor_medio_unit` | `=IFERROR(C2/B2, 0)` |
| E `percentual_valor` | `=IFERROR(C2/SUM(C$2:C$200)*100, 0)` |

### `AGG_Faturamento_Mensal`

| Coluna | Fórmula (linha 2) |
|---|---|
| A `mes` | Fixo (ex: `Jan`) |
| B `ano` | Fixo (ex: `2025`) |
| C `valor_total` | `=SUMIFS(PR!H:H, PR!D:D, A2, PR!E:E, B2)` |
| D `qtd_realizacoes` | `=SUMIFS(PR!F:F, PR!D:D, A2, PR!E:E, B2)` |
| E `qtd_pacientes_ativos` | `=COUNTIFS(PR!D:D, A2, PR!E:E, B2, PR!B:B, ">"&0)` |

### `AGG_Acomodacao`

| Coluna | Fórmula (linha 2) |
|---|---|
| A `codigo` | Fixo (`ID` / `AD`) |
| B `label` | `=VLOOKUP(A2, REF_Acomodacao!A:B, 2, 0)` |
| C `qtd_pacientes` | `=COUNTIF(PAC!G:G, A2)` |
| D `valor_total` | `=SUMPRODUCT((IFERROR(VLOOKUP(PR!$B$2:$B$9999,PAC!$A:$G,7,0),"")=A2)*PR!$H$2:$H$9999)` |

### `AGG_PacoteHoras`

| Coluna | Fórmula (linha 2) |
|---|---|
| A `pacote` | `=REF_PacoteHoras!A2` |
| B `qtd_pacientes_ativos` | `=COUNTIF(PAC!I:I, A2)` |
| C `percentual` | `=IFERROR(B2/SUM(B$2:B$5)*100, 0)` |
| D `valor_total` | `=SUMPRODUCT((IFERROR(VLOOKUP(PR!$B$2:$B$9999,PAC!$A:$I,9,0),"")=A2)*PR!$H$2:$H$9999)` |

---

## Análises Cruzadas

Dimensões que vivem **dentro de PR** (procedimento, mes, ano) usam `SUMIFS` simples. Dimensões que vivem em **Pacientes** (operadora, município, sexo, pacote) usam `SUMPRODUCT` com VLOOKUP inline.

```
Fisioterapia em Mar/2025 (tudo em PR — SUMIFS simples):
=SUMIFS(PR!H:H, PR!C:C, "Fisioterapia", PR!D:D, "Mar", PR!E:E, 2025)

Fisioterapia para pacientes Femininos (join com Pacientes — SUMPRODUCT):
=SUMPRODUCT(
  (PR!C$2:C$9999="Fisioterapia") *
  (IFERROR(VLOOKUP(PR!$B$2:$B$9999,PAC!$A:$E,5,0),"")="Feminino") *
  PR!H$2:H$9999
)

Total da Camperj em Nova Iguaçu em Jan/2025:
=SUMPRODUCT(
  (IFERROR(VLOOKUP(PR!$B$2:$B$9999,PAC!$A:$F,6,0),"")="Camperj") *
  (IFERROR(VLOOKUP(PR!$B$2:$B$9999,PAC!$A:$C,3,0),"")="Nova Iguaçu") *
  (PR!D$2:D$9999="Jan") *
  (PR!E$2:E$9999=2025) *
  PR!H$2:H$9999
)

Pacientes com status "Internação" no pacote "24h" (direto de Pacientes — COUNTIFS):
=COUNTIFS(PAC!H:H, "Internação", PAC!I:I, "24h")
```

---

## KPIs Calculados pelo Dashboard

| KPI | Cálculo |
|---|---|
| **Valor Total Pago** | `SUM(AGG_Operadoras!C:C)` |
| **Média Mensal** | `Valor Total / COUNT(meses com lançamento)` |
| **Pacientes Distintos** | `COUNTA(Pacientes!A:A) - 1` |
| **Custo Médio/Paciente** | `Valor Total / Pacientes Distintos` |
| **Valor Total Glosado** | futura coluna `glosa` em `Procedimentos_Realizados` |

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
| `AGG_PacoteHoras` | Visão Geral | novo componente a criar |

---

## Frequência de Atualização

| Aba | Quem atualiza | Quando |
|---|---|---|
| `Pacientes` | Equipe clínica/administrativa | A cada admissão, alta ou mudança de status/pacote |
| `Procedimentos_Realizados` | Equipe de faturamento | Ao fechar o faturamento mensal |
| `REF_*` | Administrador | Ao cadastrar nova operadora, procedimento etc. |
| `AGG_*` | **Automático (fórmulas)** | Tempo real — recalculam ao salvar qualquer dado |

---

## Regras de Consistência de Dados

1. **`paciente_id`** em `Procedimentos_Realizados` deve existir em `Pacientes.id`.
2. **Município** deve ter grafia idêntica em todos os cadastros do mesmo local.
3. **Valores monetários:** ponto (`.`) decimal. Sem `R$`, sem ponto de milhar.
4. **Meses:** apenas abreviações `Jan`…`Dez`. Nunca numerais.
5. **Coluna `valor_total` em `Procedimentos_Realizados`** (H) — nunca digitar, é fórmula.
6. **`data_saida` vazia** = paciente ativo. Não preencher com datas futuras.
7. **Não deletar linhas** em abas `AGG_*`.

---

## Guia de Configuração no Google Sheets (Passo a Passo)

---

### Passo 1 — Criar a planilha e nomear as abas

1. Acesse [sheets.google.com](https://sheets.google.com) → **"+ Em branco"**
2. Renomeie o arquivo para `Dashboard Faturamento 2025`
3. Para cada aba: clique **`+`** no canto inferior esquerdo → clique duplo no nome para renomear

**Ordem de criação:**
```
Pacientes · Procedimentos_Realizados
REF_Operadoras · REF_Procedimentos · REF_Status · REF_Sexo · REF_Acomodacao · REF_PacoteHoras
AGG_Municipios · AGG_Operadoras · AGG_Sexo · AGG_Procedimentos · AGG_Faturamento_Mensal · AGG_Acomodacao · AGG_PacoteHoras
```

**Colorir por camada** (botão direito na aba → "Mudar cor"):

| Cor | Abas |
|---|---|
| Azul | `Pacientes`, `Procedimentos_Realizados` |
| Cinza | `REF_*` |
| Verde | `AGG_*` |

---

### Passo 2 — Preencher as abas de referência (REF_*)

**`REF_Operadoras`** (A1:B1 cabeçalho, dados a partir de A2):
```
id | nome
1  | Unimed Nova Iguaçu
2  | Camperj
```

**`REF_Procedimentos`** (A1:C1 cabeçalho):
```
id | nome                  | categoria
1  | Pacote Internação      | Internação
2  | Fisioterapia          | Reabilitação
3  | Terapia c/ Método     | Reabilitação
4  | Consulta Médica       | Assistência
5  | Enfermagem 24h        | Internação
```

**`REF_Status`** (coluna A, sem id):
```
Internação
Alta
Óbito
Ouvidoria
```

**`REF_Sexo`**:
```
Masculino
Feminino
```

**`REF_Acomodacao`**:
```
ID | Internação Domiciliar
AD | Atendimento Domiciliar
```

**`REF_PacoteHoras`**:
```
3h  | Pacote 3 horas/dia
6h  | Pacote 6 horas/dia
12h | Pacote 12 horas/dia
24h | Pacote 24 horas/dia (integral)
```

---

### Passo 3 — Configurar a aba `Pacientes`

#### 3.1 Criar o cabeçalho na linha 1

```
A  | B    | C         | D               | E    | F         | G          | H      | I            | J            | K
id | nome | municipio | data_nascimento | sexo | operadora | acomodacao | status | pacote_horas | data_entrada | data_saida
```

#### 3.2 Formatar colunas de data

Selecione D, J e K inteiras → **Formatar → Número → Data** → `DD/MM/AAAA`

#### 3.3 Configurar os dropdowns

Para cada campo, selecione a coluna inteira (ex: `E2:E9999`) → **Dados → Validação de dados → Adicionar regra**:

| Coluna | Critérios | Intervalo | Dados inválidos |
|---|---|---|---|
| E `sexo` | Menu suspenso (de um intervalo) | `REF_Sexo!A2:A3` | Rejeitar entrada |
| F `operadora` | Menu suspenso (de um intervalo) | `REF_Operadoras!B2:B100` | Rejeitar entrada |
| G `acomodacao` | Menu suspenso (de um intervalo) | `REF_Acomodacao!A2:A3` | Rejeitar entrada |
| H `status` | Menu suspenso (de um intervalo) | `REF_Status!A2:A10` | Rejeitar entrada |
| I `pacote_horas` | Menu suspenso (de um intervalo) | `REF_PacoteHoras!A2:A5` | Rejeitar entrada |

#### 3.4 Congelar o cabeçalho

**Exibir → Congelar → 1 linha**

---

### Passo 4 — Configurar a aba `Procedimentos_Realizados`

#### 4.1 Criar o cabeçalho

```
A  | B           | C            | D   | E   | F          | G              | H
id | paciente_id | procedimento | mes | ano | quantidade | valor_unitario | valor_total
```

#### 4.2 Formatar colunas monetárias

Selecione G e H → **Formatar → Número → Moeda**

#### 4.3 Configurar dropdowns

| Coluna | Critérios | Intervalo / Lista | Dados inválidos |
|---|---|---|---|
| C `procedimento` | Menu suspenso (de um intervalo) | `REF_Procedimentos!B2:B100` | Rejeitar entrada |
| D `mes` | Menu suspenso (de uma lista) | `Jan,Fev,Mar,Abr,Mai,Jun,Jul,Ago,Set,Out,Nov,Dez` | Rejeitar entrada |

#### 4.4 Inserir fórmula de valor_total (coluna H)

Na célula **H2**:
```
=IF(F2="","",F2*G2)
```

Selecione H2 → **Ctrl+C** → selecione H3:H9999 → **Ctrl+V**

#### 4.5 Proteger coluna de fórmula

**Dados → Proteger intervalos** → intervalo `H:H` → "Mostrar aviso ao editar"

---

### Passo 5 — Configurar as abas AGG_*

> Ao referenciar outra aba em fórmulas, use a sintaxe `NomeDaAba!Coluna:Coluna`. Nomes sem espaços não precisam de apóstrofos.

Abreviações usadas nas fórmulas: `PR` = `Procedimentos_Realizados`, `PAC` = `Pacientes`.

#### `AGG_Municipios`

Cabeçalho: `municipio | qtd_pacientes | valor_total | percentual_valor`

- A2: nome do município (ex: `Nova Iguaçu`)
- B2: `=COUNTIF(PAC!C:C,A2)`
- C2: `=SUMPRODUCT((IFERROR(VLOOKUP(PR!$B$2:$B$9999,PAC!$A:$C,3,0),"")=A2)*PR!$H$2:$H$9999)`
- D2: `=IFERROR(C2/SUM(C$2:C$200)*100,0)`

Adicione uma linha por município. Selecione B2:D2 → copie → cole nas demais linhas.

#### `AGG_Operadoras`

- A2: `=REF_Operadoras!B2`
- B2: `=COUNTIF(PAC!F:F,A2)`
- C2: `=SUMPRODUCT((IFERROR(VLOOKUP(PR!$B$2:$B$9999,PAC!$A:$F,6,0),"")=A2)*PR!$H$2:$H$9999)`
- D2: `=IFERROR(C2/SUM(C$2:C$200)*100,0)`

#### `AGG_Sexo`

- A2: `Masculino` / A3: `Feminino`
- B2: `=COUNTIF(PAC!E:E,A2)`
- C2: `=IFERROR(B2/SUM(B$2:B$3)*100,0)`
- D2: `=SUMPRODUCT((IFERROR(VLOOKUP(PR!$B$2:$B$9999,PAC!$A:$E,5,0),"")=A2)*PR!$H$2:$H$9999)`

#### `AGG_Procedimentos`

Sem join — `procedimento` é coluna direta de PR.

- A2: `=REF_Procedimentos!B2`
- B2: `=SUMIF(PR!C:C,A2,PR!F:F)`
- C2: `=SUMIF(PR!C:C,A2,PR!H:H)`
- D2: `=IFERROR(C2/B2,0)`
- E2: `=IFERROR(C2/SUM(C$2:C$200)*100,0)`

#### `AGG_Faturamento_Mensal`

Sem join — mes/ano são colunas diretas de PR.

- A2: `Jan` | B2: `2025` (uma linha por mês, preenchidas manualmente)
- C2: `=SUMIFS(PR!H:H,PR!D:D,A2,PR!E:E,B2)`
- D2: `=SUMIFS(PR!F:F,PR!D:D,A2,PR!E:E,B2)`
- E2: `=COUNTIFS(PR!D:D,A2,PR!E:E,B2,PR!B:B,">"&0)`

#### `AGG_Acomodacao`

- A2: `ID` / A3: `AD`
- B2: `=VLOOKUP(A2,REF_Acomodacao!A:B,2,0)`
- C2: `=COUNTIF(PAC!G:G,A2)`
- D2: `=SUMPRODUCT((IFERROR(VLOOKUP(PR!$B$2:$B$9999,PAC!$A:$G,7,0),"")=A2)*PR!$H$2:$H$9999)`

#### `AGG_PacoteHoras`

- A2: `=REF_PacoteHoras!A2` (linhas 2–5 para 3h, 6h, 12h, 24h)
- B2: `=COUNTIF(PAC!I:I,A2)`
- C2: `=IFERROR(B2/SUM(B$2:B$5)*100,0)`
- D2: `=SUMPRODUCT((IFERROR(VLOOKUP(PR!$B$2:$B$9999,PAC!$A:$I,9,0),"")=A2)*PR!$H$2:$H$9999)`

---

### Passo 6 — Proteger abas contra edição acidental

**Abas AGG_* e REF_*** (ninguém deve editar manualmente):
1. Botão direito na aba → **"Proteger planilha"**
2. **"Definir permissões"** → **"Mostrar um aviso ao editar"**
3. Salvar

---

### Passo 7 — Boas práticas finais

**Congelar cabeçalho** em todas as abas:
- **Exibir → Congelar → 1 linha**

**Usar Intervalos Nomeados** para fórmulas mais legíveis:
- **Dados → Intervalos nomeados** → criar:

| Nome | Intervalo |
|---|---|
| `pr_valor` | `Procedimentos_Realizados!H2:H9999` |
| `pr_procedimento` | `Procedimentos_Realizados!C2:C9999` |
| `pr_operadora` | `Procedimentos_Realizados!I2:I9999` |
| `pr_municipio` | `Procedimentos_Realizados!J2:J9999` |
| `pr_sexo` | `Procedimentos_Realizados!K2:K9999` |
| `pr_pacote` | `Procedimentos_Realizados!M2:M9999` |

Resultado: fórmulas mais legíveis:
```
antes: =SUMIF(Procedimentos_Realizados!I:I, A2, Procedimentos_Realizados!H:H)
depois: =SUMIF(pr_operadora, A2, pr_valor)
```

**Compartilhar com permissões corretas:**
- Equipe clínica/faturamento: **Editor**
- Dashboard (Service Account da API): **Leitor**

---

## Próximos Passos para Integração Técnica

- [ ] Criar a planilha Google Sheets seguindo o guia acima
- [ ] Configurar permissão de leitura via **Google Sheets API v4** (Service Account)
- [ ] Criar variável de ambiente `VITE_GOOGLE_SHEETS_ID`
- [ ] Implementar `src/lib/sheets.ts` — lê `AGG_*` e `Pacientes`, mapeia para tipos do frontend
- [ ] Substituir `src/data/mock.ts` por hooks de dados reais
- [ ] Adicionar estados de loading e erro nos componentes
- [ ] Configurar cache/revalidação (ex: a cada 30 min ou botão manual)
- [ ] Criar componente `<PacoteHorasChart />` para `AGG_PacoteHoras`
