# Guia de Alimentação de Dados — Google Sheets

> Dashboard: **Unimed Nova Iguaçu / Camperj — Faturamento 2025**

---

## Arquitetura em 4 Camadas

```
CAMADA 1 — ENTRADA (dados brutos, preenchidos pelo usuário)
├── Pacientes                 ← cadastro dos pacientes
└── Procedimentos_Realizados  ← lançamentos mensais por paciente (N:N)

CAMADA 2 — LOGS (histórico append-only, nunca editar — só acrescentar)
├── Log_Status_Paciente       ← cada mudança de status clínico
└── Log_Pacote_Horas          ← cada mudança de pacote (3h/6h/12h/24h)

CAMADA 3 — REFERÊNCIA (listas pré-definidas, fonte dos dropdowns)
├── REF_Operadoras
├── REF_Procedimentos
├── REF_Status
├── REF_Sexo
├── REF_Acomodacao
└── REF_PacoteHoras

CAMADA 4 — AGREGAÇÃO (fórmulas automáticas, lidas pelo dashboard)
├── AGG_Municipios
├── AGG_Operadoras
├── AGG_Sexo
├── AGG_Procedimentos
├── AGG_Faturamento_Mensal
├── AGG_Acomodacao
└── AGG_PacoteHoras
```

> **Regra fundamental:** as abas `AGG_*` são 100% fórmulas. As abas `Log_*` são append-only — jamais edite ou delete uma linha existente.

---

## Diagrama de Relacionamento

```
REF_Operadoras ─────────────────────────────────────────┐
REF_Status ─────────────────────────────────────────┐   │
REF_Sexo ───────────────────────────────────────┐   │   │
REF_Acomodacao ──────────────────────────────┐  │   │   │
REF_PacoteHoras ──────────────────────────┐  │  │   │   │
                                          ▼  ▼  ▼   ▼   ▼
                                   ┌──────────────────────────┐
                                   │         Pacientes         │
                                   │  id (PK)                  │
                                   │  nome                     │
                                   │  municipio (texto livre)  │
                                   │  data_nascimento          │
                                   │  sexo ▼ dropdown          │
                                   │  operadora ▼ dropdown     │
                                   │  acomodacao ▼ dropdown    │
                                   │  data_entrada             │
                                   │  data_saida               │
                                   │  ── campos fórmula ──     │
                                   │  status_atual    ←──────────── Log_Status_Paciente
                                   │  pacote_horas_atual ←───────── Log_Pacote_Horas
                                   └───────────┬──────────────┘
                                               │ 1
                                          ┌────┴────┐ N
                          ┌───────────────▼──┐   ┌──▼──────────────────────┐
                          │ Log_Status_       │   │ Log_Pacote_Horas         │
                          │ Paciente          │   │  id (PK)                 │
                          │  id (PK)          │   │  paciente_id (FK)        │
                          │  paciente_id (FK) │   │  data_evento             │
                          │  data_evento      │   │  pacote ▼ dropdown       │
                          │  status ▼ dropdown│   │  observacao              │
                          │  observacao       │   └──────────────────────────┘
                          └───────────────────┘
                                               │ 1
                                               │ N
                          ┌────────────────────▼─────────────────────────────┐
                          │            Procedimentos_Realizados               │
                          │  id (PK)                                          │
                          │  paciente_id (FK)                                 │
                          │  procedimento ▼ dropdown                          │
                          │  mes ▼ dropdown                                   │
                          │  ano                                              │
                          │  quantidade                                       │
                          │  valor_unitario                                   │
                          │  valor_total [fórmula = quantidade * unit]        │
                          │  ── campos auto via VLOOKUP ──                    │
                          │  operadora_auto    ← Pacientes                    │
                          │  municipio_auto    ← Pacientes                    │
                          │  sexo_auto         ← Pacientes                    │
                          │  acomodacao_auto   ← Pacientes                    │
                          │  pacote_auto       ← Pacientes.pacote_horas_atual │
                          └───────────────────────┬──────────────────────────┘
                                                  │ SUMIFS / COUNTIFS / SUMIF
                          ┌───────────────────────▼──────────────────────────┐
                          │                   AGG_* (fórmulas)                │
                          └──────────────────────────────────────────────────┘
```

---

## Camada 1 — Abas de Entrada

### `Pacientes`

Cadastro mestre. **Uma linha por paciente.** Campos com `▼` usam dropdown. Campos marcados como `[fórmula]` nunca são digitados manualmente.

| Coluna | Tipo | Entrada | Descrição |
|---|---|---|---|
| `id` | Inteiro | Manual | Identificador único, sequencial (1, 2, 3…) |
| `nome` | Texto | Manual | Nome completo do paciente |
| `municipio` | Texto | **Livre** | Município — o usuário digita (ver nota abaixo) |
| `data_nascimento` | Data | Manual | Formato `DD/MM/AAAA` |
| `sexo` | Texto | **Dropdown** | Fonte: `REF_Sexo` |
| `operadora` | Texto | **Dropdown** | Fonte: `REF_Operadoras` |
| `acomodacao` | Texto | **Dropdown** | Fonte: `REF_Acomodacao` (`ID` ou `AD`) |
| `data_entrada` | Data | Manual | Data de início do atendimento |
| `data_saida` | Data | Opcional | Vazio = paciente ativo |
| `status_atual` | Texto | **[fórmula]** | Último status do `Log_Status_Paciente` |
| `pacote_horas_atual` | Texto | **[fórmula]** | Último pacote do `Log_Pacote_Horas` |

