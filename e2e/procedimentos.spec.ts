/**
 * Playwright E2E tests for Gerenciar Procedimentos.
 * Requires `pnpm run dev` at localhost:5173.
 */
import { test, expect, type Page } from '@playwright/test'

async function authenticate(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem('powerbi_dashboard_auth_user', 'rai.oliveira')
  })
}

async function goToProcedimentos(page: Page) {
  await authenticate(page)
  await page.goto('/')

  await page.getByRole('tab', { name: /inserir dados/i }).click()
  await expect(page.getByRole('tab', { name: /gerenciar procedimentos/i })).toBeVisible()
  await page.getByRole('tab', { name: /gerenciar procedimentos/i }).click()

  await expect(page.getByText(/procedimentos cadastrados/i)).toBeVisible()
}

test.describe('Gerenciar Procedimentos - leitura', () => {
  test('lista de procedimentos e exibida ao carregar a pagina', async ({ page }) => {
    await goToProcedimentos(page)

    const rows = page.locator('table tbody tr')
    await expect(rows.first()).toBeVisible({ timeout: 15_000 })
    expect(await rows.count()).toBeGreaterThan(0)
  })

  test('usuario consegue buscar um procedimento pelo nome', async ({ page }) => {
    await goToProcedimentos(page)

    const searchBox = page.getByPlaceholder(/buscar procedimento/i)
    await searchBox.fill('Fis')

    const rows = page.locator('table tbody tr')
    const count = await rows.count()
    expect(count).toBeGreaterThan(0)

    for (let i = 0; i < count; i += 1) {
      const text = (await rows.nth(i).textContent())?.toLowerCase() || ''
      expect(text).toContain('fis')
    }
  })
})

test.describe('Gerenciar Procedimentos - edicao', () => {
  test('clicar Editar preenche o formulario e desabilita o campo Nome', async ({ page }) => {
    await goToProcedimentos(page)

    await page.locator('table tbody tr').first().getByRole('button', { name: /editar/i }).click()

    await expect(page.getByText(/editar procedimento/i)).toBeVisible()

    const nameInput = page.getByPlaceholder('Ex: Fisioterapia')
    await expect(nameInput).toBeDisabled()
    await expect(nameInput).not.toHaveValue('')

    await expect(page.getByRole('button', { name: /cancelar/i })).toBeVisible()
  })

  test('Cancelar reseta o formulario para criacao', async ({ page }) => {
    await goToProcedimentos(page)

    await page.locator('table tbody tr').first().getByRole('button', { name: /editar/i }).click()
    await expect(page.getByText(/editar procedimento/i)).toBeVisible()

    await page.getByRole('button', { name: /cancelar/i }).click()

    await expect(page.getByText(/novo procedimento/i)).toBeVisible()
    await expect(page.getByPlaceholder('Ex: Fisioterapia')).toHaveValue('')
  })
})

test.describe('Gerenciar Procedimentos - criacao', () => {
  test('botao Adicionar a Fila so habilita com campos preenchidos', async ({ page }) => {
    await goToProcedimentos(page)

    const addButton = page.getByRole('button', { name: /adicionar/i })
    await expect(addButton).toBeDisabled()

    await page.getByPlaceholder('Ex: Fisioterapia').fill('Procedimento E2E')
    await page.getByPlaceholder('Ex: 100.00').fill('50')
    await page.getByPlaceholder('Ex: 150.00').fill('80')

    await expect(addButton).toBeEnabled()
  })

  test('adiciona na fila e exibe acao de salvar lote', async ({ page }) => {
    await goToProcedimentos(page)

    await page.getByPlaceholder('Ex: Fisioterapia').fill('Procedimento E2E')
    await page.getByPlaceholder('Ex: 100.00').fill('50')
    await page.getByPlaceholder('Ex: 150.00').fill('80')

    await page.getByRole('button', { name: /adicionar/i }).click()

    await expect(page.getByText(/procedimento\(s\) na fila/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /salvar lote/i })).toBeVisible()
  })
})
