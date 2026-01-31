<!-- 
Click on "Bid" -> bid_id not exist - we have to create
Click on "Open Bid" => bid_id pass - we get history
-->

<script setup lang="ts">
type Role = 'buyer' | 'seller'
type From = 'dashboard' | 'explore'
type FieldStatus = 'pending' | 'accepted' | 'denied'
type SuggestionOverall = 'pending' | 'accepted' | 'denied'

type CatalogField = {
  key: string
  label: string
  type: 'text' | 'number' | 'select' | 'date'
  options?: string[]
  placeholder?: string
}

type SuggestionField = {
  field: string
  field_name: string
  value: string
  status: FieldStatus
}

type Suggestion = {
  id: string
  actor: Role
  createdAt: string
  nickname: string
  user_id: number
  bid_id: number
  fields: SuggestionField[]
  overall: SuggestionOverall
}

type SuggestionItemApi = {
  field: string
  value: string
  status?: FieldStatus
  field_name?: string
}

type SuggestionRowApi = {
  id: number
  user_id: number
  nickname: string
  bid_id: number
  suggestion: unknown // usually JSON string
  created_at?: string
}

type SuggestionsResponse = { success: true; results: SuggestionRowApi[] } | { success: false; message: string }

type DraftField = {
  key: string
  label: string
  value: string
  raw: string
}

