import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { generateNickname } from '~~/server/utils/generateNickname'

const signupSchema = z.object({
  email: z.email(),
  name: z.string(),
  password: z.string().min(8),
})

export default defineEventHandler(async (event) => {
  const { name, email, password } = await readValidatedBody(event, signupSchema.parse)

  const db = event.context.cloudflare.env.DB
  const nickname = generateNickname()

  const existingUser = await db.prepare('SELECT id FROM users WHERE email = ?').bind(email).first()

  if (existingUser) {
    throw createError({
      statusCode: 409,
      statusMessage: 'Email already in use',
    })
  }

  const passwordHash = await bcrypt.hash(password, 10)
  const result = await db
    .prepare('INSERT INTO users (email,  name, nickname, password) VALUES (?, ?, ?, ?)')
    .bind(email, name, nickname, passwordHash)
    .run()
  const userId = result.lastInsertRowId ?? null

  await setUserSession(event, {
    user: {
      id: userId,
      email,
      nickname,
    },
  })

  return {
    id: userId,
    email,
    nickname,
  }
})
