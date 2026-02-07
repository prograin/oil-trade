import { createError } from 'h3'

type Ownership = {
  bidId: number
  bidOwnerId: number
  offerOwnerId: number
}

export async function getBidOwnership(db: any, bidId: string | number): Promise<Ownership> {
  const row = await db
    .prepare(
      `
      SELECT
        b.id      AS bid_id,
        b.user_id AS bid_owner_id,
        o.user_id AS offer_owner_id
      FROM bids b
      JOIN offers o ON o.id = b.offer_id
      WHERE b.id = ?
      LIMIT 1
    `,
    )
    .bind(bidId)
    .first()

  if (!row) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Not Found',
      message: 'Bid not found.',
    })
  }

  return {
    bidId: Number(row.bid_id),
    bidOwnerId: Number(row.bid_owner_id),
    offerOwnerId: Number(row.offer_owner_id),
  }
}

export function assertBidOrOfferOwner(params: { userId: string | number; bidOwnerId: number; offerOwnerId: number }) {
  const uid = Number(params.userId)
  if (uid !== params.bidOwnerId && uid !== params.offerOwnerId) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden',
      message: 'You do not have permission to perform this action.',
    })
  }
}
