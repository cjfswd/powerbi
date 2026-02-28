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
