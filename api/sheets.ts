// Google Sheets API v4 — read-only client
// Uses batchGet to fetch all ranges in a single HTTP request.
// Authentication: API Key (sheet must have "Anyone with link can view").

const MONTHS_ORDER = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

// Static metadata that lives in code, not in the spreadsheet
const SEXO_CORES: Record<string, string> = {
  Masculino: '#2563eb',
  Feminino: '#db2777',
}

const ACOMODACAO_META: Record<string, { label: string; cor: string }> = {
  ID: { label: 'Internação Domiciliar', cor: '#2563eb' },
  AD: { label: 'Atendimento Domiciliar', cor: '#7c3aed' },
}

const PACOTE_CORES: Record<string, string> = {
  '3h': '#ea580c',
  '6h': '#0891b2',
  '12h': '#db2777',
  '24h': '#2563eb',
}

// ---------------------------------------------------------------------------
// Low-level helpers
// ---------------------------------------------------------------------------

function num(v: unknown): number {
  const n = Number(v)
  return isNaN(n) ? 0 : n
}

function str(v: unknown): string {
  return v == null ? '' : String(v).trim()
}

// Skip header row (row index 0)
function dataRows(rows: unknown[][]): unknown[][] {
  return rows.slice(1)
}

// ---------------------------------------------------------------------------
// API fetch — single batchGet call for all ranges
// ---------------------------------------------------------------------------

