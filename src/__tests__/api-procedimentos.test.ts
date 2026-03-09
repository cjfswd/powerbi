/**
 * Unit tests for api/procedimentos.ts handler.
 * Mocks getGoogleSheetsClient so no real API calls are made.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

// ---------------------------------------------------------------------------
// Helpers to build fake request/response objects
// ---------------------------------------------------------------------------

function makeRes() {
  const res = {
    statusCode: 200,
    body: null as any,
    status(code: number) { this.statusCode = code; return this },
    json(data: any) { this.body = data; return this },
  }
  return res
}

function makeReq(method: string, body: any) {
  return { method, body }
}

// ---------------------------------------------------------------------------
// Mock googleapis
// ---------------------------------------------------------------------------

const mockAppend = vi.fn()
const mockGet = vi.fn()
const mockUpdate = vi.fn()

vi.mock('../../api/lib/google.ts', () => ({
  getGoogleSheetsClient: () => ({
    spreadsheets: {
      values: {
        append: mockAppend,
        get: mockGet,
        update: mockUpdate,
      },
    },
  }),
}))

// Import handler AFTER mock is set up
const { default: handler } = await import('../../api/procedimentos.ts')

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('POST /api/procedimentos — insert_reference', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.GOOGLE_SHEETS_ID = 'test-sheet-id'
    mockAppend.mockResolvedValue({ data: { updates: { updatedRows: 1 } } })
  })

  it('returns 400 when procedimento is missing', async () => {
    const req = makeReq('POST', { action: 'insert_reference', payload: { precoCusto: 10, precoVenda: 20 } })
    const res = makeRes()
    await handler(req, res)
    expect(res.statusCode).toBe(400)
    expect(res.body.error).toMatch(/missing/i)
  })

  it('returns 400 when precoCusto is missing', async () => {
    const req = makeReq('POST', { action: 'insert_reference', payload: { procedimento: 'Fisio', precoVenda: 20 } })
    const res = makeRes()
    await handler(req, res)
    expect(res.statusCode).toBe(400)
  })

  it('calls sheets.append with correct row structure', async () => {
    const req = makeReq('POST', {
      action: 'insert_reference',
      payload: { procedimento: 'Fisioterapia', precoCusto: 100, precoVenda: 150, ativo: true },
    })
    const res = makeRes()
    await handler(req, res)

    expect(res.statusCode).toBe(200)
    expect(res.body.success).toBe(true)
    const appendedRow = mockAppend.mock.calls[0][0].requestBody.values[0]
    expect(appendedRow[0]).toBe('Fisioterapia')  // procedimento
    expect(appendedRow[1]).toBe(100)             // precoCusto
    expect(appendedRow[2]).toBe(150)             // precoVenda
    expect(appendedRow[3]).toBe('Ativo')         // status
  })

  it('sets status to Inativo when ativo is false', async () => {
    const req = makeReq('POST', {
      action: 'insert_reference',
      payload: { procedimento: 'Fisio', precoCusto: 10, precoVenda: 20, ativo: false },
    })
    const res = makeRes()
    await handler(req, res)
    const appendedRow = mockAppend.mock.calls[0][0].requestBody.values[0]
    expect(appendedRow[3]).toBe('Inativo')
  })

  it('handles batch_insert_reference with multiple rows', async () => {
    const list = [
      { procedimento: 'Proc1', precoCusto: 10, precoVenda: 20, ativo: true },
      { procedimento: 'Proc2', precoCusto: 30, precoVenda: 40, ativo: false },
    ]
    const req = makeReq('POST', {
      action: 'batch_insert_reference',
      payload: list,
    })
    const res = makeRes()
    await handler(req, res)

    expect(res.statusCode).toBe(200)
    const appendedRows = mockAppend.mock.calls[0][0].requestBody.values
    expect(appendedRows.length).toBe(2)
    expect(appendedRows[0][0]).toBe('Proc1')
    expect(appendedRows[0][3]).toBe('Ativo')
    expect(appendedRows[1][0]).toBe('Proc2')
    expect(appendedRows[1][3]).toBe('Inativo')
  })
})

describe('PUT /api/procedimentos — update_reference', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.GOOGLE_SHEETS_ID = 'test-sheet-id'
    mockGet.mockResolvedValue({
      data: {
        values: [
          ['procedimento', 'preco_custo', 'preco_venda', 'status', 'data_insercao', 'data_atualizacao', 'valores_anteriores'],
          ['Fisioterapia', 100, 150, 'Ativo', '2024-01-01', '2024-01-01', ''],
          ['Pilates', 80, 120, 'Ativo', '2024-01-01', '2024-01-01', ''],
        ],
      },
    })
    mockUpdate.mockResolvedValue({ data: { updatedRows: 1 } })
  })

  it('returns 404 when procedimento is not found', async () => {
    const req = makeReq('PUT', {
      action: 'update_reference',
      payload: { procedimento: 'NaoExiste', precoCusto: 50, precoVenda: 80, ativo: true },
    })
    const res = makeRes()
    await handler(req, res)
    expect(res.statusCode).toBe(404)
    expect(res.body.error).toMatch(/not found/i)
  })

  it('finds the correct row even with trailing whitespace', async () => {
    mockGet.mockResolvedValue({
      data: {
        values: [
          ['procedimento', 'preco_custo'],
          ['Fisioterapia   ', 100],  // trailing spaces in sheet
        ],
      },
    })
    const req = makeReq('PUT', {
      action: 'update_reference',
      payload: { procedimento: 'Fisioterapia', precoCusto: 200, precoVenda: 300, ativo: true },
    })
    const res = makeRes()
    await handler(req, res)
    expect(res.statusCode).toBe(200)
  })

  it('updates the correct sheet range with new values', async () => {
    const req = makeReq('PUT', {
      action: 'update_reference',
      payload: { procedimento: 'Pilates', precoCusto: 90, precoVenda: 130, ativo: false },
    })
    const res = makeRes()
    await handler(req, res)

    expect(res.statusCode).toBe(200)
    const updateCall = mockUpdate.mock.calls[0][0]
    // Pilates is at row 3 in the sheet (1-indexed)
    expect(updateCall.range).toBe('REF_Procedimentos!A3:G3')
    const updatedRow = updateCall.requestBody.values[0]
    expect(updatedRow[0]).toBe('Pilates')
    expect(updatedRow[1]).toBe(90)
    expect(updatedRow[2]).toBe(130)
    expect(updatedRow[3]).toBe('Inativo')
  })
})

describe('POST /api/procedimentos — batch_insert_realizados', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.GOOGLE_SHEETS_ID = 'test-sheet-id'
    mockAppend.mockResolvedValue({ data: { updates: { updatedRows: 2 } } })
  })

  it('returns 400 when procedimentos array is missing', async () => {
    const req = makeReq('POST', { action: 'batch_insert_realizados', payload: { month: 'Jan', year: '2025' } })
    const res = makeRes()
    await handler(req, res)
    expect(res.statusCode).toBe(400)
  })

  it('maps each item to correct column order', async () => {
    const req = makeReq('POST', {
      action: 'batch_insert_realizados',
      payload: {
        month: 'Jan',
        year: '2025',
        procedimentos: [
          { paciente_id: 1, proc: 'Fisio', qtd: 2, custo_unit: 50, venda_unit: 75, custo_total: 100, venda_total: 150 },
        ],
      },
    })
    const res = makeRes()
    await handler(req, res)

    expect(res.statusCode).toBe(200)
    const appendedRow = mockAppend.mock.calls[0][0].requestBody.values[0]
    // format: id, paciente_id, proc, mes, ano, qtd, custo_unit, venda_unit, custo_total, venda_total, valor_glosado
    expect(appendedRow[1]).toBe(1)        // paciente_id
    expect(appendedRow[2]).toBe('Fisio')  // proc
    expect(appendedRow[3]).toBe('Jan')    // mes
    expect(appendedRow[4]).toBe('2025')   // ano
    expect(appendedRow[5]).toBe(2)        // qtd
    expect(appendedRow[6]).toBe(50)       // custo_unit
    expect(appendedRow[9]).toBe(150)      // venda_total
  })
})

describe('Method validation', () => {
  it('returns 405 for GET requests', async () => {
    const req = makeReq('GET', {})
    const res = makeRes()
    await handler(req, res)
    expect(res.statusCode).toBe(405)
  })
})
