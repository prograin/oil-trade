export default defineEventHandler(async (event) => {
  try {
    const data = await readBody(event)
    const user = event.context.user
    const bidIdParam = getRouterParam(event, 'id')

    if (!bidIdParam) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid Request',
        message: 'The Bid ID is missing or invalid.',
      })
    }

    const userId = user.id
    const db = event.context.cloudflare.env.DB

    // Expect: [{ field, value, status, field_name }]
    const suggestionJson = Array.isArray(data?.suggestion) ? JSON.stringify(data.suggestion) : '[]'

    await db
      .prepare(`INSERT INTO suggestions (user_id, bid_id, suggestion) VALUES (?, ?, ?)`)
      .bind(userId, bidIdParam, suggestionJson) // <-- DO NOT stringify again
      .run()

    return {
      success: true,
      message: 'Your Suggestion has been added.',
    }
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      message: 'An unexpected error occurred while posting the offer.',
    })
  }
})
