import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { useDashboard } from "@/lib/DashboardDataContext"
import { ComboboxFilter } from "@/components/ui/combobox-filter"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

function formatCurrency(value: number) {
    return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

export function DataEntry() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-xl">Inserção de Dados Base (Google Sheets)</CardTitle>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="procedimento">
                    <TabsList className="mb-4">
                        <TabsTrigger value="procedimento">Atualizar Procedimento</TabsTrigger>
                        <TabsTrigger value="pacientes">Inserir Pacientes</TabsTrigger>
                        <TabsTrigger value="realizados">Inserir Realizados</TabsTrigger>
                    </TabsList>

                    <TabsContent value="procedimento">
                        <FormProcedimento />
                    </TabsContent>

                    <TabsContent value="pacientes">
                        <FormPacientes />
                    </TabsContent>

                    <TabsContent value="realizados">
                        <FormRealizados />
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    )
}

function FormProcedimento() {
    const [procedimento, setProcedimento] = useState("")
    const [valor, setValor] = useState("")
    const [ativo, setAtivo] = useState(true)
    const [status, setStatus] = useState("")

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setStatus("Salvando...")
        try {
            const res = await fetch("/api/procedimentos", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "insert_reference",
                    payload: {
                        procedimento,
                        valor: parseFloat(valor.replace(",", ".")),
                        ativo
                    }
                })
            })
            if (!res.ok) throw new Error(await res.text())
            setStatus("Salvo com sucesso!")
            setProcedimento("")
            setValor("")
        } catch (err: any) {
            setStatus("Erro: " + err.message)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
            <div>
                <label className="block text-sm font-medium mb-1">Nome do Procedimento</label>
                <input
                    required
                    value={procedimento}
                    onChange={e => setProcedimento(e.target.value)}
                    className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background"
                    placeholder="Ex: Fisioterapia"
                />
            </div>
            <div>
                <label className="block text-sm font-medium mb-1">Valor Unitário (R$)</label>
                <input
                    required
                    type="number"
                    step="0.01"
                    value={valor}
                    onChange={e => setValor(e.target.value)}
                    className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background"
                    placeholder="Ex: 150.00"
                />
            </div>
            <div className="flex items-center gap-2">
                <input
                    type="checkbox"
                    id="proc-ativo"
                    checked={ativo}
                    onChange={e => setAtivo(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                />
                <label htmlFor="proc-ativo" className="text-sm font-medium">Procedimento Ativo</label>
            </div>
            <button type="submit" className="h-10 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                Salvar Novo Valor
            </button>
            {status && <p className="text-sm mt-2 text-blue-600 font-medium">{status}</p>}
        </form>
    )
}

function FormPacientes() {
    const { distribuicaoMunicipio, valorOperadora, tipoAcomodacao, statusPacienteConfig } = useDashboard()
    const [patients, setPatients] = useState<any[]>([])

    // Combobox Options
    const municipioOptions = distribuicaoMunicipio.map(m => ({ label: m.municipio, value: m.municipio }))
    const operadoraOptions = valorOperadora.map(o => ({ label: o.operadora, value: o.operadora }))
    const acomodacaoOptions = tipoAcomodacao.map(a => ({ label: `${a.label} (${a.tipo})`, value: a.tipo }))
    const statusOptions = Object.keys(statusPacienteConfig).map(s => ({
        label: statusPacienteConfig[s as keyof typeof statusPacienteConfig]?.label || s,
        value: s
    }))

    // Form State
    const [nome, setNome] = useState("")
    const [municipio, setMunicipio] = useState("")
    const [sexo, setSexo] = useState("Masculino")
    const [operadora, setOperadora] = useState("")
    const [acomodacao, setAcomodacao] = useState("")
    const [statusPaciente, setStatusPaciente] = useState("")

    const [apiStatus, setApiStatus] = useState("")

    function handleAdd() {
        if (!nome || !municipio || !operadora || !acomodacao || !statusPaciente) return;
        const newPatient = {
            // id can be generated later by Sheets, or we can leave it empty
            id: "",
            nome,
            municipio,
            nasc: "",
            sexo,
            operadora,
            acomodacao,
            status: statusPaciente,
            pacote: "",
            entrada: "",
            saida: ""
        }
        setPatients([...patients, newPatient])

        // reset basic fields to speed up multi-entry
        setNome("")
    }

    function handleRemove(index: number) {
        setPatients(patients.filter((_, i) => i !== index))
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (patients.length === 0) return;
        setApiStatus("Enviando...")
        try {
            const res = await fetch("/api/patients", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ patients })
            })
            if (!res.ok) throw new Error(await res.text())
            setApiStatus("Inseridos com sucesso!")
            setPatients([])
        } catch (err: any) {
            setApiStatus("Erro: " + err.message)
        }
    }

    return (
        <div className="space-y-6 pb-32">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 p-4 border rounded-lg bg-muted/20">
                <div>
                    <label className="block text-sm font-medium mb-1">Nome</label>
                    <input value={nome} onChange={e => setNome(e.target.value)} className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder="Nome completo" />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Município</label>
                    <ComboboxFilter
                        options={municipioOptions}
                        value={municipio}
                        onValueChange={setMunicipio}
                        placeholder="Selecione o município..."
                        emptyMessage="Não encontrado."
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Sexo</label>
                    <select value={sexo} onChange={e => setSexo(e.target.value)} className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                        <option>Masculino</option>
                        <option>Feminino</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Operadora</label>
                    <ComboboxFilter
                        options={operadoraOptions}
                        value={operadora}
                        onValueChange={setOperadora}
                        placeholder="Selecione a operadora..."
                        emptyMessage="Não encontrada."
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Acomodação</label>
                    <ComboboxFilter
                        options={acomodacaoOptions}
                        value={acomodacao}
                        onValueChange={setAcomodacao}
                        placeholder="Selecione a acomodação..."
                        emptyMessage="Não encontrada."
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Status Base</label>
                    <ComboboxFilter
                        options={statusOptions}
                        value={statusPaciente}
                        onValueChange={setStatusPaciente}
                        placeholder="Selecione o status..."
                        emptyMessage="Não encontrado."
                    />
                </div>
                <div className="flex items-end">
                    <button onClick={handleAdd} disabled={!nome || !municipio || !operadora || !acomodacao || !statusPaciente} className="h-10 px-4 w-full bg-slate-900 text-white rounded-md hover:bg-slate-800 disabled:opacity-50 transition-colors">
                        Adicionar à Lista
                    </button>
                </div>
            </div>

            {patients.length > 0 && (
                <Card className="shadow-none border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nome</TableHead>
                                <TableHead>Município</TableHead>
                                <TableHead>Sexo</TableHead>
                                <TableHead>Operadora</TableHead>
                                <TableHead>Acomodação</TableHead>
                                <TableHead className="w-[80px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {patients.map((p, i) => (
                                <TableRow key={i}>
                                    <TableCell className="font-medium text-xs">{p.nome}</TableCell>
                                    <TableCell className="text-xs">{p.municipio}</TableCell>
                                    <TableCell className="text-xs">{p.sexo}</TableCell>
                                    <TableCell className="text-xs">{p.operadora}</TableCell>
                                    <TableCell className="text-xs">{p.acomodacao} - {p.status}</TableCell>
                                    <TableCell>
                                        <button onClick={() => handleRemove(i)} className="text-red-500 hover:text-red-700 text-xs">Remover</button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    <CardFooter className="pt-4 border-t flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">{patients.length} paciente(s) prontos para inserção.</span>
                        <div className="flex items-center gap-4">
                            {apiStatus && <span className="text-sm text-blue-600 font-medium">{apiStatus}</span>}
                            <button onClick={handleSubmit} className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium transition-colors">
                                Enviar Lote para PBI
                            </button>
                        </div>
                    </CardFooter>
                </Card>
            )}
            {patients.length === 0 && apiStatus && <p className="text-sm mt-2 text-blue-600 font-medium">{apiStatus}</p>}
        </div>
    )
}