async function batchGet(
  spreadsheetId: string,
  apiKey: string,
  ranges: string[],
): Promise<unknown[][][]> {
  const params = new URLSearchParams({ valueRenderOption: 'UNFORMATTED_VALUE', key: apiKey })
  ranges.forEach(r => params.append('ranges', r))

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchGet?${params}`
  const res = await fetch(url)

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`Google Sheets API ${res.status}: ${body}`)
  }

  const json = (await res.json()) as { valueRanges: Array<{ values?: unknown[][] }> }
  return json.valueRanges.map(vr => vr.values ?? [])
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

export default async function handler(req: any, res: any) {
  const spreadsheetId = process.env.GOOGLE_SHEETS_ID;
  const apiKey = process.env.GOOGLE_SHEETS_API_KEY;

  if (!spreadsheetId || !apiKey) {
    return res.status(500).json({ error: 'Missing GOOGLE_SHEETS_ID or GOOGLE_SHEETS_API_KEY environment variables' });
  }

  try {
    const RANGES = [
      'AGG_Faturamento_Mensal!A:D',   // [0] ano, mes, valor_total, qtd_realizacoes
      'AGG_Municipios!A:D',           // [1] municipio, qtd_pacientes, valor_total, %
      'AGG_Operadoras!A:D',           // [2] operadora, qtd_pacientes, valor_total, %
      'AGG_Procedimentos!A:E',        // [3] procedimento, qtd, valor_total, medio, %
      'AGG_Sexo!A:D',                 // [4] sexo, qtd_pacientes, percentual, valor_total
      'AGG_Acomodacao!A:C',           // [5] codigo, qtd_pacientes, valor_total
      'AGG_Pacote_Horas!A:D',         // [6] pacote, qtd_ativos, percentual, valor_total
      'Pacientes!A:K',                // [7] id, nome, municipio, nasc, sexo, oper, acom, status, pacote, entrada, saida
      'Procedimentos_Realizados!A:H', // [8] id, paciente_id, proc, mes, ano, qtd, unit, valor_total
      'Ref_Procedimentos!A:D',        // [9] procedimento, data_criacao, valor, status_ativo
    ]

    const [
      rawFaturamento,
      rawMunicipios,
      rawOperadoras,
      rawProcedimentos,
      rawSexo,
      rawAcomodacao,
      rawPacoteHoras,
      rawPacientes,
      rawPR,
      rawRefProcedimentos,
    ] = await batchGet(spreadsheetId, apiKey, RANGES)

    // --- AGG_Faturamento_Mensal → { mes, valor } ----------------------------
    const fatRows = dataRows(rawFaturamento).filter(r => r[0] && r[1])
    const multiYear = new Set(fatRows.map(r => str(r[0]))).size > 1

    const faturamentoMensal = fatRows
      .map(r => ({ ano: num(r[0]), mesStr: str(r[1]), valor: num(r[2]) }))
      .sort((a, b) => {
        if (a.ano !== b.ano) return a.ano - b.ano
        return MONTHS_ORDER.indexOf(a.mesStr) - MONTHS_ORDER.indexOf(b.mesStr)
      })
      .map(({ ano, mesStr, valor }) => ({
        mes: multiYear ? `${mesStr}/${String(ano).slice(2)}` : mesStr,
        valor,
      }))

    // --- AGG_Municipios → { municipio, valor } --------------------------------
    const distribuicaoMunicipio = dataRows(rawMunicipios)
      .filter(r => r[0])
      .map(r => ({ municipio: str(r[0]), valor: num(r[2]) }))
      .sort((a, b) => b.valor - a.valor)

    // --- AGG_Operadoras → { operadora, valor } --------------------------------
    const valorOperadora = dataRows(rawOperadoras)
      .filter(r => r[0])
      .map(r => ({ operadora: str(r[0]), valor: num(r[2]) }))
      .sort((a, b) => b.valor - a.valor)

    // --- AGG_Procedimentos → { procedimento, valor } -------------------------
    const tipoProcedimento = dataRows(rawProcedimentos)
      .filter(r => r[0])
      .map(r => ({ procedimento: str(r[0]), valor: num(r[2]) }))
      .sort((a, b) => b.valor - a.valor)

    // --- AGG_Sexo → { sexo, percentual, cor } ---------------------------------
    const perfilSexo = dataRows(rawSexo)
      .filter(r => r[0])
      .map(r => ({
        sexo: str(r[0]),
        percentual: num(r[2]),
        cor: SEXO_CORES[str(r[0])] ?? '#6366f1',
      }))

    // --- AGG_Acomodacao → { tipo, label, valor, cor } -------------------------
    const tipoAcomodacao = dataRows(rawAcomodacao)
      .filter(r => r[0])
      .map(r => {
        const tipo = str(r[0])
        const meta = ACOMODACAO_META[tipo] ?? { label: tipo, cor: '#6366f1' }
        return { tipo, label: meta.label, valor: num(r[2]), cor: meta.cor }
      })

    // --- AGG_Pacote_Horas → distribuicaoAssistencia { tipo, valor, cor } -----
    // Maps the care-package breakdown (3h/6h/12h/24h) to the "Tipo de Assistência" chart
    const distribuicaoAssistencia = dataRows(rawPacoteHoras)
      .filter(r => r[0])
      .map(r => ({
        tipo: str(r[0]),
        valor: num(r[3]), // valor_total is column D (index 3)
        cor: PACOTE_CORES[str(r[0])] ?? '#6366f1',
      }))

    // --- Procedimentos_Realizados → custo por paciente -----------------------
    // Sum valor_total (col H, index 7) grouped by paciente_id (col B, index 1)
    const custoPorPaciente: Record<number, number> = {}
    dataRows(rawPR).forEach(r => {
      const pid = num(r[1])
      const valor = num(r[7])
      if (pid > 0) custoPorPaciente[pid] = (custoPorPaciente[pid] ?? 0) + valor
    })

    // --- Pacientes → patient list ---------------------------------------------
    const pacientes = dataRows(rawPacientes)
      .filter(r => r[0] && str(r[1]))
      .map(r => ({
        id: num(r[0]),
        nome: str(r[1]),
        municipio: str(r[2]),
        status: str(r[7]),
        custo: custoPorPaciente[num(r[0])] ?? 0,
        operadora: str(r[5]),
        acomodacao: str(r[6]),
      }))

    // --- Ref_Procedimentos → historical pricing references --------------------
    // Determine if we should skip the header or not. 
    // If the first row's first cell is exactly "procedimento", we skip it.
    const refProtRaw = (rawRefProcedimentos[0] && str(rawRefProcedimentos[0][0]).toLowerCase() === 'procedimento')
      ? dataRows(rawRefProcedimentos)
      : rawRefProcedimentos

    const refProcedimentos = refProtRaw
      .filter(r => r[0])
      .map(r => ({
        procedimento: str(r[0]),
        dataCriacao: str(r[1]),
        valor: num(r[2]),
        ativo: str(r[3]).toLowerCase() !== 'falso' && str(r[3]).toLowerCase() !== 'inativo' // Defaults to true if empty or anything else
      }))

    // --- KPIs (derived from AGG data) -----------------------------------------
    const valorTotalPago = valorOperadora.reduce((s, p) => s + p.valor, 0)
    const mediaMensalPaga = faturamentoMensal.length > 0
      ? valorTotalPago / faturamentoMensal.length
      : 0
    const pacientesDistintos = pacientes.length
    const custoMedioPaciente = pacientesDistintos > 0
      ? valorTotalPago / pacientesDistintos
      : 0

    const data = {
      kpis: {
        valorTotalPago,
        mediaMensalPaga,
        valorTotalGlosado: 0,
        mediaMensalGlosado: 0,
        pacientesDistintos,
        custoMedioPaciente,
      },
      faturamentoMensal,
      distribuicaoAssistencia,
      tipoProcedimento,
      distribuicaoMunicipio,
      perfilSexo,
      valorOperadora,
      tipoAcomodacao,
      tipoGuia: { tipo: 'SP/SADT', valor: valorTotalPago },
      areaPrestador: { area: 'Rio de Janeiro', valor: valorTotalPago },
      tipoDespesa: { tipo: 'Atendimento Domiciliar', valor: valorTotalPago },
      pacientes,
      refProcedimentos,
    }

    res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=60');
    return res.status(200).json(data);
  } catch (error: any) {
    console.error('API Error:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
