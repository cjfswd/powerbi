import { act, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const statusPacienteConfig = {
  Internação: { label: 'Internação', cor: '#2563eb', icon: '' },
  Alta: { label: 'Alta', cor: '#10b981', icon: '' },
}

const patients = Array.from({ length: 15 }, (_, index) => ({
  id: index + 1,
  nome: `Paciente ${index + 1}`,
  municipio: index % 2 === 0 ? 'Rio de Janeiro' : 'Nova Iguaçu',
  status: index % 3 === 0 ? 'Alta' : 'Internação',
  custo: 1000 + (index * 75),
  custoReal: 800 + (index * 50),
  operadora: index % 2 === 0 ? 'Camperj' : 'Unimed',
  acomodacao: index % 2 === 0 ? 'ID' : 'AD',
  horasAtendimento: {
    '3h': 50,
    '6h': 120,
    '12h': 240,
    '24h': 480,
  },
}))

const snapshotMock = {
  generatedAt: '2026-03-09T12:00:00.000Z',
  filters: {
    operadora: 'todas',
    ano: '2026',
    mes: 'março',
  },
  statusPacienteConfig,
  data: {
    kpis: {
      valorTotalPago: 420000,
      custoTotal: 275000,
      resultadoBruto: 145000,
      mediaMensalPaga: 70000,
      valorTotalGlosado: 12000,
      mediaMensalGlosado: 2000,
      pacientesDistintos: 15,
      custoMedioPaciente: 18333,
    },
    faturamentoMensal: [
      { mes: 'Jan', valor: 65000, custo: 42000 },
      { mes: 'Fev', valor: 70000, custo: 45000 },
      { mes: 'Mar', valor: 68000, custo: 43000 },
      { mes: 'Abr', valor: 72000, custo: 47000 },
      { mes: 'Mai', valor: 71000, custo: 46000 },
      { mes: 'Jun', valor: 74000, custo: 52000 },
    ],
    distribuicaoAssistencia: [
      { tipo: '24h', valor: 180000, custo: 110000, cor: '#2563eb' },
      { tipo: '12h', valor: 95000, custo: 62000, cor: '#0f766e' },
      { tipo: 'Assistência', valor: 87000, custo: 56000, cor: '#f59e0b' },
      { tipo: 'Fisioterapia', valor: 58000, custo: 47000, cor: '#9333ea' },
    ],
    tipoProcedimento: [
      { procedimento: 'Diária global 24h', valor: 140000, custo: 90000 },
      { procedimento: 'Fisioterapia motora', valor: 99000, custo: 68000 },
      { procedimento: 'Pacote domiciliar', valor: 87000, custo: 55000 },
      { procedimento: 'Terapia respiratória', valor: 64000, custo: 41000 },
    ],
    distribuicaoMunicipio: [
      { municipio: 'Rio de Janeiro', valor: 180000, custo: 110000 },
      { municipio: 'Nova Iguaçu', valor: 145000, custo: 96000 },
      { municipio: 'Belford Roxo', valor: 95000, custo: 62000 },
    ],
    perfilSexo: [
      { sexo: 'Feminino', percentual: 58, cor: '#db2777' },
      { sexo: 'Masculino', percentual: 42, cor: '#2563eb' },
    ],
    valorOperadora: [
      { operadora: 'Camperj', valor: 220000, custo: 140000 },
      { operadora: 'Unimed', valor: 200000, custo: 135000 },
    ],
    pacientes: patients,
    faixaEtaria: [
      { faixa: '0-11', descricao: 'Criança', qtd: 2, percentual: 13.3, valorFaturado: 45000, valorCusto: 28000, valorGlosado: 0 },
      { faixa: '18-29', descricao: 'Jovem adulto', qtd: 3, percentual: 20, valorFaturado: 70000, valorCusto: 48000, valorGlosado: 1000 },
      { faixa: '30-59', descricao: 'Adulto', qtd: 6, percentual: 40, valorFaturado: 180000, valorCusto: 120000, valorGlosado: 5000 },
      { faixa: '60+', descricao: 'Idoso', qtd: 4, percentual: 26.7, valorFaturado: 125000, valorCusto: 79000, valorGlosado: 6000 },
    ],
  },
}

const dashboardMock = {
  ...snapshotMock.data,
  statusPacienteConfig,
  globalOperadora: 'todas',
  setGlobalOperadora: vi.fn(),
  globalAno: '2026',
  setGlobalAno: vi.fn(),
  globalMes: 'março',
  setGlobalMes: vi.fn(),
  refreshData: vi.fn(),
  loading: false,
  error: null,
}

vi.mock('@/lib/DashboardDataContext', () => ({
  useDashboard: () => dashboardMock,
}))

vi.mock('@/lib/print-report', () => ({
  readPrintReportSnapshot: () => snapshotMock,
}))

vi.mock('recharts', async () => {
  const actual = await vi.importActual<typeof import('recharts')>('recharts')
  return {
    ...actual,
    ResponsiveContainer: ({ children }: { children: unknown }) => (
      <div style={{ width: 1200, height: 800 }}>{children as any}</div>
    ),
  }
})

import ReportPrintView from '@/components/ReportPrintView'

describe('ReportPrintView', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    Object.defineProperty(window, 'print', { value: vi.fn(), writable: true })
    Object.defineProperty(HTMLElement.prototype, 'clientWidth', { configurable: true, get: () => 1200 })
    Object.defineProperty(HTMLElement.prototype, 'clientHeight', { configurable: true, get: () => 800 })
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(() => ({
      x: 0,
      y: 0,
      top: 0,
      left: 0,
      bottom: 800,
      right: 1200,
      width: 1200,
      height: 800,
      toJSON: () => ({}),
    } as DOMRect))
  })

  afterEach(() => {
    vi.runOnlyPendingTimers()
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('renderiza as 9 seções fixas e pagina a base analítica depois delas', () => {
    render(<ReportPrintView />)

    act(() => {
      vi.runOnlyPendingTimers()
    })

    expect(screen.queryByText(/sem dados para exportação/i)).not.toBeInTheDocument()
    expect(screen.getAllByTestId('print-section-page')).toHaveLength(9)
    expect(screen.getAllByTestId('print-table-page')).toHaveLength(2)

    const sectionHeadings = screen.getAllByTestId('print-section-page').map((page) =>
      within(page).getByRole('heading', { level: 1 }).textContent
    )
    expect(sectionHeadings).toEqual([
      'Faturamento x custo por mês',
      'Mix assistencial',
      'Resumo operacional',
      'Visualizações consolidadas',
      'Procedimentos com maior valor',
      'Municípios com maior concentração',
      'Faixa etária',
      'Operadoras líderes',
      'Cobertura assistencial',
    ])

    const tableHeadings = screen.getAllByTestId('print-table-page').map((page) =>
      within(page).getByRole('heading', { level: 1 }).textContent
    )
    expect(tableHeadings).toEqual([
      'Pacientes por custo',
      'Pacientes por custo',
    ])

    expect(window.print).toHaveBeenCalled()
  })
})
