<script setup>
import { watch, ref, computed } from 'vue'
import { XIcon, CheckIcon, ChevronDownIcon, PencilIcon, Trash2Icon } from 'lucide-vue-next'

const { data, pending, error } = useFetch('/api/offer', { method: 'GET' })
const { user } = useUserSession()
const { showError } = useErrorModal()
const { showSuccess } = useSuccessModal()

// Filters
const type = ref('Offers')
const selectedDeal = ref('')
const selectedProduct = ref('')
const selectedDelivery = ref('')
const sortBy = ref('')

// Modal
const selectedOffer = ref(null)

// Bids
const bidsByOffer = ref({}) // { [offerId]: [{ id, nickname, price, created_at }] }
const showBids = ref(false)
const newBidPrice = ref('')

//Editing bid
const editingBidId = ref(null)
const editBidPrice = ref('')

// Modal control
async function openDetails(offer) {
  selectedOffer.value = offer
  showBids.value = false
  newBidPrice.value = ''
  editingBidId.value = null
  editBidPrice.value = ''
  try {
    const bidsData = await $fetch(`/api/offer/${selectedOffer.value.id}/bids`, { method: 'GET' })
    bidsByOffer.value[selectedOffer.value.id] = bidsData.results
  } catch (error) {
    showError({
      title: error?.data?.statusMessage || 'CRITICAL',
      message: error?.data?.message || 'An unexpected error occurred.',
    })
  }
}

// Add Bid
async function addBid() {
  if (!selectedOffer.value || !newBidPrice.value) return

  const offerId = selectedOffer.value.id
  try {
    const res = await $fetch(`/api/offer/${offerId}/bids`, { method: 'POST', body: { value: newBidPrice.value } })

    if (!bidsByOffer.value[offerId]) bidsByOffer.value[offerId] = []
    if (!res.ok) return

    showSuccess({
      title: 'Bid Created',
      message: res.message || 'Your bid has been placed successfully.',
    })

    const updated = await $fetch(`/api/offer/${offerId}/bids`)
    bidsByOffer.value[offerId] = updated.results
    newBidPrice.value = ''
  } catch (error) {
    showError({
      title: error?.data?.statusMessage || 'CRITICAL',
      message: error?.data?.message || 'An unexpected error occurred.',
    })
  }
}

// Start Edit Bid
function startEditBid(bid) {
  editingBidId.value = bid.id
  editBidPrice.value = bid.price
}
// Cancel Edit Bid
function cancelEditBid() {
  editingBidId.value = null
  editBidPrice.value = ''
}
// Save Edit Bid
async function saveEditBid(offerId, bidId) {
  try {
    const res = await $fetch(`/api/bid/${bidId}`, { method: 'PATCH', body: { value: editBidPrice.value } })

    showSuccess({
      title: 'Bid Updated',
      message: res.message || 'Your bid has been updated.',
    })

    const updated = await $fetch(`/api/offer/${offerId}/bids`)
    bidsByOffer.value[offerId] = updated.results

    editingBidId.value = null
    editBidPrice.value = ''
  } catch (error) {
    showError({
      title: error?.data?.statusMessage || 'CRITICAL',
      message: error?.data?.message || 'An unexpected error occurred.',
    })
  }
}

// Delete Bid
async function deleteBid(offerId, bidId) {
  try {
    const res = await $fetch(`/api/bid/${bidId}`, { method: 'DELETE' })
    showSuccess({
      title: 'Bid Deleted',
      message: res.message || 'The bid was deleted successfully.',
    })

    const updated = await $fetch(`/api/offer/${offerId}/bids`)
    bidsByOffer.value[offerId] = updated.results

    editingBidId.value = null
    editBidPrice.value = ''
  } catch (error) {
    showError({
      title: error?.data?.statusMessage || 'CRITICAL',
      message: error?.data?.message || 'An unexpected error occurred.',
    })
  }
}

function closeDetails() {
  selectedOffer.value = null
}

