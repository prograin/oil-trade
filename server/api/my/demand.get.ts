export default defineEventHandler(async (event) => {
  try {
    const db = event.context.cloudflare.env.DB

    const demandsRes = await db
      .prepare(
        `
        SELECT demands.*
        FROM demands
        WHERE demands.user_id = ?
        ORDER BY demands.id DESC
        `,
      )
      .bind(event.context.user.id)
      .all()

    return { success: true, results: demandsRes.results ?? [] }
  } catch (err) {
    setResponseStatus(event, 500)
    return { success: false, message: 'Internal server error' }
  }
})