> **Município é campo livre** — a lista é extensa e variável. Mantenha grafia consistente em todos os cadastros (ex: sempre "Nova Iguaçu", nunca "N. Iguaçu"). O dashboard agrupa pelos valores digitados.

**Fórmulas das colunas derivadas (copiar para toda a coluna):**

```
status_atual (coluna K, linha 2):
=IFERROR(
  VLOOKUP(
    MAXIFS(Log_Status_Paciente!$C:$C, Log_Status_Paciente!$B:$B, A2),
    FILTER(Log_Status_Paciente!$C:$D, Log_Status_Paciente!$B:$B=A2),
    2, 0
  ),
  "Sem registro"
)

pacote_horas_atual (coluna L, linha 2):
=IFERROR(
  VLOOKUP(
    MAXIFS(Log_Pacote_Horas!$C:$C, Log_Pacote_Horas!$B:$B, A2),
    FILTER(Log_Pacote_Horas!$C:$D, Log_Pacote_Horas!$B:$B=A2),
    2, 0
  ),
  "Não definido"
)
```

Como funcionam: `MAXIFS` encontra a **data mais recente** do paciente nos logs. `FILTER` isola apenas as linhas daquele paciente. `VLOOKUP` retorna o valor registrado naquela data. O resultado sempre reflete o estado atual sem editar o cadastro.

**Exemplo:**
```
id | nome         | municipio    | nasc       | sexo      | operadora          | acomod | entrada    | saida | status_atual | pacote_atual
1  | João Silva   | Nova Iguaçu  | 12/03/1948 | Masculino | Unimed Nova Iguaçu | ID     | 01/01/2025 |       | Internação   | 24h
2  | Maria Santos | Rio de Janeiro| 05/07/1962| Feminino  | Camperj            | AD     | 15/01/2025 | ...   | Alta         | 12h
```

---

### `Procedimentos_Realizados`

Tabela de relacionamento paciente ↔ procedimento. **Um lançamento por procedimento por mês por paciente.** Fonte financeira do dashboard.

**Colunas de entrada (preenchidas pelo usuário):**

| Coluna | Tipo | Entrada | Descrição |
|---|---|---|---|
| `id` | Inteiro | Manual | Identificador único do lançamento |
| `paciente_id` | Inteiro | Manual | FK → `Pacientes.id` |
| `procedimento` | Texto | **Dropdown** | Fonte: `REF_Procedimentos` |
| `mes` | Texto | **Dropdown** | `Jan` … `Dez` |
| `ano` | Inteiro | Manual | Ex: `2025` |
| `quantidade` | Inteiro | Manual | Nº de execuções do procedimento no mês |
| `valor_unitario` | Decimal | Manual | Valor de uma execução (R$) |

**Colunas calculadas por fórmula (não editar):**

| Coluna | Fórmula | Descrição |
|---|---|---|
| `valor_total` | `=G2*H2` | `quantidade * valor_unitario` |
| `operadora_auto` | `=IFERROR(VLOOKUP(B2, Pacientes!$A:$G, 6, 0), "")` | Operadora do paciente |
| `municipio_auto` | `=IFERROR(VLOOKUP(B2, Pacientes!$A:$C, 3, 0), "")` | Município do paciente |
| `sexo_auto` | `=IFERROR(VLOOKUP(B2, Pacientes!$A:$E, 5, 0), "")` | Sexo do paciente |
| `acomodacao_auto` | `=IFERROR(VLOOKUP(B2, Pacientes!$A:$G, 7, 0), "")` | Acomodação do paciente |
| `pacote_auto` | `=IFERROR(VLOOKUP(B2, Pacientes!$A:$L, 12, 0), "")` | Pacote de horas vigente |

> Os índices do VLOOKUP (6, 3, 5…) dependem da ordem final das colunas em `Pacientes`. Ajuste conforme o layout real da planilha.

**Exemplo:**
```
id | pac_id | procedimento      | mes | ano  | qtd | unit      | total     | operadora_auto      | municipio_auto | sexo_auto | acomod | pacote
1  | 1      | Pacote Internação | Jan | 2025 | 1   | 40000.00  | 40000.00  | Unimed Nova Iguaçu  | Nova Iguaçu    | Masculino | ID     | 24h
2  | 1      | Fisioterapia      | Jan | 2025 | 8   | 400.00    | 3200.00   | Unimed Nova Iguaçu  | Nova Iguaçu    | Masculino | ID     | 24h
3  | 1      | Fisioterapia      | Fev | 2025 | 6   | 400.00    | 2400.00   | Unimed Nova Iguaçu  | Nova Iguaçu    | Masculino | ID     | 24h
4  | 2      | Consulta Médica   | Jan | 2025 | 2   | 350.00    | 700.00    | Camperj             | Rio de Janeiro | Feminino  | AD     | 12h
```

