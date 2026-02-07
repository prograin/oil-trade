<!-- components/ExploreList.vue -->
<script setup>
import { ref, computed, watch } from 'vue'
import { XIcon, ChevronDownIcon } from 'lucide-vue-next'
import { negotiationFieldToLabelValue } from '~/utils/field-mapper'

const props = defineProps({
  // each item: { id, product, nickname, price/target_price, quantity, deal_type, delivery_term, payment_term, validity, ... }
  items: { type: Array, default: () => [] },

  // "Offers" or "Demands" controls which price label to show (used in card)
  mode: { type: String, default: 'Offers' },

  // if true, component will attempt to fetch bids on open:
  // GET /api/offer/:id/bids (Explore behavior)
  fetchBidsOnOpen: { type: Boolean, default: false },

  // optional: dashboard uses confirm
  enableConfirm: { type: Boolean, default: false },

  // refresh callback (dashboard can pass offersRefresh)
  refresh: { type: Function, default: null },
})

const { user } = useUserSession()
const { showError } = useErrorModal()
const { showSuccess } = useSuccessModal()
const { askQuestion } = useQuestionModal()

// Modal
const selectedItem = ref(null)

// Bids
const bidsById = ref({}) // { [offerId]: [...] }
const showBids = ref(false)

/**
 * DO NOT SHOW rows for undefined / null / empty-string fields.
 * Also exclude internal fields we don't want to render as "info".
 */
const excludedDetailKeys = new Set([
  'bids',
  'id',
  'user_id',
  'is_active',
  'negotiation_field',
  'type',
  'created_at', // rendered in the bids section instead
])

function isEmptyValue(v) {
  if (v === null || v === undefined) return true
  if (typeof v === 'string' && v.trim() === '') return true
  if (Array.isArray(v) && v.length === 0) return true
  if (typeof v === 'object' && !Array.isArray(v) && Object.keys(v).length === 0) return true
  return false
}

function labelize(key) {
  // snake_case / camelCase -> Title Case
  return String(key)
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^./, (c) => c.toUpperCase())
}

function stringifyValue(v) {
  if (typeof v === 'boolean') return v ? 'Yes' : 'No'
  if (typeof v === 'number') return String(v)
  if (typeof v === 'string') return v
  if (Array.isArray(v)) return v.map(stringifyValue).join(', ')
  if (typeof v === 'object') return JSON.stringify(v, null, 2)
  return String(v)
}

const detailFields = computed(() => {
  const item = selectedItem.value
  if (!item || typeof item !== 'object') return []

  return Object.entries(item)
    .filter(([k, v]) => !excludedDetailKeys.has(k) && !isEmptyValue(v))
    .map(([k, v]) => ({
      key: k,
      label: labelize(k),
      value: stringifyValue(v),
      isJson: typeof v === 'object' && v !== null && !Array.isArray(v),
    }))
})

const selectedBids = computed(() => {
  const id = selectedItem.value?.id
  if (!id) return []
  return bidsById.value[id] ?? []
})

async function openDetails(item) {
  selectedItem.value = item
  showBids.value = false

  // If dashboard provided bids inline, use them
  if (Array.isArray(item.bids)) {
    bidsById.value[item.id] = item.bids
    return
  }

  // Explore behavior: fetch bids on open
  if (props.fetchBidsOnOpen) {
    try {
      const bidsData = await $fetch(`/api/offer/${item.id}/bids`, { method: 'GET' })
      bidsById.value[item.id] = bidsData.results || []
    } catch (error) {
      showError({
        title: error?.data?.statusMessage || 'CRITICAL',
        message: error?.data?.message || 'An unexpected error occurred.',
      })
    }
  }
}

function closeDetails() {
  selectedItem.value = null
}

async function refreshSelectedBids() {
  const offerId = selectedItem.value?.id
  if (!offerId) return

  // If dashboard passes inline bids, rely on parent refresh
  if (!props.fetchBidsOnOpen) {
    await props.refresh?.()
    return
  }

  // Explore refresh: fetch again
  const updated = await $fetch(`/api/offer/${offerId}/bids`)
  bidsById.value[offerId] = updated.results || []
}

async function onConfirmBid(bidId) {
  askQuestion('Confirm Bid?', 'Are you sure you want to confirm this bid?', async () => {
    try {
      const res = await $fetch(`/api/bid/${bidId}/confirm`, { method: 'POST' })
      if (res?.success) {
        showSuccess({ title: 'Bid confirmed', message: 'The bid has been successfully confirmed.' })
        await props.refresh?.()

        // also update local bids list if it exists
        const offerId = selectedItem.value?.id
        if (offerId && props.fetchBidsOnOpen) {
          const updated = await $fetch(`/api/offer/${offerId}/bids`)
          bidsById.value[offerId] = updated.results || []
        }
      }
    } catch (error) {
      showError({
        title: error?.data?.statusMessage || 'CRITICAL',
        message: error?.data?.message || 'An unexpected error occurred.',
      })
    }
  })
}

watch(selectedItem, (v) => {
  if (v) document.body.classList.add('overflow-hidden')
  else document.body.classList.remove('overflow-hidden')
})
</script>

