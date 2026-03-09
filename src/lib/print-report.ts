import type { DashboardData } from '@/lib/sheets'

export const PRINT_REPORT_STORAGE_KEY = '@powerbi:printSnapshot'

export type PrintStatusConfig = Record<string, {
  label: string
  cor?: string
  icon?: string
}>

export interface PrintReportFilters {
  operadora: string
  ano: string
  mes: string
}

export interface PrintReportData extends Pick<
  DashboardData,
  | 'kpis'
  | 'faturamentoMensal'
  | 'distribuicaoAssistencia'
  | 'tipoProcedimento'
  | 'distribuicaoMunicipio'
  | 'perfilSexo'
  | 'valorOperadora'
  | 'pacientes'
  | 'faixaEtaria'
> {}

export interface PrintReportSnapshot {
  generatedAt: string
  filters: PrintReportFilters
  data: PrintReportData
  statusPacienteConfig: PrintStatusConfig
}

export function savePrintReportSnapshot(snapshot: PrintReportSnapshot) {
  if (typeof window === 'undefined') return

  window.localStorage.setItem(PRINT_REPORT_STORAGE_KEY, JSON.stringify(snapshot))
}

export function readPrintReportSnapshot(): PrintReportSnapshot | null {
  if (typeof window === 'undefined') return null

  const raw = window.localStorage.getItem(PRINT_REPORT_STORAGE_KEY)
  if (!raw) return null

  try {
    return JSON.parse(raw) as PrintReportSnapshot
  } catch (error) {
    console.error('Falha ao ler snapshot de impressão:', error)
    return null
  }
}
