import React from "react"
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, Legend
} from "recharts"
import {
  DollarSign, Users, TrendingUp, Building2, MapPin,
  Activity, ChevronDown, ChevronUp, Loader2,
  LayoutDashboard, ClipboardList, Map, Briefcase, BarChart2, Clock, FileText, PlusCircle, FlaskConical
} from "lucide-react"

import { useDashboard } from "@/lib/DashboardDataContext"
import { ComboboxFilter } from "@/components/ui/combobox-filter"
import { DataEntry } from "@/components/DataEntry"
import { AuthProvider, useAuth } from "@/lib/AuthContext"
import { Login } from "@/components/Login"
import ReportPrintView from "@/components/ReportPrintView"
import { PDFExportButton } from "@/components/PDFExportButton"
import { TestesPage } from "@/components/TestesPage"

function formatCurrency(value: number) {
  const safeValue = typeof value === 'number' ? value : 0
  return safeValue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

function formatCompact(value: number) {
  if (value >= 1_000_000) return `R$ ${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `R$ ${(value / 1_000).toFixed(0)}K`
  return formatCurrency(value)
}

function calculatePercent(part: number, total: number) {
  if (!Number.isFinite(part) || !Number.isFinite(total) || total <= 0) return 0
  return (part / total) * 100
}

const COLORS = ["#2563eb", "#7c3aed", "#db2777", "#ea580c", "#65a30d", "#0891b2", "#d97706", "#6366f1", "#14b8a6", "#f43f5e"]

function CustomTooltipCurrency({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border bg-background p-3 shadow-md">
      <p className="font-medium mb-2">{label}</p>
      {payload.map((entry: any, i: number) => (
        <div key={i} className="flex justify-between gap-4 text-sm items-center">
          <span className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color || entry.fill }} />
            <span className="text-muted-foreground">{entry.name}:</span>
          </span>
          <span className="font-bold" style={{ color: entry.color || entry.fill }}>
            {formatCurrency(entry.value)}
          </span>
        </div>
      ))}
      {payload.length === 2 && (
        <div className="mt-2 pt-2 border-t flex justify-between gap-4 text-sm items-center">
          <span className="text-muted-foreground italic">Resultado:</span>
          <span className="font-bold text-green-600">
            {formatCurrency(payload[0].value - payload[1].value)}
          </span>
        </div>
      )}
    </div>
  )
}

function KpiCard({ title, value, icon: Icon, description, variant = "default" }: {
  title: string
  value: string
  icon: any
  description?: string
  variant?: "default" | "success" | "warning"
}) {
  const iconColors = {
    default: "text-blue-600 bg-blue-100",
    success: "text-green-600 bg-green-100",
    warning: "text-amber-600 bg-amber-100",
  }
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className={`rounded-md p-2 ${iconColors[variant]}`}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
      </CardContent>
    </Card>
  )
}

function KpiSection() {
  const { kpis } = useDashboard()
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      <KpiCard
        title="Faturamento Total"
        value={formatCompact(kpis.valorTotalPago)}
        icon={DollarSign}
        description="Faturamento Exercício"
      />
      <KpiCard
        title="Custo Total"
        value={formatCompact(kpis.custoTotal)}
        icon={Activity}
        description="Custo dos Realizados"
      />
      <KpiCard
        title="Resultado Bruto"
        value={formatCompact(kpis.resultadoBruto)}
        icon={TrendingUp}
        description="Margem Bruta"
      />
      <KpiCard
        title="Pacientes Ativos"
        value={kpis.pacientesDistintos.toString()}
        icon={Users}
        description="Total de Pacientes"
      />
      <KpiCard
        title="Média Mensal"
        value={formatCompact(kpis.mediaMensalPaga)}
        icon={DollarSign}
        description="Faturamento/mês"
      />
      <KpiCard
        title="Custo Médio/Pcte"
        value={formatCompact(kpis.custoMedioPaciente)}
        icon={Activity}
        description="Despesa média"
      />
    </div>
  )
}

function FaturamentoMensalChart() {
  const { faturamentoMensal } = useDashboard()
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Faturamento Mensal 2025</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={faturamentoMensal}>
            <defs>
              <linearGradient id="colorFat" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorCusto" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="mes" className="text-xs" />
            <YAxis tickFormatter={(v) => formatCompact(v)} className="text-xs" />
            <Tooltip content={<CustomTooltipCurrency />} />
            <Legend verticalAlign="top" height={36}/>
            <Area name="Venda" type="monotone" dataKey="valor" stroke="#2563eb" strokeWidth={2} fill="url(#colorFat)" />
            <Area name="Custo" type="monotone" dataKey="custo" stroke="#ef4444" strokeWidth={2} fill="url(#colorCusto)" />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

function DistribuicaoAssistenciaChart() {
  const { distribuicaoAssistencia } = useDashboard()
  const data = distribuicaoAssistencia.map(item => ({
    ...item,
    valorEpsilon: item.valor === 0 ? 0.1 : item.valor
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Tipo de Assistência</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={3}
              dataKey="valorEpsilon"
              nameKey="tipo"
            >
              {data.map((entry, index) => (
                <Cell key={index} fill={entry.cor} />
              ))}
            </Pie>
            <Tooltip formatter={(_valor: any, _name: any, props: any) => [formatCurrency(props.payload.valor), 'Valor']} />
            <Legend layout="horizontal" verticalAlign="bottom" align="center" iconType="square" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

function TipoProcedimentoChart() {
  const { tipoProcedimento } = useDashboard()
  return (
    <Card className="col-span-full lg:col-span-2">
      <CardHeader>
        <CardTitle className="text-base">Valor por Tipo de Procedimento</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={tipoProcedimento} layout="vertical" margin={{ left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis type="number" tickFormatter={(v) => formatCompact(v)} className="text-xs" />
            <YAxis dataKey="procedimento" type="category" width={130} className="text-xs" />
            <Tooltip content={<CustomTooltipCurrency />} />
            <Legend verticalAlign="top" height={36}/>
            <Bar name="Venda" dataKey="valor" fill="#2563eb" radius={[0, 4, 4, 0]} />
            <Bar name="Custo" dataKey="custo" fill="#ef4444" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

function MunicipioChart() {
  const { distribuicaoMunicipio } = useDashboard()
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Distribuição por Município</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={distribuicaoMunicipio}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="municipio" className="text-xs" angle={-25} textAnchor="end" height={60} />
            <YAxis tickFormatter={(v) => formatCompact(v)} className="text-xs" />
            <Tooltip content={<CustomTooltipCurrency />} />
            <Legend verticalAlign="top" height={36}/>
            <Bar name="Venda" dataKey="valor" fill="#2563eb" radius={[4, 4, 0, 0]} />
            <Bar name="Custo" dataKey="custo" fill="#ef4444" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

function SexoChart() {
  const { perfilSexo } = useDashboard()
  const data = perfilSexo.map(item => ({
    ...item,
    percentualEpsilon: item.percentual === 0 ? 0.1 : item.percentual
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Perfil Beneficiários (Sexo)</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center justify-center">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={4}
              dataKey="percentualEpsilon"
              nameKey="sexo"
            >
              {data.map((entry, index) => (
                <Cell key={index} fill={entry.cor} />
              ))}
            </Pie>
            <Tooltip formatter={(_val: any, _name: any, props: any) => [`${props.payload.percentual}%`, 'Percentual']} />
            <Legend layout="horizontal" verticalAlign="bottom" align="center" iconType="square" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

function OperadoraChart() {
  const { valorOperadora } = useDashboard()
  const total = valorOperadora.reduce((s, p) => s + p.valor, 0)
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Valor por Operadora</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {valorOperadora.map((p, i) => {
            const pct = calculatePercent(p.valor, total)
            const pctLabel = pct.toFixed(1)
            return (
              <div key={i} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium truncate max-w-[200px]">{p.operadora}</span>
                  <span className="text-muted-foreground">{pctLabel}%</span>
                </div>
                <div className="h-3 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${Math.min(100, Math.max(0, pct))}%`, backgroundColor: COLORS[i % COLORS.length] }}
                  />
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-blue-600 font-medium">V: {formatCurrency(p.valor)}</span>
                  <span className="text-red-500 font-medium">C: {formatCurrency(p.custo)}</span>
                  <span className="text-green-600 font-bold">R: {formatCurrency(p.valor - p.custo)}</span>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

