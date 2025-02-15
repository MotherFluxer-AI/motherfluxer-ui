import { setupServer } from 'msw/node'
import { rest } from 'msw'
import { handlers } from './handlers'

export const server = setupServer(...handlers) 