// Only the types are exported here. The logic was moved to api/sheets.ts

// ---------------------------------------------------------------------------
// Types — mirror the shapes expected by App.tsx components
// ---------------------------------------------------------------------------

export interface DashboardData {
  kpis: {
    valorTotalPago: number
    mediaMensalPaga: number
    valorTotalGlosado: number
    mediaMensalGlosado: number
    pacientesDistintos: number
    custoMedioPaciente: number
  }
  faturamentoMensal: { mes: string; valor: number }[]
  distribuicaoAssistencia: { tipo: string; valor: number; cor: string }[]
  tipoProcedimento: { procedimento: string; valor: number }[]
  distribuicaoMunicipio: { municipio: string; valor: number }[]
  perfilSexo: { sexo: string; percentual: number; cor: string }[]
  valorOperadora: { operadora: string; valor: number }[]
  tipoAcomodacao: { tipo: string; label: string; valor: number; cor: string }[]
  tipoGuia: { tipo: string; valor: number }
  areaPrestador: { area: string; valor: number }
  tipoDespesa: { tipo: string; valor: number }
  pacientes: {
    id: number
    nome: string
    municipio: string
    status: string
    custo: number
    operadora: string
    acomodacao: string
    horasAtendimento?: { '3h': number; '6h': number; '12h': number; '24h': number }
  }[]
  refProcedimentos?: { procedimento: string; dataCriacao: string; valor: number; ativo: boolean }[]
}