function FormRealizados() {
    const { refProcedimentos, pacientes } = useDashboard()

    // Deduplicate procedures for combobox, showing latest price
    // Also track the active status so we only display active ones
    const latestProcedures = new Map<string, { cleanName: string; price: number; ativo: boolean }>()

    if (refProcedimentos) {
        refProcedimentos.forEach(p => {
            const rawName = p.procedimento
            const cleanName = rawName.replace(/[\r\n]+/g, " ").replace(/\s+/g, " ").trim()
            latestProcedures.set(rawName, { cleanName, price: p.valor, ativo: p.ativo })
        })
    }

    const procedureOptions = Array.from(latestProcedures.entries())
        .filter(([_, data]) => data.ativo)
        .map(([rawName, data]) => ({
            label: data.price > 0 ? `${data.cleanName} (${formatCurrency(data.price)})` : data.cleanName,
            value: rawName,
            price: data.price
        }))

    const pacienteOptions = pacientes.map(p => ({
        label: `${p.id} - ${p.nome}`,
        value: p.id.toString()
    }))

    const [month, setMonth] = useState("Jan")
    const [year, setYear] = useState("2025")

    const [pacienteId, setPacienteId] = useState("")
    const [selectedProc, setSelectedProc] = useState("")
    const [qtd, setQtd] = useState("1")

    const [pending, setPending] = useState<any[]>([])
    const [apiStatus, setApiStatus] = useState("")

    function handleAdd() {
        if (!pacienteId || !selectedProc) return;

        // Find the price and clean name
        const procData = latestProcedures.get(selectedProc)
        const price = procData ? procData.price : 0
        const displayProc = procData ? procData.cleanName : selectedProc

        // Look up patient name safely just for previewing
        const pt = pacientes.find(p => p.id === Number(pacienteId))

        const newProc = {
            pacienteId: Number(pacienteId),
            pacienteNome: pt?.nome || `ID: ${pacienteId}`,
            proc: selectedProc, // keep raw for API
            displayProc,      // use clean for UI
            qtd: Number(qtd),
            unitPreview: price,
            valor_totalPreview: price * Number(qtd)
        }

        setPending([...pending, newProc])

        // reset form but keep patient selected for rapid entry
        setSelectedProc("")
        setQtd("1")
    }

    function handleRemove(index: number) {
        setPending(pending.filter((_, i) => i !== index))
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (pending.length === 0) return;
        setApiStatus("Processando e Enviando...")

        // Transform pending into the API payload format
        const procedimentos = pending.map(p => ({
            paciente_id: p.pacienteId,
            proc: p.proc,
            qtd: p.qtd,
        }))

        try {
            const res = await fetch("/api/procedimentos", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "batch_insert_realizados",
                    payload: { month, year, procedimentos }
                })
            })
            if (!res.ok) throw new Error(await res.text())
            setApiStatus("Inseridos com sucesso!")
            setPending([])
        } catch (err: any) {
            setApiStatus("Erro: " + err.message)
        }
    }

    return (
        <div className="space-y-6 pb-32">
            <div className="flex gap-4">
                <div className="max-w-[120px]">
                    <label className="block text-sm font-medium mb-1">Mês (Abrev)</label>
                    <select value={month} onChange={e => setMonth(e.target.value)} className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                        {['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'].map(m => (
                            <option key={m}>{m}</option>
                        ))}
                    </select>
                </div>
                <div className="max-w-[120px]">
                    <label className="block text-sm font-medium mb-1">Ano</label>
                    <input type="number" value={year} onChange={e => setYear(e.target.value)} className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder="2025" />
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 p-4 border rounded-lg bg-muted/20">
                <div className="lg:col-span-2">
                    <label className="block text-sm font-medium mb-1">Paciente</label>
                    <ComboboxFilter
                        options={pacienteOptions}
                        value={pacienteId}
                        onValueChange={setPacienteId}
                        placeholder="Selecione o paciente..."
                        emptyMessage="Paciente não encontrado."
                    />
                </div>
                <div className="lg:col-span-2">
                    <label className="block text-sm font-medium mb-1">Procedimento</label>
                    <ComboboxFilter
                        options={procedureOptions}
                        value={selectedProc}
                        onValueChange={setSelectedProc}
                        placeholder="Selecione o procedimento..."
                        emptyMessage="Procedimento não encontrado nas referências."
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Qtd.</label>
                    <input type="number" min="1" value={qtd} onChange={e => setQtd(e.target.value)} className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm" />
                </div>

                <div className="lg:col-span-5 flex justify-end">
                    <button onClick={handleAdd} disabled={!pacienteId || !selectedProc} className="h-10 px-8 bg-slate-900 text-white rounded-md hover:bg-slate-800 disabled:opacity-50 transition-colors">
                        Adicionar à Lista
                    </button>
                </div>
            </div>

            {pending.length > 0 && (
                <Card className="shadow-none border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Paciente</TableHead>
                                <TableHead>Procedimento</TableHead>
                                <TableHead className="text-right">Qtd</TableHead>
                                <TableHead className="text-right">Val. Unit</TableHead>
                                <TableHead className="text-right">Total Realizado</TableHead>
                                <TableHead className="w-[80px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {pending.map((p, i) => (
                                <TableRow key={i}>
                                    <TableCell className="font-medium text-xs">{p.pacienteNome}</TableCell>
                                    <TableCell className="text-xs">{p.displayProc || p.proc}</TableCell>
                                    <TableCell className="text-right text-xs">{p.qtd}</TableCell>
                                    <TableCell className="text-right text-xs">{formatCurrency(p.unitPreview)}</TableCell>
                                    <TableCell className="text-right font-medium text-xs text-blue-600">{formatCurrency(p.valor_totalPreview)}</TableCell>
                                    <TableCell>
                                        <button onClick={() => handleRemove(i)} className="text-red-500 hover:text-red-700 text-xs font-medium">Remover</button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    <CardFooter className="pt-4 border-t flex justify-between items-center bg-muted/10">
                        <span className="text-sm text-muted-foreground">{pending.length} procedimento(s) computados. O custo total do lote será calculado pela API.</span>
                        <div className="flex items-center gap-4">
                            {apiStatus && <span className="text-sm text-blue-600 font-medium">{apiStatus}</span>}
                            <button onClick={handleSubmit} className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium transition-colors">
                                Enviar Lote Realizados
                            </button>
                        </div>
                    </CardFooter>
                </Card>
            )}
            {pending.length === 0 && apiStatus && <p className="text-sm mt-2 text-blue-600 font-medium">{apiStatus}</p>}
        </div>
    )
}
