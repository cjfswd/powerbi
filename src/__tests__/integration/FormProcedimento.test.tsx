import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { MemoryRouter, Route, Routes } from 'react-router-dom'

import { server } from '../msw/server'
import { DataEntry } from '@/components/DataEntry'
import { DashboardDataProvider } from '@/lib/DashboardDataContext'
import { FIXTURE_PROCEDIMENTOS } from '../msw/handlers'

function renderDataEntry() {
  return render(
    <MemoryRouter initialEntries={['/inserir/procedimento']}>
      <DashboardDataProvider>
        <Routes>
          <Route path="/inserir/*" element={<DataEntry />} />
        </Routes>
      </DashboardDataProvider>
    </MemoryRouter>,
  )
}

async function waitForInitialLoad() {
  await waitFor(() => {
    expect(screen.queryByText(/Carregando dados da planilha/i)).not.toBeInTheDocument()
  })
}

describe('FormProcedimento - criacao de novo procedimento', () => {
  it('mostra sucesso apos POST bem-sucedido', async () => {
    renderDataEntry()
    const user = userEvent.setup()

    await waitForInitialLoad()

    await user.type(screen.getByPlaceholderText('Ex: Fisioterapia'), 'Novo Procedimento')
    await user.type(screen.getByPlaceholderText('Ex: 100.00'), '50')
    await user.type(screen.getByPlaceholderText('Ex: 150.00'), '80')

    await user.click(screen.getByRole('button', { name: /adicionar/i }))
    await user.click(screen.getByRole('button', { name: /salvar lote/i }))

    await waitFor(() => {
      expect(screen.getByText('Salvo com sucesso!')).toBeInTheDocument()
    }, { timeout: 4000 })
  })

  it('mantem o envio bloqueado quando os campos estao vazios', async () => {
    renderDataEntry()

    await waitForInitialLoad()

    const addButton = screen.getByRole('button', { name: /adicionar/i })
    expect(addButton).toBeDisabled()
    expect(screen.queryByText('Salvo com sucesso!')).not.toBeInTheDocument()
  })

  it('mostra erro quando a API retorna 500', async () => {
    server.use(
      http.post('/api/procedimentos', () =>
        HttpResponse.json({ error: 'Erro interno do servidor' }, { status: 500 }),
      ),
    )

    renderDataEntry()
    const user = userEvent.setup()

    await waitForInitialLoad()

    await user.type(screen.getByPlaceholderText('Ex: Fisioterapia'), 'Teste Erro')
    await user.type(screen.getByPlaceholderText('Ex: 100.00'), '10')
    await user.type(screen.getByPlaceholderText('Ex: 150.00'), '20')
    await user.click(screen.getByRole('button', { name: /adicionar/i }))
    await user.click(screen.getByRole('button', { name: /salvar lote/i }))

    await waitFor(() => {
      expect(screen.getAllByText(/^Erro:/i).length).toBeGreaterThan(0)
    })
  })
})

describe('FormProcedimento - edicao de procedimento existente', () => {
  async function clickEditFor(procedureName: string) {
    const rows = await screen.findAllByRole('row')
    const targetRow = rows.find((row: HTMLElement) => within(row).queryByText(procedureName))

    if (!targetRow) throw new Error(`Row containing "${procedureName}" not found`)

    const editButton = within(targetRow).getByRole('button', { name: /editar/i })
    fireEvent.click(editButton)
  }

  it('preenche o formulario ao clicar em Editar', async () => {
    renderDataEntry()

    await clickEditFor('Fisioterapia')

    await waitFor(() => {
      expect(screen.getByText(/editar procedimento/i)).toBeInTheDocument()
    })

    const nameInput = screen.getByPlaceholderText('Ex: Fisioterapia') as HTMLInputElement
    expect(nameInput.value).toBe('Fisioterapia')
    expect(nameInput.disabled).toBe(true)
  })

  it('mostra sucesso apos PUT bem-sucedido', async () => {
    renderDataEntry()
    const user = userEvent.setup()

    await clickEditFor('Fisioterapia')
    await waitFor(() => screen.getByText(/editar procedimento/i))

    const costInput = screen.getByPlaceholderText('Ex: 100.00') as HTMLInputElement
    await user.clear(costInput)
    await user.type(costInput, '200')

    await user.click(screen.getByRole('button', { name: /salvar altera/i }))

    await waitFor(() => {
      expect(screen.getByText('Salvo com sucesso!')).toBeInTheDocument()
    }, { timeout: 4000 })
  })

  it('mostra erro 404 quando o procedimento some da planilha', async () => {
    server.use(
      http.put('/api/procedimentos', () =>
        HttpResponse.json({ error: 'Procedimento not found' }, { status: 404 }),
      ),
    )

    renderDataEntry()
    const user = userEvent.setup()

    await clickEditFor('Fisioterapia')
    await waitFor(() => screen.getByText(/editar procedimento/i))

    await user.click(screen.getByRole('button', { name: /salvar altera/i }))

    await waitFor(() => {
      expect(screen.getAllByText(/^Erro:/i).length).toBeGreaterThan(0)
    })
  })

  it('cancelar reseta o formulario para Novo Procedimento', async () => {
    renderDataEntry()

    await clickEditFor('Fisioterapia')
    await waitFor(() => screen.getByText(/editar procedimento/i))

    fireEvent.click(screen.getByRole('button', { name: /cancelar/i }))

    await waitFor(() => {
      expect(screen.getByText(/novo procedimento/i)).toBeInTheDocument()
    })
  })
})

describe('Tabela de procedimentos', () => {
  it('exibe todos os procedimentos do contexto', async () => {
    renderDataEntry()

    for (const procedure of FIXTURE_PROCEDIMENTOS) {
      await waitFor(() => {
        expect(screen.getByText(procedure.procedimento)).toBeInTheDocument()
      })
    }
  })

  it('exibe badges de Ativo e Inativo corretamente', async () => {
    renderDataEntry()

    await waitFor(() => screen.getByText('Fisioterapia'))

    expect(screen.getAllByText('Ativo').length).toBeGreaterThanOrEqual(2)
    expect(screen.getByText('Inativo')).toBeInTheDocument()
  })
})
