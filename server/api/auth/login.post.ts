import zod from 'zod'
import bcrypt from 'bcryptjs'

const bodySchema = zod.object({
  email: zod.string().email(),
  password: zod.string().min(8),
})

export default defineEventHandler(async (event) => {
  const { email, password } = await readValidatedBody(event, bodySchema.parse)

  const db = event.context.cloudflare.env.DB
  const user = await db.prepare('SELECT * FROM users WHERE email=?').bind(email).first()

  if (!user) {
    throw createError({
      statusCode: 401,
      message: 'Invalid email or password.',
    })
  }

  const isValid = await bcrypt.compare(password, user.password)

  if (!isValid) {
    throw createError({
      statusCode: 401,
      message: 'Invalid email or password.',
    })
  }

  await setUserSession(event, {
    user: {
      id: user.id,
      nickname: user.nickname,
      email: user.email,
    },
  })

  return { ok: true }
})
