export default defineEventHandler(async (event) => {
  const bidIdParam = getRouterParam(event, 'id')

  if (!bidIdParam) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid Request',
      message: 'The bid ID is missing or invalid.',
    })
  }

  try {
    const db = event.context.cloudflare.env.DB

    const query = `
      DELETE FROM bids
      WHERE id = ?
    `

    const result = await db.prepare(query).bind(bidIdParam).run()

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
      message: 'Bid deleted successfully',
    }
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      message: 'An unexpected error occurred while deleting the bid.',
    })
  }
})
