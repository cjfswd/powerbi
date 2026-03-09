// Only the types are exported here. The logic was moved to api/sheets.ts

// ---------------------------------------------------------------------------
// Types — mirror the shapes expected by App.tsx components
// ---------------------------------------------------------------------------

export interface DashboardData {
  kpis: {
    valorTotalPago: number
    custoTotal: number
    resultadoBruto: number
    mediaMensalPaga: number
    valorTotalGlosado: number
    mediaMensalGlosado: number
    pacientesDistintos: number
    custoMedioPaciente: number
  }
  faturamentoMensal: { mes: string; valor: number; custo: number }[]
  distribuicaoAssistencia: { tipo: string; valor: number; custo: number; cor: string }[]
  tipoProcedimento: { procedimento: string; valor: number; custo: number }[]
  distribuicaoMunicipio: { municipio: string; valor: number; custo: number }[]
  perfilSexo: { sexo: string; percentual: number; cor: string }[]
  valorOperadora: { operadora: string; valor: number; custo: number }[]
  tipoAcomodacao: { tipo: string; label: string; valor: number; custo: number; cor: string }[]
  tipoGuia: { tipo: string; valor: number; custo: number }
  areaPrestador: { area: string; valor: number; custo: number }
  tipoDespesa: { tipo: string; valor: number; custo: number }
  todasOperadoras: string[]
  pacientes: {
    id: number
    nome: string
    municipio: string
    status: string
    custo: number
    custoReal: number
    operadora: string
    acomodacao: string
    horasAtendimento?: { '3h': number; '6h': number; '12h': number; '24h': number }
  }[]
  refProcedimentos?: { procedimento: string; dataCriacao: string; precoCusto: number; precoVenda: number; ativo: boolean }[]
  faixaEtaria: {
    faixa: string
    descricao: string
    qtd: number
    percentual: number
    valorFaturado: number
    valorCusto: number
    valorGlosado: number
  }[]
  todosAnos?: number[]
  todosMeses?: string[]
  prBase: any[][]
}
