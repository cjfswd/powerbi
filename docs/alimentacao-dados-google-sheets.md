# Guia de Alimentação de Dados — Google Sheets

> Dashboard: **Unimed Nova Iguaçu / Camperj — Faturamento 2025**
> Planilha: **FATURAMENTO** — ID `1tQHfqn8VSS78iQ7csxwJ6xobT769Umc5-ZDkqLXTjps`
> URL: https://docs.google.com/spreadsheets/d/1tQHfqn8VSS78iQ7csxwJ6xobT769Umc5-ZDkqLXTjps/edit

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
├── REF_Municipios
├── REF_Acomodacao
└── REF_Pacote_Horas

CAMADA 3 — AGREGAÇÃO (fórmulas automáticas, lidas pelo dashboard)
├── AGG_Municipios
├── AGG_Operadoras
├── AGG_Sexo
├── AGG_Procedimentos
├── AGG_Faturamento_Mensal
├── AGG_Acomodacao
└── AGG_Pacote_Horas
```

> **Regra fundamental:** as abas `AGG_*` são 100% fórmulas — nenhum valor é digitado manualmente nelas.

---

## Diagrama de Relacionamento

```
REF_Municipios ────────────────────────────────────────────┐
REF_Operadoras ──────────────────────────────────────────┐ │
REF_Status ──────────────────────────────────────────┐   │ │
REF_Sexo ────────────────────────────────────────┐   │   │ │
REF_Acomodacao ──────────────────────────────┐   │   │   │ │
REF_Pacote_Horas ──────────────────────────┐ │   │   │   │ │
                                           ▼ ▼   ▼   ▼   ▼ ▼
                                   ┌──────────────────────────┐
                                   │         Pacientes         │
                                   │  id (PK)                  │
                                   │  nome                     │
                                   │  municipio ▼ dropdown     │
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
                         │  procedimento                                  │
                         │  mes                                           │
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

Cadastro mestre. **Uma linha por paciente.** Todos os campos controlados usam dropdown.

**Layout de colunas (ordem obrigatória para os VLOOKUPs funcionarem):**

```
A  | B    | C         | D               | E    | F         | G          | H      | I            | J            | K
id | nome | municipio | data_nascimento | sexo | operadora | acomodacao | status | pacote_horas | data_entrada | data_saida
```

| Coluna | Tipo | Entrada | Validação real |
|---|---|---|---|
| A `id` | Inteiro | Manual | — |
| B `nome` | Texto | Manual | — |
| C `municipio` | Texto | **Dropdown** | `REF_Municipios!A:A` |
| D `data_nascimento` | Data | Manual | `DATE_IS_VALID_DATE` |
| E `sexo` | Texto | **Dropdown** | `REF_Sexo!A1:A2` |
| F `operadora` | Texto | **Dropdown** | `REF_Operadoras!A1:A` |
| G `acomodacao` | Texto | **Dropdown** | `REF_Acomodacao!A1:A` |
| H `status` | Texto | **Dropdown** | `REF_Status!A1:A` |
| I `pacote_horas` | Texto | **Dropdown** | `REF_Pacote_Horas!A1:A` |
| J `data_entrada` | Data | Manual | `DATE_IS_VALID_DATE` |
| K `data_saida` | Data | Opcional | `DATE_IS_VALID_DATE` — vazio = paciente ativo |

**Exemplo:**
```
id | nome         | municipio    | nasc       | sexo      | operadora    | acomod | status     | pacote | entrada    | saida
1  | João Silva   | Nova Iguaçu  | 12/03/1948 | Masculino | Unimed NI RJ | ID     | Internação | 24h    | 01/01/2025 |
2  | Maria Santos | Rio de Janeiro| 05/07/1962| Feminino  | CAMPERJ      | AD     | Alta       | 12h    | 15/01/2025 | 20/02/2025
```

---

### `Procedimentos_Realizados`

Tabela de relacionamento paciente ↔ procedimento. Um lançamento por procedimento por mês por paciente. Fonte financeira de todo o dashboard.