const props = defineProps<{
  viewerRole: Role
  viewer_user_id: number // <-- IMPORTANT: needed to detect "me" vs "other"
  bid_id: number
  from?: From
  offer: Record<string, any>
  negotiation_field: Array<{ value: string; label: string }>
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const onClose = () => emit('close')

const bidId = ref(props.bid_id || null)

const { data, pending, error, refresh } = useFetch<SuggestionsResponse>(`/api/bid/${bidId.value}/suggestions`, { method: 'GET' })

const context = computed(() => ({
  product: props.offer.product,
  listedPrice: `${props.offer.price} USD/BBL`,
  quantity: `${props.offer.quantity} BBL`,
}))

const fieldsCatalog: CatalogField[] = [
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
  { key: 'quantity', label: 'Quantity', type: 'number', placeholder: 'e.g., 200000' },
  {
    key: 'delivery_term',
    label: 'Delivery Term',
    type: 'select',
    options: ['FOB', 'CFR', 'CIF', 'DAP', 'DES', 'DDP', 'DDU', 'STS', 'OPL (Off Port Limits)', 'TTO (Tanker Take Over)'],
  },
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

const labelByKey = (key: string) => fieldsCatalog.find((f) => f.key === key)?.label ?? key

const computeOverall = (fields: SuggestionField[]): SuggestionOverall => {
  if (fields.some((f) => f.status === 'denied')) return 'denied'
  if (fields.length > 0 && fields.every((f) => f.status === 'accepted')) return 'accepted'
  return 'pending'
}

const safeParseJson = (v: unknown): unknown => {
  if (typeof v !== 'string') return v
  try {
    return JSON.parse(v)
  } catch {
    return v
  }
}

/**
 * Convert DB suggestion into:
 * [{ field, field_name, value, status }]
 */
const normalizeSuggestionToFields = (suggestion: unknown): SuggestionField[] => {
  const parsed = safeParseJson(suggestion)

  // Expected format: [{ field, value, status, field_name }]
  if (Array.isArray(parsed)) {
    return (parsed as SuggestionItemApi[])
      .map((x) => {
        const field = String(x?.field ?? '').trim()
        if (!field) return null

        const status = (x?.status ?? 'pending') as FieldStatus
        return {
          field,
          field_name: String(x?.field_name ?? labelByKey(field)),
          value: String(x?.value ?? ''),
          status,
        }
      })
      .filter(Boolean) as SuggestionField[]
  }

  // Optional fallback if some old rows are object-form
  if (parsed && typeof parsed === 'object') {
    const obj = parsed as Record<string, any>
    return Object.entries(obj).map(([field, v]) => {
      const value = v && typeof v === 'object' ? String(v.value ?? '') : String(v ?? '')
      const status = (v && typeof v === 'object' ? v.status : 'pending') as FieldStatus
      const field_name = v && typeof v === 'object' ? String(v.field_name ?? labelByKey(field)) : labelByKey(field)

      return { field, field_name, value, status: status ?? 'pending' }
    })
  }

  return []
}

const toActor = (rowUserId: number): Role => {
  // If the suggestion belongs to me => "buyer" (or "you") else "seller"
  return rowUserId === props.viewer_user_id ? 'buyer' : 'seller'
}

/** Local mutable history */
const history = ref<Suggestion[]>([])

/** Load from API -> local history */
watchEffect(() => {
  const v = data.value
  if (!v || !v.success) return

  history.value = (v.results ?? []).map((row) => {
    const fields = normalizeSuggestionToFields(row.suggestion)
    const createdAt = row.created_at ?? new Date().toISOString()

    return {
      id: String(row.id),
      actor: toActor(row.user_id),
      createdAt,
      nickname: row.nickname,
      user_id: row.user_id,
      bid_id: row.bid_id,
      fields,
      overall: computeOverall(fields),
    }
  })
})

/** Sorted view (newest first) */
const sortedHistory = computed(() => {
  return [...history.value].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
})

const overallClass = (ov: SuggestionOverall) => {
  if (ov === 'accepted') return 'accepted'
  if (ov === 'denied') return 'denied'
  return 'pending'
}

const fieldStatusClass = (st: FieldStatus) => {
  if (st === 'accepted') return 'accepted'
  if (st === 'denied') return 'denied'
  return 'pending'
}

/** Review per field (local only for now) */
const reviewField = (suggestionId: string, fieldIndex: number, status: FieldStatus) => {
  const s = history.value.find((x) => x.id === suggestionId)
  if (!s) return

  const f = s.fields[fieldIndex]
  if (!f) return

  f.status = status
  s.overall = computeOverall(s.fields)
}

/* Draft builder */
const selectedFieldKey = ref<string>('')
const selectedValue = ref<string>('')
const draft = ref<DraftField[]>([])
const draftComment = ref<string>('') // you can POST this later if you add a column

const selectedField = computed(() => fieldsCatalog.find((f) => f.key === selectedFieldKey.value))

const formatValue = (f: CatalogField, raw: string) => {
  // if (f.key === 'price') return `${raw} USD/BBL`
  // if (f.key === 'quantity') return `${raw} BBL`
  return raw
}

const addDraftField = () => {
  const f = selectedField.value
  if (!f) return

  const raw = String(selectedValue.value || '').trim()
  if (!raw) return

  if (draft.value.some((x) => x.key === f.key)) return

  draft.value.push({
    key: f.key,
    label: f.label,
    raw,
    value: formatValue(f, raw),
  })

  selectedValue.value = ''
}

const removeDraft = (idx: number) => {
  draft.value.splice(idx, 1)
}

const cancelDraft = () => {
  draft.value = []
  draftComment.value = ''
  selectedFieldKey.value = ''
  selectedValue.value = ''
}

/**
 * Build the payload in the required DB shape:
 * [{ field, value, status, field_name }]
 *
 * This only pushes locally. You can POST suggestionPayload to your API.
 */
const submitNegotiation = async () => {
  if (draft.value.length === 0) return

  const nowIso = new Date().toISOString()
  let valueField = null
  for (let item of draft.value) {
    if (item.key === 'price') {
      valueField = Number(item.value)
    }
  }

  if (!valueField) return

  const suggestionPayload: SuggestionField[] = draft.value.map((d) => ({
    field: d.key,
    field_name: d.label,
    value: d.value,
    status: 'pending',
  }))

  // // Optimistic local append
  // history.value.push({
  //   id: `local-${Math.random().toString(16).slice(2)}`,
  //   actor: props.viewerRole,
  //   createdAt: nowIso,
  //   nickname: 'You',
  //   user_id: props.viewer_user_id,
  //   bid_id: props.bid_id,
  //   fields: suggestionPayload,
  //   overall: computeOverall(suggestionPayload),
  // })

  if (!bidId.value) {
    const res = await $fetch<{ ok: string; bid_id: number }>(`/api/offer/${props.offer.id}/bids`, {
      method: 'POST',
      body: { value: valueField },
    })
    if (res.ok) {
      console.log(res.bid_id)
      bidId.value = res.bid_id
    }
  }

  await $fetch(`/api/bid/${bidId.value}/suggestions`, {
    method: 'POST',
    body: { suggestion: suggestionPayload },
  })

  // Clear draft
  draft.value = []
  draftComment.value = ''
  selectedFieldKey.value = ''
  selectedValue.value = ''
  refresh()
}
</script>

<template>
  <!-- Backdrop -->
  <div class="modal-backdrop" role="dialog" aria-modal="true" aria-label="Negotiation Modal" @click.self="onClose">
    <div class="modal-panel">
      <!-- Header -->
      <header class="modal-header">
        <div class="min-w-0">
          <div class="text-amber-400 font-black text-lg tracking-tight">Negotiation</div>
        </div>

        <button class="icon-btn" type="button" aria-label="Close" @click="onClose">✕</button>
      </header>

      <div class="modal-body">
        <!-- Context -->
        <section class="card-surface p-3">
          <div class="grid gap-2 sm:grid-cols-3">
            <div class="kv-row">
              <span class="kv-label">Product</span>
              <span class="kv-value">{{ context.product }}</span>
            </div>
            <div class="kv-row">
              <span class="kv-label">Price</span>
              <span class="kv-value">{{ context.listedPrice }}</span>
            </div>
            <div class="kv-row">
              <span class="kv-label">Quantity</span>
              <span class="kv-value">{{ context.quantity }}</span>
            </div>
          </div>
        </section>

        <!-- History -->
        <section class="mt-4 pt-4 border-t border-slate-700/40">
          <div class="section-head">
            <div class="font-black text-slate-100">Negotiation History</div>
            <div class="text-xs text-slate-400">
              <span v-if="pending">Loading…</span>
              <span v-else-if="error" class="text-red-300">Failed to load</span>
              <span v-else>{{ sortedHistory.length }} items</span>
            </div>
          </div>

          <div class="timeline mt-3">
            <div
              v-if="!pending && !error && sortedHistory.length === 0"
              class="rounded border border-dashed border-slate-600/50 bg-slate-900/20 p-3 text-sm text-slate-400"
            >
              No suggestions yet. Create the first one below.
            </div>

            <!-- newest first -->
            <article v-for="s in sortedHistory" :key="s.id" class="card" :class="s.actor === 'seller' ? 'card-seller' : 'card-buyer'">
              <div class="card-head">
                <div class="flex items-center gap-2 min-w-0">
                  <span class="who-pill" :class="s.actor === 'seller' ? 'who-seller' : 'who-buyer'">
                    {{ s.actor === 'seller' ? 'Seller Suggestion' : 'Your Suggestion' }}
                  </span>
                  <span class="text-xs text-slate-400 truncate">{{ s.createdAt }}</span>
                </div>

                <span class="pill" :class="overallClass(s.overall)">{{ s.overall }}</span>
              </div>

              <div class="p-3">
                <div class="rounded overflow-hidden border border-slate-700/40">
                  <table class="w-full border-collapse">
                    <thead>
                      <tr class="bg-slate-800/50">
                        <th class="th w-[34%]">Field</th>
                        <th class="th">Value</th>
                        <th class="th w-[32%]">Status</th>
                      </tr>
                    </thead>

                    <tbody>
                      <tr v-for="(f, i) in s.fields" :key="f.field + i">
                        <td>{{ f.field_name }}</td>
                        <td>
                          <b>{{ f.value }}</b>
                        </td>
                        <td>
                          <b>{{ f.status }}</b>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </article>
          </div>
        </section>

        <!-- Add Negotiation -->
        <section class="mt-4 pt-4 border-t border-slate-700/40">
          <div class="section-head">
            <div class="font-black text-slate-100">Add Negotiation</div>
            <div class="text-xs text-slate-400">Build a draft, then submit.</div>
          </div>

          <div class="builder mt-3">
            <div class="grid gap-3 md:grid-cols-[1.2fr_1.8fr_auto] p-3">
              <div>
                <label class="field-label" for="fieldSelect">Negotiation Field</label>
                <select id="fieldSelect" class="control" v-model="selectedFieldKey">
                  <option value="" disabled>Select field…</option>
                  <option v-for="f in props.negotiation_field" :key="f.value" :value="f.value">
                    {{ f.label }}
                  </option>
                </select>
              </div>

              <div>
                <label class="field-label" for="valueInput">Your Value</label>

                <!-- dynamic input type -->
                <select v-if="selectedField?.type === 'select'" id="valueInput" class="control" v-model="selectedValue">
                  <option value="" disabled>Select option…</option>
                  <option v-for="opt in selectedField?.options || []" :key="opt" :value="opt">
                    {{ opt }}
                  </option>
                </select>

                <input v-else-if="selectedField?.type === 'date'" id="valueInput" class="control" type="date" v-model="selectedValue" />

                <input
                  v-else
                  id="valueInput"
                  class="control"
                  :type="selectedField?.type === 'number' ? 'number' : 'text'"
                  :step="selectedField?.type === 'number' ? 'any' : undefined"
                  :placeholder="selectedField?.placeholder || 'Enter value…'"
                  v-model="selectedValue"
                />
              </div>

              <div class="flex md:items-end">
                <button class="btn btn-primary w-full md:w-auto" type="button" @click="addDraftField">+ Add</button>
              </div>
            </div>

            <div class="px-3 pb-3 space-y-2">
              <div v-if="draft.length === 0" class="text-xs text-slate-400 px-1">No fields added yet.</div>

              <div
                v-for="(d, idx) in draft"
                :key="d.key"
                class="flex items-center justify-between gap-3 rounded border border-slate-700/40 bg-slate-800/40 p-3"
              >
                <div class="min-w-0">
                  <div class="text-xs text-slate-400">{{ d.label }}</div>
                  <div class="font-black text-slate-100 truncate">{{ d.value }}</div>
                </div>

                <button class="btn btn-danger" type="button" @click="removeDraft(idx)">Remove</button>
              </div>
            </div>

            <div class="builder-foot">
              <button class="btn btn-ghost" type="button" @click="cancelDraft">Cancel</button>
              <button class="btn btn-primary" type="button" :disabled="draft.length === 0" @click="submitNegotiation">
                Submit Negotiation
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>
<style scoped>
@reference "tailwindcss";

/* Backdrop + panel */
.modal-backdrop {
  @apply fixed inset-0 bg-black/80 flex items-center justify-center;
}

.modal-panel {
  @apply w-full h-full overflow-hidden bg-slate-900 border border-slate-700/30 rounded shadow-xl flex flex-col;
}

.modal-header {
  @apply sticky top-0 z-10 flex items-center justify-between gap-4
    px-4 py-4 bg-slate-900/80 backdrop-blur border-b border-slate-700/30;
}

.modal-body {
  @apply p-6 overflow-y-auto;
}

/* Surfaces */
.card-surface {
  @apply rounded bg-slate-950/35 border border-slate-700/30;
}

/* Key-value row */
.kv-row {
  @apply flex items-center justify-between gap-4 rounded
    bg-slate-800/40 border border-slate-700/30 px-4 py-3;
}
.kv-label {
  @apply text-xs text-slate-400;
}
.kv-value {
  @apply text-xs font-semibold text-slate-100;
}

/* Section header */
.section-head {
  @apply flex items-baseline justify-between gap-4 rounded
    bg-slate-800/40 border border-slate-700/30 px-4 py-3;
}

/* Timeline */
.timeline {
  @apply relative pl-6 flex flex-col gap-4;
}
.timeline::before {
  @apply absolute left-2 top-2 bottom-2 w-1 rounded bg-slate-600/40;
}

/* History card */
.card {
  @apply relative rounded border border-slate-700/30 bg-slate-950/35 overflow-hidden;
}
.card::before {
  @apply absolute -left-5 top-4 h-3 w-3 rounded border-2 border-slate-900 shadow;
}
.card-buyer::before {
  @apply bg-amber-400;
}
.card-seller::before {
  @apply bg-blue-500;
}

.card-head {
  @apply flex items-center justify-between gap-4 px-4 py-3
    bg-slate-800/30 border-b border-slate-700/20;
}

/* Pills */
.pill {
  @apply text-xs px-3 py-1 rounded border border-slate-600/40
    bg-slate-400/10 text-slate-200 capitalize whitespace-nowrap;
}
.pill.pending {
  @apply border-amber-400/30 bg-amber-400/10 text-amber-200;
}
.pill.accepted {
  @apply border-emerald-400/30 bg-emerald-400/10 text-emerald-200;
}
.pill.denied {
  @apply border-red-400/30 bg-red-400/10 text-red-200;
}

.who-pill {
  @apply text-[0.9rem] px-2 py-0.5 rounded border border-slate-600/40 whitespace-nowrap;
}
.who-buyer {
  @apply bg-amber-400/10 text-amber-200;
}
.who-seller {
  @apply bg-blue-500/10 text-blue-200;
}

/* Table */
.th {
  @apply text-left text-xs font-semibold text-slate-200 px-4 py-2;
}
.td {
  @apply text-sm text-slate-200 px-4 py-2 align-middle;
}

/* Field status badge */
.status-pill {
  @apply text-xs px-3 py-1 rounded border border-slate-600/40
    bg-slate-400/10 text-slate-200 capitalize whitespace-nowrap;
}
.status-pill.pending {
  @apply border-amber-400/20 bg-amber-400/10 text-amber-200;
}
.status-pill.accepted {
  @apply border-emerald-400/20 bg-emerald-400/10 text-emerald-200;
}
.status-pill.denied {
  @apply border-red-400/20 bg-red-400/10 text-red-200;
}

/* Controls */
.field-label {
  @apply block text-xs text-slate-400 mb-1;
}
.control {
  @apply w-full rounded bg-slate-900/40 border border-slate-700/30
    text-slate-100 text-sm px-3 py-2 outline-none
    focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400/40;
}

/* Buttons */
.icon-btn {
  @apply h-8 w-8 rounded border border-slate-600/40 bg-slate-700/25
    text-slate-100 text-xs grid place-items-center
    hover:bg-slate-700/40 transition;
}

.btn {
  @apply text-xs font-semibold px-4 py-2 rounded border border-slate-600/40
    bg-slate-700/20 text-slate-100 hover:bg-slate-700/35 transition;
}
.btn-primary {
  @apply bg-blue-500/90 border-blue-500/30 hover:bg-blue-500 text-white;
}
.btn-danger {
  @apply bg-red-500/90 border-red-500/30 hover:bg-red-500 text-white;
}
.btn-ghost {
  @apply bg-slate-700/10 hover:bg-slate-700/25;
}
.btn:disabled {
  @apply opacity-50 cursor-not-allowed hover:bg-inherit;
}

/* Mini review buttons */
.mini-btn {
  @apply text-xs px-2 py-1 rounded border border-slate-600/40
    bg-slate-700/20 text-slate-100 hover:bg-slate-700/35 transition;
}
.mini-ok {
  @apply border-emerald-400/30 bg-emerald-400/10 hover:bg-emerald-400/15;
}
.mini-no {
  @apply border-red-400/30 bg-red-400/10 hover:bg-red-400/15;
}

/* Builder footer */
.builder {
  @apply rounded border border-slate-700/30 bg-slate-900/30 overflow-hidden;
}
.builder-foot {
  @apply flex justify-end gap-2 px-3 py-3 border-t border-slate-700/20 bg-slate-900/20;
}

/* Your example pattern */
.filter-scroll {
  @apply flex flex-row gap-4 w-full overflow-x-auto overflow-y-hidden;
  flex-wrap: nowrap;
  -webkit-overflow-scrolling: touch;
  scrollbar-gutter: stable;
}
</style>
