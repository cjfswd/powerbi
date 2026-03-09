import { useEffect, useMemo, type ReactNode } from 'react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Building2, CalendarDays, Filter, Info, Printer, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useDashboard } from '@/lib/DashboardDataContext'
import { readPrintReportSnapshot, type PrintStatusConfig } from '@/lib/print-report'
import type { DashboardData } from '@/lib/sheets'

const CHART_COLORS = ['#2563eb', '#0f766e', '#f59e0b', '#9333ea', '#ef4444', '#0891b2']
const PATIENTS_PER_PAGE = 14
const FIXED_SECTION_COUNT = 9

type DashboardPatient = DashboardData['pacientes'][number]

const formatCurrency = (value: number) => (
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
    Number.isFinite(value) ? value : 0,
  )
)

const formatNumber = (value: number) => (
  new Intl.NumberFormat('pt-BR').format(Number.isFinite(value) ? value : 0)
)

const formatCompactCurrency = (value: number) => {
  const safeValue = Number.isFinite(value) ? value : 0
  if (Math.abs(safeValue) >= 1_000_000) return `R$ ${(safeValue / 1_000_000).toFixed(1)}M`
  if (Math.abs(safeValue) >= 1_000) return `R$ ${(safeValue / 1_000).toFixed(0)} mil`
  return formatCurrency(safeValue)
}

const formatPercent = (value: number) => `${(Number.isFinite(value) ? value : 0).toFixed(1)}%`

const formatTooltipCurrency = (
  value: number | string | readonly (number | string)[] | undefined,
) => {
  const safeValue = Array.isArray(value) ? value[0] : value
  return formatCurrency(Number(safeValue ?? 0))
}

const safePercent = (part: number, total: number) => {
  if (!Number.isFinite(part) || !Number.isFinite(total) || total <= 0) return 0
  return (part / total) * 100
}

const truncateText = (value: string, max = 26) => (
  value.length > max ? `${value.slice(0, max - 1)}...` : value
)

const formatDateTime = (value: string) => {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(new Date())
  }

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date)
}

const normalizeFilterValue = (value: string, fallback: string) => {
  if (!value) return fallback
  if (value === 'todos' || value === 'todas') return fallback
  return value
}

function chunkArray<T>(items: T[], chunkSize: number) {
  if (chunkSize <= 0) return [items]

  const chunks: T[][] = []
  for (let index = 0; index < items.length; index += chunkSize) {
    chunks.push(items.slice(index, index + chunkSize))
  }
  return chunks
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2 text-[11px] font-medium text-slate-600">
      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
      <span>{label}</span>
    </div>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 px-6 text-center text-sm text-slate-500">
      {message}
    </div>
  )
}

function MetricCard({
  title,
  value,
  subtitle,
}: {
  title: string
  value: string
  subtitle: string
}) {
  return (
    <div className="flex min-h-[28mm] flex-col justify-between rounded-xl border border-slate-200 bg-white p-3">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">{title}</p>
        <p className="mt-2 text-[25px] font-semibold leading-none tracking-tight text-slate-950">{value}</p>
      </div>
      <p className="mt-3 text-[11px] leading-4 text-slate-500">{subtitle}</p>
    </div>
  )
}

function CompactInfoCard({
  label,
  value,
  detail,
}: {
  label: string
  value: string
  detail: string
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <p className="mt-2 text-[17px] font-semibold leading-5 text-slate-950">{value}</p>
      <p className="mt-2 text-[11px] leading-4 text-slate-500">{detail}</p>
    </div>
  )
}

function Panel({
  title,
  subtitle,
  className = '',
  children,
}: {
  title: string
  subtitle?: string
  className?: string
  children: ReactNode
}) {
  return (
    <section className={`flex min-h-0 flex-col rounded-2xl border border-slate-200 bg-white p-4 ${className}`}>
      <div className="mb-3">
        <h2 className="text-[15px] font-semibold tracking-tight text-slate-950">{title}</h2>
        {subtitle && <p className="mt-1 text-[11px] leading-4 text-slate-500">{subtitle}</p>}
      </div>
      <div className="min-h-0 flex-1">{children}</div>
    </section>
  )
}

function ChartPanel({
  title,
  subtitle,
  legend,
  children,
}: {
  title: string
  subtitle?: string
  legend?: ReactNode
  children: ReactNode
}) {
  return (
    <Panel title={title} subtitle={subtitle} className="h-full">
      {legend && <div className="mb-3 flex flex-wrap gap-4">{legend}</div>}
      <div className="print-chart-fill min-h-0 flex-1">{children}</div>
    </Panel>
  )
}

function MetaChip({
  label,
  value,
  icon,
}: {
  label: string
  value: string
  icon?: ReactNode
}) {
  return (
    <div className="print-meta-chip inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] leading-4 text-slate-600">
      {icon}
      <span className="font-medium text-slate-500">{label}:</span>
      <span className="font-semibold text-slate-900">{value}</span>
    </div>
  )
}

