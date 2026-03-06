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
                        <TabsTrigger value="procedimento">Gerenciar Procedimentos</TabsTrigger>
                        <TabsTrigger value="pacientes">Gerenciar Pacientes</TabsTrigger>
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
    const { refProcedimentos } = useDashboard()
    const [procedimento, setProcedimento] = useState("")
    const [valor, setValor] = useState("")
    const [ativo, setAtivo] = useState(true)
    const [status, setStatus] = useState("")
    const [isEditing, setIsEditing] = useState(false)

    // Optional: Search term for the reference table
    const [searchTerm, setSearchTerm] = useState("")

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setStatus("Salvando...")
        try {
            const res = await fetch("/api/procedimentos", {
                method: isEditing ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: isEditing ? "update_reference" : "insert_reference",
                    payload: {
                        procedimento,
                        valor: parseFloat(valor.replace(",", ".")),
                        ativo
                    }
                })
            })
            if (!res.ok) throw new Error(await res.text())
            setStatus("Salvo com sucesso!")
            // Reset form
            setProcedimento("")
            setValor("")
            setAtivo(true)
            setIsEditing(false)
        } catch (err: any) {
            setStatus("Erro: " + err.message)
        }
    }

    function handleEdit(proc: any) {
        setProcedimento(proc.procedimento)
        setValor(proc.valor.toString())
        setAtivo(proc.ativo)
        setIsEditing(true)
        setStatus("")
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    function handleCancelEdit() {
        setProcedimento("")
        setValor("")
        setAtivo(true)
        setIsEditing(false)
        setStatus("")
    }

    const filteredProcedures = refProcedimentos?.filter(p => p.procedimento.toLowerCase().includes(searchTerm.toLowerCase())) || []

    return (
        <div className="space-y-8">
            <form onSubmit={handleSubmit} className="space-y-4 max-w-md p-4 border rounded-lg bg-muted/20">
                <h3 className="font-semibold text-lg">{isEditing ? "Editar Procedimento" : "Novo Procedimento"}</h3>
                <div>
                    <label className="block text-sm font-medium mb-1">Nome do Procedimento</label>
                    <input
                        required
                        disabled={isEditing}
                        value={procedimento}
                        onChange={e => setProcedimento(e.target.value)}
                        className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background disabled:opacity-50"
                        placeholder="Ex: Fisioterapia"
                    />
                    {isEditing && <p className="text-xs text-muted-foreground mt-1">O nome do procedimento não pode ser alterado na edição.</p>}
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
                <div className="flex gap-2">
                    <button type="submit" className="h-10 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                        {isEditing ? "Salvar Alterações" : "Salvar Novo Valor"}
                    </button>
                    {isEditing && (
                        <button type="button" onClick={handleCancelEdit} className="h-10 px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300">
                            Cancelar
                        </button>
                    )}
                </div>
                {status && <p className="text-sm mt-2 text-blue-600 font-medium">{status}</p>}
            </form>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-lg">Procedimentos Cadastrados</h3>
                    <input
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        placeholder="Buscar procedimento..."
                        className="h-9 px-3 border rounded-md text-sm"
                    />
                </div>
                <div className="border rounded-md max-h-[400px] overflow-auto">
                    <Table>
                        <TableHeader className="sticky top-0 bg-background z-10">
                            <TableRow>
                                <TableHead>Procedimento</TableHead>
                                <TableHead className="text-right">Valor Original</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="w-[80px] text-right">Ação</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredProcedures.map((proc, i) => (
                                <TableRow key={i}>
                                    <TableCell className="font-medium text-sm">{proc.procedimento}</TableCell>
                                    <TableCell className="text-right text-sm">{formatCurrency(proc.valor)}</TableCell>
                                    <TableCell className="text-sm">
                                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${proc.ativo ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                                            {proc.ativo ? "Ativo" : "Inativo"}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <button onClick={() => handleEdit(proc)} className="text-blue-600 hover:text-blue-800 text-sm font-medium">Editar</button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    )
}

function FormPacientes() {
    const { distribuicaoMunicipio, valorOperadora, tipoAcomodacao, statusPacienteConfig, pacientes } = useDashboard()
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

    // Edit State
    const [isEditing, setIsEditing] = useState(false)
    const [editPatientId, setEditPatientId] = useState<string | number>("")
    const [nasc, setNasc] = useState("")
    const [pacote, setPacote] = useState("")
    const [entrada, setEntrada] = useState("")
    const [saida, setSaida] = useState("")

    const [apiStatus, setApiStatus] = useState("")
    const [searchTerm, setSearchTerm] = useState("")

    function resetForm() {
        setNome("")
        setMunicipio("")
        setSexo("Masculino")
        setOperadora("")
        setAcomodacao("")
        setStatusPaciente("")
        setNasc("")
        setPacote("")
        setEntrada("")
        setSaida("")
        setIsEditing(false)
        setEditPatientId("")
    }

    function handleAdd() {
        if (!nome || !municipio || !operadora || !acomodacao || !statusPaciente) return;
        const newPatient = {
            id: "",
            nome,
            municipio,
            nasc,
            sexo,
            operadora,
            acomodacao,
            status: statusPaciente,
            pacote,
            entrada,
            saida
        }
        setPatients([...patients, newPatient])
        resetForm()
    }

    function handleRemove(index: number) {
        setPatients(patients.filter((_, i) => i !== index))
    }

    function handleEditExisting(pt: any) {
        setEditPatientId(pt.id)
        setNome(pt.nome || "")
        setMunicipio(pt.municipio || "")
        setSexo(pt.sexo || "Masculino")
        setOperadora(pt.operadora || "")
        setAcomodacao(pt.acomodacao || "")
        setStatusPaciente(pt.status || "Ativo")
        setNasc(pt.nasc || "")
        setPacote(pt.pacote || "")
        setEntrada(pt.entrada || "")
        setSaida(pt.saida || "")
        setIsEditing(true)
        setPatients([]) // Clear batch queue if starting an edit
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    async function handleUpdateExisting() {
        if (!editPatientId || !nome || !municipio || !operadora || !acomodacao || !statusPaciente) return;
        setApiStatus("Atualizando...")
        try {
            const patientData = {
                id: editPatientId,
                nome,
                municipio,
                nasc,
                sexo,
                operadora,
                acomodacao,
                status: statusPaciente,
                pacote,
                entrada,
                saida
            }
            const res = await fetch("/api/patients", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "update", patient: patientData })
            })
            if (!res.ok) throw new Error(await res.text())
            setApiStatus("Atualizado com sucesso!")
            resetForm()
        } catch (err: any) {
            setApiStatus("Erro: " + err.message)
        }
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

    const filteredExistingPatients = pacientes?.filter((p: any) => p.nome.toLowerCase().includes(searchTerm.toLowerCase()) || p.id.toString().includes(searchTerm)) || [];

    return (
        <div className="space-y-8 pb-32">
            <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
                <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-lg">{isEditing ? `Editar Paciente #${editPatientId}` : "Adicionar Novos Pacientes"}</h3>
                    {isEditing && (
                        <button onClick={resetForm} className="text-sm text-slate-500 hover:text-slate-800 underline">Cancelar Edição</button>
                    )}
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
                    {/* Optional extra fields for edit mode to allow full modification */}
                    {isEditing && (
                        <>
                            <div>
                                <label className="block text-sm font-medium mb-1">Nascimento</label>
                                <input value={nasc} onChange={e => setNasc(e.target.value)} type="date" className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Pacote</label>
                                <input value={pacote} onChange={e => setPacote(e.target.value)} className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder="Ex: SIM" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Entrada</label>
                                <input value={entrada} onChange={e => setEntrada(e.target.value)} type="date" className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Saída</label>
                                <input value={saida} onChange={e => setSaida(e.target.value)} type="date" className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm" />
                            </div>
                        </>
                    )}
                    <div className="flex items-end">
                        {isEditing ? (
                            <button onClick={handleUpdateExisting} disabled={!nome || !municipio || !operadora || !acomodacao || !statusPaciente} className="h-10 px-4 w-full bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors">
                                Salvar Alterações
                            </button>
                        ) : (
                            <button onClick={handleAdd} disabled={!nome || !municipio || !operadora || !acomodacao || !statusPaciente} className="h-10 px-4 w-full bg-slate-900 text-white rounded-md hover:bg-slate-800 disabled:opacity-50 transition-colors">
                                Adicionar à Fila
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {!isEditing && patients.length > 0 && (
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
            {!isEditing && patients.length === 0 && apiStatus && <p className="text-sm mt-2 text-blue-600 font-medium">{apiStatus}</p>}

            <div className="space-y-4 mt-8 pt-8 border-t">
                <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-lg">Pacientes Cadastrados</h3>
                    <input
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        placeholder="Buscar paciente por nome ou ID..."
                        className="h-9 w-64 px-3 border rounded-md text-sm"
                    />
                </div>
                <div className="border rounded-md max-h-[400px] overflow-auto">
                    <Table>
                        <TableHeader className="sticky top-0 bg-background z-10">
                            <TableRow>
                                <TableHead className="w-[60px]">ID</TableHead>
                                <TableHead>Nome</TableHead>
                                <TableHead>Operadora</TableHead>
                                <TableHead>Município</TableHead>
                                <TableHead>Status Base</TableHead>
                                <TableHead className="w-[80px] text-right">Ação</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredExistingPatients.map((p: any) => (
                                <TableRow key={p.id}>
                                    <TableCell className="text-sm text-muted-foreground">{p.id}</TableCell>
                                    <TableCell className="font-medium text-sm">{p.nome}</TableCell>
                                    <TableCell className="text-sm">{p.operadora}</TableCell>
                                    <TableCell className="text-sm">{p.municipio}</TableCell>
                                    <TableCell className="text-sm">
                                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${p.status === 'Alta' ? 'bg-red-100 text-red-800' : p.status === 'Ativo' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'}`}>
                                            {p.status || 'Ativo'}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <button onClick={() => handleEditExisting(p)} className="text-blue-600 hover:text-blue-800 text-sm font-medium">Editar</button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
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