const offers = computed(() => {
  const rows = data.value?.results || []

  return rows.map((row) => ({
    id: row.id,
    title: `${row.product}`,
    subtitle: `By : ${row.nickname}`,

    data: [
      { label: 'Product', value: row.product },
      { label: 'Quantity', value: row.quantity },
      { label: 'Deal Type', value: row.deal_type },
      { label: 'Delivery Term', value: row.delivery_term },
      { label: 'Delivery Detail', value: row.delivery_detail },
      { label: 'Transfer Zone', value: row.transfer_zone },
      { label: 'Benchmark Based', value: row.benchmark_based },
      { label: 'Payment Term', value: row.payment_term },
      { label: 'Operation Cost', value: row.operation_cost },
      { label: 'Down Payment', value: row.down_payment },
      { label: 'Validity', value: row.validity },
      { label: 'API', value: row.api },
      { label: 'Sulfur', value: row.sulfur },
    ],
  }))
})

// Unique filter lists
const dealTypes = computed(() => {
  return [...new Set(offers.value.map((o) => o.data.find((d) => d.label === 'Deal Type')?.value).filter(Boolean))]
})

const products = computed(() => {
  return [...new Set(offers.value.map((o) => o.data.find((d) => d.label === 'Product')?.value).filter(Boolean))]
})

const deliveryTerms = computed(() => {
  return [...new Set(offers.value.map((o) => o.data.find((d) => d.label === 'Delivery Term')?.value).filter(Boolean))]
})

// Extract helper
function getField(item, label) {
  return item.data.find((d) => d.label === label)?.value || '-'
}

// FILTER + SORT
const filteredOffers = computed(() => {
  let list = [...offers.value]

  if (selectedDeal.value) list = list.filter((o) => getField(o, 'Deal Type') === selectedDeal.value)

  if (selectedProduct.value) list = list.filter((o) => getField(o, 'Product') === selectedProduct.value)

  if (selectedDelivery.value) list = list.filter((o) => getField(o, 'Delivery Term') === selectedDelivery.value)

  if (sortBy.value === 'date') {
    list.sort((a, b) => new Date(getField(a, 'Validity')) - new Date(getField(b, 'Validity')))
  }

  if (sortBy.value === 'quantity') {
    list.sort((a, b) => parseFloat(getField(a, 'Quantity')) - parseFloat(getField(b, 'Quantity')))
  }

  return list
})

watch(selectedOffer, (newVal) => {
  if (newVal) {
    document.body.classList.add('overflow-hidden')
  } else {
    document.body.classList.remove('overflow-hidden')
  }
})
</script>

