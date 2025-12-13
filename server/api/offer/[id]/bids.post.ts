export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  const data = await readBody(event)
  const offerIdParam = getRouterParam(event, 'id')

  if (!session.user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized', message: 'You must be logged in to access this page' })
  }

  if (!offerIdParam) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid Request',
      message: 'The offer ID is missing or invalid.',
    })
  }

  try {
    const db = event.context.cloudflare.env.DB

    const query = `
      INSERT INTO bids(
        offer_id,user_id,value
      )
      VALUES (?, ?, ?)
      `

    await db.prepare(query).bind(offerIdParam, session.user.id, data.value).run()

    return {
      ok: true,
      message: 'Your bid has been created.',
    }
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      message: 'An unexpected error occurred while posting the bid.',
    })
  }
})
