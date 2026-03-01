import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from "recharts"
import {
  DollarSign, Users, TrendingUp, AlertTriangle, Building2, MapPin,
  Activity, FileText, Home, ChevronDown, ChevronUp
} from "lucide-react"
import { useDashboard } from "@/lib/DashboardDataContext"

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

function formatCompact(value: number) {
  if (value >= 1_000_000) return `R$ ${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `R$ ${(value / 1_000).toFixed(0)}K`
  return formatCurrency(value)
}

const COLORS = ["#2563eb", "#7c3aed", "#db2777", "#ea580c", "#65a30d", "#0891b2", "#d97706", "#6366f1", "#14b8a6", "#f43f5e"]

function CustomTooltipCurrency({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border bg-background p-3 shadow-md">
      <p className="font-medium">{label}</p>
      {payload.map((entry: any, i: number) => (
        <p key={i} style={{ color: entry.color }} className="text-sm">
          {formatCurrency(entry.value)}
        </p>
      ))}
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
        title="Valor Total Pago"
        value={formatCompact(kpis.valorTotalPago)}
        icon={DollarSign}
        description="Exercício 2025"
      />
      <KpiCard
        title="Média Mensal"
        value={formatCompact(kpis.mediaMensalPaga)}
        icon={TrendingUp}
        description="Média paga/mês"
      />
      <KpiCard
        title="Total Glosado"
        value={formatCurrency(kpis.valorTotalGlosado)}
        icon={AlertTriangle}
        variant="success"
        description="Nenhuma glosa"
      />
      <KpiCard
        title="Média Glosa/Mês"
        value={formatCurrency(kpis.mediaMensalGlosado)}
        icon={AlertTriangle}
        variant="success"
        description="Sem glosas"
      />
      <KpiCard
        title="Pacientes"
        value={kpis.pacientesDistintos.toString()}
        icon={Users}
        description="Pacientes distintos"
      />
      <KpiCard
        title="Custo Médio/Paciente"
        value={formatCompact(kpis.custoMedioPaciente)}
        icon={Activity}
        variant="warning"
        description="Alta complexidade"
      />
    </div>
  )
}

function FaturamentoMensalChart() {
  const { faturamentoMensal } = useDashboard()
  return (
    <Card className="col-span-full lg:col-span-2">
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
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="mes" className="text-xs" />
            <YAxis tickFormatter={(v) => formatCompact(v)} className="text-xs" />
            <Tooltip content={<CustomTooltipCurrency />} />
            <Area type="monotone" dataKey="valor" stroke="#2563eb" strokeWidth={2} fill="url(#colorFat)" />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

function DistribuicaoAssistenciaChart() {
  const { distribuicaoAssistencia } = useDashboard()
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Tipo de Assistência</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={distribuicaoAssistencia}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={3}
              dataKey="valor"
              nameKey="tipo"
              label={(props: any) => `${props.tipo} ${(props.percent * 100).toFixed(0)}%`}
              labelLine={false}
            >
              {distribuicaoAssistencia.map((entry, index) => (
                <Cell key={index} fill={entry.cor} />
              ))}
            </Pie>
            <Tooltip formatter={(value: any) => formatCurrency(value as number)} />
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
            <Bar dataKey="valor" radius={[0, 4, 4, 0]}>
              {tipoProcedimento.map((_, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
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
            <Bar dataKey="valor" radius={[4, 4, 0, 0]}>
              {distribuicaoMunicipio.map((_, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

function SexoChart() {
  const { perfilSexo } = useDashboard()
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Perfil Beneficiários (Sexo)</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center justify-center">
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={perfilSexo}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={4}
              dataKey="percentual"
              nameKey="sexo"
              label={(props: any) => `${props.sexo} ${props.percentual}%`}
            >
              {perfilSexo.map((entry, index) => (
                <Cell key={index} fill={entry.cor} />
              ))}
            </Pie>
            <Tooltip formatter={(value: any) => `${value}%`} />
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
            const pct = ((p.valor / total) * 100).toFixed(1)
            return (
              <div key={i} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium truncate max-w-[200px]">{p.operadora}</span>
                  <span className="text-muted-foreground">{pct}%</span>
                </div>
                <div className="h-3 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${pct}%`, backgroundColor: COLORS[i] }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">{formatCurrency(p.valor)}</p>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

