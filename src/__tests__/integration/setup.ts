/**
 * Setup file scoped exclusively to integration tests.
 * Starts MSW server before the suite and tears it down after.
 * Unit tests MUST NOT import this file — they may stub fetch directly.
 */
import '@testing-library/jest-dom'
import { beforeAll, afterEach, afterAll } from 'vitest'
import { server } from '../msw/server'

// jsdom does not implement window.scrollTo
Object.defineProperty(window, 'scrollTo', { value: () => {}, writable: true })

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }))
afterEach(() => {
  server.resetHandlers()
  localStorage.clear()
})
afterAll(() => server.close())
