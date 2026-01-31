export default defineEventHandler(async (event) => {
  try {
    const data = await readBody(event)
    const user = event.context.user

    const userId = user.id
    const db = event.context.cloudflare.env.DB

    const negotiationFieldJson = Array.isArray(data.negotiation_field) ? JSON.stringify(data.negotiation_field) : '[]'

    const res = await db
      .prepare(
        `
    INSERT INTO offers (
      user_id, document_type, product, api, sulfur, quantity, deal_type,
      delivery_term, delivery_detail, transfer_zone,
      benchmark_based, payment_term, operation_cost,
      down_payment, price, validity ,negotiation_field
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `,
      )
      .bind(
        userId,
        data.document_type,
        data.product,
        data.api,
        data.sulfur,
        data.quantity,
        data.deal_type,
        data.delivery_term,
        data.delivery_detail,
        data.transfer_zone,
        data.benchmark_based,
        data.payment_term,
        data.operation_cost,
        data.down_payment,
        data.price,
        data.validity,
        negotiationFieldJson,
      )
      .run()

    return {
      success: true,
      message: 'Your offer has been created.',
    }
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      message: 'An unexpected error occurred while posting the offer.',
    })
  }
})