<template>
  <main class="w-full max-w-full p-6 flex-1 flex flex-col items-start justify-start">
    <!-- FILTER BAR -->
    <div class="flex flex-row flex-wrap gap-4 mb-6">
      <!-- Type -->
      <div class="relative inline-block">
        <select v-model="type" class="filter-box pr-8">
          <option>Offers</option>
          <option>Demands</option>
        </select>
      </div>

      <!-- Deal Type -->
      <div class="relative inline-block">
        <select v-model="selectedDeal" class="filter-box pr-8">
          <option disabled value="">Select deal type</option>
          <option v-for="d in dealTypes" :key="d" :value="d">{{ d }}</option>
        </select>
        <button v-if="selectedDeal" class="clear-btn" @click.stop="selectedDeal = ''" type="button">
          <XIcon class="w-3 h-3" />
        </button>
      </div>

      <!-- Product -->
      <div class="relative inline-block">
        <select v-model="selectedProduct" class="filter-box pr-8">
          <option value="">Product</option>
          <option v-for="p in products" :key="p" :value="p">{{ p }}</option>
        </select>
        <button v-if="selectedProduct" class="clear-btn" @click.stop="selectedProduct = ''" type="button">
          <XIcon class="w-3 h-3" />
        </button>
      </div>

      <!-- Delivery Term -->
      <div class="relative inline-block">
        <select v-model="selectedDelivery" class="filter-box pr-8">
          <option value="">Delivery Term</option>
          <option v-for="d in deliveryTerms" :key="d" :value="d">{{ d }}</option>
        </select>
        <button v-if="selectedDelivery" class="clear-btn" @click.stop="selectedDelivery = ''" type="button">
          <XIcon class="w-3 h-3" />
        </button>
      </div>

      <!-- Sort -->
      <div class="relative inline-block">
        <select v-model="sortBy" class="filter-box pr-8">
          <option value="">Sort</option>
          <option value="date">Validity</option>
          <option value="quantity">Quantity</option>
        </select>
        <button v-if="sortBy" class="clear-btn" @click.stop="sortBy = ''" type="button">
          <XIcon class="w-3 h-3" />
        </button>
      </div>
    </div>

    <div v-if="pending" class="text-gray-400 mb-4">Loading offers…</div>
    <div v-else-if="error" class="text-red-400 mb-4">Failed to load offers.</div>

    <!-- GRID LIST -->
    <div v-else class="grid lg:grid-cols-4 sm:grid-cols-2 grid-cols-1 gap-4">
      <div v-for="item in filteredOffers" :key="item.id" class="offer-card" @click="openDetails(item)">
        <div class="offer-card-header">
          <h3 class="title">{{ item.title }}</h3>
          <p class="subtitle">{{ item.subtitle }}</p>
        </div>

        <div class="grid grid-cols-2 gap-2 mt-3 text-sm">
          <div class="label">Product</div>
          <div class="value">{{ getField(item, 'Product') }}</div>
          <div class="label">Quantity</div>
          <div class="value">{{ getField(item, 'Quantity') }}</div>
          <div class="label">Delivery</div>
          <div class="value">{{ getField(item, 'Delivery Term') }}</div>
          <div class="label">Payment</div>
          <div class="value">{{ getField(item, 'Payment Term') }}</div>
        </div>
      </div>
    </div>

    <!-- DETAILS MODAL -->
    <div
      v-if="selectedOffer"
      class="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50"
      @click.self="closeDetails"
    >
      <div class="detail-panel">
        <div class="detail-panel-header">
          <div>
            <h2 class="detail-title">{{ selectedOffer.title }}</h2>
            <p class="detail-subtitle">{{ selectedOffer.subtitle }}</p>
          </div>

          <!-- Close button -->
          <XIcon @click="closeDetails" class="w-6 h-6 cursor-pointer text-gray-400 hover:text-red-500 transition" />
        </div>

        <div class="space-y-3 mt-4">
          <!-- OFFERS DATA -->
          <div v-for="d in selectedOffer.data" :key="d.label" class="detail-row">
            <span class="label">{{ d.label }}</span>
            <span class="value text-right">{{ d.value }}</span>
          </div>

          <div v-if="!user" class="bids-guest">
            <div class="bids-guest-card">
              <p class="bids-guest-title">Bids</p>
              <p class="bids-guest-text">You must be signed in to view bids and place a bid on this offer.</p>

              <div class="bids-guest-actions">
                <NuxtLink to="/login" class="bids-guest-btn"> Sign in </NuxtLink>
              </div>
            </div>
          </div>

          <!-- BIDS COLLAPSIBLE -->
          <div v-else class="bids-section">
            <button type="button" class="bids-header" @click="showBids = !showBids">
              <span class="bids-title">
                Bids
                <span class="bids-count">
                  {{ (bidsByOffer[selectedOffer.id] || []).length }}
                </span>
              </span>

              <ChevronDownIcon class="w-5 h-5 transition-transform" :class="{ 'rotate-180': showBids }" />
            </button>

            <transition name="fade">
              <div v-if="showBids" class="bids-body">
                <!-- EXISTING BIDS -->
                <div v-for="bid in bidsByOffer[selectedOffer.id] || []" :key="bid.id" class="bid-row">
                  <!-- edit mode -->
                  <template v-if="editingBidId === bid.id && bid.user_id === user.id">
                    <span class="bid-user">{{ bid.nickname }}</span>
                    <input v-model="editBidPrice" type="number" step="0.01" class="bids-new-input flex-1" />
                    <div class="bid-actions">
                      <button type="button" class="bid-btn-icon bid-btn--green" @click="saveEditBid(selectedOffer.id, bid.id)">
                        <CheckIcon class="w-4 h-4" />
                      </button>

                      <button type="button" class="bid-btn-icon bid-btn--red" @click="cancelEditBid">
                        <XIcon class="w-4 h-4" />
                      </button>
                    </div>
                  </template>

                  <!-- normal mode -->
                  <template v-else>
                    <span class="bid-user">{{ bid.nickname }}</span>
                    <span class="bid-price">{{ bid.value }} USD/BBL</span>
                    <span class="bid-time">{{ bid.created_at }}</span>
                    <div v-if="bid.user_id === user.id" class="bid-actions">
                      <button type="button" class="bid-btn-icon bid-btn--blue" @click="startEditBid(bid)">
                        <PencilIcon class="w-4 h-4" />
                      </button>
                      <button type="button" class="bid-btn-icon bid-btn--red" @click="deleteBid(selectedOffer.id, bid.id)">
                        <Trash2Icon class="w-4 h-4" />
                      </button>
                    </div>
                  </template>
                </div>

                <!-- NEW BID ROW AT BOTTOM -->
                <div v-if="!bidsByOffer[selectedOffer.id]?.some((bid) => bid.user_id == user.id)" class="bids-new-row">
                  <input
                    v-model="newBidPrice"
                    type="number"
                    step="0.01"
                    placeholder="Bid (e.g. 2.25 USD/BBL)"
                    class="bids-new-input flex-1"
                  />
                  <button type="button" class="bids-new-btn" @click="addBid">Bid</button>
                </div>
              </div>
            </transition>
          </div>
          <!-- END BIDS COLLAPSIBLE -->
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
@reference "tailwindcss";

