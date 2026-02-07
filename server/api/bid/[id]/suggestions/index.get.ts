export default defineEventHandler(async (event) => {
  try {
    const db = event.context.cloudflare.env.DB
    const bidIdParam = getRouterParam(event, 'id')

    if (!bidIdParam) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid Request',
        message: 'The Bid ID is missing or invalid.',
      })
    }

    const { results } = await db
      .prepare(
        `
        SELECT
          suggestions.id,
          suggestions.user_id,
          suggestions.bid_id,
          suggestions.suggestion,
          users.nickname
        FROM suggestions
        JOIN users ON users.id = suggestions.user_id
        WHERE suggestions.bid_id = ?
        ORDER BY suggestions.id DESC
      `,
      )
      .bind(bidIdParam)
      .all()

    return { success: true, results }
  } catch (err) {
    setResponseStatus(event, 500)
    return { success: false, message: 'Internal server error' }
  }
})