const FAIXA_CORES: Record<string, string> = {
  "0-11": "#2563eb",
  "12-17": "#7c3aed",
  "18-29": "#db2777",
  "30-59": "#ea580c",
  "60-79": "#65a30d",
  "80+": "#0891b2",
  "S/I": "#94a3b8",
}

function FaixaEtariaChart() {
  const { faixaEtaria } = useDashboard()
  return (
    <Card className="col-span-full lg:col-span-2">
      <CardHeader>
        <CardTitle className="text-base">Distribuição por Faixa Etária</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={faixaEtaria}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="faixa" className="text-xs" />
            <YAxis tickFormatter={(v) => formatCompact(v)} className="text-xs" />
            <Tooltip content={<CustomTooltipCurrency />} />
            <Legend verticalAlign="top" height={36}/>
            <Bar name="Venda" dataKey="valorFaturado" fill="#2563eb" radius={[4, 4, 0, 0]} />
            <Bar name="Custo" dataKey="valorCusto" fill="#ef4444" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

function AcomodacaoChart() {
  const { tipoAcomodacao } = useDashboard()
  const data = tipoAcomodacao.map(item => ({
    ...item,
    valorEpsilon: item.valor === 0 ? 0.1 : item.valor
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Tipo de Acomodação</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center justify-center">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={4}
              dataKey="valorEpsilon"
              nameKey="label"
            >
              {data.map((entry, index) => (
                <Cell key={index} fill={entry.cor} />
              ))}
            </Pie>
            <Tooltip formatter={(_val: any, _name: any, props: any) => [formatCurrency(props.payload.valor), 'Valor']} />
            <Legend layout="horizontal" verticalAlign="bottom" align="center" iconType="square" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

function ProcedimentoTable() {
  const { tipoProcedimento, kpis, loading } = useDashboard()
  return (
    <Card className="relative overflow-hidden">
      {loading && (
        <div className="absolute inset-0 bg-background/50 backdrop-blur-[1px] z-20 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      )}
      <CardHeader>
        <CardTitle className="text-base">Detalhamento por Procedimento</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="table-container">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Procedimento</TableHead>
                <TableHead className="text-right">Custo</TableHead>
                <TableHead className="text-right">Venda</TableHead>
                <TableHead className="text-right">Resultado</TableHead>
                <TableHead className="text-right">% Fat.</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tipoProcedimento.map((p, i) => {
                const pct = calculatePercent(p.valor, kpis.valorTotalPago).toFixed(1)
                const resultado = p.valor - p.custo
                return (
                  <TableRow key={i}>
                    <TableCell className="font-medium whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                        {p.procedimento}
                      </div>
                    </TableCell>
                    <TableCell className="text-right text-red-600 whitespace-nowrap">{formatCurrency(p.custo)}</TableCell>
                    <TableCell className="text-right text-blue-600 whitespace-nowrap">{formatCurrency(p.valor)}</TableCell>
                    <TableCell className={`text-right font-bold whitespace-nowrap ${resultado >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {formatCurrency(resultado)}
                    </TableCell>
                    <TableCell className="text-right whitespace-nowrap">{pct}%</TableCell>
                  </TableRow>
                )
              })}
              <TableRow className="font-bold bg-muted/50">
                <TableCell>Total</TableCell>
                <TableCell className="text-right text-red-600">{formatCurrency(kpis.custoTotal)}</TableCell>
                <TableCell className="text-right text-blue-600">{formatCurrency(kpis.valorTotalPago)}</TableCell>
                <TableCell className="text-right text-green-600">{formatCurrency(kpis.resultadoBruto)}</TableCell>
                <TableCell className="text-right">100%</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

function AtendimentoHorasChart() {
  const { pacientes, globalOperadora, loading } = useDashboard()
  // Aggregate attendance hours from all patients with ID accommodation
  let patientsComHoras = pacientes.filter(p => (p as any).horasAtendimento)
  if (globalOperadora !== 'todas') {
    patientsComHoras = patientsComHoras.filter(p => p.operadora === globalOperadora)
  }

  const horasData = {
    "3h": 0,
    "6h": 0,
    "12h": 0,
    "24h": 0,
  }

  patientsComHoras.forEach(p => {
    const horas = (p as any).horasAtendimento || {}
    Object.entries(horas).forEach(([hora, valor]) => {
      horasData[hora as keyof typeof horasData] += valor as number
    })
  })

  const chartData = Object.entries(horasData).map(([hora, valor]) => ({
    horas: hora,
    valor,
  }))

  const total = Object.values(horasData).reduce((a, b) => a + b, 0)

  return (
    <Card className="relative overflow-hidden">
      {loading && (
        <div className="absolute inset-0 bg-background/50 backdrop-blur-[1px] z-20 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      )}
      <CardHeader>
        <CardTitle className="text-base">Atendimento por Horas - Análise Geral</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Gráfico de Barras */}
        <div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="horas" />
              <YAxis />
              <Tooltip content={<CustomTooltipCurrency />} />
              <Bar dataKey="valor" fill="#2563eb" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Cards com Resumo */}
        <div className="grid gap-4 md:grid-cols-4">
          {chartData.map((item) => {
            const pct = ((item.valor / total) * 100).toFixed(1)
            return (
              <div key={item.horas} className="p-4 rounded-lg border bg-muted/50">
                <p className="text-sm font-medium text-muted-foreground mb-2">{item.horas}</p>
                <p className="text-xl font-bold">{formatCompact(item.valor)}</p>
                <p className="text-xs text-muted-foreground mt-1">{pct}% do total</p>
              </div>
            )
          })}
        </div>

        {/* Tabela com Detalhes por Paciente */}
        <div className="pt-6 border-t">
          <h3 className="text-sm font-medium mb-4">Detalhamento por Paciente</h3>
          <div className="table-container">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="whitespace-nowrap">Paciente</TableHead>
                  <TableHead className="whitespace-nowrap">Municipio</TableHead>
                  <TableHead className="whitespace-nowrap">Operadora</TableHead>
                  <TableHead className="text-right whitespace-nowrap">3h</TableHead>
                  <TableHead className="text-right whitespace-nowrap">6h</TableHead>
                  <TableHead className="text-right whitespace-nowrap">12h</TableHead>
                  <TableHead className="text-right whitespace-nowrap">24h</TableHead>
                  <TableHead className="text-right whitespace-nowrap">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {patientsComHoras.map(p => {
                  const horas = (p as any).horasAtendimento || {}
                  const subtotal = Object.values(horas).reduce((a: number, b) => a + (b as number), 0)
                  return (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium whitespace-nowrap">{p.nome}</TableCell>
                      <TableCell className="text-sm whitespace-nowrap">{p.municipio}</TableCell>
                      <TableCell className="text-sm truncate max-w-[150px] whitespace-nowrap">{p.operadora}</TableCell>
                      <TableCell className="text-right text-sm whitespace-nowrap">{formatCurrency(horas["3h"] as number || 0)}</TableCell>
                      <TableCell className="text-right text-sm whitespace-nowrap">{formatCurrency(horas["6h"] as number || 0)}</TableCell>
                      <TableCell className="text-right text-sm whitespace-nowrap">{formatCurrency(horas["12h"] as number || 0)}</TableCell>
                      <TableCell className="text-right text-sm whitespace-nowrap">{formatCurrency(horas["24h"] as number || 0)}</TableCell>
                      <TableCell className="text-right font-medium whitespace-nowrap">{formatCurrency(subtotal)}</TableCell>
                    </TableRow>
                  )
                })}
                <TableRow className="font-bold bg-muted/50">
                  <TableCell colSpan={3}>Total</TableCell>
                  <TableCell className="text-right">{formatCurrency(horasData["3h"])}</TableCell>
                  <TableCell className="text-right">{formatCurrency(horasData["6h"])}</TableCell>
                  <TableCell className="text-right">{formatCurrency(horasData["12h"])}</TableCell>
                  <TableCell className="text-right">{formatCurrency(horasData["24h"])}</TableCell>
                  <TableCell className="text-right">{formatCurrency(total)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function AnaliticoPacientes() {
  const { pacientes, statusPacienteConfig, distribuicaoMunicipio, valorOperadora, globalOperadora, loading } = useDashboard()
  const [municipioFilter, setMunicipioFilter] = React.useState<string>("todos")
  const [statusFilter, setStatusFilter] = React.useState<string>("todos")
  const [operadoraFilter, setOperadoraFilter] = React.useState<string>("todas")
  const [expandedPatientId, setExpandedPatientId] = React.useState<number | null>(null)

  // Sync the local filter with the global filter when the global filter changes
  React.useEffect(() => {
    setOperadoraFilter(globalOperadora)
  }, [globalOperadora])

  const municipioOptions = [
    { label: "Todos os Municípios", value: "todos" },
    ...distribuicaoMunicipio.map(m => ({ label: m.municipio, value: m.municipio }))
  ]

  const statusList = ["todos", ...Object.keys(statusPacienteConfig)]
  const statusOptions = [
    { label: "Todos os Status", value: "todos" },
    ...Object.keys(statusPacienteConfig).map(s => ({
      label: statusPacienteConfig[s as keyof typeof statusPacienteConfig]?.label || s,
      value: s
    }))
  ]

  const operadoraOptions = [
    { label: "Todas as Operadoras", value: "todas" },
    ...valorOperadora.map(o => ({ label: o.operadora, value: o.operadora }))
  ]

  const pacientesFiltrados = pacientes.filter(p => {
    const municipioOk = municipioFilter === "todos" || p.municipio === municipioFilter
    const statusOk = statusFilter === "todos" || p.status === statusFilter
    const operadoraOk = operadoraFilter === "todas" || p.operadora === operadoraFilter
    return municipioOk && statusOk && operadoraOk
  })

  const custoTotal = pacientesFiltrados.reduce((s, p) => s + p.custoReal, 0)
  const faturamentoTotal = pacientesFiltrados.reduce((s, p) => s + p.custo, 0)
  const custoPorStatus = statusList.slice(1).map(status => ({
    status,
    quantidade: pacientesFiltrados.filter(p => p.status === status).length,
    faturamento: pacientesFiltrados.filter(p => p.status === status).reduce((s, p) => s + p.custo, 0),
  }))

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <label className="text-sm font-medium mb-2 block">Filtrar por Município</label>
            <ComboboxFilter
              options={municipioOptions}
              value={municipioFilter}
              onValueChange={setMunicipioFilter}
              placeholder="Selecione um município..."
              emptyMessage="Município não encontrado."
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <label className="text-sm font-medium mb-2 block">Filtrar por Status</label>
            <ComboboxFilter
              options={statusOptions}
              value={statusFilter}
              onValueChange={setStatusFilter}
              placeholder="Selecione um status..."
              emptyMessage="Status não encontrado."
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <label className="text-sm font-medium mb-2 block">Filtrar por Operadora</label>
            <ComboboxFilter
              options={operadoraOptions}
              value={operadoraFilter}
              onValueChange={setOperadoraFilter}
              placeholder="Selecione uma operadora..."
              emptyMessage="Operadora não encontrada."
            />
          </CardContent>
        </Card>
      </div>

      {/* KPIs de Filtro */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Pacientes</p>
            <p className="text-2xl font-bold">{pacientesFiltrados.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Faturamento</p>
            <p className="text-2xl font-bold text-blue-600">{formatCompact(faturamentoTotal)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Custo Total</p>
            <p className="text-2xl font-bold text-red-600">{formatCompact(custoTotal)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Resultado Bruto</p>
            <p className="text-2xl font-bold text-green-600">
              {formatCompact(faturamentoTotal - custoTotal)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Pacientes */}
      <Card className="relative overflow-hidden">
        {loading && (
          <div className="absolute inset-0 bg-background/50 backdrop-blur-[1px] z-20 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        )}
        <CardHeader>
          <CardTitle className="text-base">Detalhamento por Paciente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="table-container">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8"></TableHead>
                  <TableHead className="whitespace-nowrap">Paciente</TableHead>
                  <TableHead className="whitespace-nowrap">Município</TableHead>
                  <TableHead className="whitespace-nowrap">Status</TableHead>
                  <TableHead className="whitespace-nowrap">Acomodação</TableHead>
                  <TableHead className="whitespace-nowrap">Operadora</TableHead>
                  <TableHead className="text-right whitespace-nowrap">Custo</TableHead>
                  <TableHead className="text-right whitespace-nowrap">Faturado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pacientesFiltrados.map(p => {
                  const config = statusPacienteConfig[p.status as keyof typeof statusPacienteConfig]
                  const isExpanded = expandedPatientId === p.id
                  const hasHours = p.acomodacao === "ID" && (p as any).horasAtendimento
  
                  return (
                    <React.Fragment key={p.id}>
                      <TableRow
                        className={hasHours ? "cursor-pointer hover:bg-muted/50" : ""}
                        onClick={() => hasHours && setExpandedPatientId(isExpanded ? null : p.id)}
                      >
                        <TableCell className="w-8">
                          {hasHours && (
                            isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                          )}
                        </TableCell>
                        <TableCell className="font-medium whitespace-nowrap">{p.nome}</TableCell>
                        <TableCell className="whitespace-nowrap">{p.municipio}</TableCell>
                        <TableCell className="whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className="text-lg shrink-0">{config?.icon}</span>
                            <span className="px-2 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: config?.cor + "20", color: config?.cor }}>
                              {config?.label}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          <span className="px-2 py-1 rounded-md bg-muted text-xs font-medium">
                            {p.acomodacao}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm truncate max-w-[180px] whitespace-nowrap">{p.operadora}</TableCell>
                        <TableCell className="text-right font-medium text-red-600 whitespace-nowrap">{formatCurrency(p.custoReal)}</TableCell>
                        <TableCell className="text-right font-medium text-blue-600 whitespace-nowrap">{formatCurrency(p.custo)}</TableCell>
                      </TableRow>
  
                      {isExpanded && hasHours && (
                        <TableRow className="bg-muted/30">
                          <TableCell colSpan={8} className="p-4">
                            <div className="space-y-3">
                              <p className="font-medium text-sm">Detalhamento por Horas de Atendimento:</p>
                              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                                {Object.entries((p as any).horasAtendimento || {}).map(([horas, valor]) => (
                                  <div key={horas} className="p-3 rounded-lg border bg-background">
                                    <p className="text-xs text-muted-foreground mb-1">{horas}</p>
                                    <p className="font-bold text-sm">{formatCurrency(valor as number)}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Resumo por Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Resumo por Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {custoPorStatus.map(item => {
              const config = statusPacienteConfig[item.status as keyof typeof statusPacienteConfig]
              return (
                <div key={item.status} className="p-4 rounded-lg border" style={{ borderColor: config?.cor + "40" }}>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{config?.icon}</span>
                    <span className="font-medium">{config?.label}</span>
                  </div>
                  <p className="text-lg font-bold mt-2">Pacientes: {item.quantidade}</p>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function DashboardApp() {
  const {
    distribuicaoMunicipio,
    valorOperadora,
    todasOperadoras,
    kpis,
    globalOperadora,
    setGlobalOperadora,
    globalAno,
    setGlobalAno,
    globalMes,
    setGlobalMes,
    todosAnos,
    todosMeses,
    faixaEtaria,
  } = useDashboard()
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  // Map path to tab value (first segment only)
  const segments = location.pathname.split("/").filter(Boolean)
  const currentTab = segments[0] || "visao-geral"

  const handleTabChange = (value: string) => {
    if (value === "inserir") {
      navigate("/inserir/procedimento")
    } else {
      navigate(`/${value}`)
    }
  }

  const tabContentMap: Record<string, string> = {
    "visao-geral": "Visão Geral",
    "procedimentos": "Procedimentos",
    "geografico": "Geográfico",
    "operadoras": "Operadoras",
    "faixa-etaria": "Faixa Etária",
    "horas": "Atendimento Horas",
    "analitico": "Análise Analítica",
    "inserir": "Inserção de Dados"
  }

  return (
    <Tabs value={currentTab} onValueChange={handleTabChange} className="min-h-screen bg-muted/40 flex flex-col">
      {/* Tier 1: Primary Header (Branding & User) */}
      <header className="sticky top-0 z-50 w-full border-b bg-background shadow-sm">
        <div className="max-w-[1400px] mx-auto flex h-16 items-center px-6 justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg sm:rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-200">
              <Building2 className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <div>
              <span className="text-lg sm:text-xl font-extrabold tracking-tight text-foreground block leading-tight">Healthmais</span>
              <span className="text-[8px] sm:text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Business Intelligence</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end hidden sm:flex">
              <span className="text-sm font-bold text-foreground">{user}</span>
              <button 
                onClick={logout} 
                className="group flex items-center gap-1 text-[10px] text-muted-foreground hover:text-red-500 transition-colors font-bold uppercase"
              >
                Encerrar Sessão
              </button>
            </div>
            <div className="h-10 w-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center border-2 border-white shadow-sm font-bold text-sm ring-1 ring-blue-100">
              {user?.substring(0, 2).toUpperCase()}
            </div>
          </div>
        </div>
      </header>

      {/* Tier 2: Filter Toolbar & Context */}
      <div className="bg-background border-b py-6 relative z-40">
        <div className="max-w-[1400px] mx-auto px-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex-1">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">{tabContentMap[currentTab] || "Dashboard"}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-pulse shrink-0" />
              <p className="text-xs sm:text-sm text-muted-foreground font-medium">
                {globalAno !== 'todos' ? `Exercício ${globalAno}` : 'Dados Consolidados (2024-2025)'} 
                {globalMes !== 'todos' ? ` - ${globalMes}` : ''}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap lg:flex-nowrap items-center gap-2 sm:gap-3 overflow-x-auto no-scrollbar pb-1">
             <div className="flex items-center gap-2 pl-3 pr-2 sm:pr-4 py-1.5 bg-muted/40 rounded-xl border border-muted-foreground/10 focus-within:ring-2 ring-blue-100 transition-all w-full lg:w-auto shrink-0">
                <Building2 className="h-4 w-4 text-blue-600 shrink-0" />
                <select
                  className="bg-transparent border-none text-sm font-bold outline-none cursor-pointer text-foreground flex-1 sm:min-w-[160px]"
                  value={globalOperadora}
                  onChange={(e) => setGlobalOperadora(e.target.value)}
                >
                  <option value="todas">Todas as Operadoras</option>
                  {todasOperadoras?.map(op => (
                    <option key={op} value={op}>{op}</option>
                  ))}
                </select>
             </div>

             <div className="flex items-center gap-1 p-1 bg-muted/40 rounded-xl border border-muted-foreground/10 w-full lg:w-auto overflow-x-auto shrink-0">
                <select
                  className="bg-transparent border-none px-3 py-1 text-xs font-bold outline-none cursor-pointer text-muted-foreground hover:text-foreground hover:bg-white rounded-lg transition-all flex-1"
                  value={globalAno}
                  onChange={(e) => setGlobalAno(e.target.value)}
                >
                  <option value="todos">Ano: Todos</option>
                  {todosAnos?.map(ano => (
                    <option key={ano} value={ano.toString()}>{ano}</option>
                  ))}
                </select>
                <div className="w-px h-4 bg-muted-foreground/20 shrink-0" />
                <select
                  className="bg-transparent border-none px-3 py-1 text-xs font-bold outline-none cursor-pointer text-muted-foreground hover:text-foreground hover:bg-white rounded-lg transition-all flex-1"
                  value={globalMes}
                  onChange={(e) => setGlobalMes(e.target.value)}
                >
                  <option value="todos">Mês: Todos</option>
                  {todosMeses?.map(mes => (
                    <option key={mes} value={mes}>{mes}</option>
                  ))}
                </select>
             </div>

             <PDFExportButton />
          </div>
        </div>
      </div>

      {/* Tier 3: Navigation Navbar */}
      <div className="bg-white border-b overflow-x-auto no-scrollbar shadow-sm sticky top-16 z-30">
        <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center">
          <TabsList className="bg-transparent h-full p-0 flex flex-nowrap gap-2">
            <TabsTrigger 
              value="visao-geral" 
              className="group relative h-10 px-4 rounded-xl data-[state=active]:bg-blue-600 data-[state=active]:text-white text-muted-foreground transition-all hover:bg-muted font-bold text-sm flex items-center gap-2"
            >
              <LayoutDashboard className="h-4 w-4" />
              Geral
            </TabsTrigger>
            
            <TabsTrigger 
              value="procedimentos" 
              className="group relative h-10 px-4 rounded-xl data-[state=active]:bg-blue-600 data-[state=active]:text-white text-muted-foreground transition-all hover:bg-muted font-bold text-sm flex items-center gap-2"
            >
              <ClipboardList className="h-4 w-4" />
              Procedimentos
            </TabsTrigger>
            
            <TabsTrigger 
              value="geografico" 
              className="group relative h-10 px-4 rounded-xl data-[state=active]:bg-blue-600 data-[state=active]:text-white text-muted-foreground transition-all hover:bg-muted font-bold text-sm flex items-center gap-2"
            >
              <Map className="h-4 w-4" />
              Geográfico
            </TabsTrigger>
            
            <TabsTrigger 
              value="operadoras" 
              className="group relative h-10 px-4 rounded-xl data-[state=active]:bg-blue-600 data-[state=active]:text-white text-muted-foreground transition-all hover:bg-muted font-bold text-sm flex items-center gap-2"
            >
              <Briefcase className="h-4 w-4" />
              Operadoras
            </TabsTrigger>
            
            <TabsTrigger 
              value="faixa-etaria" 
              className="group relative h-10 px-4 rounded-xl data-[state=active]:bg-blue-600 data-[state=active]:text-white text-muted-foreground transition-all hover:bg-muted font-bold text-sm flex items-center gap-2"
            >
              <BarChart2 className="h-4 w-4" />
              Faixa Etária
            </TabsTrigger>
            
            <TabsTrigger 
              value="horas" 
              className="group relative h-10 px-4 rounded-xl data-[state=active]:bg-blue-600 data-[state=active]:text-white text-muted-foreground transition-all hover:bg-muted font-bold text-sm flex items-center gap-2"
            >
              <Clock className="h-4 w-4" />
              Horas
            </TabsTrigger>
            
            <TabsTrigger 
              value="analitico" 
              className="group relative h-10 px-4 rounded-xl data-[state=active]:bg-blue-600 data-[state=active]:text-white text-muted-foreground transition-all hover:bg-muted font-bold text-sm flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              Analítico
            </TabsTrigger>

            <TabsTrigger 
              value="testes" 
              className="group relative h-10 px-4 rounded-xl data-[state=active]:bg-blue-600 data-[state=active]:text-white text-muted-foreground transition-all hover:bg-muted font-bold text-sm flex items-center gap-2"
            >
              <FlaskConical className="h-4 w-4" />
              Testes
            </TabsTrigger>

            <div className="w-px h-6 bg-muted-foreground/20 mx-2 hidden md:block" />

            <TabsTrigger 
              value="inserir" 
              className="h-10 px-5 rounded-xl bg-muted text-muted-foreground data-[state=active]:bg-emerald-600 data-[state=active]:text-white hover:bg-muted-foreground/10 transition-all font-bold text-sm flex items-center gap-2"
            >
              <PlusCircle className="h-4 w-4" />
              Inserir Dados
            </TabsTrigger>
          </TabsList>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 max-w-[1400px] w-full mx-auto px-6 py-8 space-y-8 animate-in fade-in duration-500">
        <KpiSection />
        
        <div className="mt-2">

          <Routes>
            <Route path="/" element={<Navigate to="/visao-geral" replace />} />
            
            <Route path="/visao-geral" element={
              <TabsContent value="visao-geral" className="space-y-6 mt-6">
                <FaturamentoMensalChart />
                <div className="grid gap-4 md:grid-cols-2">
                  <DistribuicaoAssistenciaChart />
                  <SexoChart />
                  <AcomodacaoChart />
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Faixa Etária (Qtd)</CardTitle>
                      </CardHeader>
                      <CardContent className="flex items-center justify-center">
                        <ResponsiveContainer width="100%" height={300}>
                          <PieChart>
                            <Pie
                              data={faixaEtaria.map(f => ({ ...f, qtdEpsilon: f.qtd === 0 ? 0.1 : f.qtd }))}
                              innerRadius={60}
                              outerRadius={100}
                              paddingAngle={2}
                              dataKey="qtdEpsilon"
                              nameKey="faixa"
                            >
                              {faixaEtaria.map((entry, index) => (
                                <Cell key={index} fill={FAIXA_CORES[entry.faixa] || COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(_val: any, _name: any, props: any) => [props.payload.qtd, 'Quantidade']} />
                            <Legend layout="horizontal" verticalAlign="bottom" align="center" iconType="square" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                          </PieChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                </div>
              </TabsContent>
            } />

            <Route path="/procedimentos" element={
              <TabsContent value="procedimentos" className="space-y-6 mt-6">
                <div className="grid gap-4 lg:grid-cols-3">
                  <TipoProcedimentoChart />
                  <DistribuicaoAssistenciaChart />
                </div>
                <ProcedimentoTable />
              </TabsContent>
            } />

            <Route path="/geografico" element={
              <TabsContent value="geografico" className="space-y-6 mt-6">
                <MunicipioChart />
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Detalhamento por Municipio</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="table-container">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="whitespace-nowrap">Municipio</TableHead>
                            <TableHead className="text-right whitespace-nowrap">Valor Pago</TableHead>
                            <TableHead className="text-right whitespace-nowrap">% do Total</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {distribuicaoMunicipio.map((m, i) => (
                            <TableRow key={i}>
                              <TableCell className="font-medium whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                  <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                                  {m.municipio}
                                </div>
                              </TableCell>
                              <TableCell className="text-right whitespace-nowrap">{formatCurrency(m.valor)}</TableCell>
                              <TableCell className="text-right whitespace-nowrap">
                                {calculatePercent(m.valor, kpis.valorTotalPago).toFixed(1)}%
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            } />

            <Route path="/operadoras" element={
              <TabsContent value="operadoras" className="space-y-6 mt-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <OperadoraChart />
                  <AcomodacaoChart />
                </div>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Detalhamento por Operadora</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="table-container">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="whitespace-nowrap">Operadora</TableHead>
                            <TableHead className="text-right whitespace-nowrap">Valor Pago</TableHead>
                            <TableHead className="text-right whitespace-nowrap">% do Total</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {valorOperadora.map((p, i) => (
                            <TableRow key={i}>
                              <TableCell className="font-medium whitespace-nowrap">{p.operadora}</TableCell>
                              <TableCell className="text-right whitespace-nowrap">{formatCurrency(p.valor)}</TableCell>
                              <TableCell className="text-right whitespace-nowrap">
                                {calculatePercent(p.valor, kpis.valorTotalPago).toFixed(1)}%
                              </TableCell>
                            </TableRow>
                          ))}
                          <TableRow className="font-bold bg-muted/50">
                            <TableCell className="whitespace-nowrap">Total</TableCell>
                            <TableCell className="text-right whitespace-nowrap">{formatCurrency(kpis.valorTotalPago)}</TableCell>
                            <TableCell className="text-right whitespace-nowrap">100%</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            } />

            <Route path="/faixa-etaria" element={
              <TabsContent value="faixa-etaria" className="space-y-6 mt-6">
                <div className="grid gap-4 lg:grid-cols-3">
                  <FaixaEtariaChart />
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Resumo por Faixa</CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-center justify-center">
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={faixaEtaria}
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={4}
                            dataKey="qtd"
                            nameKey="faixa"
                          >
                            {faixaEtaria.map((entry, index) => (
                              <Cell key={index} fill={FAIXA_CORES[entry.faixa] || COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend layout="horizontal" verticalAlign="bottom" align="center" iconType="square" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Detalhamento por Faixa Etária</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="table-container">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="whitespace-nowrap">Faixa Etária</TableHead>
                            <TableHead className="whitespace-nowrap">Descrição</TableHead>
                            <TableHead className="text-right whitespace-nowrap">Qtd. Pacientes</TableHead>
                            <TableHead className="text-right whitespace-nowrap">Valor Faturado</TableHead>
                            <TableHead className="text-right whitespace-nowrap">% do Total</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {faixaEtaria.map((f, i) => (
                            <TableRow key={i}>
                              <TableCell className="font-medium whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                  <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: FAIXA_CORES[f.faixa] }} />
                                  {f.faixa}
                                </div>
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground whitespace-nowrap">{f.descricao}</TableCell>
                              <TableCell className="text-right whitespace-nowrap">{f.qtd}</TableCell>
                              <TableCell className="text-right whitespace-nowrap">{formatCurrency(f.valorFaturado)}</TableCell>
                              <TableCell className="text-right whitespace-nowrap">{f.percentual}%</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            } />

            <Route path="/horas" element={
              <TabsContent value="horas" className="space-y-6 mt-6">
                <AtendimentoHorasChart />
              </TabsContent>
            } />

            <Route path="/analitico" element={
              <TabsContent value="analitico" className="space-y-6 mt-6">
                <div className="grid gap-4">
                  <AnaliticoPacientes />
                </div>
              </TabsContent>
            } />

            <Route path="/testes" element={
              <TabsContent value="testes" className="space-y-6 mt-6">
                <TestesPage />
              </TabsContent>
            } />

            <Route path="/inserir/*" element={
              <TabsContent value="inserir" className="space-y-6 mt-6">
                <DataEntry />
              </TabsContent>
            } />

            <Route path="*" element={<Navigate to="/visao-geral" replace />} />
          </Routes>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-background mt-auto py-6 no-print">
        <div className="max-w-[1400px] mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
             <span className="font-bold text-foreground">Healthmais Dashboard</span>
             <span className="w-1 h-1 bg-muted-foreground/40 rounded-full" />
             <span>Faturamento & BI v1.2</span>
          </div>
          <p>© 2024-2025 Atendimento Domiciliar - Todos os direitos reservados</p>
        </div>
      </footer>
    </Tabs>
  )
}

function AppContent() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
          <p className="mt-4 text-sm font-medium text-muted-foreground">Verificando acesso...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Login />
  }

  return <DashboardApp />
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/print-report" element={<ReportPrintView />} />
          <Route path="/*" element={<AppContent />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
