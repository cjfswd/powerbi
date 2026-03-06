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

  // Extract query param
  const urlObj = new URL(req.url || '', `http://${req.headers?.host || 'localhost'}`)
  const isVercelLocal = !req.url?.includes('http') && req.query // fallback for varying environments
  const queryOperadora = (isVercelLocal ? req.query?.operadora : urlObj.searchParams.get('operadora')) || 'todas'
  const filterOperadora = queryOperadora === 'todas' ? null : queryOperadora

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
      'Procedimentos_Realizados!A:I', // [8] id, paciente_id, proc, mes, ano, qtd, unit, valor_total, valor_glosado
      'REF_Procedimentos!A:F',         // [9] procedimento, valor, status, data_insercao, data_atualizacao, valores_anteriores
      'AGG_Faixa_Etaria!A:F',         // [10] faixa_etaria, qtd, %, desc, faturado, glosado
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
      rawFaixaEtaria,
    ] = await batchGet(spreadsheetId, apiKey, RANGES)

    // --- AGG_Faturamento_Mensal → { mes, valor } ----------------------------
    const fatRows = dataRows(rawFaturamento).filter(r => r[0] && r[1])
    const multiYear = new Set(fatRows.map(r => str(r[0]))).size > 1

    let faturamentoMensal = fatRows
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
    let distribuicaoMunicipio = dataRows(rawMunicipios)
      .filter(r => r[0])
      .map(r => ({ municipio: str(r[0]), valor: num(r[2]) }))
      .sort((a, b) => b.valor - a.valor)

    // --- AGG_Operadoras → { operadora, valor } --------------------------------
    let valorOperadora = dataRows(rawOperadoras)
      .filter(r => r[0])
      .map(r => ({ operadora: str(r[0]), valor: num(r[2]) }))
      .sort((a, b) => b.valor - a.valor)

    // --- AGG_Procedimentos → { procedimento, valor } -------------------------
    let tipoProcedimento = dataRows(rawProcedimentos)
      .filter(r => r[0])
      .map(r => ({ procedimento: str(r[0]), valor: num(r[2]) }))
      .sort((a, b) => b.valor - a.valor)

    // --- AGG_Sexo → { sexo, percentual, cor } ---------------------------------
    let perfilSexo = dataRows(rawSexo)
      .filter(r => r[0])
      .map(r => ({
        sexo: str(r[0]),
        percentual: num(r[2]),
        cor: SEXO_CORES[str(r[0])] ?? '#6366f1',
      }))

    // --- AGG_Acomodacao → { tipo, label, valor, cor } -------------------------
    let tipoAcomodacao = dataRows(rawAcomodacao)
      .filter(r => r[0])
      .map(r => {
        const tipo = str(r[0])
        const meta = ACOMODACAO_META[tipo] ?? { label: tipo, cor: '#6366f1' }
        return { tipo, label: meta.label, valor: num(r[2]), cor: meta.cor }
      })

    // --- AGG_Pacote_Horas → distribuicaoAssistencia { tipo, valor, cor } -----
    // Maps the care-package breakdown (3h/6h/12h/24h) to the "Tipo de Assistência" chart
    let distribuicaoAssistencia = dataRows(rawPacoteHoras)
      .filter(r => r[0])
      .map(r => ({
        tipo: str(r[0]),
        valor: num(r[3]), // valor_total is column D (index 3)
        cor: PACOTE_CORES[str(r[0])] ?? '#6366f1',
      }))

    // --- AGG_Faixa_Etaria → { faixa, descricao, qtd, percentual, valorFaturado, valorGlosado }
    let faixaEtaria = dataRows(rawFaixaEtaria)
      .filter(r => r[0] && str(r[0]).toLowerCase() !== 'total_ativos')
      .map(r => ({
        faixa: str(r[0]),
        qtd: num(r[1]),
        percentual: num(str(r[2]).replace('%', '')),
        descricao: str(r[3]),
        valorFaturado: num(r[4]),
        valorGlosado: num(r[5]),
      }))

    // ------------------------------------------------------------------------
    // Filter Raw Data based on `filterOperadora`
    // ------------------------------------------------------------------------

    // Original Pacientes: [0] id, [1] nome, [2] municipio, [3] nasc, [4] sexo, [5] oper, [6] acom, [7] status, [8] pacote, [9] entrada, [10] saida
    let pacientesBase = dataRows(rawPacientes).filter(r => r[0] && str(r[1]))
    if (filterOperadora) {
      pacientesBase = pacientesBase.filter(r => str(r[5]) === filterOperadora)
    }

    const validPatientIds = new Set(pacientesBase.map(r => num(r[0])))

    // Original PR: [0] id, [1] paciente_id, [2] proc, [3] mes, [4] ano, [5] qtd, [6] unit, [7] valor_total, [8] valor_glosado
    let prBase = dataRows(rawPR).filter(r => r[0])
    if (filterOperadora) {
      prBase = prBase.filter(r => validPatientIds.has(num(r[1])))
    }

    // --- Procedimentos_Realizados → custo por paciente -----------------------
    // Sum valor_total (col H, index 7) and valor_glosado (col I, index 8) grouped by paciente_id (col B, index 1)
    const custoPorPaciente: Record<number, number> = {}
    const glosaPorPaciente: Record<number, number> = {}
    prBase.forEach(r => {
      const pid = num(r[1])
      const valor = num(r[7])
      const glosa = num(r[8])
      if (pid > 0) {
        custoPorPaciente[pid] = (custoPorPaciente[pid] ?? 0) + valor
        glosaPorPaciente[pid] = (glosaPorPaciente[pid] ?? 0) + glosa
      }
    })

    // --- Pacientes → patient list ---------------------------------------------
    const pacientes = pacientesBase
      .map(r => ({
        id: num(r[0]),
        nome: str(r[1]),
        municipio: str(r[2]),
        status: str(r[7]),
        custo: custoPorPaciente[num(r[0])] ?? 0,
        operadora: str(r[5]),
        acomodacao: str(r[6]),
      }))

    // --- REF_Procedimentos → reference pricing list (6-col standardized schema) ----
    // Schema: procedimento | valor | status | data_insercao | data_atualizacao | valores_anteriores
    const refProcedimentos = dataRows(rawRefProcedimentos)
      .filter(r => r[0])
      .map(r => ({
        procedimento: str(r[0]),
        valor: num(r[1]),
        ativo: str(r[2]).toLowerCase() !== 'inativo',
        status: str(r[2]) || 'Ativo',
        dataInsercao: str(r[3]),
        dataAtualizacao: str(r[4]),
        valoresAnteriores: str(r[5]),
      }))

    // --- KPIs (derived from AGG data or dynamic if filtered) ------------------
    let valorTotalPago = 0
    let mediaMensalPaga = 0
    let pacientesDistintos = pacientes.length
    let custoMedioPaciente = 0

    if (filterOperadora) {
      // DYNAMIC RECOMPUTATION 
      // 1. Faturamento Mensal
      const mesMap = new Map<string, number>()
      let totalVal = 0
      prBase.forEach(r => {
        const mes = str(r[3])
        const ano = num(r[4])
        const val = num(r[7])
        if (!mes || !ano) return
        const key = multiYear ? `${mes}/${String(ano).slice(2)}` : mes
        mesMap.set(key, (mesMap.get(key) || 0) + val)
        totalVal += val
      })

      faturamentoMensal = Array.from(mesMap.entries()).map(([mes, valor]) => ({ mes, valor }))
      // sort logic omitted for brevity as PRs might already be sorted or dashboard handles it loosely
      if (faturamentoMensal.length > 0 && !multiYear) {
        faturamentoMensal.sort((a, b) => MONTHS_ORDER.indexOf(a.mes) - MONTHS_ORDER.indexOf(b.mes))
      } else {
        // Basic sort for mm/yy
        faturamentoMensal.sort((a, b) => {
          const [ma, ya] = a.mes.split('/')
          const [mb, yb] = b.mes.split('/')
          if (ya !== yb) return num(ya) - num(yb)
          return MONTHS_ORDER.indexOf(ma) - MONTHS_ORDER.indexOf(mb)
        })
      }

      // 2. Municipios
      const munMap = new Map<string, number>()
      pacientes.forEach(p => munMap.set(p.municipio, (munMap.get(p.municipio) || 0) + p.custo))
      distribuicaoMunicipio = Array.from(munMap.entries())
        .map(([municipio, valor]) => ({ municipio, valor }))
        .sort((a, b) => b.valor - a.valor)

      // 3. Operadora
      valorOperadora = [{ operadora: filterOperadora, valor: totalVal }]

      // 4. Procedimentos
      const procMap = new Map<string, number>()
      prBase.forEach(r => {
        const proc = str(r[2])
        procMap.set(proc, (procMap.get(proc) || 0) + num(r[7]))
      })
      tipoProcedimento = Array.from(procMap.entries())
        .map(([procedimento, valor]) => ({ procedimento, valor }))
        .sort((a, b) => b.valor - a.valor)

      // 5. Sexo
      const sexoQtd = { Masculino: 0, Feminino: 0 }
      pacientesBase.forEach(r => {
        const s = str(r[4])
        if (s === 'Masculino') sexoQtd.Masculino++
        if (s === 'Feminino') sexoQtd.Feminino++
      })
      const totalSexo = sexoQtd.Masculino + sexoQtd.Feminino
      perfilSexo = []
      if (totalSexo > 0) {
        if (sexoQtd.Masculino > 0) perfilSexo.push({ sexo: 'Masculino', percentual: (sexoQtd.Masculino / totalSexo) * 100, cor: SEXO_CORES['Masculino'] })
        if (sexoQtd.Feminino > 0) perfilSexo.push({ sexo: 'Feminino', percentual: (sexoQtd.Feminino / totalSexo) * 100, cor: SEXO_CORES['Feminino'] })
      }

      // 6. Acomodação
      const acomMap = new Map<string, number>()
      pacientesBase.forEach(r => {
        const id = num(r[0])
        const ac = str(r[6])
        acomMap.set(ac, (acomMap.get(ac) || 0) + (custoPorPaciente[id] || 0))
      })
      tipoAcomodacao = Array.from(acomMap.entries()).map(([tipo, valor]) => {
        const meta = ACOMODACAO_META[tipo] ?? { label: tipo, cor: '#6366f1' }
        return { tipo, label: meta.label, valor, cor: meta.cor }
      })

      // 7. Assistencia (Pacote)
      const pacoteMap = new Map<string, number>()
      pacientesBase.forEach(r => {
        const id = num(r[0])
        const pac = str(r[8])
        pacoteMap.set(pac, (pacoteMap.get(pac) || 0) + (custoPorPaciente[id] || 0))
      })
      distribuicaoAssistencia = Array.from(pacoteMap.entries()).map(([tipo, valor]) => ({
        tipo, valor, cor: PACOTE_CORES[tipo] ?? '#6366f1'
      }))

      // 8. Faixa Etaria (Approximate based on raw records)
      // Since we don't calculate age accurately here to match Google Sheets exactly, 
      // we'll filter the AGG_Faixa_Etaria values by computing proportions or keep it simpler.
      // For accurate dynamic Faixa Etaria, we need birthdate logic. Let's do a simple mapping:
      function getFaixa(nascStr: string): string {
        if (!nascStr) return 'S/I'
        const parts = nascStr.split('/')
        if (parts.length < 3) return 'S/I'
        const year = num(parts[parts.length - 1])
        if (year === 0) return 'S/I'
        const age = new Date().getFullYear() - (year > 100 ? year : year + 1900) // loose estimation
        if (age < 12) return '0-11'
        if (age < 18) return '12-17'
        if (age < 30) return '18-29'
        if (age < 60) return '30-59'
        if (age < 80) return '60-79'
        return '80+'
      }

      const faixaMap = new Map<string, { qtd: number, valorFaturado: number }>()
      pacientesBase.forEach(r => {
        const id = num(r[0])
        const nasc = str(r[3])
        const f = getFaixa(nasc)
        const curr = faixaMap.get(f) || { qtd: 0, valorFaturado: 0 }
        curr.qtd++
        curr.valorFaturado += (custoPorPaciente[id] || 0)
        faixaMap.set(f, curr)
      })

      const descMap: Record<string, string> = {
        '0-11': 'Criança', '12-17': 'Adolescente', '18-29': 'Jovem Adulto',
        '30-59': 'Adulto', '60-79': 'Idoso', '80+': 'Idoso em Idade Avançada', 'S/I': 'Sem Informação'
      }

      faixaEtaria = Array.from(faixaMap.entries()).map(([faixa, data]) => ({
        faixa,
        descricao: descMap[faixa] || '',
        qtd: data.qtd,
        percentual: totalVal > 0 ? (data.valorFaturado / totalVal) * 100 : 0,
        valorFaturado: data.valorFaturado,
        valorGlosado: 0 // Cannot easily map glosado dynamic here without more logic
      }))

      valorTotalPago = totalVal
    } else {
      valorTotalPago = valorOperadora.reduce((s, p) => s + p.valor, 0)
    }

    mediaMensalPaga = faturamentoMensal.length > 0
      ? valorTotalPago / faturamentoMensal.length
      : 0
    custoMedioPaciente = pacientesDistintos > 0
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
      faixaEtaria,
    }

    res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=60');
    return res.status(200).json(data);
  } catch (error: any) {
    console.error('API Error:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