function AcomodacaoChart() {
  const { tipoAcomodacao } = useDashboard()
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Tipo de Acomodação</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center justify-center">
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={tipoAcomodacao}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={4}
              dataKey="valor"
              nameKey="label"
              label={(props: any) => `${props.label} ${((props.percent ?? 0) * 100).toFixed(0)}%`}
            >
              {tipoAcomodacao.map((entry, index) => (
                <Cell key={index} fill={entry.cor} />
              ))}
            </Pie>
            <Tooltip formatter={(value: any) => formatCurrency(value as number)} />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

function InfoCards() {
  const { tipoGuia, areaPrestador, tipoDespesa } = useDashboard()
  const items = [
    { icon: FileText, label: "Tipo de Guia", value: tipoGuia.tipo, detail: formatCurrency(tipoGuia.valor) },
    { icon: MapPin, label: "Área do Prestador", value: areaPrestador.area, detail: formatCurrency(areaPrestador.valor) },
    { icon: Home, label: "Tipo de Despesa", value: tipoDespesa.tipo, detail: formatCurrency(tipoDespesa.valor) },
  ]
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {items.map((item, i) => (
        <Card key={i}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-md p-2 bg-blue-100 text-blue-600">
                <item.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{item.label}</p>
                <p className="font-semibold">{item.value}</p>
                <p className="text-xs text-muted-foreground">{item.detail}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function ProcedimentoTable() {
  const { tipoProcedimento, kpis } = useDashboard()
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Detalhamento por Procedimento</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Procedimento</TableHead>
              <TableHead className="text-right">Valor</TableHead>
              <TableHead className="text-right">% do Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tipoProcedimento.map((p, i) => {
              const pct = ((p.valor / kpis.valorTotalPago) * 100).toFixed(1)
              return (
                <TableRow key={i}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                      {p.procedimento}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">{formatCurrency(p.valor)}</TableCell>
                  <TableCell className="text-right">{pct}%</TableCell>
                </TableRow>
              )
            })}
            <TableRow className="font-bold bg-muted/50">
              <TableCell>Total</TableCell>
              <TableCell className="text-right">{formatCurrency(kpis.valorTotalPago)}</TableCell>
              <TableCell className="text-right">100%</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

function AtendimentoHorasChart() {
  const { pacientes } = useDashboard()
  // Aggregate attendance hours from all patients with ID accommodation
  const patientsComHoras = pacientes.filter(p => (p as any).horasAtendimento)

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
    <Card>
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Paciente</TableHead>
                <TableHead>Municipio</TableHead>
                <TableHead>Operadora</TableHead>
                <TableHead className="text-right">3h</TableHead>
                <TableHead className="text-right">6h</TableHead>
                <TableHead className="text-right">12h</TableHead>
                <TableHead className="text-right">24h</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {patientsComHoras.map(p => {
                const horas = (p as any).horasAtendimento || {}
                const subtotal = Object.values(horas).reduce((a: number, b) => a + (b as number), 0)
                return (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.nome}</TableCell>
                    <TableCell className="text-sm">{p.municipio}</TableCell>
                    <TableCell className="text-sm truncate max-w-[150px]">{p.operadora}</TableCell>
                    <TableCell className="text-right text-sm">{formatCurrency(horas["3h"] as number || 0)}</TableCell>
                    <TableCell className="text-right text-sm">{formatCurrency(horas["6h"] as number || 0)}</TableCell>
                    <TableCell className="text-right text-sm">{formatCurrency(horas["12h"] as number || 0)}</TableCell>
                    <TableCell className="text-right text-sm">{formatCurrency(horas["24h"] as number || 0)}</TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(subtotal)}</TableCell>
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
      </CardContent>
    </Card>
  )
}

function AnaliticoPacientes() {
  const { pacientes, statusPacienteConfig } = useDashboard()
  const [municipioFilter, setMunicipioFilter] = React.useState<string>("todos")
  const [statusFilter, setStatusFilter] = React.useState<string>("todos")
  const [operadoraFilter, setOperadoraFilter] = React.useState<string>("todas")
  const [expandedPatientId, setExpandedPatientId] = React.useState<number | null>(null)

  const municipios = ["todos", ...new Set(pacientes.map(p => p.municipio))]
  const statusList = ["todos", ...Object.keys(statusPacienteConfig)]
  const operadoras = ["todas", ...new Set(pacientes.map(p => p.operadora))]

  const pacientesFiltrados = pacientes.filter(p => {
    const municipioOk = municipioFilter === "todos" || p.municipio === municipioFilter
    const statusOk = statusFilter === "todos" || p.status === statusFilter
    const operadoraOk = operadoraFilter === "todas" || p.operadora === operadoraFilter
    return municipioOk && statusOk && operadoraOk
  })

  const custoTotal = pacientesFiltrados.reduce((s, p) => s + p.custo, 0)
  const custoPorStatus = statusList.slice(1).map(status => ({
    status,
    quantidade: pacientesFiltrados.filter(p => p.status === status).length,
    custo: pacientesFiltrados.filter(p => p.status === status).reduce((s, p) => s + p.custo, 0),
  }))

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <label className="text-sm font-medium mb-2 block">Filtrar por Município</label>
            <select
              value={municipioFilter}
              onChange={(e) => setMunicipioFilter(e.target.value)}
              className="w-full px-3 py-2 border rounded-md bg-background text-foreground cursor-pointer"
            >
              {municipios.map(m => (
                <option key={m} value={m}>
                  {m === "todos" ? "Todos os Municípios" : m}
                </option>
              ))}
            </select>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <label className="text-sm font-medium mb-2 block">Filtrar por Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border rounded-md bg-background text-foreground cursor-pointer"
            >
              {statusList.map(s => (
                <option key={s} value={s}>
                  {s === "todos" ? "Todos os Status" : statusPacienteConfig[s as keyof typeof statusPacienteConfig]?.label || s}
                </option>
              ))}
            </select>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <label className="text-sm font-medium mb-2 block">Filtrar por Operadora</label>
            <select
              value={operadoraFilter}
              onChange={(e) => setOperadoraFilter(e.target.value)}
              className="w-full px-3 py-2 border rounded-md bg-background text-foreground cursor-pointer"
            >
              {operadoras.map(o => (
                <option key={o} value={o}>
                  {o === "todas" ? "Todas as Operadoras" : o}
                </option>
              ))}
            </select>
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
            <p className="text-sm text-muted-foreground">Custo Total</p>
            <p className="text-2xl font-bold">{formatCompact(custoTotal)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Custo Médio</p>
            <p className="text-2xl font-bold">
              {pacientesFiltrados.length > 0 ? formatCompact(custoTotal / pacientesFiltrados.length) : "R$ 0"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Acomodação ID</p>
            <p className="text-2xl font-bold">
              {pacientesFiltrados.filter(p => p.acomodacao === "ID").length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Pacientes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Detalhamento por Paciente</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8"></TableHead>
                <TableHead>Paciente</TableHead>
                <TableHead>Município</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Acomodação</TableHead>
                <TableHead>Operadora</TableHead>
                <TableHead className="text-right">Custo</TableHead>
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
                      <TableCell className="font-medium">{p.nome}</TableCell>
                      <TableCell>{p.municipio}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{config?.icon}</span>
                          <span className="px-2 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: config?.cor + "20", color: config?.cor }}>
                            {config?.label}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="px-2 py-1 rounded-md bg-muted text-xs font-medium">
                          {p.acomodacao}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm truncate max-w-[180px]">{p.operadora}</TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(p.custo)}</TableCell>
                    </TableRow>

                    {isExpanded && hasHours && (
                      <TableRow className="bg-muted/30">
                        <TableCell colSpan={7} className="p-4">
                          <div className="space-y-3">
                            <p className="font-medium text-sm">Detalhamento por Horas de Atendimento:</p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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
                  <p className="text-sm text-muted-foreground">Pacientes: {item.quantidade}</p>
                  <p className="text-lg font-bold mt-2">{formatCurrency(item.custo)}</p>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function App() {
  const { distribuicaoMunicipio, valorOperadora, kpis } = useDashboard()
  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-[1400px] mx-auto flex h-16 items-center px-6">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <div>
              <select name="" id="">
                <option value="">Todas Operadoras</option>
                <option value="">Unimed</option>
                <option value="">Camperj</option>
              </select>
              <h1 className="text-lg font-bold leading-none"></h1>
              <p className="text-xs text-muted-foreground">Faturamento 2025 - Atendimento Domiciliar</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1400px] mx-auto px-6 py-6 space-y-6">
        {/* KPIs */}
        <KpiSection />

        {/* Tabs */}
        <Tabs defaultValue="visao-geral">
          <TabsList>
            <TabsTrigger value="visao-geral">Visão Geral</TabsTrigger>
            <TabsTrigger value="procedimentos">Procedimentos</TabsTrigger>
            <TabsTrigger value="geografico">Geográfico</TabsTrigger>
            <TabsTrigger value="operadoras">Operadoras</TabsTrigger>
            <TabsTrigger value="horas">Atendimento Horas</TabsTrigger>
            <TabsTrigger value="analitico">Analítico</TabsTrigger>
          </TabsList>

          {/* Visao Geral */}
          <TabsContent value="visao-geral" className="space-y-6">
            <div className="grid gap-4 lg:grid-cols-3">
              <FaturamentoMensalChart />
              <DistribuicaoAssistenciaChart />
            </div>
            <InfoCards />
            <div className="grid gap-4 md:grid-cols-2">
              <SexoChart />
              <AcomodacaoChart />
            </div>
          </TabsContent>

          {/* Procedimentos */}
          <TabsContent value="procedimentos" className="space-y-6">
            <div className="grid gap-4 lg:grid-cols-3">
              <TipoProcedimentoChart />
              <DistribuicaoAssistenciaChart />
            </div>
            <ProcedimentoTable />
          </TabsContent>

          {/* Geografico */}
          <TabsContent value="geografico" className="space-y-6">
            <MunicipioChart />
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Detalhamento por Municipio</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Municipio</TableHead>
                      <TableHead className="text-right">Valor Pago</TableHead>
                      <TableHead className="text-right">% do Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {distribuicaoMunicipio.map((m, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            {m.municipio}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">{formatCurrency(m.valor)}</TableCell>
                        <TableCell className="text-right">
                          {((m.valor / kpis.valorTotalPago) * 100).toFixed(1)}%
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Operadoras */}
          <TabsContent value="operadoras" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <OperadoraChart />
              <AcomodacaoChart />
            </div>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Detalhamento por Operadora</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Operadora</TableHead>
                      <TableHead className="text-right">Valor Pago</TableHead>
                      <TableHead className="text-right">% do Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {valorOperadora.map((p, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-medium">{p.operadora}</TableCell>
                        <TableCell className="text-right">{formatCurrency(p.valor)}</TableCell>
                        <TableCell className="text-right">
                          {((p.valor / kpis.valorTotalPago) * 100).toFixed(1)}%
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="font-bold bg-muted/50">
                      <TableCell>Total</TableCell>
                      <TableCell className="text-right">{formatCurrency(kpis.valorTotalPago)}</TableCell>
                      <TableCell className="text-right">100%</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Atendimento por Horas */}
          <TabsContent value="horas" className="space-y-6">
            <AtendimentoHorasChart />
          </TabsContent>

          {/* Analítico */}
          <TabsContent value="analitico" className="space-y-6">
            <div className="grid gap-4">
              <AnaliticoPacientes />
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t mt-8">
        <div className="max-w-[1400px] mx-auto px-6 py-4 flex items-center justify-between text-xs text-muted-foreground">
          <span>Unimed Nova Iguaçu / Camperj Dashboard - Faturamento 2025</span>
          <span>Dados referentes ao exercício 2025 - Atendimento Domiciliar</span>
        </div>
      </footer>
    </div>
  )
}

export default App
