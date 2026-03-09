/**
 * Unit tests for api/patients.ts handler.
 * Mocks getGoogleSheetsClient so no real API calls are made.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

// ---------------------------------------------------------------------------
// Helpers
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

const { default: handler } = await import('../../api/patients.ts')

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('POST /api/patients — insert', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.GOOGLE_SHEETS_ID = 'test-sheet-id'
    mockAppend.mockResolvedValue({ data: { updates: { updatedRows: 1 } } })
  })

  it('returns 400 when patients array is missing', async () => {
    const req = makeReq('POST', { action: 'insert' })
    const res = makeRes()
    await handler(req, res)
    expect(res.statusCode).toBe(400)
    expect(res.body.error).toMatch(/patients/i)
  })

  it('returns 400 when patients array is empty', async () => {
    const req = makeReq('POST', { action: 'insert', patients: [] })
    const res = makeRes()
    await handler(req, res)
    expect(res.statusCode).toBe(400)
  })

  it('maps patient fields to correct sheet column order', async () => {
    const patient = {
      id: '', nome: 'João Silva', municipio: 'Rio de Janeiro',
      nasc: '1980-01-01', sexo: 'Masculino', operadora: 'Unimed',
      acomodacao: 'ID', status: 'Ativo', pacote: '12h',
      entrada: '2024-01-01', saida: '',
    }
    const req = makeReq('POST', { action: 'insert', patients: [patient] })
    const res = makeRes()
    await handler(req, res)

    expect(res.statusCode).toBe(200)
    const appendedRow = mockAppend.mock.calls[0][0].requestBody.values[0]
    // format: id, nome, municipio, nasc, sexo, operadora, acomodacao, status, pacote, entrada, saida
    expect(appendedRow[1]).toBe('João Silva')
    expect(appendedRow[2]).toBe('Rio de Janeiro')
    expect(appendedRow[4]).toBe('Masculino')
    expect(appendedRow[5]).toBe('Unimed')
    expect(appendedRow[6]).toBe('ID')
    expect(appendedRow[7]).toBe('Ativo')
    expect(appendedRow[8]).toBe('12h')
  })

  it('defaults status to Ativo when not provided', async () => {
    const req = makeReq('POST', { action: 'insert', patients: [{ nome: 'Test', operadora: 'X' }] })
    const res = makeRes()
    await handler(req, res)
    const appendedRow = mockAppend.mock.calls[0][0].requestBody.values[0]
    expect(appendedRow[7]).toBe('Ativo')
  })
})

describe('PUT /api/patients — update', () => {
  const sheetRows = [
    ['ID', 'nome'],
    ['', ''],          // row 2: empty id — should be skipped
    ['101', 'Ana'],
    ['102', 'Bruno'],
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    process.env.GOOGLE_SHEETS_ID = 'test-sheet-id'
    mockGet.mockResolvedValue({ data: { values: sheetRows } })
    mockUpdate.mockResolvedValue({ data: { updatedRows: 1 } })
  })

  it('returns 400 when patient id is missing', async () => {
    const req = makeReq('PUT', { action: 'update', patient: { nome: 'X' } })
    const res = makeRes()
    await handler(req, res)
    expect(res.statusCode).toBe(400)
  })

  it('returns 404 when patient is not found', async () => {
    const req = makeReq('PUT', { action: 'update', patient: { id: '999', nome: 'X' } })
    const res = makeRes()
    await handler(req, res)
    expect(res.statusCode).toBe(404)
    expect(res.body.error).toMatch(/not found/i)
  })

  it('skips empty rows and still finds the correct patient', async () => {
    const req = makeReq('PUT', {
      action: 'update',
      patient: { id: '101', nome: 'Ana Updated', municipio: 'SP', sexo: 'Feminino', operadora: 'SUS', acomodacao: 'AD', status: 'Alta' },
    })
    const res = makeRes()
    await handler(req, res)
    // id '101' is at JS array index 2 → sheet row 3
    expect(res.statusCode).toBe(200)
    const updateCall = mockUpdate.mock.calls[0][0]
    expect(updateCall.range).toBe('Pacientes!A3:K3')
  })

  it('updates the correct row for the second patient', async () => {
    const req = makeReq('PUT', {
      action: 'update',
      patient: { id: '102', nome: 'Bruno Updated', municipio: 'RJ', sexo: 'Masculino', operadora: 'Unimed', acomodacao: 'ID', status: 'Ativo' },
    })
    const res = makeRes()
    await handler(req, res)
    const updateCall = mockUpdate.mock.calls[0][0]
    expect(updateCall.range).toBe('Pacientes!A4:K4')
    expect(updateCall.requestBody.values[0][1]).toBe('Bruno Updated')
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
