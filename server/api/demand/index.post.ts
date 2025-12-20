export default defineEventHandler(async (event) => {
  const user = event.context.user // if your auth middleware sets this; otherwise remove
  const body = await readBody(event)

  const db = event.context.cloudflare.env.DB

  // IMPORTANT: use your real user id source; this is just a safe fallback.
  const userId = body.user_id ?? user?.id

  if (!userId) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized', message: 'Login required.' })
  }

  const query = `
    INSERT INTO demands (
      user_id, document_type, product,
      api_min, api_max, sulfur_max,
      quantity, deal_type, delivery_term, delivery_detail, transfer_zone,
      benchmark_based, payment_term, operation_cost, down_payment,
      target_price, validity, is_active
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `

  const params = [
    userId,
    body.document_type,
    body.product,
    body.api_min,
    body.api_max,
    body.sulfur_max,
    body.quantity,
    body.deal_type,
    body.delivery_term,
    body.delivery_detail,
    body.transfer_zone,
    body.benchmark_based,
    body.payment_term,
    body.operation_cost,
    body.down_payment,
    body.target_price,
    body.validity,
    body.is_active ?? false,
  ]

  const result = await db
    .prepare(query)
    .bind(...params)
    .run()

  return {
    ok: true,
    message: 'Demand Created',
    id: result.meta?.last_row_id,
  }
})
