import { getBidOwnership, assertBidOrOfferOwner } from '../../utils/authBid'

export default defineEventHandler(async (event) => {
  const user = event.context.user
  const userId = user.id
  const suggestionId = getRouterParam(event, 'id')

  if (!suggestionId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid Request',
      message: 'The Suggestion ID is missing or invalid.',
    })
  }

  const body = await readBody(event)
  const db = event.context.cloudflare.env.DB

  // 1) Load suggestion (and ownership)
  const row = await db.prepare(`SELECT id, user_id, bid_id FROM suggestions WHERE id = ? LIMIT 1`).bind(suggestionId).first()

  if (!row) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Not Found',
      message: 'Suggestion not found.',
    })
  }

  const { bidOwnerId, offerOwnerId } = await getBidOwnership(db, row.bid_id!)
  assertBidOrOfferOwner({ userId, bidOwnerId, offerOwnerId })

  // 3) Build update
  const fields: string[] = []
  const values: any[] = []

  // Update suggestion JSON
  if (body?.suggestion !== undefined) {
    const suggestionJson = Array.isArray(body.suggestion) ? JSON.stringify(body.suggestion) : '[]'
    fields.push('suggestion = ?')
    values.push(suggestionJson)
  }

  if (fields.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: 'No valid fields to update.',
    })
  }

  values.push(suggestionId)

  const result = await db
    .prepare(`UPDATE suggestions SET ${fields.join(', ')} WHERE id = ?`)
    .bind(...values)
    .run()

  if (result.meta.changes === 0) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Not Found',
      message: 'Suggestion not found.',
    })
  }

  return {
    success: true,
    meta: result.meta,
    message: 'Suggestion updated.',
  }
})
