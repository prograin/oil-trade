#OfferTable.vue
<template>
  <table>
    <thead>
      <tr>
        <th>Item</th>
        <th>Details</th>
      </tr>
    </thead>
    <tbody>
      <OfferRow label="Document Type">
        <OfferSelect :options="documentOptions" />
      </OfferRow>

      <OfferRow label="Product">
        <OfferSelect :options="['Light Crude Oil', 'Heavy Crude Oil', 'Super Heavy Crude Oil']" />
      </OfferRow>

      <OfferRow label="Specification">
        <OfferSpecInput />
      </OfferRow>

      <OfferRow label="Quantity">
        <OfferSelect :options="['500,000 BBL', '700,000 BBL', '1,000,000 BBL', '2,000,000 BBL']" />
      </OfferRow>

      <OfferRow label="Deal Type">
        <OfferSelect :options="['Spot', 'Term Contract', 'Trial Shipment']" />
      </OfferRow>

      <OfferRow label="Delivery Term">
        <OfferInput placeholder="Delivery details" />
      </OfferRow>

      <OfferRow label="Price">
        <OfferInput placeholder="Custom Bid Ratio e.g., 2.50" type="number" />
      </OfferRow>

      <OfferRow label="Payment Term">
        <OfferSelect :options="['TT', 'SBLC', 'DLC', 'Escrow']" />
      </OfferRow>

      <OfferRow label="Inspection">
        <OfferSelect :options="['SGS', 'CCIC', 'Intertek']" />
      </OfferRow>

      <OfferRow label="Validity">
        <OfferInput type="date" />
      </OfferRow>
    </tbody>
  </table>
</template>

<script setup>
  import OfferRow from './OfferRow.vue'
  import OfferSelect from './OfferSelect.vue'
  import OfferInput from './OfferInput.vue'
  import OfferSpecInput from './OfferSpecInput.vue'

  // ... (documentOptions data remains the same)
  const documentOptions = [
    {
      group: 'Buy-Side (Request)',
      values: ['RFQ', 'LOI', 'ICPO']
    },
    {
      group: 'Sell-Side (Offer)',
      values: ['Availability Notice', 'Spot Cargo Offer', 'Term Contract Proposal']
    },
    {
      group: 'Other',
      values: ['EOI', 'Term Sheet']
    }
  ]
</script>