**Layout de colunas:**

```
A  | B           | C            | D   | E   | F          | G              | H
id | paciente_id | procedimento | mes | ano | quantidade | valor_unitario | valor_total
```

| Coluna | Tipo | Entrada | Descrição |
|---|---|---|---|
| A `id` | Inteiro | Manual | Identificador único do lançamento |
| B `paciente_id` | Inteiro | Manual | FK → `Pacientes.id` |
| C `procedimento` | Texto | Manual | Nome do procedimento — usar exatamente como está em `REF_Procedimentos` |
| D `mes` | Texto | Manual | `Jan` … `Dez` |
| E `ano` | Inteiro | Manual | Ex: `2025` |
| F `quantidade` | Inteiro | Manual | Nº de execuções do procedimento no mês |
| G `valor_unitario` | Decimal | Manual | Valor de uma execução (R$) |
| H `valor_total` | Decimal | **Fórmula** | `=IF(F2="","",F2*G2)` — não editar |

> **Atenção — espaços no nome dos procedimentos:** os valores em `REF_Procedimentos` possuem espaços à direita (ex: `"Fisioterapia            "`). Ao digitar em `procedimento`, use exatamente o mesmo valor da lista para garantir que as fórmulas de agregação funcionem. O uso de dropdown para essa coluna (ainda não configurado na planilha) eliminaria esse risco.

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

Todas as abas REF são listas simples em coluna A (sem cabeçalho de id ou categoria). Os dropdowns apontam diretamente para `A1:A` ou `A:A`.

### `REF_Operadoras`
```
Unimed NI RJ
CAMPERJ
```

### `REF_Procedimentos`

> ⚠️ Alguns valores possuem espaços à direita. Recomenda-se limpá-los para evitar problemas nas fórmulas de agregação.

```
Pacote Internação
Fisioterapia
Terapia c/ Método
Consulta Médica
Enfermagem 24h
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
ID
AD
```

### `REF_Pacote_Horas`
```
3h
6h
12h
24h
```

### `REF_Municipios`

Lista com os 92 municípios do estado do Rio de Janeiro. Primeiros valores:
```
Rio de Janeiro
São Gonçalo
Duque de Caxias
Nova Iguaçu
Campos dos Goytacazes
Belford Roxo
Niterói
São João de Meriti
Petrópolis
Volta Redonda
… (92 municípios no total)
```

---

### Validação de Dados Configurada na Planilha

Intervalos exatamente conforme o JSON exportado da planilha real:

| Campo | Intervalo configurado | Rejeita entrada inválida |
|---|---|---|
| `Pacientes.municipio` (col C) | `REF_Municipios!A:A` | Sim |
| `Pacientes.sexo` (col E) | `REF_Sexo!A1:A2` | Sim |
| `Pacientes.operadora` (col F) | `REF_Operadoras!A1:A` | Sim |
| `Pacientes.acomodacao` (col G) | `REF_Acomodacao!A1:A` | Sim |
| `Pacientes.status` (col H) | `REF_Status!A1:A` | Sim |
| `Pacientes.pacote_horas` (col I) | `REF_Pacote_Horas!A1:A` | Sim |
| `Procedimentos_Realizados.procedimento` (col C) | **não configurado** — recomendado adicionar | — |
| `Procedimentos_Realizados.mes` (col D) | **não configurado** — recomendado adicionar | — |

---

## Camada 3 — Abas de Agregação (Fórmulas)

Convenções:
- `PAC` = `Pacientes`
- `PR` = `Procedimentos_Realizados`

> **Por que SUMPRODUCT nas AGGs?** `Procedimentos_Realizados` só contém dados da transação — sem colunas derivadas. O join com `Pacientes` é feito inline. `SUMPRODUCT` multiplica dois arrays: um booleano (paciente pertence à dimensão?) e os valores.

---

### `AGG_Municipios`