function PageFooter({
  pageNumber,
  totalPages,
  detail,
}: {
  pageNumber: number
  totalPages: number
  detail?: string
}) {
  return (
    <footer className="mt-3 flex items-center justify-between border-t border-slate-200 pt-2 text-[10px] uppercase tracking-[0.16em] text-slate-400">
      <span>Healthmais BI</span>
      <div className="flex items-center gap-4">
        {detail && <span>{detail}</span>}
        <span>Página {pageNumber} de {totalPages}</span>
      </div>
    </footer>
  )
}
function PrintPageShell({
  sectionLabel,
  title,
  description,
  periodoLabel,
  operadoraLabel,
  generatedAt,
  pageNumber,
  totalPages,
  detail,
  testId = 'print-section-page',
  children,
}: {
  sectionLabel: string
  title: string
  description: string
  periodoLabel: string
  operadoraLabel: string
  generatedAt: string
  pageNumber: number
  totalPages: number
  detail?: string
  testId?: string
  children: ReactNode
}) {
  return (
    <section
      data-testid={testId}
      className="print-report-page grid h-[198mm] min-h-[198mm] w-full max-w-[297mm] grid-rows-[auto_minmax(0,1fr)_auto] rounded-[24px] border border-slate-200 bg-white px-[8mm] py-[7mm] text-slate-950 shadow-[0_18px_60px_rgba(15,23,42,0.08)] print:rounded-none print:shadow-none"
    >
      <header className="border-b border-slate-200 pb-3">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">{sectionLabel}</p>
          <h1 className="mt-1 text-[22px] font-semibold leading-tight tracking-tight text-slate-950">{title}</h1>
          <p className="mt-1 max-w-[210mm] text-[12px] leading-5 text-slate-600">{description}</p>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <MetaChip
            label="Período"
            value={periodoLabel}
            icon={<Filter className="h-3.5 w-3.5 text-slate-400" />}
          />
          <MetaChip
            label="Operadora"
            value={operadoraLabel}
            icon={<Building2 className="h-3.5 w-3.5 text-slate-400" />}
          />
          <MetaChip
            label="Gerado em"
            value={formatDateTime(generatedAt)}
            icon={<CalendarDays className="h-3.5 w-3.5 text-slate-400" />}
          />
          {detail && (
            <MetaChip
              label="Resumo"
              value={detail}
              icon={<Info className="h-3.5 w-3.5 text-slate-400" />}
            />
          )}
        </div>
      </header>

      <div className="print-page-body min-h-0 pt-4">{children}</div>

      <PageFooter pageNumber={pageNumber} totalPages={totalPages} detail={detail} />
    </section>
  )
}

