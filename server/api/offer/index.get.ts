export default defineEventHandler(async (event) => {
  try {
    const db = event.context.cloudflare.env.DB
    const { results } = await db
      .prepare(
        `
        SELECT 
            offers.*,users.nickname AS nickname 
        FROM offers
        JOIN users ON users.id = offers.user_id
        `,
      )
      .all()

    return { success: true, results }
  } catch (err) {
    setResponseStatus(event, 500)

    return {
      success: false,
      message: 'Internal server error',
    }
  }
})
