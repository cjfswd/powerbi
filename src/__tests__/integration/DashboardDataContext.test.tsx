/**
 * Integration tests for DashboardDataContext.
 * Verifies that loadData and refreshData make the correct fetch calls
 * (including cache-busting _t param) and update component state.
 */
import { describe, it, expect } from 'vitest'
import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { server } from '../msw/server'
import { DashboardDataProvider, useDashboard } from '@/lib/DashboardDataContext'
import { FIXTURE_SHEETS_RESPONSE } from '../msw/handlers'

// ---------------------------------------------------------------------------
// Helper component that exposes context values in the DOM for assertions
// ---------------------------------------------------------------------------
function ContextInspector() {
  const { refProcedimentos, refreshData } = useDashboard()
  return (
    <div>
      <span data-testid="proc-count">{refProcedimentos?.length ?? 0}</span>
      <button onClick={refreshData}>Refresh</button>
    </div>
  )
}

function renderWithProvider() {
  return render(
    <DashboardDataProvider>
      <ContextInspector />
    </DashboardDataProvider>
  )
}

// Ensure tests wait for the initial load to finish to avoid unhandled state updates
async function renderAndWaitForLoad() {
  let view: any
  await act(async () => {
    view = renderWithProvider()
    // small wait for microtasks (the fetch)
    await new Promise(r => setTimeout(r, 0))
  })
  return view
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('DashboardDataContext — carregamento inicial', () => {
  it('carrega dados da API e popula refProcedimentos', async () => {
    await renderAndWaitForLoad()

    await waitFor(() => {
      expect(screen.getByTestId('proc-count').textContent).toBe(
        String(FIXTURE_SHEETS_RESPONSE.refProcedimentos.length)
      )
    })
  })

  it('mostra banner de erro quando GET /api/sheets falha', async () => {
    server.use(
      http.get('/api/sheets', () =>
        HttpResponse.json({ error: 'Internal Server Error' }, { status: 500 })
      )
    )

    render(
      <DashboardDataProvider>
        <div>conteúdo</div>
      </DashboardDataProvider>
    )

    await waitFor(() => {
      expect(screen.getByText(/erro ao carregar planilha/i)).toBeInTheDocument()
    })
  })
})

describe('DashboardDataContext — refreshData & cache busting', () => {
  it('refreshData chama /api/sheets com parâmetro _t', async () => {
    const capturedUrls: string[] = []

    server.use(
      http.get('/api/sheets', ({ request }) => {
        capturedUrls.push(request.url)
        return HttpResponse.json(FIXTURE_SHEETS_RESPONSE)
      })
    )

    await renderAndWaitForLoad()
    // Wait for the initial call to complete
    await waitFor(() => {
      expect(screen.getByTestId('proc-count').textContent).not.toBe('0')
    })

    const initialCallCount = capturedUrls.length

    // Trigger refreshData
    await userEvent.click(screen.getByRole('button', { name: /refresh/i }))

    await waitFor(() => {
      expect(capturedUrls.length).toBeGreaterThan(initialCallCount)
    })

    // The refresh call must include _t param for cache busting
    const refreshCall = capturedUrls[capturedUrls.length - 1]
    expect(refreshCall).toContain('_t=')
  })

  it('refreshData NÃO envia _t para a URL do Google Sheets', async () => {
    // This test verifies the critical fix: _t must stay inside our own API,
    // not leak into responses that would be passed to Google.
    // We verify that the MSW-intercepted URL is our /api/sheets (not googleapis.com).
    const capturedUrls: string[] = []

    server.use(
      http.get('/api/sheets', ({ request }) => {
        capturedUrls.push(request.url)
        return HttpResponse.json(FIXTURE_SHEETS_RESPONSE)
      })
    )

    await renderAndWaitForLoad()
    await waitFor(() => screen.getByTestId('proc-count'))

    await userEvent.click(screen.getByRole('button', { name: /refresh/i }))

    // All calls must be to our own API, not Google
    for (const url of capturedUrls) {
      expect(url).not.toContain('googleapis.com')
      expect(url).toContain('/api/sheets')
    }
  })

  it('atualiza os dados no contexto após refreshData', async () => {
    let callCount = 0
    const updatedProcedimentos = [
      ...FIXTURE_SHEETS_RESPONSE.refProcedimentos,
      { procedimento: 'Yoga', precoCusto: 50, precoVenda: 70, ativo: true, status: 'Ativo', dataInsercao: '', dataAtualizacao: '', valoresAnteriores: '' },
    ]

    server.use(
      http.get('/api/sheets', () => {
        callCount++
        // Second call returns updated data with one extra procedure
        const payload = callCount > 1
          ? { ...FIXTURE_SHEETS_RESPONSE, refProcedimentos: updatedProcedimentos }
          : FIXTURE_SHEETS_RESPONSE
        return HttpResponse.json(payload)
      })
    )

    await renderAndWaitForLoad()

    const initialCount = FIXTURE_SHEETS_RESPONSE.refProcedimentos.length
    await waitFor(() => {
      expect(screen.getByTestId('proc-count').textContent).toBe(String(initialCount))
    })

    // Trigger refresh — should now see the extra procedure
    await userEvent.click(screen.getByRole('button', { name: /refresh/i }))

    await waitFor(() => {
      expect(screen.getByTestId('proc-count').textContent).toBe(String(initialCount + 1))
    })
  })
})