/* Filter dropdowns */
.filter-box {
  @apply bg-gray-700 text-gray-200 rounded-full px-3 py-1.5
         focus:ring-2 focus:ring-yellow-400
         appearance-none inline-block w-fit text-center
         cursor-pointer;
}
.clear-btn {
  @apply absolute right-2 top-1/2 -translate-y-1/2
         flex items-center justify-center
         text-gray-400 hover:text-red-400
         focus:outline-none;
}

/* Cards */
.offer-card {
  @apply bg-gray-800 p-4 rounded shadow-md border border-gray-700
         hover:bg-gray-700 hover:shadow-xl transition cursor-pointer;
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
  @apply bg-gray-900 p-6 rounded shadow-2xl
         sm:h-[90%] sm:max-h-fit h-full sm:w-[50%] w-full overflow-y-auto;
}
.detail-panel-header {
  @apply flex justify-between items-center flex-nowrap;
}
.detail-title {
  @apply text-xl font-bold text-yellow-400;
}
.detail-subtitle {
  @apply text-gray-400 text-sm;
}
.detail-row {
  @apply flex justify-between bg-gray-800 p-3 rounded
         shadow-sm hover:bg-gray-700 transition;
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
  @apply px-3 py-1.5 text-sm font-semibold
         bg-yellow-500 text-gray-900 rounded
         hover:bg-yellow-400 transition inline-flex items-center justify-center;
}

/* BIDS */
.bids-section {
  @apply mt-6 border-t border-gray-700 pt-4;
}
.bids-header {
  @apply w-full flex items-center justify-between
         bg-gray-800 px-4 py-2 rounded
         hover:bg-gray-700 transition
         cursor-pointer;
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
  @apply flex items-center justify-between gap-3 bg-gray-800 px-3 py-2 rounded text-sm;
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
.bid-actions {
  @apply flex items-center gap-2;
}
.bid-btn {
  @apply px-3 py-1 inline-flex w-full h-full items-center justify-center rounded text-xs
         bg-gray-700 hover:bg-gray-600 active:bg-gray-900 active:scale-95
         text-gray-200 transition;
}
.bid-btn-icon {
  @apply rounded-full w-7 h-7 inline-flex items-center justify-center text-xs
         bg-gray-700 hover:bg-gray-600
         text-gray-200 transition;
}
.bid-btn--blue {
  @apply bg-blue-600 hover:bg-blue-500;
}
.bid-btn--green {
  @apply bg-green-500 hover:bg-green-400;
}
.bid-btn--red {
  @apply bg-red-600 hover:bg-red-500;
}
.bids-new-row {
  @apply flex items-center gap-2 mt-3;
}
.bids-new-input {
  @apply min-w-0.5 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm text-gray-200
         focus:outline-none focus:ring-2 focus:ring-yellow-400;
}
.bids-new-btn {
  @apply px-3 py-1 text-sm font-semibold
         bg-yellow-500 text-gray-900 rounded
         hover:bg-yellow-400 transition;
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
