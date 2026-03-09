/**
 * MSW request handlers — used in both Vitest integration tests and browser.
 * Simulates /api/sheets, /api/procedimentos, /api/patients with stable fixture data.
 */
import { http, HttpResponse } from 'msw'

// ---------------------------------------------------------------------------
// Stable fixture data
// ---------------------------------------------------------------------------

export const FIXTURE_PROCEDIMENTOS = [
  { procedimento: 'Fisioterapia', precoCusto: 100, precoVenda: 150, ativo: true, status: 'Ativo', dataInsercao: '2024-01-01', dataAtualizacao: '2024-01-01', valoresAnteriores: '' },
  { procedimento: 'Pilates', precoCusto: 80, precoVenda: 120, ativo: true, status: 'Ativo', dataInsercao: '2024-01-01', dataAtualizacao: '2024-01-01', valoresAnteriores: '' },
  { procedimento: 'Acupuntura', precoCusto: 60, precoVenda: 90, ativo: false, status: 'Inativo', dataInsercao: '2024-01-01', dataAtualizacao: '2024-01-01', valoresAnteriores: '' },
]

export const FIXTURE_PACIENTES = [
  { id: 1, nome: 'Ana Silva', municipio: 'Rio de Janeiro', status: 'Ativo', custo: 1200, custoReal: 800, operadora: 'Unimed', acomodacao: 'ID' },
  { id: 2, nome: 'Bruno Costa', municipio: 'São Paulo', status: 'Ativo', custo: 900, custoReal: 600, operadora: 'Bradesco', acomodacao: 'AD' },
]

/** Minimal /api/sheets payload shape expected by DashboardDataContext */
export const FIXTURE_SHEETS_RESPONSE = {
  kpis: {
    valorTotalPago: 2100,
    custoTotal: 1400,
    resultadoBruto: 700,
    mediaMensalPaga: 1050,
    valorTotalGlosado: 0,
    mediaMensalGlosado: 0,
    pacientesDistintos: 2,
    custoMedioPaciente: 700,
  },
  faturamentoMensal: [{ mes: 'Jan', valor: 1050 }, { mes: 'Fev', valor: 1050 }],
  distribuicaoAssistencia: [],
  tipoProcedimento: [{ procedimento: 'Fisioterapia', valor: 1200 }],
  distribuicaoMunicipio: [{ municipio: 'Rio de Janeiro', valor: 1200 }],
  perfilSexo: [],
  valorOperadora: [{ operadora: 'Unimed', valor: 1200 }],
  todasOperadoras: ['Unimed', 'Bradesco'],
  tipoAcomodacao: [],
  tipoGuia: { tipo: 'SP/SADT', valor: 2100 },
  areaPrestador: { area: 'Rio de Janeiro', valor: 2100 },
  tipoDespesa: { tipo: 'Atendimento Domiciliar', valor: 2100 },
  faixaEtaria: [],
  pacientes: FIXTURE_PACIENTES,
  refProcedimentos: FIXTURE_PROCEDIMENTOS,
}

// ---------------------------------------------------------------------------
// Handlers
// ---------------------------------------------------------------------------

export const handlers = [
  // GET /api/sheets — main data load
  http.get('/api/sheets', () => {
    return HttpResponse.json(FIXTURE_SHEETS_RESPONSE)
  }),

  // POST /api/procedimentos (batch_insert_reference / realizados)
  http.post('/api/procedimentos', async ({ request }) => {
    const body = await request.json() as any
    if (body.action === 'batch_insert_reference') {
      const payload = Array.isArray(body.payload) ? body.payload : []
      if (payload.length === 0) {
        return HttpResponse.json({ error: 'Missing fields' }, { status: 400 })
      }

      for (const item of payload) {
        if (!item?.procedimento || item.precoCusto === undefined || item.precoVenda === undefined) {
          return HttpResponse.json({ error: 'Missing fields' }, { status: 400 })
        }
      }

      return HttpResponse.json({ success: true, updates: { updatedRows: 1 } })
    }
    if (body.action === 'batch_insert_realizados') {
      return HttpResponse.json({ success: true, updates: { updatedRows: 1 } })
    }
    return HttpResponse.json({ error: 'Invalid action' }, { status: 400 })
  }),

  // PUT /api/procedimentos (update_reference)
  http.put('/api/procedimentos', async ({ request }) => {
    const body = await request.json() as any
    const { procedimento } = body.payload ?? {}
    const found = FIXTURE_PROCEDIMENTOS.find(p =>
      p.procedimento.trim() === String(procedimento).trim()
    )
    if (!found) {
      return HttpResponse.json({ error: 'Procedimento not found' }, { status: 404 })
    }
    return HttpResponse.json({ success: true, updates: { updatedRows: 1 } })
  }),

  // PUT /api/patients (update)
  http.put('/api/patients', async ({ request }) => {
    const body = await request.json() as any
    const patientId = body.patient?.id
    const found = FIXTURE_PACIENTES.find(p => String(p.id) === String(patientId))
    if (!found) {
      return HttpResponse.json({ error: 'Patient not found' }, { status: 404 })
    }
    return HttpResponse.json({ success: true, updates: { updatedRows: 1 } })
  }),

  // POST /api/patients (insert batch)
  http.post('/api/patients', async () => {
    return HttpResponse.json({ success: true, updates: { updatedRows: 1 } })
  }),
]