| Coluna | Fórmula (linha 2) |
|---|---|
| A `municipio` | `=REF_Municipios!A2` (uma linha por município) |
| B `qtd_pacientes` | `=COUNTIF(PAC!C:C, A2)` |
| C `valor_total` | `=SUMPRODUCT((IFERROR(VLOOKUP(PR!$B$2:$B$9999,PAC!$A:$C,3,0),"")=A2)*PR!$H$2:$H$9999)` |
| D `percentual_valor` | `=IFERROR(C2/SUM(C$2:C$200)*100, 0)` |

### `AGG_Operadoras`

| Coluna | Fórmula (linha 2) |
|---|---|
| A `operadora` | `=REF_Operadoras!A2` |
| B `qtd_pacientes` | `=COUNTIF(PAC!F:F, A2)` |
| C `valor_total` | `=SUMPRODUCT((IFERROR(VLOOKUP(PR!$B$2:$B$9999,PAC!$A:$F,6,0),"")=A2)*PR!$H$2:$H$9999)` |
| D `percentual_valor` | `=IFERROR(C2/SUM(C$2:C$200)*100, 0)` |

### `AGG_Sexo`

| Coluna | Fórmula (linha 2) |
|---|---|
| A `sexo` | `=REF_Sexo!A1` / `=REF_Sexo!A2` |
| B `qtd_pacientes` | `=COUNTIF(PAC!E:E, A2)` |
| C `percentual_pacientes` | `=IFERROR(B2/SUM(B$2:B$3)*100, 0)` |
| D `valor_total` | `=SUMPRODUCT((IFERROR(VLOOKUP(PR!$B$2:$B$9999,PAC!$A:$E,5,0),"")=A2)*PR!$H$2:$H$9999)` |

### `AGG_Procedimentos`

Sem join — `procedimento` é coluna direta de PR.

| Coluna | Fórmula (linha 2) |
|---|---|
| A `procedimento` | `=REF_Procedimentos!A2` |
| B `qtd_realizacoes` | `=SUMIF(PR!C:C, A2, PR!F:F)` |
| C `valor_total` | `=SUMIF(PR!C:C, A2, PR!H:H)` |
| D `valor_medio_unit` | `=IFERROR(C2/B2, 0)` |
| E `percentual_valor` | `=IFERROR(C2/SUM(C$2:C$200)*100, 0)` |

> Se os valores em `REF_Procedimentos` tiverem espaços à direita, usar `=TRIM(REF_Procedimentos!A2)` na coluna A para garantir correspondência com o que foi digitado em PR.

### `AGG_Faturamento_Mensal`

Sem join — mes/ano são colunas diretas de PR.

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
| A `codigo` | `=REF_Acomodacao!A1` / `=REF_Acomodacao!A2` (`ID` e `AD`) |
| B `qtd_pacientes` | `=COUNTIF(PAC!G:G, A2)` |
| C `valor_total` | `=SUMPRODUCT((IFERROR(VLOOKUP(PR!$B$2:$B$9999,PAC!$A:$G,7,0),"")=A2)*PR!$H$2:$H$9999)` |

### `AGG_Pacote_Horas`

| Coluna | Fórmula (linha 2) |
|---|---|
| A `pacote` | `=REF_Pacote_Horas!A1` (linhas 2–5 para 3h, 6h, 12h, 24h) |
| B `qtd_pacientes_ativos` | `=COUNTIF(PAC!I:I, A2)` |
| C `percentual` | `=IFERROR(B2/SUM(B$2:B$5)*100, 0)` |
| D `valor_total` | `=SUMPRODUCT((IFERROR(VLOOKUP(PR!$B$2:$B$9999,PAC!$A:$I,9,0),"")=A2)*PR!$H$2:$H$9999)` |

---

## Análises Cruzadas

Dimensões **dentro de PR** (procedimento, mes, ano) usam `SUMIFS` simples. Dimensões em **Pacientes** (operadora, município, sexo, pacote) usam `SUMPRODUCT` com VLOOKUP inline.

