// server/api/demand/[id].delete.ts
export default defineEventHandler(async (event) => {
  // get id from route: /api/demand/:id
  const idParam = getRouterParam(event, 'id')

  if (!idParam) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid Request',
      message: 'The demand ID is missing or invalid.',
    })
  }

  try {
    const db = event.context.cloudflare.env.DB

    const result = await db
      .prepare(
        `
        DELETE FROM demands
        WHERE id = ?
      `,
      )
      .bind(idParam)
      .run()

    // D1: result.meta.changes = number of rows deleted
    if (result.meta.changes === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Demand Not Found',
        message: `No demand exists with ID: ${idParam}.`,
      })
    }

    return {
      success: true,
      message: 'The demand has been deleted successfully.',
    }
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Deletion Failed',
      message: 'An unexpected error occurred while deleting the demand.',
    })
  }
})
