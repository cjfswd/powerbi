// Google Sheets API v4 - read-only client
// Uses batchGet to fetch all ranges in a single HTTP request.
// Authentication: API Key (sheet must have "Anyone with link can view").

const MONTHS_ORDER = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

const SEXO_CORES: Record<string, string> = {
  Masculino: '#2563eb',
  Feminino: '#db2777',
}

const ACOMODACAO_META: Record<string, { label: string; cor: string }> = {
  ID: { label: 'Internacao Domiciliar', cor: '#2563eb' },
  AD: { label: 'Atendimento Domiciliar', cor: '#7c3aed' },
}

const PACOTE_CORES: Record<string, string> = {
  '3h': '#ea580c',
  '6h': '#0891b2',
  '12h': '#db2777',
  '24h': '#2563eb',
}

function num(v: unknown): number {
  const n = Number(v)
  return isNaN(n) ? 0 : n
}

function str(v: unknown): string {
  return v == null ? '' : String(v).trim()
}

function dataRows(rows: unknown[][]): unknown[][] {
  return rows ? rows.slice(1) : []
}

type PRColumns = {
  id: number
  patientId: number
  procedure: number
  month: number
  year: number
  quantity: number
  costUnit: number
  saleUnit: number
  costTotal: number
  saleTotal: number
  glosa: number
}

const DEFAULT_PR_COLUMNS: PRColumns = {
  id: 0,
  patientId: 1,
  procedure: 2,
  month: 3,
  year: 4,
  quantity: 5,
  costUnit: 6,
  saleUnit: 7,
  costTotal: 8,
  saleTotal: 9,
  glosa: 10,
}

function normalizeHeader(value: unknown): string {
  return str(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '')
    .toLowerCase()
}

function resolvePRColumns(rows: unknown[][]): PRColumns {
  const header = rows?.[0]
  if (!header || !Array.isArray(header)) {
    return DEFAULT_PR_COLUMNS
  }

  const normalizedHeader = header.map(normalizeHeader)
  const pick = (aliases: string[], fallback: number) => {
    const index = normalizedHeader.findIndex((value) => aliases.includes(value))
    return index >= 0 ? index : fallback
  }

  return {
    id: pick(['id'], DEFAULT_PR_COLUMNS.id),
    patientId: pick(['pacienteid', 'patientid', 'paciente'], DEFAULT_PR_COLUMNS.patientId),
    procedure: pick(['procedimento', 'procedure', 'proc'], DEFAULT_PR_COLUMNS.procedure),
    month: pick(['mes', 'month'], DEFAULT_PR_COLUMNS.month),
    year: pick(['ano', 'year'], DEFAULT_PR_COLUMNS.year),
    quantity: pick(['quantidade', 'qtd', 'quantity'], DEFAULT_PR_COLUMNS.quantity),
    costUnit: pick(['custounitario', 'custounit', 'costunit'], DEFAULT_PR_COLUMNS.costUnit),
    saleUnit: pick(['vendaunitaria', 'vendaunit', 'saleunit'], DEFAULT_PR_COLUMNS.saleUnit),
    costTotal: pick(['custototal', 'costtotal'], DEFAULT_PR_COLUMNS.costTotal),
    saleTotal: pick(['vendatotal', 'valortotal', 'saletotal'], DEFAULT_PR_COLUMNS.saleTotal),
    glosa: pick(['valorglosado', 'glosa'], DEFAULT_PR_COLUMNS.glosa),
  }
}

function getPRMetrics(row: unknown[], columns: PRColumns) {
  const vendaTotal = num(row[columns.saleTotal])
  const vendaUnit = num(row[columns.saleUnit])
  const custoTotal = num(row[columns.costTotal])
  const glosaTotal = num(row[columns.glosa])

  const venda = vendaTotal || vendaUnit
  const custo = custoTotal || venda * 0.6
  const glosa = glosaTotal

  return { venda, custo, glosa }
}

function monthMatchesFilter(rawMonth: string, filterMes: string): boolean {
  if (filterMes === 'todos') return true

  const monthValue = str(rawMonth)
  if (!monthValue) return false

  if (monthValue === filterMes) return true
  if (monthValue.startsWith(`${filterMes}/`)) return true
  if (monthValue.includes(filterMes)) return true

  const maybeMonthNumber = num(monthValue.split('/')[0])
  if (maybeMonthNumber >= 1 && maybeMonthNumber <= 12) {
    const monthAbbrev = MONTHS_ORDER[maybeMonthNumber - 1]
    return monthAbbrev === filterMes
  }

  return false
}

