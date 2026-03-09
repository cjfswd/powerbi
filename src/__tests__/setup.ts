import '@testing-library/jest-dom'
import { beforeAll, afterEach, afterAll } from 'vitest'
import { server } from './msw/server'

// jsdom does not implement window.scrollTo — stub to prevent errors
Object.defineProperty(window, 'scrollTo', { value: () => {}, writable: true })

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }))
afterEach(() => {
  server.resetHandlers()
  localStorage.clear()
})
afterAll(() => server.close())



