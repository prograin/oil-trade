import { getBidOwnership, assertBidOrOfferOwner } from '../../../utils/authBid'

// server/api/offers/[offerId]/negotiate.post.ts
export default defineEventHandler(async (event) => {
  const user = event.context.user

  const offerIdParam = getRouterParam(event, 'id')
  if (!offerIdParam) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid Request', message: 'The offer ID is missing or invalid.' })
  }

  const body = await readBody(event)

  const value = Number(body?.value)
  if (!Number.isFinite(value)) {
    throw createError({ statusCode: 400, statusMessage: 'Bad Request', message: 'Invalid bid value.' })
  }

  const suggestionJson = Array.isArray(body?.suggestion) ? JSON.stringify(body.suggestion) : '[]'

  const db = event.context.cloudflare.env.DB
  const userId = Number(user.id)
  const offerId = Number(offerIdParam)

  try {
    // If bid_id is provided: update that bid + insert suggestion referencing bid_id (atomic via batch)
    if (body?.bid_id) {
      const bidId = Number(body.bid_id)
      if (!Number.isFinite(bidId)) {
        throw createError({ statusCode: 400, statusMessage: 'Bad Request', message: 'Invalid bid_id.' })
      }
      const { bidOwnerId, offerOwnerId } = await getBidOwnership(db, bidId!)
      assertBidOrOfferOwner({ userId, bidOwnerId, offerOwnerId })

      const stmts = [
        db
          .prepare(
            `
          UPDATE bids
          SET value = ?
          WHERE id = ?
            AND offer_id = ?
            AND user_id = ?
        `,
          )
          .bind(value, bidId, offerId, userId),

        db
          .prepare(
            `
          INSERT INTO suggestions (user_id, bid_id, suggestion)
          VALUES (?, ?, ?)
        `,
          )
          .bind(userId, bidId, suggestionJson),
      ]

      const results = await db.batch(stmts)

      // If UPDATE matched 0 rows, treat as forbidden/not found
      const anyChanged = results.some((r: any) => (r.meta?.changes ?? 0) > 0)
      if (!anyChanged) {
        throw createError({
          statusCode: 403,
          statusMessage: 'Forbidden',
          message: 'Bid not found for this offer or you do not own it.',
        })
      }

      return {
        success: true,
        bid_id: bidId,
        message: 'Negotiation submitted (bid updated + suggestion created).',
      }
    }

    // Otherwise: create bid + insert suggestion using last_insert_rowid() (atomic via batch)
    const stmts = [
      db
        .prepare(
          `
        INSERT INTO bids (offer_id, user_id, value)
        VALUES (?, ?, ?)
      `,
        )
        .bind(offerId, userId, value),

      db
        .prepare(
          `
        INSERT INTO suggestions (user_id, bid_id, suggestion)
        VALUES (?, last_insert_rowid(), ?)
      `,
        )
        .bind(userId, suggestionJson),
    ]

    const results = await db.batch(stmts)

    const newBidId = results[0]?.meta?.last_row_id
    if (!newBidId) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Internal Server Error',
        message: 'Failed to create bid.',
      })
    }

    return {
      success: true,
      bid_id: Number(newBidId),
      message: 'Negotiation submitted (bid created + suggestion created).',
    }
  } catch (error: any) {
    if (error?.statusCode) throw error

    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      message: 'An unexpected error occurred while submitting the negotiation.',
    })
  }
})