---

## Camada 2 — Logs de Eventos

Tabelas append-only. Cada linha registra um evento. **Nunca edite ou delete linhas existentes.** Para corrigir um erro, adicione uma nova linha com o valor correto e uma observação.

### `Log_Status_Paciente`

Toda mudança de status clínico gera uma nova linha. A coluna `status_atual` em `Pacientes` sempre reflete a linha com a data mais recente.

| Coluna | Tipo | Entrada | Descrição |
|---|---|---|---|
| `id` | Inteiro | Manual | Sequencial |
| `paciente_id` | Inteiro | Manual | FK → `Pacientes.id` |
| `data_evento` | Data | Manual | Data da mudança (`DD/MM/AAAA`) |
| `status` | Texto | **Dropdown** | Fonte: `REF_Status` |
| `observacao` | Texto | Opcional | Motivo, CID, nome do profissional etc. |

**Exemplo:**
```
id | pac_id | data_evento | status     | observacao
1  | 1      | 01/01/2025  | Internação | Admissão inicial
2  | 1      | 10/03/2025  | Ouvidoria  | Reclamação familiar — aguardando retorno
3  | 1      | 15/03/2025  | Internação | Caso resolvido, retorno ao protocolo
4  | 2      | 15/01/2025  | Internação | Admissão inicial
5  | 2      | 20/02/2025  | Alta       | Alta hospitalar — critérios atingidos
```

**Como ler:** o status atual do paciente 1 é `Internação` (linha 3, data mais recente). O do paciente 2 é `Alta` (linha 5). O log completo preserva toda a trajetória.

---

### `Log_Pacote_Horas`

Toda mudança de pacote de cuidado (3h → 12h, por exemplo) gera uma nova linha.

| Coluna | Tipo | Entrada | Descrição |
|---|---|---|---|
| `id` | Inteiro | Manual | Sequencial |
| `paciente_id` | Inteiro | Manual | FK → `Pacientes.id` |
| `data_evento` | Data | Manual | Data de início do novo pacote |
| `pacote` | Texto | **Dropdown** | Fonte: `REF_PacoteHoras` (`3h`, `6h`, `12h`, `24h`) |
| `observacao` | Texto | Opcional | Motivo da mudança, médico responsável etc. |

**Exemplo:**
```
id | pac_id | data_evento | pacote | observacao
1  | 1      | 01/01/2025  | 12h    | Pacote inicial de admissão
2  | 1      | 14/02/2025  | 24h    | Piora clínica — necessidade de monitoramento contínuo
3  | 2      | 15/01/2025  | 12h    | Pacote inicial de admissão
```

**Como ler:** o pacote atual do paciente 1 é `24h` (evento mais recente). Toda a progressão está preservada para análise histórica.

---

## Camada 3 — Abas de Referência

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

1. Selecione a coluna de destino (ex: `Log_Status_Paciente!D:D`, sem o cabeçalho)
2. **Dados → Validação de dados → Adicionar regra**
3. Critérios: **Menu suspenso (de um intervalo)**
4. Insira o intervalo da REF correspondente
5. **Rejeitar entrada** para garantir apenas valores da lista

| Campo | Intervalo de origem |
|---|---|
| `Pacientes.sexo` | `REF_Sexo!A2:A3` |
| `Pacientes.operadora` | `REF_Operadoras!B2:B100` |
| `Pacientes.acomodacao` | `REF_Acomodacao!A2:A3` |
| `Log_Status_Paciente.status` | `REF_Status!A2:A10` |
| `Log_Pacote_Horas.pacote` | `REF_PacoteHoras!A2:A5` |
| `Procedimentos_Realizados.procedimento` | `REF_Procedimentos!B2:B100` |
| `Procedimentos_Realizados.mes` | Lista fixa: `Jan,Fev,Mar,Abr,Mai,Jun,Jul,Ago,Set,Out,Nov,Dez` |

---

## Camada 4 — Abas de Agregação (Fórmulas)

Convenções nas fórmulas:
- `PAC` = `Pacientes`
- `PR` = `Procedimentos_Realizados`
- `LS` = `Log_Status_Paciente`
- `LP` = `Log_Pacote_Horas`

---

### `AGG_Municipios`

| Coluna | Fórmula (linha 2) |
|---|---|
| `municipio` | Fixo (digitado uma vez) |
| `qtd_pacientes` | `=COUNTIF(PAC!C:C, A2)` |
| `valor_total` | `=SUMIF(PR!municipio_auto, A2, PR!valor_total)` |
| `percentual_valor` | `=IFERROR(C2/SUM(C$2:C$200)*100, 0)` |

---

### `AGG_Operadoras`

