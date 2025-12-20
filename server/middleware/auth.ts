import { jwtVerify } from 'jose'

export default defineEventHandler(async (event) => {
  const db = event.context.cloudflare.env.DB
  const publicRules: Array<{ prefix: string; methods?: string[] }> = [
    { prefix: '/api/_auth' },
    { prefix: '/api/version' },
    { prefix: '/register' },
    { prefix: '/api/auth/login' },
    { prefix: '/api/auth/signup' },
    { prefix: '/api/offer', methods: ['GET'] }, // only GET is public
  ]
  const path = event.path || ''
  const method = (event.method || 'GET').toUpperCase()

  const isPublic = publicRules.some((r) => {
    const matchPrefix = path === r.prefix || path.startsWith(r.prefix + '/')
    const matchMethod = !r.methods || r.methods.includes(method)
    return matchPrefix && matchMethod
  })

  if (isPublic) return

  if (event.path.startsWith('/api/_hub')) {
    return
  }

  if (event.path.startsWith('/api')) {
    const authHeader = getHeader(event, 'authorization')

    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.slice(7).trim()
        const secret = new TextEncoder().encode(event.context.cloudflare.env.JWT_SECRET)
        const { payload } = await jwtVerify(token, secret)
        const userId = payload.sub ? Number(payload.sub) : (payload.userId as number | undefined)
        if (!userId) {
          throw createError({ statusCode: 401, statusMessage: 'Unauthorized', message: 'Invalid token payload' })
        }
        event.context.user = { id: userId, ...payload }
      } catch (error) {
        throw createError({
          statusCode: 401,
          statusMessage: 'Unauthorized',
          message: 'You must be logged in.',
        })
      }
    } else {
      const session = await getUserSession(event)
      const user = session.user

      if (!user.id) {
        throw createError({
          statusCode: 401,
          statusMessage: 'Unauthorized',
          message: 'You must be logged in.',
        })
      }
      event.context.user = user
    }
  }
})
