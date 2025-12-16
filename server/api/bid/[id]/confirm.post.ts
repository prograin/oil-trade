// server/api/bids/[bidId]/confirm.post.ts
export default defineEventHandler(async (event) => {
  const db = event.context.cloudflare.env.DB
  const session = await getUserSession(event)
  const user = session.user

  if (!user.id) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
      message: 'You must be logged in to confirm a bid.',
    })
  }

  const bidId = Number(getRouterParam(event, 'id'))
  if (!Number.isFinite(bidId) || bidId <= 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid bidId',
      message: 'The bid ID is missing or invalid.',
    })
  }

  const row = await db
    .prepare(
      `
      SELECT
        b.id           AS bid_id,
        b.offer_id     AS offer_id,
        b.is_confirmed AS is_confirmed,
        o.user_id      AS offer_owner_id
      FROM bids b
      JOIN offers o ON o.id = b.offer_id
      WHERE b.id = ?
    `,
    )
    .bind(bidId)
    .first()

  if (!row) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Bid not found',
      message: 'The specified bid does not exist.',
    })
  }

  if (row.offer_owner_id !== user.id) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden',
      message: 'Only the owner of the offer can confirm a bid.',
    })
  }

  // Already confirmed
  if (row.is_confirmed === 1 || row.is_confirmed === true) {
    return {
      success: true,
      message: 'This bid has already been confirmed.',
      bidId,
      offerId: row.offer_id,
      is_confirmed: true,
    }
  }

  await db.batch([
    db.prepare(`UPDATE bids SET is_confirmed = false WHERE offer_id = ?`).bind(row.offer_id),
    db.prepare(`UPDATE bids SET is_confirmed = true WHERE id = ?`).bind(bidId),
  ])

  const confirmedBid = await db.prepare(`SELECT * FROM bids WHERE id = ?`).bind(bidId).first()

  return {
    success: true,
    message: 'The bid has been successfully confirmed.',
    bid: confirmedBid,
  }
})
