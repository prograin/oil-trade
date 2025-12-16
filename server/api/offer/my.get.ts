export default defineEventHandler(async (event) => {
  try {
    const session = await getUserSession(event)
    const db = event.context.cloudflare.env.DB
    const query = getQuery(event)
    const includeBids = query.include === 'bids'

    if (!session?.user) {
      throw createError({ statusCode: 401, statusMessage: 'Unauthorized', message: 'Unauthorized' })
    }

    // 1) Fetch user's offers
    const offersRes = await db
      .prepare(
        `
        SELECT
          offers.*
        FROM offers
        WHERE offers.user_id = ?
        ORDER BY offers.id DESC
        `,
      )
      .bind(session.user.id)
      .all()

    const offers = offersRes.results ?? []

    // Default: offers only
    if (!includeBids) {
      return { success: true, results: offers }
    }

    // 2) Fetch bids for all offers (single query)
    if (offers.length === 0) {
      return { success: true, results: [] }
    }

    const offerIds = offers.map((o: any) => o.id)
    const placeholders = offerIds.map(() => '?').join(',')

    const bidsRes = await db
      .prepare(
        `
        SELECT
          bids.*,
          users.nickname AS bidder
        FROM bids
        JOIN users ON bids.user_id = users.id
        WHERE bids.offer_id IN (${placeholders})
        ORDER BY bids.created_at DESC
        `,
      )
      .bind(...offerIds)
      .all()

    const bids = bidsRes.results ?? []

    // 3) Group bids by offer_id and attach
    const bidsByOfferId: Record<string, any[]> = {}
    for (const b of bids) {
      ;(bidsByOfferId[b.offer_id] ||= []).push(b)
    }

    const merged = offers.map((o: any) => ({
      ...o,
      bids: bidsByOfferId[o.id] ?? [],
    }))
    console.log(merged[0].bids.length)
    return { success: true, results: merged }
  } catch (err) {
    setResponseStatus(event, 500)
    return { success: false, message: 'Internal server error' }
  }
})
