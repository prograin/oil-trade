import type { CatalogField } from '@/types/bid' // relative path to shared/types/bid.d.ts

export const fieldsCatalog: CatalogField[] = [
  { key: 'price', label: 'Price (USD/BBL)', type: 'number', placeholder: 'e.g., 65.90' },
  { key: 'benchmark', label: 'Benchmark Differential', type: 'text', placeholder: 'e.g., +1.75 or -0.50' },
  { key: 'quantity', label: 'Quantity (BBL)', type: 'number', placeholder: 'e.g., 200000' },
  { key: 'delivery_term', label: 'Delivery Term', type: 'select', options: ['CFR', 'CIF', 'FOB', 'DAP'] },
  { key: 'delivery_detail', label: 'Delivery Detail (Port/Terminal)', type: 'text', placeholder: 'e.g., CFR Qingdao / Ningbo' },
  { key: 'payment_term', label: 'Payment Term', type: 'select', options: ['SBLC', 'LC at sight', 'LC deferred', 'D/P', 'T/T'] },
  { key: 'validity', label: 'Validity', type: 'date' },
  {
    key: 'document_type',
    label: 'Document Type',
    type: 'select',
    options: [
      'RFQ – Request for Quotation',
      'LOI – Letter of Intent',
      'ICPO – Irrevocable Corporate Purchase Order (Draft)',
      'Availability Notice – Sales Offer (SCO)',
      'Spot Cargo Offer',
      'Term Contract Proposal',
      'EOI – Expression of Interest',
      'Term Sheet',
    ],
  },
  { key: 'product', label: 'Product', type: 'select', options: ['Light Crude Oil', 'Heavy Crude Oil', 'Super Heavy Crude Oil'] },
  { key: 'api', label: 'API', type: 'number', placeholder: 'e.g., 34.0' },
  { key: 'sulfur', label: 'Sulfur', type: 'number', placeholder: 'e.g., 1.2' },
  { key: 'transfer_zone', label: 'Transfer Zone', type: 'text', placeholder: 'e.g., Qingdao / Ningbo' },
  { key: 'benchmark_based', label: 'Benchmark Based', type: 'number', placeholder: 'e.g., 2.50' },
  {
    key: 'operation_cost',
    label: 'Operation Cost',
    type: 'select',
    options: ['Standard STS operation included', 'Buyer to cover STS costs', 'Shared operation costs (50/50)'],
  },
  {
    key: 'down_payment',
    label: 'Down Payment',
    type: 'select',
    options: ['After Dip Test', 'Before Dip Test', 'LC', 'BG', 'Escrow Account Deposit', 'Back To Back Deal'],
  },
]
