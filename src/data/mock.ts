// Dados mockados baseados no dashboard real HealthMais 2025

export const kpis = {
  valorTotalPago: 4651945.64,
  mediaMensalPaga: 775324.27,
  valorTotalGlosado: 0,
  mediaMensalGlosado: 0,
  pacientesDistintos: 110,
  custoMedioPaciente: 42290.41,
}

export const distribuicaoAssistencia = [
  { tipo: "24h", valor: 2958329.38, cor: "#2563eb" },
  { tipo: "Assistência", valor: 384198.79, cor: "#7c3aed" },
  { tipo: "12h", valor: 250710.30, cor: "#db2777" },
  { tipo: "Fisioterapia", valor: 154860.00, cor: "#ea580c" },
  { tipo: "48h", valor: 65544.00, cor: "#65a30d" },
  { tipo: "06h", valor: 25831.86, cor: "#0891b2" },
]

export const tipoProcedimento = [
  { procedimento: "Pacote Internação", valor: 4290154.60 },
  { procedimento: "Fisioterapia", valor: 183606.87 },
  { procedimento: "Terapia c/ Método", valor: 65460.00 },
  { procedimento: "Terapia Simples", valor: 50168.06 },
  { procedimento: "Diária", valor: 28891.66 },
  { procedimento: "Honorário Médico", valor: 18009.00 },
  { procedimento: "Taxa", valor: 6939.60 },
  { procedimento: "Medicamento", valor: 6068.77 },
  { procedimento: "Material", valor: 2151.58 },
  { procedimento: "Dieta", valor: 405.30 },
]

export const distribuicaoMunicipio = [
  { municipio: "Nova Iguaçu", valor: 2161398.80 },
  { municipio: "Rio de Janeiro", valor: 834502.62 },
  { municipio: "Belford Roxo", valor: 395749.30 },
  { municipio: "S. J. de Meriti", valor: 368919.38 },
  { municipio: "Queimados", valor: 304963.00 },
  { municipio: "Mesquita", valor: 264303.00 },
]

export const perfilSexo = [
  { sexo: "Masculino", percentual: 69.94, cor: "#2563eb" },
  { sexo: "Feminino", percentual: 30.06, cor: "#db2777" },
]

export const valorOperadora = [
  { operadora: "Unimed Nova Iguaçu", valor: 3108067.59 },
  { operadora: "Camperj", valor: 1543878.05 },
]

export const tipoAcomodacao = [
  { tipo: "ID", label: "Internação Domiciliar", valor: 3577064.84, cor: "#2563eb" },
  { tipo: "AD", label: "Atendimento Domiciliar", valor: 1074880.80, cor: "#7c3aed" },
]

export const faturamentoMensal = [
  { mes: "Jan", valor: 680000 },
  { mes: "Fev", valor: 720000 },
  { mes: "Mar", valor: 810000 },
  { mes: "Abr", valor: 790000 },
  { mes: "Mai", valor: 830000 },
  { mes: "Jun", valor: 821945.64 },
]

export const tipoGuia = { tipo: "SP/SADT", valor: 4651945.64 }

export const areaPrestador = { area: "Rio de Janeiro", valor: 4651945.64 }

export const tipoDespesa = { tipo: "Atendimento Domiciliar", valor: 4651945.64 }

// Dados de pacientes com status
export const pacientes = [
  { id: 1, nome: "João Silva", municipio: "Nova Iguaçu", status: "Internação", custo: 45230.50, operadora: "Unimed Nova Iguaçu", acomodacao: "ID", horasAtendimento: { "3h": 5230.50, "6h": 8500.00, "12h": 15000.00, "24h": 16500.00 } },
  { id: 2, nome: "Maria Santos", municipio: "Rio de Janeiro", status: "Alta", custo: 38500.00, operadora: "Camperj", acomodacao: "AD" },
  { id: 3, nome: "Carlos Oliveira", municipio: "Belford Roxo", status: "Óbito", custo: 52000.00, operadora: "Unimed Nova Iguaçu", acomodacao: "ID", horasAtendimento: { "3h": 7000.00, "6h": 10000.00, "12h": 18000.00, "24h": 17000.00 } },
  { id: 4, nome: "Ana Costa", municipio: "Nova Iguaçu", status: "Ouvidoria", custo: 41200.00, operadora: "Camperj", acomodacao: "AD" },
  { id: 5, nome: "Pedro Gomes", municipio: "S. J. de Meriti", status: "Internação", custo: 48900.00, operadora: "Unimed Nova Iguaçu", acomodacao: "ID", horasAtendimento: { "3h": 6200.00, "6h": 9700.00, "12h": 16500.00, "24h": 16500.00 } },
  { id: 6, nome: "Lucia Ferreira", municipio: "Nova Iguaçu", status: "Alta", custo: 39800.00, operadora: "Camperj", acomodacao: "AD" },
  { id: 7, nome: "Roberto Alves", municipio: "Queimados", status: "Internação", custo: 44500.00, operadora: "Unimed Nova Iguaçu", acomodacao: "ID", horasAtendimento: { "3h": 5500.00, "6h": 8200.00, "12h": 14800.00, "24h": 16000.00 } },
  { id: 8, nome: "Fernanda Lima", municipio: "Rio de Janeiro", status: "Óbito", custo: 50100.00, operadora: "Camperj", acomodacao: "AD" },
  { id: 9, nome: "Gustavo Martins", municipio: "Mesquita", status: "Alta", custo: 36200.00, operadora: "Unimed Nova Iguaçu", acomodacao: "ID", horasAtendimento: { "3h": 4800.00, "6h": 7500.00, "12h": 12000.00, "24h": 11900.00 } },
  { id: 10, nome: "Patricia Rocha", municipio: "Nova Iguaçu", status: "Ouvidoria", custo: 42800.00, operadora: "Camperj", acomodacao: "AD" },
]

// Mapa de status com cores
export const statusPacienteConfig = {
  "Internação": { label: "Internação", cor: "#3b82f6", icon: "🏥" },
  "Alta": { label: "Alta", cor: "#10b981", icon: "✓" },
  "Óbito": { label: "Óbito", cor: "#ef4444", icon: "⚠️" },
  "Ouvidoria": { label: "Ouvidoria", cor: "#f59e0b", icon: "📋" },
}

