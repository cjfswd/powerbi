// Dados mockados baseados no dashboard real HealthMais 2025

export const kpis = {
  valorTotalPago: 4651945.64,
  mediaMensalPaga: 775324.27,
  valorTotalGlosado: 0,
  mediaMensalGlosado: 0,
  beneficiariosDistintos: 110,
  custoMedioBeneficiario: 42290.41,
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

export const valorPrestador = [
  { prestador: "Healthcare Gestão em Saúde Ltda", valor: 3108067.59 },
  { prestador: "HealthMais Cuidados e Gestão Ltda", valor: 1543878.05 },
]

export const tipoAcomodacao = [
  { tipo: "Enfermaria", valor: 3577064.84, cor: "#2563eb" },
  { tipo: "Apartamento", valor: 1074880.80, cor: "#7c3aed" },
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