function TablePage({
  pageNumber,
  totalPages,
  periodoLabel,
  operadoraLabel,
  generatedAt,
  rows,
  rowOffset,
  totalRows,
  statusMap,
}: {
  pageNumber: number
  totalPages: number
  periodoLabel: string
  operadoraLabel: string
  generatedAt: string
  rows: DashboardPatient[]
  rowOffset: number
  totalRows: number
  statusMap: PrintStatusConfig
}) {
  const startRow = rowOffset + 1
  const endRow = rowOffset + rows.length

  return (
    <PrintPageShell
      sectionLabel="Base analítica"
      title="Pacientes por custo"
      description="Continuação paginada da base analítica, ordenada por maior custo dentro do filtro atual."
      periodoLabel={periodoLabel}
      operadoraLabel={operadoraLabel}
      generatedAt={generatedAt}
      pageNumber={pageNumber}
      totalPages={totalPages}
      detail={`Registros ${startRow}-${endRow} de ${totalRows}`}
      testId="print-table-page"
    >
      <div className="flex h-full min-h-0 flex-col">
        <div className="mb-3 flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] text-slate-600">
          <span className="font-medium text-slate-900">Base analítica de pacientes</span>
          <span>Linhas {startRow} a {endRow}</span>
        </div>

        <div className="min-h-0 flex-1 overflow-hidden rounded-xl border border-slate-200 bg-white">
          <table className="w-full border-collapse text-sm">
            <thead className="print-table-head bg-slate-900 text-white">
              <tr>
                <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-[0.16em]">Paciente</th>
                <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-[0.16em]">Operadora</th>
                <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-[0.16em]">Município</th>
                <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-[0.16em]">Status</th>
                <th className="px-4 py-3 text-right text-[11px] font-medium uppercase tracking-[0.16em]">Custo</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((patient, index) => {
                const status = statusMap[patient.status]
                return (
                  <tr key={`${patient.id}-${rowOffset + index}`} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                    <td className="px-4 py-3 font-medium text-slate-950">{patient.nome}</td>
                    <td className="px-4 py-3 text-slate-600">{patient.operadora}</td>
                    <td className="px-4 py-3 text-slate-600">{patient.municipio}</td>
                    <td className="px-4 py-3">
                      <span
                        className="inline-flex rounded-full px-3 py-1 text-xs font-medium"
                        style={{
                          backgroundColor: `${status?.cor || '#cbd5e1'}20`,
                          color: status?.cor || '#475569',
                        }}
                      >
                        {status?.label || patient.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-slate-950">{formatCurrency(patient.custo)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </PrintPageShell>
  )
}

export default function ReportPrintView() {
  const dashboard = useDashboard()
  const snapshot = useMemo(() => readPrintReportSnapshot(), [])

  const handleClosePreview = () => {
    try {
      window.close()
    } catch {
      // ignore and use fallback below
    }

    window.setTimeout(() => {
      if (document.visibilityState !== 'visible') return

      if (window.history.length > 1) {
        window.history.back()
        return
      }

      window.location.replace('/')
    }, 120)
  }

  const reportData = snapshot?.data ?? {
    kpis: dashboard.kpis,
    faturamentoMensal: dashboard.faturamentoMensal,
    distribuicaoAssistencia: dashboard.distribuicaoAssistencia,
    tipoProcedimento: dashboard.tipoProcedimento,
    distribuicaoMunicipio: dashboard.distribuicaoMunicipio,
    perfilSexo: dashboard.perfilSexo,
    valorOperadora: dashboard.valorOperadora,
    pacientes: dashboard.pacientes,
    faixaEtaria: dashboard.faixaEtaria,
  }

  const filters = snapshot?.filters ?? {
    operadora: dashboard.globalOperadora,
    ano: dashboard.globalAno,
    mes: dashboard.globalMes,
  }

  const statusMap: PrintStatusConfig = snapshot?.statusPacienteConfig ?? dashboard.statusPacienteConfig
  const generatedAt = snapshot?.generatedAt ?? new Date().toISOString()

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      window.print()
    }, 450)

    return () => window.clearTimeout(timeout)
  }, [])

  const operadoraLabel = normalizeFilterValue(filters.operadora, 'Todas as operadoras')
  const anoLabel = normalizeFilterValue(filters.ano, 'Todos os anos')
  const mesLabel = normalizeFilterValue(filters.mes, 'Todos os meses')
  const periodoLabel = `${anoLabel} • ${mesLabel}`

  const assistenciaTotal = reportData.distribuicaoAssistencia.reduce((sum, item) => sum + item.valor, 0)
  const totalOperadoras = reportData.valorOperadora.reduce((sum, item) => sum + item.valor, 0)
  const totalMunicipios = reportData.distribuicaoMunicipio.reduce((sum, item) => sum + item.valor, 0)
  const totalProcedimentos = reportData.tipoProcedimento.reduce((sum, item) => sum + item.valor, 0)
  const totalFaixas = reportData.faixaEtaria.reduce((sum, faixa) => sum + faixa.qtd, 0)
  const resultadoBruto = reportData.kpis.resultadoBruto ?? (reportData.kpis.valorTotalPago - reportData.kpis.custoTotal)
  const margemBruta = safePercent(resultadoBruto, reportData.kpis.valorTotalPago)
  const ticketMedio = reportData.kpis.pacientesDistintos > 0
    ? reportData.kpis.valorTotalPago / reportData.kpis.pacientesDistintos
    : 0

  const assistenciaPieData = reportData.distribuicaoAssistencia.map((item) => ({
    ...item,
    valorEpsilon: item.valor === 0 ? 0.1 : item.valor,
  }))

  const assistenciaHighlights = [...reportData.distribuicaoAssistencia]
    .sort((a, b) => b.valor - a.valor)
    .slice(0, 6)

  const topProcedures = [...reportData.tipoProcedimento]
    .sort((a, b) => b.valor - a.valor)
    .slice(0, 8)

  const topMunicipios = [...reportData.distribuicaoMunicipio]
    .sort((a, b) => b.valor - a.valor)
    .slice(0, 8)

  const topOperadoras = [...reportData.valorOperadora]
    .sort((a, b) => b.valor - a.valor)

  const sortedPatients = [...reportData.pacientes].sort((a, b) => b.custo - a.custo)
  const patientPages = chunkArray(sortedPatients, PATIENTS_PER_PAGE)

  const dominantSexo = [...reportData.perfilSexo].sort((a, b) => b.percentual - a.percentual)[0]
  const dominantFaixa = [...reportData.faixaEtaria].sort((a, b) => b.qtd - a.qtd)[0]
  const topProcedimento = topProcedures[0]
  const topMunicipio = topMunicipios[0]
  const topOperadora = topOperadoras[0]
  const topAssistencia = assistenciaHighlights[0]

  const acomodacaoLabels: Record<string, string> = {
    AD: 'Atendimento domiciliar',
    ID: 'Internação domiciliar',
  }

  const coberturaAcomodacao = Object.values(
    reportData.pacientes.reduce<Record<string, { tipo: string; label: string; pacientes: number; custo: number }>>((acc, patient) => {
      const tipo = patient.acomodacao || 'N/A'
      if (!acc[tipo]) {
        acc[tipo] = {
          tipo,
          label: acomodacaoLabels[tipo] || tipo,
          pacientes: 0,
          custo: 0,
        }
      }

      acc[tipo].pacientes += 1
      acc[tipo].custo += patient.custo
      return acc
    }, {}),
  ).sort((a, b) => b.pacientes - a.pacientes)

  const coberturaHoras = ['3h', '6h', '12h', '24h'].map((faixa) => {
    const valor = reportData.pacientes.reduce((sum, patient) => sum + (patient.horasAtendimento?.[faixa as '3h' | '6h' | '12h' | '24h'] ?? 0), 0)
    return { faixa, valor }
  })

  const totalCoberturaHoras = coberturaHoras.reduce((sum, item) => sum + item.valor, 0)

  const statusResumo = Object.entries(
    reportData.pacientes.reduce<Record<string, number>>((acc, patient) => {
      acc[patient.status] = (acc[patient.status] ?? 0) + 1
      return acc
    }, {}),
  )
    .map(([status, count]) => ({
      status,
      label: statusMap[status]?.label || status,
      cor: statusMap[status]?.cor || '#64748b',
      count,
    }))
    .sort((a, b) => b.count - a.count)

  const hasAnyData = (
    reportData.faturamentoMensal.length > 0 ||
    reportData.distribuicaoAssistencia.length > 0 ||
    reportData.tipoProcedimento.length > 0 ||
    reportData.distribuicaoMunicipio.length > 0 ||
    reportData.valorOperadora.length > 0 ||
    reportData.faixaEtaria.length > 0 ||
    reportData.pacientes.length > 0 ||
    reportData.kpis.valorTotalPago > 0
  )

  const totalPages = hasAnyData ? FIXED_SECTION_COUNT + patientPages.length : 1

  return (
    <div className="min-h-screen bg-slate-100 text-slate-950">
      <div className="no-print sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-[1240px] items-center justify-between gap-4 px-6 py-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">Pré-visualização de impressão</p>
            <h1 className="mt-1 text-xl font-semibold tracking-tight">Relatório PDF em páginas A4 paisagem</h1>
            <p className="print-preview-note mt-1 text-sm text-amber-700">
              Para um PDF mais limpo, desmarque "Cabeçalhos e rodapés" na janela do navegador.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="gap-2" onClick={handleClosePreview}>
              <X className="h-4 w-4" />
              Fechar
            </Button>
            <Button className="gap-2" onClick={() => window.print()}>
              <Printer className="h-4 w-4" />
              Imprimir
            </Button>
          </div>
        </div>
      </div>

      <main className="mx-auto flex w-full max-w-[320mm] flex-col gap-4 px-4 py-5 print:max-w-none print:gap-0 print:px-0 print:py-0">
        {!hasAnyData ? (
          <PrintPageShell
            sectionLabel="Relatório"
            title="Sem dados para exportação"
            description="Nenhum dado compatível com o filtro atual foi encontrado para montar o relatório impresso."
            periodoLabel={periodoLabel}
            operadoraLabel={operadoraLabel}
            generatedAt={generatedAt}
            pageNumber={1}
            totalPages={1}
            detail="Ajuste os filtros e tente novamente"
          >
            <EmptyState message="O relatório não possui conteúdo suficiente para preencher as páginas solicitadas." />
          </PrintPageShell>
        ) : (
          <>
            <PrintPageShell
              sectionLabel="Financeiro"
              title="Faturamento x custo por mês"
              description="Evolução mensal do faturamento e do custo no recorte atual, com aproveitamento máximo da área útil da página."
              periodoLabel={periodoLabel}
              operadoraLabel={operadoraLabel}
              generatedAt={generatedAt}
              pageNumber={1}
              totalPages={totalPages}
              detail={`${reportData.faturamentoMensal.length} competências analisadas`}
            >
              <ChartPanel
                title="Série mensal"
                subtitle="Comparativo consolidado de faturamento e custo ao longo do período."
                legend={
                  <>
                    <LegendItem color="#2563eb" label="Faturamento" />
                    <LegendItem color="#ef4444" label="Custo" />
                  </>
                }
              >
                {reportData.faturamentoMensal.length === 0 ? (
                  <EmptyState message="Não há competências suficientes para compor a série mensal." />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={reportData.faturamentoMensal} margin={{ top: 12, right: 16, left: 8, bottom: 0 }}>
                      <defs>
                        <linearGradient id="print-fat" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2563eb" stopOpacity={0.22} />
                          <stop offset="95%" stopColor="#2563eb" stopOpacity={0.02} />
                        </linearGradient>
                        <linearGradient id="print-cost" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ef4444" stopOpacity={0.18} />
                          <stop offset="95%" stopColor="#ef4444" stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="mes" tick={{ fill: '#475569', fontSize: 12 }} />
                      <YAxis tickFormatter={formatCompactCurrency} tick={{ fill: '#475569', fontSize: 12 }} width={82} />
                      <Tooltip formatter={(value) => formatTooltipCurrency(value)} />
                      <Area type="monotone" dataKey="valor" name="Faturamento" stroke="#2563eb" strokeWidth={2.8} fill="url(#print-fat)" />
                      <Area type="monotone" dataKey="custo" name="Custo" stroke="#ef4444" strokeWidth={2.8} fill="url(#print-cost)" />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </ChartPanel>
            </PrintPageShell>

            <PrintPageShell
              sectionLabel="Assistência"
              title="Mix assistencial"
              description="Distribuição financeira do portfólio assistencial, com leitura principal no gráfico e resumo compacto ao lado."
              periodoLabel={periodoLabel}
              operadoraLabel={operadoraLabel}
              generatedAt={generatedAt}
              pageNumber={2}
              totalPages={totalPages}
              detail={`${assistenciaHighlights.length} categorias em destaque`}
            >
              <div className="grid h-full min-h-0 grid-cols-[1.45fr_0.95fr] gap-3">
                <ChartPanel
                  title="Participação financeira"
                  subtitle="Peso relativo do faturamento por tipo de assistência."
                >
                  {assistenciaPieData.length === 0 ? (
                    <EmptyState message="Não há dados suficientes para compor o mix assistencial." />
                  ) : (
                    <div className="relative h-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={assistenciaPieData}
                            dataKey="valorEpsilon"
                            nameKey="tipo"
                            innerRadius={88}
                            outerRadius={148}
                            paddingAngle={2}
                          >
                            {assistenciaPieData.map((entry, index) => (
                              <Cell key={`${entry.tipo}-${index}`} fill={entry.cor || CHART_COLORS[index % CHART_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => formatTooltipCurrency(value)} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                        <div className="rounded-full border border-slate-200 bg-white px-5 py-4 text-center shadow-sm">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Total</p>
                          <p className="mt-1 text-lg font-semibold text-slate-950">{formatCurrency(assistenciaTotal)}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </ChartPanel>

                <Panel title="Resumo do mix" subtitle="Lista densa das modalidades com maior peso financeiro." className="h-full">
                  {assistenciaHighlights.length === 0 ? (
                    <EmptyState message="Sem categorias assistenciais para resumir nesta página." />
                  ) : (
                    <div className="space-y-2.5">
                      {assistenciaHighlights.map((item, index) => {
                        const share = safePercent(item.valor, assistenciaTotal)
                        return (
                          <div key={item.tipo} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-2">
                                <span
                                  className="h-2.5 w-2.5 rounded-full"
                                  style={{ backgroundColor: item.cor || CHART_COLORS[index % CHART_COLORS.length] }}
                                />
                                <span className="text-sm font-medium text-slate-900">{item.tipo}</span>
                              </div>
                              <span className="text-[11px] font-semibold text-slate-600">{formatPercent(share)}</span>
                            </div>
                            <div className="mt-2 grid grid-cols-2 gap-2 text-[11px] text-slate-500">
                              <span>Faturamento</span>
                              <span className="text-right font-medium text-slate-900">{formatCurrency(item.valor)}</span>
                              <span>Custo</span>
                              <span className="text-right font-medium text-slate-900">{formatCurrency(item.custo)}</span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </Panel>
              </div>
            </PrintPageShell>

            <PrintPageShell
              sectionLabel="Operação"
              title="Resumo operacional"
              description="Página executiva com os principais indicadores do período em grade compacta e leitura imediata."
              periodoLabel={periodoLabel}
              operadoraLabel={operadoraLabel}
              generatedAt={generatedAt}
              pageNumber={3}
              totalPages={totalPages}
              detail={`Base ativa: ${formatNumber(reportData.kpis.pacientesDistintos)} pacientes`}
            >
              <div className="grid h-full min-h-0 grid-cols-4 gap-3">
                <MetricCard title="Faturamento total" value={formatCurrency(reportData.kpis.valorTotalPago)} subtitle="Receita consolidada do período" />
                <MetricCard title="Custo total" value={formatCurrency(reportData.kpis.custoTotal)} subtitle="Custo consolidado dos realizados" />
                <MetricCard title="Resultado bruto" value={formatCurrency(resultadoBruto)} subtitle={`Margem de ${formatPercent(margemBruta)}`} />
                <MetricCard title="Glosa total" value={formatCurrency(reportData.kpis.valorTotalGlosado)} subtitle="Impacto financeiro glosado" />
                <MetricCard title="Pacientes distintos" value={formatNumber(reportData.kpis.pacientesDistintos)} subtitle="Base assistencial no filtro" />
                <MetricCard title="Média mensal" value={formatCurrency(reportData.kpis.mediaMensalPaga)} subtitle="Receita média por competência" />
                <MetricCard title="Ticket médio" value={formatCurrency(ticketMedio)} subtitle="Faturamento médio por paciente" />
                <MetricCard title="Custo médio por paciente" value={formatCurrency(reportData.kpis.custoMedioPaciente)} subtitle="Despesa média por beneficiário" />
              </div>
            </PrintPageShell>

            <PrintPageShell
              sectionLabel="Consolidação"
              title="Visualizações consolidadas"
              description="Leitura integrada dos principais destaques financeiros, geográficos e assistenciais do recorte filtrado."
              periodoLabel={periodoLabel}
              operadoraLabel={operadoraLabel}
              generatedAt={generatedAt}
              pageNumber={4}
              totalPages={totalPages}
              detail={`Ano ${anoLabel} • Mês ${mesLabel}`}
            >
              <div className="grid h-full min-h-0 grid-cols-4 gap-3">
                <CompactInfoCard
                  label="Operadora líder"
                  value={topOperadora?.operadora || 'Sem dados'}
                  detail={`${formatCurrency(topOperadora?.valor || 0)} • ${formatPercent(safePercent(topOperadora?.valor || 0, totalOperadoras))}`}
                />
                <CompactInfoCard
                  label="Município líder"
                  value={topMunicipio?.municipio || 'Sem dados'}
                  detail={`${formatCurrency(topMunicipio?.valor || 0)} • ${formatPercent(safePercent(topMunicipio?.valor || 0, totalMunicipios))}`}
                />
                <CompactInfoCard
                  label="Procedimento líder"
                  value={topProcedimento ? truncateText(topProcedimento.procedimento, 30) : 'Sem dados'}
                  detail={`${formatCurrency(topProcedimento?.valor || 0)} • ${formatPercent(safePercent(topProcedimento?.valor || 0, totalProcedimentos))}`}
                />
                <CompactInfoCard
                  label="Perfil assistencial"
                  value={topAssistencia?.tipo || 'Sem dados'}
                  detail={`${formatPercent(safePercent(topAssistencia?.valor || 0, assistenciaTotal))} do faturamento assistencial`}
                />
                <CompactInfoCard
                  label="Faixa dominante"
                  value={dominantFaixa ? `${dominantFaixa.faixa} • ${dominantFaixa.descricao}` : 'Sem dados'}
                  detail={`${formatNumber(dominantFaixa?.qtd || 0)} pacientes na base`}
                />
                <CompactInfoCard
                  label="Sexo predominante"
                  value={dominantSexo?.sexo || 'Sem dados'}
                  detail={`${formatPercent(dominantSexo?.percentual || 0)} de participação relativa`}
                />
                <CompactInfoCard
                  label="Resultado do período"
                  value={formatCurrency(resultadoBruto)}
                  detail={`Margem consolidada de ${formatPercent(margemBruta)}`}
                />
                <CompactInfoCard
                  label="Glosa média"
                  value={formatCurrency(reportData.kpis.mediaMensalGlosado)}
                  detail={`${formatNumber(sortedPatients.length)} pacientes na visão analítica`}
                />
              </div>
            </PrintPageShell>
            <PrintPageShell
              sectionLabel="Procedimentos"
              title="Procedimentos com maior valor"
              description="Ranking financeiro dos procedimentos com maior faturamento, com eixo e rótulos compactados para aproveitar melhor a página."
              periodoLabel={periodoLabel}
              operadoraLabel={operadoraLabel}
              generatedAt={generatedAt}
              pageNumber={5}
              totalPages={totalPages}
              detail={`${topProcedures.length} procedimentos em destaque`}
            >
              <ChartPanel
                title="Ranking financeiro"
                subtitle="Comparativo entre faturamento e custo por procedimento."
                legend={
                  <>
                    <LegendItem color="#2563eb" label="Faturamento" />
                    <LegendItem color="#ef4444" label="Custo" />
                  </>
                }
              >
                {topProcedures.length === 0 ? (
                  <EmptyState message="Não há procedimentos suficientes para compor o ranking." />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topProcedures} layout="vertical" margin={{ top: 8, right: 12, left: 28, bottom: 8 }} barCategoryGap={14}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis type="number" tickFormatter={formatCompactCurrency} tick={{ fill: '#475569', fontSize: 11 }} />
                      <YAxis
                        dataKey="procedimento"
                        type="category"
                        width={170}
                        tick={{ fill: '#475569', fontSize: 11 }}
                        tickFormatter={(value: string) => truncateText(value, 28)}
                      />
                      <Tooltip formatter={(value) => formatTooltipCurrency(value)} />
                      <Bar name="Faturamento" dataKey="valor" fill="#2563eb" radius={[0, 5, 5, 0]} />
                      <Bar name="Custo" dataKey="custo" fill="#ef4444" radius={[0, 5, 5, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </ChartPanel>
            </PrintPageShell>

            <PrintPageShell
              sectionLabel="Geografia"
              title="Municípios com maior concentração"
              description="Concentração financeira por município, com melhor aproveitamento lateral e leitura limpa dos eixos."
              periodoLabel={periodoLabel}
              operadoraLabel={operadoraLabel}
              generatedAt={generatedAt}
              pageNumber={6}
              totalPages={totalPages}
              detail={`${topMunicipios.length} municípios ranqueados`}
            >
              <ChartPanel
                title="Distribuição territorial"
                subtitle="Comparativo de faturamento e custo dos municípios mais representativos."
                legend={
                  <>
                    <LegendItem color="#0f766e" label="Faturamento" />
                    <LegendItem color="#f97316" label="Custo" />
                  </>
                }
              >
                {topMunicipios.length === 0 ? (
                  <EmptyState message="Não há municípios suficientes para compor a distribuição territorial." />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topMunicipios} margin={{ top: 8, right: 12, left: 8, bottom: 42 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis
                        dataKey="municipio"
                        angle={-18}
                        textAnchor="end"
                        height={52}
                        tick={{ fill: '#475569', fontSize: 11 }}
                        tickFormatter={(value: string) => truncateText(value, 18)}
                      />
                      <YAxis tickFormatter={formatCompactCurrency} tick={{ fill: '#475569', fontSize: 11 }} width={78} />
                      <Tooltip formatter={(value) => formatTooltipCurrency(value)} />
                      <Bar name="Faturamento" dataKey="valor" fill="#0f766e" radius={[5, 5, 0, 0]} />
                      <Bar name="Custo" dataKey="custo" fill="#f97316" radius={[5, 5, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </ChartPanel>
            </PrintPageShell>

            <PrintPageShell
              sectionLabel="Perfil"
              title="Faixa etária"
              description="Distribuição da base por faixa etária com gráfico principal e ranking lateral resumido para leitura mais densa."
              periodoLabel={periodoLabel}
              operadoraLabel={operadoraLabel}
              generatedAt={generatedAt}
              pageNumber={7}
              totalPages={totalPages}
              detail={`${reportData.faixaEtaria.length} faixas monitoradas`}
            >
              <div className="grid h-full min-h-0 grid-cols-[1.35fr_0.95fr] gap-3">
                <ChartPanel
                  title="Impacto financeiro por faixa"
                  subtitle="Comparativo entre faturamento e custo de cada faixa etária."
                  legend={
                    <>
                      <LegendItem color="#2563eb" label="Faturamento" />
                      <LegendItem color="#ef4444" label="Custo" />
                    </>
                  }
                >
                  {reportData.faixaEtaria.length === 0 ? (
                    <EmptyState message="Não há faixas etárias suficientes para compor o gráfico." />
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={reportData.faixaEtaria} margin={{ top: 8, right: 12, left: 8, bottom: 24 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="faixa" tick={{ fill: '#475569', fontSize: 11 }} />
                        <YAxis tickFormatter={formatCompactCurrency} tick={{ fill: '#475569', fontSize: 11 }} width={78} />
                        <Tooltip formatter={(value) => formatTooltipCurrency(value)} />
                        <Bar name="Faturamento" dataKey="valorFaturado" fill="#2563eb" radius={[5, 5, 0, 0]} />
                        <Bar name="Custo" dataKey="valorCusto" fill="#ef4444" radius={[5, 5, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </ChartPanel>

                <Panel title="Ranking etário" subtitle="Participação da base e impacto por faixa." className="h-full">
                  {reportData.faixaEtaria.length === 0 ? (
                    <EmptyState message="Sem dados etários para resumir nesta página." />
                  ) : (
                    <div className="space-y-3">
                      {reportData.faixaEtaria
                        .slice()
                        .sort((a, b) => b.qtd - a.qtd)
                        .map((faixa, index) => {
                          const share = safePercent(faixa.qtd, totalFaixas)
                          return (
                            <div key={faixa.faixa} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
                              <div className="flex items-center justify-between gap-3">
                                <div>
                                  <p className="text-sm font-medium text-slate-950">{faixa.faixa} • {faixa.descricao}</p>
                                  <p className="mt-0.5 text-[11px] text-slate-500">{formatNumber(faixa.qtd)} pacientes</p>
                                </div>
                                <span className="text-[11px] font-semibold text-slate-600">{formatPercent(share)}</span>
                              </div>
                              <div className="mt-2 h-2 rounded-full bg-slate-200">
                                <div
                                  className="h-2 rounded-full"
                                  style={{
                                    width: `${Math.min(share, 100)}%`,
                                    backgroundColor: CHART_COLORS[index % CHART_COLORS.length],
                                  }}
                                />
                              </div>
                              <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                                <span>Faturamento</span>
                                <span className="font-medium text-slate-900">{formatCurrency(faixa.valorFaturado)}</span>
                              </div>
                            </div>
                          )
                        })}
                    </div>
                  )}
                </Panel>
              </div>
            </PrintPageShell>

            <PrintPageShell
              sectionLabel="Operadoras"
              title="Operadoras líderes"
              description="Ranking compacto com participação, faturamento e custo das operadoras mais relevantes do recorte."
              periodoLabel={periodoLabel}
              operadoraLabel={operadoraLabel}
              generatedAt={generatedAt}
              pageNumber={8}
              totalPages={totalPages}
              detail={`${topOperadoras.length} operadoras listadas`}
            >
              <div className="grid h-full min-h-0 grid-rows-[auto_minmax(0,1fr)] gap-3">
                <div className="grid grid-cols-3 gap-3">
                  <MetricCard title="Operadoras ativas" value={formatNumber(topOperadoras.length)} subtitle="Quantidade no recorte atual" />
                  <MetricCard title="Líder do período" value={topOperadora?.operadora || 'Sem dados'} subtitle={formatPercent(safePercent(topOperadora?.valor || 0, totalOperadoras))} />
                  <MetricCard title="Faturamento consolidado" value={formatCurrency(totalOperadoras)} subtitle="Soma do ranking de operadoras" />
                </div>

                <Panel title="Ranking consolidado" subtitle="Participação no faturamento, com barras compactas e leitura direta." className="h-full">
                  {topOperadoras.length === 0 ? (
                    <EmptyState message="Não há operadoras suficientes para compor o ranking." />
                  ) : (
                    <div className="space-y-2">
                      {topOperadoras.map((operadora, index) => {
                        const share = safePercent(operadora.valor, totalOperadoras)
                        return (
                          <div key={operadora.operadora} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5">
                            <div className="grid grid-cols-[28px_minmax(0,1fr)_96px_64px] items-center gap-3">
                              <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">{String(index + 1).padStart(2, '0')}</span>
                              <div className="min-w-0">
                                <p className="truncate text-sm font-medium text-slate-950">{operadora.operadora}</p>
                                <div className="mt-1 h-2 rounded-full bg-slate-100">
                                  <div className="h-2 rounded-full bg-slate-900" style={{ width: `${Math.min(share, 100)}%` }} />
                                </div>
                              </div>
                              <span className="text-right text-[11px] font-semibold text-slate-900">{formatCurrency(operadora.valor)}</span>
                              <span className="text-right text-[11px] font-semibold text-slate-600">{formatPercent(share)}</span>
                            </div>
                            <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                              <span>Custo</span>
                              <span className="font-medium text-slate-900">{formatCurrency(operadora.custo)}</span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </Panel>
              </div>
            </PrintPageShell>

            <PrintPageShell
              sectionLabel="Cobertura"
              title="Cobertura assistencial"
              description="Leitura operacional da cobertura por acomodação, horas atendidas e status assistenciais da base."
              periodoLabel={periodoLabel}
              operadoraLabel={operadoraLabel}
              generatedAt={generatedAt}
              pageNumber={9}
              totalPages={totalPages}
              detail={`${reportData.pacientes.length} pacientes na base`}
            >
              <div className="grid h-full min-h-0 grid-cols-[1.05fr_0.95fr] gap-3">
                <Panel title="Cobertura por acomodação" subtitle="Distribuição dos pacientes por modalidade assistencial." className="h-full">
                  {coberturaAcomodacao.length === 0 ? (
                    <EmptyState message="Não há dados de acomodação para resumir nesta página." />
                  ) : (
                    <div className="space-y-3">
                      {coberturaAcomodacao.map((item, index) => {
                        const share = safePercent(item.pacientes, reportData.pacientes.length)
                        return (
                          <div key={item.tipo} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">
                            <div className="flex items-center justify-between gap-3">
                              <span className="text-sm font-medium text-slate-950">{item.label}</span>
                              <span className="text-[11px] font-semibold text-slate-600">{formatPercent(share)}</span>
                            </div>
                            <div className="mt-2 h-2 rounded-full bg-slate-200">
                              <div
                                className="h-2 rounded-full"
                                style={{
                                  width: `${Math.min(share, 100)}%`,
                                  backgroundColor: CHART_COLORS[index % CHART_COLORS.length],
                                }}
                              />
                            </div>
                            <div className="mt-2 grid grid-cols-2 gap-2 text-[11px] text-slate-500">
                              <span>Pacientes</span>
                              <span className="text-right font-medium text-slate-900">{formatNumber(item.pacientes)}</span>
                              <span>Custo acumulado</span>
                              <span className="text-right font-medium text-slate-900">{formatCurrency(item.custo)}</span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </Panel>

                <div className="grid min-h-0 grid-rows-[auto_minmax(0,1fr)] gap-3">
                  <Panel title="Distribuição de horas atendidas" subtitle="Somatório financeiro das faixas de cobertura registradas.">
                    {coberturaHoras.every((item) => item.valor === 0) ? (
                      <EmptyState message="Não há horas registradas para compor a distribuição." />
                    ) : (
                      <div className="space-y-3">
                        {coberturaHoras.map((item, index) => {
                          const share = safePercent(item.valor, totalCoberturaHoras)
                          return (
                            <div key={item.faixa}>
                              <div className="mb-1.5 flex items-center justify-between text-[11px]">
                                <span className="font-medium text-slate-900">{item.faixa}</span>
                                <span className="text-slate-500">{formatCurrency(item.valor)} • {formatPercent(share)}</span>
                              </div>
                              <div className="h-2 rounded-full bg-slate-100">
                                <div
                                  className="h-2 rounded-full"
                                  style={{
                                    width: `${Math.min(share, 100)}%`,
                                    backgroundColor: CHART_COLORS[index % CHART_COLORS.length],
                                  }}
                                />
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </Panel>

                  <Panel title="Status assistenciais" subtitle="Situação operacional consolidada dos pacientes no filtro atual." className="h-full">
                    {statusResumo.length === 0 ? (
                      <EmptyState message="Sem status assistenciais disponíveis para esta base." />
                    ) : (
                      <div className="grid h-full min-h-0 grid-cols-2 gap-2.5">
                        {statusResumo.map((item) => (
                          <div key={item.status} className="rounded-xl border border-slate-200 bg-white px-3 py-3">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-sm font-medium text-slate-950">{item.label}</span>
                              <span
                                className="inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium"
                                style={{ backgroundColor: `${item.cor}20`, color: item.cor }}
                              >
                                {formatNumber(item.count)}
                              </span>
                            </div>
                            <p className="mt-2 text-[11px] leading-4 text-slate-500">
                              {formatPercent(safePercent(item.count, reportData.pacientes.length))} da base assistencial.
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </Panel>
                </div>
              </div>
            </PrintPageShell>

            {patientPages.map((rows, index) => (
              <TablePage
                key={`patients-page-${index}`}
                pageNumber={index + FIXED_SECTION_COUNT + 1}
                totalPages={totalPages}
                periodoLabel={periodoLabel}
                operadoraLabel={operadoraLabel}
                generatedAt={generatedAt}
                rows={rows}
                rowOffset={index * PATIENTS_PER_PAGE}
                totalRows={sortedPatients.length}
                statusMap={statusMap}
              />
            ))}
          </>
        )}
      </main>
    </div>
  )
}
