<script setup>
import { watch, ref, computed } from 'vue'
import { XIcon, CheckIcon, ChevronDownIcon, PencilIcon, Trash2Icon, EyeIcon } from 'lucide-vue-next'
import { negotiationFieldToLabelValue } from '~/utils/field-mapper'

const { data: offersData, pending: offersPending, error: offersError } = useFetch('/api/offer', { method: 'GET' })
const { data: demandsData, pending: demandsPending, error: demandsError } = useFetch('/api/demand', { method: 'GET' })
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
const bidsByOffer = ref({})
const showBids = ref(false)
const newBidPrice = ref('')
const activeBid = ref(null)

//Editing bid
const editingBidId = ref(null)
const editBidPrice = ref('')
const viewNegotiateModal = ref(true)

const isNegotiateModalOpen = ref(false)
const modalOffer = ref(null)

const activeItems = computed(() => {
  return type.value === 'Demands' ? demands.value : offers.value
})

const pending = computed(() => (type.value === 'Offers' ? offersPending.value : demandsPending.value))
const error = computed(() => (type.value === 'Offers' ? offersError.value : demandsError.value))

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

// Cancel Edit Bid
function cancelEditBid() {
  editingBidId.value = null
  editBidPrice.value = ''
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

const openNegotiateModal = (offer, bid = null, view = true) => {
  if (!offer) return

  activeBid.value = bid
  editingBidId.value = bid ? bid.id : null
  editBidPrice.value = bid ? bid.price : null
  viewNegotiateModal.value = view
  modalOffer.value = offer
  isNegotiateModalOpen.value = true
}

const closeNegotiateModal = () => {
  isNegotiateModalOpen.value = false
  modalOffer.value = null
  cancelEditBid()
}

async function fetchBidsForOffer(offerId) {
  const bidsData = await $fetch(`/api/offer/${offerId}/bids`, { method: 'GET' })
  bidsByOffer.value[offerId] = bidsData.results
}

const onBidSubmitted = async () => {
  try {
    // use modalOffer (or selectedOffer) since that's what modal is for
    const offerId = modalOffer.value?.id ?? selectedOffer.value?.id
    if (offerId) {
      await fetchBidsForOffer(offerId)
    }
  } catch (error) {
    showError({
      message: 'Failed to refresh bids.',
    })
  }
}

const unitByLabel = {
  Quantity: 'BBL',
  Price: 'USD/BBL',
  'Target Price': 'USD/BBL',
}

const offers = computed(() => {
  const rows = offersData.value?.results || []

  return rows.map((row) => ({
    id: row.id,
    user_id: row.user_id,
    title: `${row.product}`,
    subtitle: `By : ${row.nickname}`,
    negotiation_field: negotiationFieldToLabelValue(row.negotiation_field),

    data: [
      { label: 'Product', value: row.product },
      { label: 'Price', value: row.price },
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

const demands = computed(() => {
  const rows = demandsData.value?.results || []

  return rows.map((row) => ({
    id: row.id,
    user_id: row.user_id,
    title: `${row.product}`,
    subtitle: `By : ${row.nickname}`,

    data: [
      // { label: 'Product', value: row.product },
      { label: 'Target Price', value: row.target_price }, // demands column
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

      // quality constraints (demands-specific)
      { label: 'API Min', value: row.api_min },
      { label: 'API Max', value: row.api_max },
      { label: 'Sulfur Max', value: row.sulfur_max },
    ],
  }))
})

// Unique filter lists
const dealTypes = computed(() => {
  return [...new Set(activeItems.value.map((o) => getField(o, 'Deal Type')).filter((v) => v && v !== '-'))]
})

const products = computed(() => {
  return [...new Set(activeItems.value.map((o) => getField(o, 'Product')).filter((v) => v && v !== '-'))]
})

const deliveryTerms = computed(() => {
  return [...new Set(activeItems.value.map((o) => getField(o, 'Delivery Term')).filter((v) => v && v !== '-'))]
})

// Extract helper
function getField(item, label) {
  return item.data.find((d) => d.label === label)?.value || '-'
}

// FILTER + SORT
const filteredItems = computed(() => {
  let list = [...activeItems.value]

  if (selectedDeal.value) list = list.filter((o) => getField(o, 'Deal Type') === selectedDeal.value)
  if (selectedProduct.value) list = list.filter((o) => getField(o, 'Product') === selectedProduct.value)
  if (selectedDelivery.value) list = list.filter((o) => getField(o, 'Delivery Term') === selectedDelivery.value)

  if (sortBy.value === 'date') {
    list.sort((a, b) => new Date(getField(a, 'Validity')) - new Date(getField(b, 'Validity')))
  }

  if (sortBy.value === 'quantity') {
    list.sort((a, b) => {
      return Number(getField(a, 'Quantity')) - Number(getField(b, 'Quantity'))
    })
  }

  if (sortBy.value === 'price') {
    const priceLabel = type.value === 'Offers' ? 'Price' : 'Target Price'
    list.sort((a, b) => Number(getField(a, priceLabel)) - Number(getField(b, priceLabel)))
  }

  return list
})

const viewerRoleForModal = computed(() => {
  if (!user.value || !selectedOffer.value) return 'viewer'
  if (selectedOffer.value.user_id === user.value.id) return 'seller'
  if (viewNegotiateModal.value) return 'viewer'

  return 'buyer'
})

watch(type, () => {
  selectedDeal.value = ''
  selectedProduct.value = ''
  selectedDelivery.value = ''
  sortBy.value = ''
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
    <div class="filter-scroll mb-6">
      <!-- Type -->
      <div class="filter-item relative inline-block">
        <select v-model="type" class="filter-box pr-8">
          <option>Offers</option>
          <option>Demands</option>
        </select>
      </div>

      <!-- Deal Type -->
      <div class="filter-item relative inline-block">
        <select v-model="selectedDeal" class="filter-box pr-8">
          <option disabled value="">Select deal type</option>
          <option v-for="d in dealTypes" :key="d" :value="d">{{ d }}</option>
        </select>
        <button v-if="selectedDeal" class="clear-btn" @click.stop="selectedDeal = ''" type="button">
          <XIcon class="w-3 h-3" />
        </button>
      </div>

      <!-- Product -->
      <div class="filter-item relative inline-block">
        <select v-model="selectedProduct" class="filter-box pr-8">
          <option value="">Product</option>
          <option v-for="p in products" :key="p" :value="p">{{ p }}</option>
        </select>
        <button v-if="selectedProduct" class="clear-btn" @click.stop="selectedProduct = ''" type="button">
          <XIcon class="w-3 h-3" />
        </button>
      </div>

      <!-- Delivery Term -->
      <div class="filter-item relative inline-block">
        <select v-model="selectedDelivery" class="filter-box pr-8">
          <option value="">Delivery Term</option>
          <option v-for="d in deliveryTerms" :key="d" :value="d">{{ d }}</option>
        </select>
        <button v-if="selectedDelivery" class="clear-btn" @click.stop="selectedDelivery = ''" type="button">
          <XIcon class="w-3 h-3" />
        </button>
      </div>

      <!-- Sort -->
      <div class="filter-item relative inline-block">
        <select v-model="sortBy" class="filter-box pr-8">
          <option value="">Sort</option>
          <option value="date">Validity</option>
          <option value="quantity">Quantity</option>
          <option v-if="type === 'Offers'" value="price">Price</option>
          <option v-else value="price">Target Price</option>
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
      <div v-for="item in filteredItems" :key="item.id" class="offer-card" @click="openDetails(item)">
        <div class="offer-card-header">
          <h3 class="title">{{ item.title }}</h3>
          <p class="subtitle">{{ item.subtitle }}</p>
        </div>

        <div class="grid grid-cols-2 gap-2 mt-3 text-sm">
          <!-- <div class="label">Product</div>
          <div class="value">{{ getField(item, 'Product') }}</div> -->

          <!-- Offers: Price -->
          <template v-if="type === 'Offers'">
            <div class="label">Price</div>
            <div class="value">{{ getField(item, 'Price') }} USD/BBL</div>
          </template>

          <!-- Demands: Target Price -->
          <template v-else>
            <div class="label">Target Price</div>
            <div class="value">{{ getField(item, 'Target Price') }} USD/BBL</div>
          </template>

          <div class="label">Quantity</div>
          <div class="value">{{ getField(item, 'Quantity') }} BBL</div>
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
            <span class="value text-right">{{ d.value }} {{ unitByLabel[d.label] ?? '' }}</span>
          </div>

          <template v-if="type === 'Offers'">
            <div v-if="!user" class="bids-guest">
              <div class="bids-guest-card">
                <p class="bids-guest-title">Bids</p>
                <p class="bids-guest-text">You must be signed in to view bids and place a bid on this offer.</p>

                <div class="bids-guest-actions">
                  <NuxtLink to="/login" class="bids-guest-btn"> Sign in </NuxtLink>
                </div>
              </div>
            </div>

            <BidsSection
              v-else
              :offerId="selectedOffer.id"
              :offerUserId="selectedOffer.user_id"
              :user="user"
              :negotiationField="selectedOffer.negotiation_field"
              :quantity="getField(selectedOffer, 'Quantity')"
              :price="getField(selectedOffer, 'Price')"
              :product="getField(selectedOffer, 'Product')"
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

/* Filter dropdowns */
.filter-scroll {
  @apply flex flex-row gap-4 w-full overflow-x-auto overflow-y-hidden;
  flex-wrap: nowrap; /* force single row */
  -webkit-overflow-scrolling: touch; /* smooth iOS scrolling */
  scrollbar-gutter: stable;
}

.filter-item {
  flex: 0 0 auto; /* do not shrink; keep each select as a horizontal "chip" */
}

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
  @apply bg-gray-900 p-6 rounded shadow-2xl sm:h-[90%] sm:max-h-fit h-full xl:w-1/3 w-full overflow-y-auto;
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
  @apply w-full px-3 py-1 text-sm font-semibold
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
