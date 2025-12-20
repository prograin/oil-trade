export default defineEventHandler(async (event) => {
  try {
    const db = event.context.cloudflare.env.DB
    const { results } = await db
      .prepare(
        `
        SELECT 
            demands.*,users.nickname AS nickname 
        FROM demands
        JOIN users ON users.id = demands.user_id
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
