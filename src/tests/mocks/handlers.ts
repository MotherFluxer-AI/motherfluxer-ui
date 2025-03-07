import { rest } from 'msw'

export const handlers = [
  // Auth endpoints
  rest.post('/api/auth/login', (_req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        token: 'mock-jwt-token',
        user: {
          id: '1',
          email: 'test@example.com',
          role: 'user',
        },
      })
    )
  }),

  // Model instance endpoints
  rest.get('/api/instances/health', (_req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        instances: [
          {
            id: '1',
            name: 'instance-1',
            health: 100,
            status: 'active',
          },
        ],
      })
    )
  }),

  rest.post('/api/chat', (_req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        message: 'Response message',
        timestamp: new Date().toISOString()
      })
    )
  }),

  rest.get('/api/models', (_req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        models: [
          { id: 'instance-1', name: 'Model 1', status: 'active' },
          { id: 'instance-2', name: 'Model 2', status: 'active' }
        ]
      })
    )
  }),

  // Add more handlers as needed...
] 