function parseRefProcedimentos(rows: unknown[][]) {
  return dataRows(rows)
    .filter((row) => str(row[0]) !== '')
    .map((row) => {
      const status = str(row[3]).toLowerCase()
      return {
        procedimento: str(row[0]),
        precoCusto: num(row[1]),
        precoVenda: num(row[2]),
        ativo: status !== 'inativo',
        dataCriacao: str(row[4]),
      }
    })
}

async function batchGet(
  spreadsheetId: string,
  apiKey: string,
  ranges: string[]
): Promise<unknown[][][]> {
  const params = new URLSearchParams()
  params.set('valueRenderOption', 'UNFORMATTED_VALUE')
  params.set('key', apiKey)
  ranges.forEach((range) => params.append('ranges', range))

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchGet?${params.toString()}`

  const res = await fetch(url)
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`Google Sheets API ${res.status}: ${body}`)
  }

  const json = (await res.json()) as { valueRanges: Array<{ values?: unknown[][] }> }
  return json.valueRanges.map((vr) => vr.values ?? [])
}

export default async function handler(req: any, res: any) {
  const spreadsheetId = process.env.GOOGLE_SHEETS_ID
  const apiKey = process.env.GOOGLE_SHEETS_API_KEY

  if (!spreadsheetId || !apiKey) {
    return res.status(500).json({ error: 'Missing environment variables' })
  }

  const urlObj = new URL(req.url || '', `http://${req.headers?.host || 'localhost'}`)
  const isVercelLocal = !req.url?.includes('http') && req.query

  const queryOperadora = (isVercelLocal ? req.query?.operadora : urlObj.searchParams.get('operadora')) || 'todas'
  const filterOperadora = queryOperadora === 'todas' ? null : queryOperadora
  const filterAno = num((isVercelLocal ? req.query?.ano : urlObj.searchParams.get('ano')) || 'todos') || null
  const filterMes = (isVercelLocal ? req.query?.mes : urlObj.searchParams.get('mes')) || 'todos'
  const bustCacheKey = isVercelLocal ? req.query?._t : urlObj.searchParams.get('_t')

  try {
    const ranges = [
      'AGG_Faturamento_Mensal!A:D',
      'AGG_Municipios!A:D',
      'AGG_Operadoras!A:D',
      'AGG_Procedimentos!A:E',
      'AGG_Sexo!A:D',
      'AGG_Acomodacao!A:C',
      'AGG_Pacote_Horas!A:D',
      'Pacientes!A:K',
      'Procedimentos_Realizados!A:K',
      'REF_Procedimentos!A:G',
      'AGG_Faixa_Etaria!A:F',
    ]

    const valueRanges = await batchGet(spreadsheetId, apiKey, ranges)
    const [
      _rawFaturamento,
      _rawMunicipios,
      rawOperadoras,
      _rawProcedimentos,
      _rawSexo,
      _rawAcomodacao,
      _rawPacoteHoras,
      rawPacientes,
      rawPR,
      rawRefProcedimentos,
      _rawFaixaEtaria,
    ] = valueRanges

    const prColumns = resolvePRColumns(rawPR)

    // Keep rows with patient + procedure even if the sheet id is still empty/formula-driven.
    let prBase = dataRows(rawPR).filter(
      (row) => num(row[prColumns.patientId]) > 0 && str(row[prColumns.procedure]) !== ''
    )

    let patientsRaw = dataRows(rawPacientes).filter((row) => row[0] && str(row[1]) !== '')
    if (filterOperadora) {
      patientsRaw = patientsRaw.filter((row) => str(row[5]) === filterOperadora)
    }

    const validPatientIds = new Set(patientsRaw.map((row) => num(row[0])))

    if (filterOperadora) {
      prBase = prBase.filter((row) => validPatientIds.has(num(row[prColumns.patientId])))
    }

    if (filterAno) {
      prBase = prBase.filter((row) => num(row[prColumns.year]) === filterAno)
    }

    if (filterMes !== 'todos') {
      prBase = prBase.filter((row) => monthMatchesFilter(str(row[prColumns.month]), filterMes))
    }

    const vendaPorPaciente: Record<number, number> = {}
    const custoPorPaciente: Record<number, number> = {}
    const glosaPorPaciente: Record<number, number> = {}

    let totalVendaCalc = 0
    let totalCustoCalc = 0
    let totalGlosaCalc = 0

    prBase.forEach((row) => {
      const pid = num(row[prColumns.patientId])
      const { venda, custo, glosa } = getPRMetrics(row, prColumns)

      totalVendaCalc += venda
      totalCustoCalc += custo
      totalGlosaCalc += glosa

      if (pid > 0) {
        vendaPorPaciente[pid] = (vendaPorPaciente[pid] ?? 0) + venda
        custoPorPaciente[pid] = (custoPorPaciente[pid] ?? 0) + custo
        glosaPorPaciente[pid] = (glosaPorPaciente[pid] ?? 0) + glosa
      }
    })

    const pacientes = patientsRaw.map((row) => {
      const id = num(row[0])
      return {
        id,
        nome: str(row[1]),
        municipio: str(row[2]),
        status: str(row[7]),
        custo: vendaPorPaciente[id] ?? 0,
        custoReal: custoPorPaciente[id] ?? 0,
        operadora: str(row[5]),
        acomodacao: str(row[6]),
      }
    })

    const mesMap = new Map<string, { valor: number; custo: number }>()
    prBase.forEach((row) => {
      const mesRaw = str(row[prColumns.month])
      const ano = num(row[prColumns.year])
      const { venda, custo } = getPRMetrics(row, prColumns)

      if (!mesRaw || !ano) return

      const mesParts = mesRaw.split('/')
      const mesStr = mesParts.length > 1 ? MONTHS_ORDER[num(mesParts[0]) - 1] || mesRaw : mesRaw
      const key = `${mesStr}/${String(ano).slice(2)}`
      const current = mesMap.get(key) || { valor: 0, custo: 0 }
      current.valor += venda
      current.custo += custo
      mesMap.set(key, current)
    })

    const faturamentoMensal = Array.from(mesMap.entries())
      .map(([mes, values]) => ({ mes, valor: values.valor, custo: values.custo }))
      .sort((a, b) => {
        const [mesA, anoA] = a.mes.split('/')
        const [mesB, anoB] = b.mes.split('/')

        if (anoA !== anoB) return num(anoA) - num(anoB)
        return MONTHS_ORDER.indexOf(mesA) - MONTHS_ORDER.indexOf(mesB)
      })

    const distribuicaoAssistencia = ['3h', '6h', '12h', '24h'].map((tipo) => {
      const pids = patientsRaw.filter((row) => str(row[8]) === tipo).map((row) => num(row[0]))

      const valor = pids.reduce((sum, patientId) => sum + (vendaPorPaciente[patientId] || 0), 0)
      const custo = pids.reduce((sum, patientId) => sum + (custoPorPaciente[patientId] || 0), 0)

      return {
        tipo,
        valor,
        custo,
        cor: PACOTE_CORES[tipo] || '#6366f1',
      }
    })

    const procMap = new Map<string, { valor: number; custo: number }>()
    prBase.forEach((row) => {
      const procedimento = str(row[prColumns.procedure])
      const { venda, custo } = getPRMetrics(row, prColumns)

      const current = procMap.get(procedimento) || { valor: 0, custo: 0 }
      current.valor += venda
      current.custo += custo
      procMap.set(procedimento, current)
    })

    const tipoProcedimento = Array.from(procMap.entries())
      .map(([procedimento, values]) => ({ procedimento, valor: values.valor, custo: values.custo }))
      .sort((a, b) => b.valor - a.valor)

    const munMap = new Map<string, { valor: number; custo: number }>()
    pacientes.forEach((patient) => {
      const current = munMap.get(patient.municipio) || { valor: 0, custo: 0 }
      current.valor += patient.custo
      current.custo += patient.custoReal
      munMap.set(patient.municipio, current)
    })

    const distribuicaoMunicipio = Array.from(munMap.entries())
      .map(([municipio, totals]) => ({ municipio, valor: totals.valor, custo: totals.custo }))
      .sort((a, b) => b.valor - a.valor)

    const sexoQtd = { Masculino: 0, Feminino: 0 }
    patientsRaw.forEach((row) => {
      const sexo = str(row[4])
      if (sexo === 'Masculino') sexoQtd.Masculino += 1
      else if (sexo === 'Feminino') sexoQtd.Feminino += 1
    })

    const totalSexo = sexoQtd.Masculino + sexoQtd.Feminino
    const perfilSexo = [
      { sexo: 'Masculino', percentual: totalSexo > 0 ? (sexoQtd.Masculino / totalSexo) * 100 : 0, cor: SEXO_CORES.Masculino },
      { sexo: 'Feminino', percentual: totalSexo > 0 ? (sexoQtd.Feminino / totalSexo) * 100 : 0, cor: SEXO_CORES.Feminino },
    ]

    const valorOperadora = Array.from(new Set(patientsRaw.map((row) => str(row[5])).filter(Boolean)))
      .map((operadora) => {
        const patientIds = patientsRaw
          .filter((row) => str(row[5]) === operadora)
          .map((row) => num(row[0]))

        const valor = patientIds.reduce((sum, patientId) => sum + (vendaPorPaciente[patientId] || 0), 0)
        const custo = patientIds.reduce((sum, patientId) => sum + (custoPorPaciente[patientId] || 0), 0)

        return { operadora, valor, custo }
      })
      .sort((a, b) => b.valor - a.valor)

    const todasOperadoras = Array.from(new Set(dataRows(rawOperadoras).map((row) => str(row[0])))).filter(Boolean)
    const todosAnosFull = Array.from(new Set(dataRows(rawPR).map((row) => num(row[prColumns.year]))))
      .filter((ano) => ano > 0)
      .sort((a, b) => b - a)

    const pacientesDistintos = new Set(
      prBase.map((row) => num(row[prColumns.patientId])).filter((patientId) => patientId > 0)
    ).size

    const data = {
      kpis: {
        valorTotalPago: totalVendaCalc,
        custoTotal: totalCustoCalc,
        resultadoBruto: totalVendaCalc - totalCustoCalc,
        mediaMensalPaga: faturamentoMensal.length > 0 ? totalVendaCalc / faturamentoMensal.length : 0,
        valorTotalGlosado: totalGlosaCalc,
        mediaMensalGlosado: faturamentoMensal.length > 0 ? totalGlosaCalc / faturamentoMensal.length : 0,
        pacientesDistintos,
        custoMedioPaciente: pacientesDistintos > 0 ? totalCustoCalc / pacientesDistintos : 0,
      },
      faturamentoMensal,
      distribuicaoAssistencia,
      tipoProcedimento,
      distribuicaoMunicipio,
      perfilSexo,
      valorOperadora,
      todasOperadoras,
      tipoAcomodacao: Object.entries(ACOMODACAO_META).map(([tipo, meta]) => {
        const patientIds = patientsRaw
          .filter((row) => str(row[6]) === tipo)
          .map((row) => num(row[0]))

        const valor = patientIds.reduce((sum, patientId) => sum + (vendaPorPaciente[patientId] || 0), 0)
        const custo = patientIds.reduce((sum, patientId) => sum + (custoPorPaciente[patientId] || 0), 0)

        return { tipo, label: meta.label, valor, custo, cor: meta.cor }
      }),
      tipoGuia: { tipo: 'SP/SADT', valor: totalVendaCalc, custo: totalCustoCalc },
      areaPrestador: { area: 'Rio de Janeiro', valor: totalVendaCalc, custo: totalCustoCalc },
      tipoDespesa: { tipo: 'Atendimento Domiciliar', valor: totalVendaCalc, custo: totalCustoCalc },
      pacientes,
      refProcedimentos: parseRefProcedimentos(rawRefProcedimentos),
      faixaEtaria: [
        { faixa: '0-11', descricao: 'Crianca', qtd: 0, percentual: 0, valorFaturado: 0, valorCusto: 0, valorGlosado: 0 },
        { faixa: '12-17', descricao: 'Adolescente', qtd: 0, percentual: 0, valorFaturado: 0, valorCusto: 0, valorGlosado: 0 },
        { faixa: '18-29', descricao: 'Jovem Adulto', qtd: 0, percentual: 0, valorFaturado: 0, valorCusto: 0, valorGlosado: 0 },
        { faixa: '30-59', descricao: 'Adulto', qtd: 0, percentual: 0, valorFaturado: 0, valorCusto: 0, valorGlosado: 0 },
        { faixa: '60-79', descricao: 'Idoso', qtd: 0, percentual: 0, valorFaturado: 0, valorCusto: 0, valorGlosado: 0 },
        { faixa: '80+', descricao: 'Idoso em Idade Avancada', qtd: 0, percentual: 0, valorFaturado: 0, valorCusto: 0, valorGlosado: 0 },
      ],
      todosAnos: todosAnosFull,
      todosMeses: MONTHS_ORDER,
      prBase,
    }

    res.setHeader('Cache-Control', bustCacheKey ? 'no-cache' : 's-maxage=30')
    return res.status(200).json(data)
  } catch (error: any) {
    console.error('API Error:', error)
    return res.status(500).json({ error: error.message || 'Internal Server Error' })
  }
}
