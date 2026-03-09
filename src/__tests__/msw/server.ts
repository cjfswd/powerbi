/**
 * MSW Node server for use in Vitest integration tests.
 * Imported and managed globally via setup.ts.
 */
import { setupServer } from 'msw/node'
import { handlers } from './handlers'

export const server = setupServer(...handlers)