<template>
  <main class="w-full max-w-full p-6 flex-1 flex flex-col items-start justify-start">
    <!-- NO FILTER BAR -->

    <!-- GRID LIST -->
    <div class="grid lg:grid-cols-4 sm:grid-cols-2 grid-cols-1 gap-4 w-full">
      <div v-for="item in items" :key="item.id" class="offer-card" @click="openDetails(item)">
        <div class="offer-card-header">
          <h3 class="title">{{ item.product || '-' }}</h3>
          <!-- removed "By:"; keep optional identifier without prefix -->
          <p v-if="item.nickname || item.user_name" class="subtitle">{{ item.nickname || item.user_name }}</p>
        </div>

        <div class="grid grid-cols-2 gap-2 mt-3 text-sm">
          <div class="label">{{ mode === 'Offers' ? 'Price' : 'Target Price' }}</div>
          <div class="value">{{ mode === 'Offers' ? item.price : item.target_price }} USD/BBL</div>

          <div v-if="item.quantity !== undefined && item.quantity !== null && item.quantity !== ''" class="label">Quantity</div>
          <div v-if="item.quantity !== undefined && item.quantity !== null && item.quantity !== ''" class="value">
            {{ item.quantity }} BBL
          </div>

          <div v-if="item.deal_type" class="label">Deal Type</div>
          <div v-if="item.deal_type" class="value">{{ item.deal_type }}</div>

          <div v-if="item.validity" class="label">Validity</div>
          <div v-if="item.validity" class="value">{{ item.validity }}</div>
        </div>
      </div>
    </div>

    <!-- DETAILS MODAL -->
    <div
      v-if="selectedItem"
      class="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50"
      @click.self="closeDetails"
    >
      <div class="detail-panel">
        <div class="detail-panel-header">
          <div>
            <h2 class="detail-title">{{ selectedItem.product || '-' }}</h2>
            <!-- removed "By:" -->
            <p v-if="selectedItem.nickname || selectedItem.user_name" class="detail-subtitle">
              {{ selectedItem.nickname || selectedItem.user_name }}
            </p>
          </div>

          <XIcon @click="closeDetails" class="w-6 h-6 cursor-pointer text-gray-400 hover:text-red-500 transition" />
        </div>

        <!-- Show ALL info dynamically, but DO NOT show undefined/empty fields -->
        <div class="space-y-3 mt-4">
          <div v-for="f in detailFields" :key="f.key" class="detail-row">
            <span class="label">{{ f.label }}</span>

            <!-- pretty-print objects as pre -->
            <span v-if="!f.isJson" class="value text-right whitespace-pre-wrap break-words">{{ f.value }}</span>
            <pre v-else class="value text-right whitespace-pre-wrap break-words text-xs leading-5 bg-gray-950/40 p-2 rounded"
              >{{ f.value }}
            </pre>
          </div>

          <!-- BIDS (only offers typically) -->
          <template v-if="mode === 'Offers' && selectedBids.length > 0">
            <BidsSection
              :offerId="selectedItem.id"
              :offerUserId="selectedItem.user_id"
              :user="user"
              :negotiationField="negotiationFieldToLabelValue(selectedItem.negotiation_field)"
              :quantity="selectedItem.quantity"
              :price="selectedItem.price"
              :product="selectedItem.product"
              @submitted="() => {}"
            />
          </template>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
@reference "tailwindcss";

/* Cards */
.offer-card {
  @apply bg-gray-800 p-4 rounded shadow-md border border-gray-700 hover:bg-gray-700 hover:shadow-xl transition cursor-pointer;
}
.offer-card-header {
  @apply border-b-2 border-gray-700 rounded pb-2;
}

.title {
  @apply text-lg font-bold text-yellow-400;
}
.subtitle {
  @apply text-gray-400 text-sm;
}
.label {
  @apply text-gray-400;
}
.value {
  @apply text-gray-200 font-semibold;
}

/* Modal */
.detail-panel {
  @apply bg-gray-900 p-6 rounded shadow-2xl sm:h-[90%] sm:max-h-fit h-full xl:w-1/3 w-full overflow-y-auto;
}
.detail-panel-header {
  @apply flex justify-between items-start gap-4 flex-nowrap;
}
.detail-title {
  @apply text-xl font-bold text-yellow-400;
}
.detail-subtitle {
  @apply text-gray-400 text-sm mt-1;
}
.detail-row {
  @apply flex justify-between gap-6 bg-gray-800 p-3 rounded shadow-sm hover:bg-gray-700 transition;
}

/* Guest (not logged in) */
.bids-guest {
  @apply mt-6 border-t border-gray-700 pt-4;
}
.bids-guest-card {
  @apply bg-gray-800 p-4 rounded shadow-sm;
}
.bids-guest-title {
  @apply text-gray-200 font-semibold;
}
.bids-guest-text {
  @apply text-sm text-gray-400 mt-1;
}
.bids-guest-actions {
  @apply mt-3 flex items-center gap-2;
}
.bids-guest-btn {
  @apply px-3 py-1.5 text-sm font-semibold bg-yellow-500 text-gray-900 rounded hover:bg-yellow-400 transition inline-flex items-center justify-center;
}

/* BIDS */
.bids-section {
  @apply mt-6 border-t border-gray-700 pt-4;
}
.bids-header {
  @apply w-full flex items-center justify-between bg-gray-800 px-4 py-2 rounded hover:bg-gray-700 transition cursor-pointer;
}
.bids-title {
  @apply flex items-center gap-2 text-gray-200 font-semibold;
}
.bids-count {
  @apply text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full;
}
.bids-body {
  @apply mt-3 space-y-2;
}
.bid-row {
  @apply flex items-center gap-3 bg-gray-800 px-3 py-2 rounded text-sm justify-between;
}
.bid-user {
  @apply font-semibold text-yellow-400;
}
.bid-price {
  @apply font-medium text-gray-100;
}
.bid-time {
  @apply text-xs text-right hidden lg:inline-block align-middle text-gray-400 flex-1;
}
.bid-btn {
  @apply px-3 py-1 inline-flex items-center justify-center rounded text-xs bg-gray-700 hover:bg-gray-600 active:bg-gray-900 active:scale-95 text-gray-200 transition disabled:active:scale-100 disabled:opacity-70;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
