export default defineEventHandler(async (event) => {
  const bidIdParam = getRouterParam(event, 'id')

  if (!bidIdParam) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid Request',
      message: 'The bid ID is missing or invalid.',
    })
  }

  const body = await readBody(event)
  const { value } = body

  if (value === undefined) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid Request',
      message: 'Bid value is required.',
    })
  }

  try {
    const db = event.context.cloudflare.env.DB

    const query = `
      UPDATE bids 
      SET value = ?
      WHERE id = ?
    `

    const result = await db.prepare(query).bind(value, bidIdParam).run()

    if (result.meta.changes === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Not Found',
        message: 'Bid not found.',
      })
    }

    return {
      success: true,
      meta: result.meta,
      message: 'Your bid has been updated.',
    }
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      message: 'An unexpected error occurred while updating the bid.',
    })
  }
})
