import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import * as mock from '@/data/mock'
import { type DashboardData } from '@/lib/sheets'

type ContextValue = DashboardData & {
  statusPacienteConfig: typeof mock.statusPacienteConfig
  globalOperadora: string
  setGlobalOperadora: (val: string) => void
  globalAno: string
  setGlobalAno: (val: string) => void
  globalMes: string
  setGlobalMes: (val: string) => void
  refreshData: () => Promise<void>
  loading: boolean
  error: string | null
}

const defaultValue: ContextValue = {
  ...mock,
  globalOperadora: 'todas',
  setGlobalOperadora: () => { },
  globalAno: 'todos',
  setGlobalAno: () => { },
  globalMes: 'todos',
  setGlobalMes: () => { },
  refreshData: async () => {},
  loading: false,
  error: null,
  prBase: [],
}

const DashboardDataContext = createContext<ContextValue>(defaultValue)

export function DashboardDataProvider({ children }: { children: ReactNode }) {
  const [value, setValue] = useState<ContextValue>(defaultValue)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [globalOperadora, setGlobalOperadora] = useState<string>('todas')
  const [globalAno, setGlobalAno] = useState<string>('todos')
  const [globalMes, setGlobalMes] = useState<string>('todos')

  const loadData = async (operadora: string, ano: string, mes: string, bustCache = false) => {
    setLoading(true)
    setError(null)

    const params = new URLSearchParams()
    if (operadora && operadora !== 'todas') params.set('operadora', operadora)
    if (ano && ano !== 'todos') params.set('ano', ano)
    if (mes && mes !== 'todos') params.set('mes', mes)
    if (bustCache) params.set('_t', Date.now().toString())

    const query = params.toString() ? `?${params.toString()}` : ''

    try {
      const res = await fetch(`/api/sheets${query}`)
      if (!res.ok) {
        const body = await res.text()
        throw new Error(body || res.statusText)
      }
      const data = await res.json()
      setValue(prev => ({
        ...prev,
        ...data,
        statusPacienteConfig: mock.statusPacienteConfig
      }))
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err)
      setError(message)
      console.error("Failed to load dashboard data from API:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Se o usuário acabou de recarregar a página logo após um CRUD
    const lastRefreshStr = localStorage.getItem('@powerbi:lastRefresh')
    let shouldBustCache = false

    if (lastRefreshStr) {
      const lastRefreshTime = parseInt(lastRefreshStr, 10)
      // Tempo ajustado para cobrir o Cache-Control (s-maxage=30, stale-while-revalidate=30) = 60s sugerido. 
      // Usaremos 60s (60000ms) como janela máxima.
      if (Date.now() - lastRefreshTime < 60000) {  
        shouldBustCache = true
      }
      localStorage.removeItem('@powerbi:lastRefresh')
    }

    loadData(globalOperadora, globalAno, globalMes, shouldBustCache)
  }, [globalOperadora, globalAno, globalMes])

  const refreshData = async () => {
    await loadData(globalOperadora, globalAno, globalMes, true)
  }

  return (
    <DashboardDataContext.Provider value={{
      ...value,
      globalOperadora, setGlobalOperadora,
      globalAno, setGlobalAno,
      globalMes, setGlobalMes,
      refreshData, loading, error
    }}>
      {loading && (
        <div style={{ position: 'fixed', inset: '0 0 auto 0', zIndex: 9999, padding: '8px 16px', background: '#2563eb', color: '#fff', fontSize: '0.8rem', textAlign: 'center' }}>
          Carregando dados da planilha…
        </div>
      )}
      {error && (
        <div style={{ position: 'fixed', inset: '0 0 auto 0', zIndex: 9999, padding: '8px 16px', background: '#dc2626', color: '#fff', fontSize: '0.8rem', textAlign: 'center' }}>
          Erro ao carregar planilha: {error} — exibindo dados de exemplo
        </div>
      )}
      {children}
    </DashboardDataContext.Provider>
  )
}

export function useDashboard(): ContextValue {
  return useContext(DashboardDataContext)
}
