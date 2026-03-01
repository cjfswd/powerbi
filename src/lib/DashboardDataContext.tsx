import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import * as mock from '@/data/mock'
import { fetchDashboardData, type DashboardData } from '@/lib/sheets'

// The context value includes everything from DashboardData + the static
// statusPacienteConfig map (colors/icons for patient status labels).
type ContextValue = DashboardData & {
  statusPacienteConfig: typeof mock.statusPacienteConfig
}

// Default value = mock data, so the dashboard renders immediately even without
// env vars configured. When env vars ARE set, real data replaces mock on load.
const defaultValue: ContextValue = {
  ...mock,
  // mock already contains statusPacienteConfig; spread covers everything
}

const DashboardDataContext = createContext<ContextValue>(defaultValue)

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function DashboardDataProvider({ children }: { children: ReactNode }) {
  const [value, setValue] = useState<ContextValue>(defaultValue)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const id = import.meta.env.VITE_GOOGLE_SHEETS_ID as string | undefined
    const key = import.meta.env.VITE_GOOGLE_SHEETS_API_KEY as string | undefined

    // No env vars → keep mock data, no fetch
    if (!id || !key) return

    setLoading(true)
    setError(null)

    fetchDashboardData(id, key)
      .then(data => {
        setValue({ ...data, statusPacienteConfig: mock.statusPacienteConfig })
      })
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : String(err)
        setError(message)
        // On error, fall back to mock so the dashboard remains functional
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <DashboardDataContext.Provider value={value}>
      {loading && (
        <div
          style={{
            position: 'fixed',
            inset: '0 0 auto 0',
            zIndex: 9999,
            padding: '8px 16px',
            background: '#2563eb',
            color: '#fff',
            fontSize: '0.8rem',
            textAlign: 'center',
          }}
        >
          Carregando dados da planilha…
        </div>
      )}
      {error && (
        <div
          style={{
            position: 'fixed',
            inset: '0 0 auto 0',
            zIndex: 9999,
            padding: '8px 16px',
            background: '#dc2626',
            color: '#fff',
            fontSize: '0.8rem',
            textAlign: 'center',
          }}
        >
          Erro ao carregar planilha: {error} — exibindo dados de exemplo
        </div>
      )}
      {children}
    </DashboardDataContext.Provider>
  )
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useDashboard(): ContextValue {
  return useContext(DashboardDataContext)
}