| Coluna | Fórmula (linha 2) |
|---|---|
| `operadora` | `=REF_Operadoras!B2` |
| `qtd_pacientes` | `=COUNTIF(PAC!F:F, A2)` |
| `valor_total` | `=SUMIF(PR!operadora_auto, A2, PR!valor_total)` |
| `percentual_valor` | `=IFERROR(C2/SUM(C$2:C$200)*100, 0)` |

---

### `AGG_Sexo`

| Coluna | Fórmula (linha 2) |
|---|---|
| `sexo` | Fixo (`Masculino` / `Feminino`) |
| `qtd_pacientes` | `=COUNTIF(PAC!E:E, A2)` |
| `percentual_pacientes` | `=IFERROR(B2/SUM(B$2:B$3)*100, 0)` |
| `valor_total` | `=SUMIF(PR!sexo_auto, A2, PR!valor_total)` |

---

### `AGG_Procedimentos`

| Coluna | Fórmula (linha 2) |
|---|---|
| `procedimento` | `=REF_Procedimentos!B2` |
| `qtd_realizacoes` | `=SUMIF(PR!procedimento, A2, PR!quantidade)` |
| `valor_total` | `=SUMIF(PR!procedimento, A2, PR!valor_total)` |
| `valor_medio_unit` | `=IFERROR(C2/B2, 0)` |
| `percentual_valor` | `=IFERROR(C2/SUM(C$2:C$200)*100, 0)` |

> `qtd_realizacoes` soma a quantidade de execuções (ex: 8 sessões de fisioterapia), não apenas o número de linhas. Isso possibilita análise de frequência real de cada procedimento ao longo do tempo.

---

### `AGG_Faturamento_Mensal`

| Coluna | Fórmula (linha 2) |
|---|---|
| `mes` | Fixo (ex: `Jan`) |
| `ano` | Fixo (ex: `2025`) |
| `valor_total` | `=SUMIFS(PR!valor_total, PR!mes, A2, PR!ano, B2)` |
| `qtd_procedimentos` | `=SUMIFS(PR!quantidade, PR!mes, A2, PR!ano, B2)` |
| `qtd_pacientes_ativos` | `=COUNTIFS(PR!mes, A2, PR!ano, B2, PR!paciente_id, ">"&0)` |

---

### `AGG_Acomodacao`

| Coluna | Fórmula (linha 2) |
|---|---|
| `codigo` | Fixo (`ID` / `AD`) |
| `label` | `=VLOOKUP(A2, REF_Acomodacao!A:B, 2, 0)` |
| `qtd_pacientes` | `=COUNTIF(PAC!G:G, A2)` |
| `valor_total` | `=SUMIF(PR!acomodacao_auto, A2, PR!valor_total)` |

---

### `AGG_PacoteHoras`

Distribuição atual dos pacientes por pacote de cuidado. Baseada no estado atual (`pacote_horas_atual` de `Pacientes`), não no histórico.

| Coluna | Fórmula (linha 2) |
|---|---|
| `pacote` | `=REF_PacoteHoras!A2` |
| `qtd_pacientes_ativos` | `=COUNTIF(PAC!L:L, A2)` |
| `percentual` | `=IFERROR(B2/SUM(B$2:B$5)*100, 0)` |
| `valor_total` | `=SUMIF(PR!pacote_auto, A2, PR!valor_total)` |

---

## Análises Cruzadas com SUMIFS

Com os campos `_auto` em `Procedimentos_Realizados`, qualquer combinação de dimensões é direta:

```
Fisioterapia para pacientes Femininos:
=SUMIFS(PR!valor_total, PR!procedimento, "Fisioterapia", PR!sexo_auto, "Feminino")

Camperj em Nova Iguaçu em Jan/2025:
=SUMIFS(PR!valor_total, PR!operadora_auto, "Camperj", PR!municipio_auto, "Nova Iguaçu", PR!mes, "Jan", PR!ano, 2025)

Quantidade de sessões de Fisioterapia por operadora em Mar/2025:
=SUMIFS(PR!quantidade, PR!procedimento, "Fisioterapia", PR!operadora_auto, "Unimed Nova Iguaçu", PR!mes, "Mar")

Evolução do pacote 24h ao longo dos meses (valor faturado):
=SUMIFS(PR!valor_total, PR!pacote_auto, "24h", PR!mes, "Jan", PR!ano, 2025)

Pacientes com status atual "Internação" no pacote "24h":
=COUNTIFS(PAC!status_atual, "Internação", PAC!pacote_horas_atual, "24h")

Histórico de mudanças de pacote de um paciente (contar eventos):
=COUNTIF(LP!B:B, 1)  → nº de vezes que o paciente 1 mudou de pacote
```

---

## KPIs Calculados pelo Dashboard

| KPI | Origem | Cálculo |
|---|---|---|
| **Valor Total Pago** | `AGG_Operadoras` | `SUM(valor_total)` |
| **Média Mensal** | `AGG_Faturamento_Mensal` | `Valor Total / COUNT(meses com lançamento)` |
| **Valor Total Glosado** | Futura coluna `glosa` em `PR` | `SUM(glosa)` |
| **Pacientes Distintos** | `Pacientes` | `COUNTA(id) - 1` |
| **Custo Médio/Paciente** | Calculado | `Valor Total / Pacientes Distintos` |