```
Fisioterapia em Mar/2025 (tudo em PR — SUMIFS simples):
=SUMIFS(PR!H:H, PR!C:C, "Fisioterapia", PR!D:D, "Mar", PR!E:E, 2025)

Fisioterapia para pacientes Femininos (join com Pacientes — SUMPRODUCT):
=SUMPRODUCT(
  (PR!C$2:C$9999="Fisioterapia") *
  (IFERROR(VLOOKUP(PR!$B$2:$B$9999,PAC!$A:$E,5,0),"")="Feminino") *
  PR!H$2:H$9999
)

Total da CAMPERJ em Nova Iguaçu em Jan/2025:
=SUMPRODUCT(
  (IFERROR(VLOOKUP(PR!$B$2:$B$9999,PAC!$A:$F,6,0),"")="CAMPERJ") *
  (IFERROR(VLOOKUP(PR!$B$2:$B$9999,PAC!$A:$C,3,0),"")="Nova Iguaçu") *
  (PR!D$2:D$9999="Jan") *
  (PR!E$2:E$9999=2025) *
  PR!H$2:H$9999
)

Pacientes com status "Internação" no pacote "24h":
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
| `AGG_Pacote_Horas` | Visão Geral | novo componente a criar |

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
2. **Município** deve ser selecionado do dropdown — sempre `REF_Municipios!A:A`.
3. **Valores monetários:** ponto (`.`) decimal. Sem `R$`, sem ponto de milhar.
4. **Meses:** apenas abreviações `Jan`…`Dez`. Nunca numerais.
5. **Coluna `valor_total`** (H em PR) — nunca digitar, é fórmula.
6. **`data_saida` vazia** = paciente ativo. Não preencher com datas futuras.
7. **Não deletar linhas** em abas `AGG_*`.
8. **Espaços em `REF_Procedimentos`** — limpar espaços à direita para garantir consistência nas fórmulas de agregação.

---

## Pendências na Planilha Atual

Itens identificados no JSON exportado que ainda precisam ser configurados:

| Item | Status | Ação necessária |
|---|---|---|
| Dropdown em `Procedimentos_Realizados.procedimento` | ❌ Não configurado | Adicionar validação: `REF_Procedimentos!A1:A` |
| Dropdown em `Procedimentos_Realizados.mes` | ❌ Não configurado | Adicionar validação: lista `Jan,Fev,Mar,Abr,Mai,Jun,Jul,Ago,Set,Out,Nov,Dez` |
| Espaços à direita em `REF_Procedimentos` | ⚠️ Presente | Limpar ou usar `TRIM()` nas fórmulas |
| Fórmulas nas abas `AGG_*` | ❌ Não configurado | Inserir conforme esta documentação |
| Fórmula `valor_total` em `Procedimentos_Realizados!H` | ❌ Não configurado | `=IF(F2="","",F2*G2)` copiada até linha 1000 |

---

## Próximos Passos para Integração Técnica

- [ ] Configurar dropdowns pendentes em `Procedimentos_Realizados` (procedimento e mes)
- [ ] Limpar espaços à direita nos valores de `REF_Procedimentos`
- [ ] Inserir fórmulas nas abas `AGG_*` conforme esta documentação
- [ ] Inserir fórmula `valor_total` em `Procedimentos_Realizados!H2:H1000`
- [ ] Configurar permissão de leitura via **Google Sheets API v4** (Service Account)
- [ ] Criar variável de ambiente `VITE_GOOGLE_SHEETS_ID=1tQHfqn8VSS78iQ7csxwJ6xobT769Umc5-ZDkqLXTjps`
- [ ] Implementar `src/lib/sheets.ts` — lê `AGG_*` e `Pacientes`, mapeia para tipos do frontend
- [ ] Substituir `src/data/mock.ts` por hooks de dados reais
- [ ] Adicionar estados de loading e erro nos componentes
- [ ] Configurar cache/revalidação (ex: a cada 30 min ou botão manual)
- [ ] Criar componente `<PacoteHorasChart />` para `AGG_Pacote_Horas`
