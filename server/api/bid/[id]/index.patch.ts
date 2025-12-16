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

  const fields: string[] = []
  const values: any[] = []

  try {
    const db = event.context.cloudflare.env.DB
    // allow updating bid value
    if (body.value !== undefined) {
      fields.push('value = ?')
      values.push(body.value)
    }

    if (fields.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Bad Request',
        message: 'No valid fields to update',
      })
    }

    const query = `
    UPDATE bids
    SET ${fields.join(', ')}
    WHERE id = ?
  `

    values.push(bidIdParam)

    const result = await db
      .prepare(query)
      .bind(...values)
      .run()

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
