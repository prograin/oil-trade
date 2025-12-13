export default defineEventHandler(async (event) => {
  const idParam = getRouterParam(event, 'id')

  if (!idParam) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid Request',
      message: 'The offer ID is missing or invalid.',
    })
  }

  try {
    const db = event.context.cloudflare.env.DB

    const query = `
      SELECT 
        bids.*,
        users.nickname AS nickname
      FROM bids
      JOIN users ON bids.user_id = users.id
      WHERE bids.offer_id = ?
    `

    //sample: [{},{}]
    const { results } = await db.prepare(query).bind(idParam).all()

    return {
      success: true,
      results,
    }
  } catch (error) {
    return {
      success: false,
      message: 'An unexpected error occurred while fetching the bids.',
    }
  }
})
