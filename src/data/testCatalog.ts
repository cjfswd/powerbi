export type TestKind = "unit" | "integration" | "e2e" | "manual"

export type TestItem = {
  id: string
  title: string
  description: string
  file: string
  command: string
  kind: TestKind
}

export type TestSection = {
  id: string
  title: string
  description: string
  items: TestItem[]
}

const automatedCommand = "npm test"

export const testSections: TestSection[] = [
  {
    id: "unit",
    title: "Vitest: API e utilitarios",
    description: "Cobertura das rotas serverless e dos helpers de leitura do Google Sheets.",
    items: [
      {
        id: "api-patients",
        title: "API de pacientes",
        description: "Valida insercao, edicao, mapeamento de colunas e respostas de erro em /api/patients.",
        file: "src/__tests__/api-patients.test.ts",
        command: automatedCommand,
        kind: "unit",
      },
      {
        id: "api-procedimentos",
        title: "API de procedimentos",
        description: "Valida insercao de referencia, atualizacao, lote de realizados e validacao de metodo.",
        file: "src/__tests__/api-procedimentos.test.ts",
        command: automatedCommand,
        kind: "unit",
      },
      {
        id: "api-sheets",
        title: "API consolidada de sheets",
        description: "Confere calculos usando venda_total/custo_total e consistencia do filtro por ano.",
        file: "src/__tests__/api-sheets.test.ts",
        command: automatedCommand,
        kind: "unit",
      },
      {
        id: "sheets-helpers",
        title: "Helpers de sheets",
        description: "Garante coercao segura, leitura sem cabecalho e ausencia do parametro _t na URL do Google.",
        file: "src/__tests__/sheets-helpers.test.ts",
        command: automatedCommand,
        kind: "unit",
      },
    ],
  },
  {
    id: "integration",
    title: "Vitest: integracao",
    description: "Fluxos entre contexto, componentes e estados de interface.",
    items: [
      {
        id: "dashboard-context",
        title: "DashboardDataContext",
        description: "Valida carregamento inicial, refreshData, cache busting e atualizacao do contexto.",
        file: "src/__tests__/integration/DashboardDataContext.test.tsx",
        command: automatedCommand,
        kind: "integration",
      },
      {
        id: "form-procedimento",
        title: "Formulario de procedimentos",
        description: "Cobre criacao, edicao, mensagens de erro e tabela exibida ao usuario.",
        file: "src/__tests__/integration/FormProcedimento.test.tsx",
        command: automatedCommand,
        kind: "integration",
      },
      {
        id: "report-print-view",
        title: "Relatorio para impressao",
        description: "Garante as secoes fixas e a paginacao correta da base analitica.",
        file: "src/__tests__/integration/ReportPrintView.test.tsx",
        command: automatedCommand,
        kind: "integration",
      },
    ],
  },
  {
    id: "e2e",
    title: "Playwright: ponta a ponta",
    description: "Teste real da navegacao e dos principais comportamentos da aba de procedimentos.",
    items: [
      {
        id: "e2e-procedimentos",
        title: "Gerenciar procedimentos",
        description: "Valida leitura, busca, edicao, cancelamento e inclusao na fila via interface.",
        file: "e2e/procedimentos.spec.ts",
        command: "npm run test:e2e",
        kind: "e2e",
      },
    ],
  },
  {
    id: "manual",
    title: "Scripts de diagnostico",
    description: "Utilitarios manuais que existiam soltos na raiz e agora ficam catalogados nesta pagina.",
    items: [
      {
        id: "manual-handler",
        title: "Smoke test do handler /api/sheets",
        description: "Executa o handler localmente com mocks minimos para capturar status, headers e payload.",
        file: "scripts/manual-tests/test_handler.ts",
        command: "npm run test:manual:handler",
        kind: "manual",
      },
      {
        id: "manual-sheets",
        title: "Leitura direta da aba REF_Procedimentos",
        description: "Inspeciona as linhas retornadas pelo Google Sheets e o texto bruto do procedimento.",
        file: "scripts/manual-tests/test_sheets.ts",
        command: "npm run test:manual:sheets",
        kind: "manual",
      },
      {
        id: "manual-t-param",
        title: "Reproducao do parametro _t",
        description: "Monta a URL de batchGet para verificar o comportamento do Google Sheets com cache busting.",
        file: "scripts/manual-tests/test_t_param.ts",
        command: "npm run test:manual:t-param",
        kind: "manual",
      },
      {
        id: "diagnose-api",
        title: "Inspecao rapida da API local",
        description: "Consulta /api/sheets em localhost e imprime agregacoes de assistencia, sexo e acomodacao.",
        file: "scripts/diagnostics/check_api.ts",
        command: "npm run test:diagnose:api",
        kind: "manual",
      },
      {
        id: "diagnose-sheets",
        title: "Diagnostico de ranges do Google Sheets",
        description: "Busca ranges-chave e imprime amostras para comparar com o dashboard.",
        file: "scripts/diagnostics/diagnose_sheets.ts",
        command: "npm run test:diagnose:sheets",
        kind: "manual",
      },
      {
        id: "diagnose-reproduce",
        title: "Reproducao isolada do crash",
        description: "Roda o handler de sheets fora da interface para reproduzir erros de execucao.",
        file: "scripts/diagnostics/reproduce_error.ts",
        command: "npm run test:diagnose:reproduce",
        kind: "manual",
      },
    ],
  },
]

export const testSummary = {
  total: testSections.reduce((total, section) => total + section.items.length, 0),
  automated: testSections.reduce(
    (total, section) => total + section.items.filter((item) => item.kind !== "manual").length,
    0,
  ),
  manual: testSections.reduce(
    (total, section) => total + section.items.filter((item) => item.kind === "manual").length,
    0,
  ),
}
