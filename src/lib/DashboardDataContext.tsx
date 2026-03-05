import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import * as mock from '@/data/mock'
import { type DashboardData } from '@/lib/sheets'

type ContextValue = DashboardData & {
  statusPacienteConfig: typeof mock.statusPacienteConfig
  globalOperadora: string
  setGlobalOperadora: (val: string) => void
}

const defaultValue: ContextValue = {
  ...mock,
  globalOperadora: 'todas',
  setGlobalOperadora: () => { },
}

const DashboardDataContext = createContext<ContextValue>(defaultValue)

export function DashboardDataProvider({ children }: { children: ReactNode }) {
  const [value, setValue] = useState<ContextValue>(defaultValue)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [globalOperadora, setGlobalOperadora] = useState<string>('todas')

  useEffect(() => {
    setLoading(true)
    setError(null)

    fetch('/api/sheets')
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.text()
          throw new Error(body || res.statusText)
        }
        return res.json()
      })
      .then((data: DashboardData) => {
        setValue(prev => ({
          ...prev,
          ...data,
          statusPacienteConfig: mock.statusPacienteConfig
        }))
      })
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : String(err)
        setError(message)
        console.error("Failed to load dashboard data from API:", err)
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <DashboardDataContext.Provider value={{ ...value, globalOperadora, setGlobalOperadora }}>
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