---

## Mapeamento Aba → Componente do Dashboard

| Aba Google Sheets | Aba no Dashboard | Componente |
|---|---|---|
| `Pacientes` | Analítico | `<AnaliticoPacientes />` |
| `Procedimentos_Realizados` + `Log_Pacote_Horas` | Atendimento Horas | `<AtendimentoHorasChart />` |
| `AGG_Faturamento_Mensal` | Visão Geral | `<FaturamentoMensalChart />` |
| `AGG_Procedimentos` | Procedimentos | `<TipoProcedimentoChart />` + `<ProcedimentoTable />` |
| `AGG_Municipios` | Geográfico | `<MunicipioChart />` |
| `AGG_Operadoras` | Operadoras | `<OperadoraChart />` |
| `AGG_Acomodacao` | Visão Geral | `<AcomodacaoChart />` |
| `AGG_Sexo` | Visão Geral | `<SexoChart />` |
| `AGG_PacoteHoras` | Visão Geral | (novo componente a criar) |

---

## Frequência de Atualização

| Aba | Quem atualiza | Quando |
|---|---|---|
| `Pacientes` | Equipe administrativa | A cada admissão ou alteração de dados cadastrais |
| `Log_Status_Paciente` | Equipe clínica | A cada mudança de status clínico |
| `Log_Pacote_Horas` | Equipe clínica | A cada mudança de pacote de cuidado |
| `Procedimentos_Realizados` | Equipe de faturamento | Ao fechar o faturamento mensal |
| `REF_*` | Administrador | Ao adicionar nova operadora, procedimento etc. |
| `AGG_*` | Automático (fórmulas) | Tempo real — recalculam ao salvar qualquer dado |

---

## Regras de Consistência de Dados

1. **Logs são imutáveis.** `Log_Status_Paciente` e `Log_Pacote_Horas` nunca têm linhas deletadas ou editadas. Para corrigir, adicione nova linha com observação.
2. **`paciente_id`** deve sempre corresponder a um `id` existente em `Pacientes`. Não há FK nativa no Sheets — valide manualmente ou com Apps Script.
3. **Município** deve ter grafia idêntica em todos os cadastros do mesmo local.
4. **Valores monetários:** ponto (`.`) decimal. Sem `R$`, sem ponto de milhar.
5. **Meses:** apenas abreviações `Jan`…`Dez`. Nunca numerais.
6. **`valor_total` em `PR`** é fórmula — nunca digitar diretamente.
7. **`status_atual` e `pacote_horas_atual` em `Pacientes`** são fórmulas — nunca digitar.
8. **Campos `_auto` em `PR`** são fórmulas — nunca digitar.
9. **`data_saida` vazia** = paciente ativo. Não preencher com datas futuras.
10. **Não deletar linhas** em abas `AGG_*`.

---

## Guia de Configuração no Google Sheets (Passo a Passo)

---

### Passo 1 — Criar a planilha e nomear as abas

