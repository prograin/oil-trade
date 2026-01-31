const negotiationOptionsMap: Record<any, any> = {
  price: 'Price',
  validity: 'Validity',
  payment_term: 'Payment Term',
  quantity: 'Quantity',
  delivery_term: 'Delivery Term',
  delivery_detail: 'Delivery Details',
  transfer_zone: 'Transfer Zone / OPL',
  down_payment: 'Down Payment',
  operation_cost: 'Operation Cost',
  benchmark_based: 'Benchmark Differential',
}

export function negotiationFieldToLabelValue(negotiation_field: any) {
  const arr = Array.isArray(negotiation_field)
    ? negotiation_field
    : (() => {
        try {
          return JSON.parse(negotiation_field ?? '[]')
        } catch {
          return []
        }
      })()

  const b = arr.map((v: any) => ({
    label: negotiationOptionsMap[v] ?? v,
    value: v,
  }))
  return b
}
