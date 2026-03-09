import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

function makeRes() {
  const res = {
    statusCode: 200,
    body: null as any,
    headers: {} as Record<string, string>,
    status(code: number) {
      this.statusCode = code
      return this
    },
    json(data: any) {
      this.body = data
      return this
    },
    setHeader(name: string, value: string) {
      this.headers[name] = value
    },
  }
  return res
}

function makeReq(url: string) {
  return {
    url,
    headers: { host: 'localhost' },
  }
}

function buildBatchGetPayload() {
  const pacientes = [
    ['id', 'nome', 'municipio', 'nasc', 'sexo', 'operadora', 'acomodacao', 'status', 'pacote', 'entrada', 'saida'],
    [1, 'Ana', 'Rio de Janeiro', '', 'Feminino', 'Oper1', 'ID', 'Ativo', '24h', '', ''],
    [2, 'Bruno', 'Nova Iguacu', '', 'Masculino', 'Oper2', 'AD', 'Ativo', '12h', '', ''],
  ]

  const procedimentosRealizados = [
    ['id', 'paciente_id', 'procedimento', 'mes', 'ano', 'quantidade', 'custo_unitario', 'venda_unitaria', 'custo_total', 'venda_total', 'valor_glosado'],
    [1, 1, 'Proc A', 'Jan', 2024, 1, 5, 10, 5, 10, 1],
    [2, 1, 'Proc A', 'Jan', 2025, 2, 5, 10, 10, 20, 2],
    [3, 2, 'Proc B', 'Fev', 2025, 1, 10, 20, 10, 20, 0],
  ]

  const refProcedimentos = [
    ['procedimento', 'preco_custo', 'preco_venda', 'status', 'data_insercao', 'data_atualizacao', 'valores_anteriores'],
    ['Proc A', 5, 10, 'Ativo', '2026-01-01', '2026-01-01', ''],
  ]

  const ranges = [
    [['mes', 'valor', 'custo', 'qtd']],
    [['municipio', 'qtd', 'valor', 'pct']],
    [['operadora'], ['Oper1'], ['Oper2']],
    [['procedimento', 'qtd', 'valor', 'media', 'pct']],
    [['sexo', 'qtd', 'pct', 'valor']],
    [['acomodacao', 'qtd', 'valor']],
    [['pacote', 'qtd', 'pct', 'valor']],
    pacientes,
    procedimentosRealizados,
    refProcedimentos,
    [['faixa', 'descricao', 'qtd', 'percentual', 'valor_faturado', 'valor_custo']],
  ]

  return {
    valueRanges: ranges.map((values) => ({ values })),
  }
}

describe('api/sheets handler', () => {
  beforeEach(() => {
    process.env.GOOGLE_SHEETS_ID = 'test-sheet-id'
    process.env.GOOGLE_SHEETS_API_KEY = 'test-api-key'
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('usa venda_total/custo_total e aplica filtro de ano de forma consistente', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => buildBatchGetPayload(),
      })
    )

    const { default: handler } = await import('../../api/sheets.ts')

    const req = makeReq('/api/sheets?ano=2025')
    const res = makeRes()

    await handler(req, res)

    expect(res.statusCode).toBe(200)
    expect(res.body.kpis.valorTotalPago).toBe(40)
    expect(res.body.kpis.custoTotal).toBe(20)
    expect(res.body.kpis.valorTotalGlosado).toBe(2)

    // Se o mapa por paciente ignorasse o filtro de ano, Oper1 ficaria com 30.
    const oper1 = res.body.valorOperadora.find((o: any) => o.operadora === 'Oper1')
    expect(oper1.valor).toBe(20)

    expect(res.body.kpis.pacientesDistintos).toBe(2)
  })
})