1. Acesse [sheets.google.com](https://sheets.google.com) e clique em **"+ Em branco"**
2. No topo, renomeie o arquivo para `Dashboard Faturamento 2025`
3. Para cada aba necessária, clique no **`+`** no canto inferior esquerdo e renomeie clicando duplo na aba

**Ordem recomendada de criação:**
```
Pacientes · Procedimentos_Realizados · Log_Status_Paciente · Log_Pacote_Horas
REF_Operadoras · REF_Procedimentos · REF_Status · REF_Sexo · REF_Acomodacao · REF_PacoteHoras
AGG_Municipios · AGG_Operadoras · AGG_Sexo · AGG_Procedimentos · AGG_Faturamento_Mensal · AGG_Acomodacao · AGG_PacoteHoras
```

**Colorir as abas por camada** (clique com botão direito na aba → "Mudar cor"):

| Cor | Abas |
|---|---|
| Azul | `Pacientes`, `Procedimentos_Realizados` |
| Laranja | `Log_Status_Paciente`, `Log_Pacote_Horas` |
| Cinza | `REF_*` |
| Verde | `AGG_*` |

---

### Passo 2 — Preencher as abas de referência (REF_*)

Preencha cada aba de referência com os valores fixos. Elas são a base de todos os dropdowns.

**`REF_Operadoras`** — células A1:B1 como cabeçalho, dados a partir de A2:
```
A          | B
id         | nome
1          | Unimed Nova Iguaçu
2          | Camperj
```

**`REF_Procedimentos`** — A1:C1 cabeçalho:
```
A  | B                      | C
id | nome                   | categoria
1  | Pacote Internação       | Internação
2  | Fisioterapia           | Reabilitação
3  | Terapia c/ Método      | Reabilitação
4  | Consulta Médica        | Assistência
5  | Enfermagem 24h         | Internação
```

**`REF_Status`** — somente coluna A:
```
A
valor
Internação
Alta
Óbito
Ouvidoria
```

**`REF_Sexo`** — somente coluna A:
```
A
valor
Masculino
Feminino
```

**`REF_Acomodacao`** — A1:B1 cabeçalho:
```
A      | B
codigo | label
ID     | Internação Domiciliar
AD     | Atendimento Domiciliar
```

**`REF_PacoteHoras`** — A1:B1 cabeçalho:
```
A     | B
valor | label
3h    | Pacote 3 horas/dia
6h    | Pacote 6 horas/dia
12h   | Pacote 12 horas/dia
24h   | Pacote 24 horas/dia (integral)
```

> **Dica:** selecione as abas `REF_*` e aplique cor de fundo cinza claro no cabeçalho (linha 1) para diferenciar visualmente.

---

### Passo 3 — Configurar a aba `Pacientes`

#### 3.1 Criar o cabeçalho

Na linha 1, preencha as colunas nesta ordem:
```
A   | B    | C         | D                | E    | F         | G          | H          | I           | J         | K            | L
id  | nome | municipio | data_nascimento  | sexo | operadora | acomodacao | data_entrada| data_saida | (vazia)   | status_atual | pacote_horas_atual
```

> Deixe a coluna J vazia (separador visual entre campos manuais e fórmulas).

#### 3.2 Formatar as colunas de data

1. Selecione as colunas D, H e I inteiras
2. **Formatar → Número → Data** → escolha o formato `DD/MM/AAAA`

#### 3.3 Configurar os dropdowns

Para cada campo controlado, selecione a **coluna inteira** (clique na letra da coluna) excluindo o cabeçalho — ou selecione `E2:E9999`:

**Coluna E (sexo):**
1. **Dados → Validação de dados → Adicionar regra**
2. Critérios: **Menu suspenso (de um intervalo)**
3. Intervalo: `REF_Sexo!A2:A3`
4. Em caso de dados inválidos: **Rejeitar entrada**
5. Salvar

**Coluna F (operadora):**
- Mesmo processo → Intervalo: `REF_Operadoras!B2:B100`

**Coluna G (acomodacao):**
- Mesmo processo → Intervalo: `REF_Acomodacao!A2:A3`

#### 3.4 Inserir as fórmulas das colunas derivadas

Na célula **K2**, insira a fórmula do status atual:
```
=IFERROR(
  VLOOKUP(
    MAXIFS(Log_Status_Paciente!$C:$C, Log_Status_Paciente!$B:$B, A2),
    FILTER(Log_Status_Paciente!$C:$D, Log_Status_Paciente!$B:$B=A2),
    2, 0
  ),
  "Sem registro"
)
```

Na célula **L2**, insira a fórmula do pacote atual:
```
=IFERROR(
  VLOOKUP(
    MAXIFS(Log_Pacote_Horas!$C:$C, Log_Pacote_Horas!$B:$B, A2),
    FILTER(Log_Pacote_Horas!$C:$D, Log_Pacote_Horas!$B:$B=A2),
    2, 0
  ),
  "Não definido"
)
```

Para copiar as fórmulas para todas as linhas:
1. Selecione K2 e L2
2. Copie (**Ctrl+C**)
3. Selecione K3:L9999
4. Cole (**Ctrl+V**)

#### 3.5 Congelar o cabeçalho

**Exibir → Congelar → 1 linha** — o cabeçalho ficará fixo ao rolar.

#### 3.6 Proteger as colunas de fórmula (K e L)

1. Selecione as colunas K e L
2. **Dados → Proteger intervalos e planilhas**
3. Clique em **"+ Adicionar uma planilha ou intervalo"**
4. Descrição: `Colunas de fórmula — não editar`
5. Clique em **"Definir permissões"**
6. Selecione **"Mostrar um aviso ao editar este intervalo"** (ou restringir a você mesmo)
7. Salvar

---

### Passo 4 — Configurar a aba `Log_Status_Paciente`

#### 4.1 Criar o cabeçalho

```
A  | B           | C            | D      | E
id | paciente_id | data_evento  | status | observacao
```

#### 4.2 Formatar coluna de data

Selecione a coluna C → **Formatar → Número → Data**

#### 4.3 Configurar dropdown de status

Selecione `D2:D9999` → **Dados → Validação de dados**:
- Intervalo: `REF_Status!A2:A10`
- Dados inválidos: **Rejeitar entrada**

#### 4.4 Proteger linhas existentes automaticamente

Como não é possível proteger linhas dinamicamente de forma nativa, adote a seguinte convenção operacional:
- Toda entrada nos logs é **irreversível** — instrua os usuários com uma nota na célula A1 da aba em cor vermelha: `⚠️ SOMENTE ACRESCENTAR. Nunca editar ou deletar linhas.`

---

### Passo 5 — Configurar a aba `Log_Pacote_Horas`

Estrutura idêntica ao `Log_Status_Paciente`:
```
A  | B           | C            | D      | E
id | paciente_id | data_evento  | pacote | observacao
```

Dropdown da coluna D:
- Intervalo: `REF_PacoteHoras!A2:A5`
- Dados inválidos: **Rejeitar entrada**

---

### Passo 6 — Configurar a aba `Procedimentos_Realizados`

#### 6.1 Criar o cabeçalho

```
A  | B           | C            | D   | E   | F          | G               | H           | I              | J              | K           | L              | M         | N
id | paciente_id | procedimento | mes | ano | quantidade | valor_unitario  | valor_total | operadora_auto | municipio_auto | sexo_auto   | acomodacao_auto| pacote_auto| (reserva)
```

#### 6.2 Formatar colunas monetárias

Selecione G, H e I inteiras → **Formatar → Número → Moeda** (ou **Número** com 2 casas decimais)

#### 6.3 Configurar dropdowns

**Coluna C (procedimento):**
- Intervalo: `REF_Procedimentos!B2:B100`
- Dados inválidos: **Rejeitar entrada**

**Coluna D (mes):**
- Tipo: **Menu suspenso (de uma lista)**
- Itens: `Jan,Fev,Mar,Abr,Mai,Jun,Jul,Ago,Set,Out,Nov,Dez`
- Dados inválidos: **Rejeitar entrada**

#### 6.4 Fórmula do valor_total (coluna H)

Na célula **H2**:
```
=IF(F2="", "", F2*G2)
```
Copie H2 até H9999 (**Ctrl+C** → selecionar H3:H9999 → **Ctrl+V**)

#### 6.5 Fórmulas dos campos _auto (colunas I a M)

> **Importante:** os índices de coluna do VLOOKUP abaixo assumem a ordem definida em `Pacientes` (id=A, nome=B, municipio=C, nasc=D, sexo=E, operadora=F, acomodacao=G). Se a ordem mudar, ajuste os números.

**I2 — operadora_auto:**
```
=IFERROR(VLOOKUP($B2, Pacientes!$A:$F, 6, 0), "")
```

**J2 — municipio_auto:**
```
=IFERROR(VLOOKUP($B2, Pacientes!$A:$C, 3, 0), "")
```

**K2 — sexo_auto:**
```
=IFERROR(VLOOKUP($B2, Pacientes!$A:$E, 5, 0), "")
```

**L2 — acomodacao_auto:**
```
=IFERROR(VLOOKUP($B2, Pacientes!$A:$G, 7, 0), "")
```

**M2 — pacote_auto** (lê o campo de fórmula de `Pacientes`):
```
=IFERROR(VLOOKUP($B2, Pacientes!$A:$L, 12, 0), "")
```

Selecione I2:M2 → copie → selecione I3:M9999 → cole.

#### 6.6 Proteger colunas de fórmula (H a M)

**Dados → Proteger intervalos** → selecione `H:M` → "Mostrar aviso ao editar"

---

### Passo 7 — Configurar as abas AGG_*

> **Dica antes de começar:** ao referenciar outra aba em uma fórmula, o nome da aba com underscore precisa de apóstrofo apenas se contiver espaços — como os nomes aqui não têm espaços, a sintaxe `Pacientes!A:A` funciona diretamente.

#### `AGG_Municipios`

Cabeçalho na linha 1:
```
A          | B              | C           | D
municipio  | qtd_pacientes  | valor_total | percentual_valor
```

Na **linha 2** (e seguintes, uma por município), preencha:
- A2: `Nova Iguaçu` (digitado manualmente uma vez)
- B2: `=COUNTIF(Pacientes!C:C, A2)`
- C2: `=SUMIF(Procedimentos_Realizados!J:J, A2, Procedimentos_Realizados!H:H)`
- D2: `=IFERROR(C2/SUM(C$2:C$200)*100, 0)`

Selecione B2:D2 → copie → cole em B3:D3, B4:D4 etc. para cada município adicional.

#### `AGG_Operadoras`

```
A           | B              | C           | D
operadora   | qtd_pacientes  | valor_total | percentual_valor
```

- A2: `=REF_Operadoras!B2`
- B2: `=COUNTIF(Pacientes!F:F, A2)`
- C2: `=SUMIF(Procedimentos_Realizados!I:I, A2, Procedimentos_Realizados!H:H)`
- D2: `=IFERROR(C2/SUM(C$2:C$200)*100, 0)`

#### `AGG_Sexo`

```
A    | B              | C                    | D
sexo | qtd_pacientes  | percentual_pacientes  | valor_total
```

- A2: `Masculino` / A3: `Feminino`
- B2: `=COUNTIF(Pacientes!E:E, A2)`
- C2: `=IFERROR(B2/SUM(B$2:B$3)*100, 0)`
- D2: `=SUMIF(Procedimentos_Realizados!K:K, A2, Procedimentos_Realizados!H:H)`

#### `AGG_Procedimentos`

```
A             | B                | C           | D                 | E
procedimento  | qtd_realizacoes  | valor_total | valor_medio_unit  | percentual_valor
```

- A2: `=REF_Procedimentos!B2`
- B2: `=SUMIF(Procedimentos_Realizados!C:C, A2, Procedimentos_Realizados!F:F)`
- C2: `=SUMIF(Procedimentos_Realizados!C:C, A2, Procedimentos_Realizados!H:H)`
- D2: `=IFERROR(C2/B2, 0)`
- E2: `=IFERROR(C2/SUM(C$2:C$200)*100, 0)`

#### `AGG_Faturamento_Mensal`

```
A   | B    | C           | D                 | E
mes | ano  | valor_total | qtd_procedimentos | qtd_pacientes_ativos
```

- A2: `Jan` | B2: `2025` (preenchidos manualmente, uma linha por mês)
- C2: `=SUMIFS(Procedimentos_Realizados!H:H, Procedimentos_Realizados!D:D, A2, Procedimentos_Realizados!E:E, B2)`
- D2: `=SUMIFS(Procedimentos_Realizados!F:F, Procedimentos_Realizados!D:D, A2, Procedimentos_Realizados!E:E, B2)`
- E2: `=COUNTIFS(Procedimentos_Realizados!D:D, A2, Procedimentos_Realizados!E:E, B2, Procedimentos_Realizados!B:B, ">"&0)`

#### `AGG_Acomodacao`

```
A       | B                       | C              | D
codigo  | label                   | qtd_pacientes  | valor_total
```

- A2: `ID` / A3: `AD`
- B2: `=VLOOKUP(A2, REF_Acomodacao!A:B, 2, 0)`
- C2: `=COUNTIF(Pacientes!G:G, A2)`
- D2: `=SUMIF(Procedimentos_Realizados!L:L, A2, Procedimentos_Realizados!H:H)`

#### `AGG_PacoteHoras`

```
A       | B                      | C           | D
pacote  | qtd_pacientes_ativos   | percentual  | valor_total
```

- A2: `=REF_PacoteHoras!A2` (para 3h, 6h, 12h, 24h nas linhas 2 a 5)
- B2: `=COUNTIF(Pacientes!L:L, A2)`
- C2: `=IFERROR(B2/SUM(B$2:B$5)*100, 0)`
- D2: `=SUMIF(Procedimentos_Realizados!M:M, A2, Procedimentos_Realizados!H:H)`

---

### Passo 8 — Proteger abas inteiras contra edição acidental

Para as abas `AGG_*` (ninguém deve editar manualmente):

1. Clique com botão direito na aba → **"Proteger planilha"**
2. Clique em **"Definir permissões"**
3. Opção: **"Mostrar um aviso ao editar este intervalo"**
4. Salvar

Para as abas `REF_*`, aplique o mesmo processo para evitar alterações inadvertidas.

---

### Passo 9 — Boas práticas finais

**Congelar cabeçalho em todas as abas de entrada:**
- Abra cada aba → **Exibir → Congelar → 1 linha**

**Destacar cabeçalhos:**
- Selecione a linha 1 → aplique cor de fundo (ex: azul escuro + texto branco) para destacar

**Usar Intervalos Nomeados para fórmulas mais legíveis:**
1. **Dados → Intervalos nomeados**
2. Crie nomes para as colunas mais usadas:

| Nome sugerido | Intervalo |
|---|---|
| `pac_id` | `Pacientes!A2:A9999` |
| `pac_municipio` | `Pacientes!C2:C9999` |
| `pac_sexo` | `Pacientes!E2:E9999` |
| `pac_operadora` | `Pacientes!F2:F9999` |
| `pr_valor` | `Procedimentos_Realizados!H2:H9999` |
| `pr_procedimento` | `Procedimentos_Realizados!C2:C9999` |
| `pr_operadora` | `Procedimentos_Realizados!I2:I9999` |
| `pr_municipio` | `Procedimentos_Realizados!J2:J9999` |

Com intervalos nomeados, as fórmulas ficam mais legíveis:
```
antes: =SUMIF(Procedimentos_Realizados!I:I, A2, Procedimentos_Realizados!H:H)
depois: =SUMIF(pr_operadora, A2, pr_valor)
```

**Compartilhar com permissões corretas:**
1. Botão **"Compartilhar"** no canto superior direito
2. Equipe clínica/faturamento: **"Editor"** (apenas nas abas de entrada)
3. Dashboard (API): conta de serviço com **"Leitor"**

---

## Próximos Passos para Integração Técnica

- [ ] Criar a planilha Google Sheets com todas as abas descritas
- [ ] Configurar Validação de Dados (dropdowns) conforme tabela acima
- [ ] Configurar permissão de leitura via **Google Sheets API v4** (Service Account)
- [ ] Criar variável de ambiente `VITE_GOOGLE_SHEETS_ID`
- [ ] Implementar `src/lib/sheets.ts` — lê `AGG_*`, `Pacientes` e logs, mapeia para tipos do frontend
- [ ] Substituir `src/data/mock.ts` por hooks de dados reais
- [ ] Adicionar estados de loading e erro nos componentes
- [ ] Configurar cache/revalidação (ex: a cada 30 min ou botão manual)
- [ ] Avaliar Apps Script para validação de FK e automação de `id` sequencial
- [ ] Criar componente `<PacoteHorasChart />` para visualizar `AGG_PacoteHoras`
