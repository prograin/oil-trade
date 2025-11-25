<script setup>
import { watch, ref, computed } from 'vue'
import { tabs } from '~/data/offers'
import { XIcon } from 'lucide-vue-next'

const offers = tabs[0].items // extract list only

// Filters
const selectedDeal = ref('')
const selectedProduct = ref('')
const selectedDelivery = ref('')
const sortBy = ref('')

// Modal
const selectedOffer = ref(null)

// Unique filter lists
const dealTypes = [...new Set(offers.map((o) => o.data.find((d) => d.label === 'Deal Type')?.value))]
const products = [...new Set(offers.map((o) => o.data.find((d) => d.label === 'Product')?.value))]
const deliveryTerms = [...new Set(offers.map((o) => o.data.find((d) => d.label === 'Delivery Term')?.value))]

// Extract helper
function getField(item, label) {
  return item.data.find((d) => d.label === label)?.value || '-'
}

// FILTER + SORT
const filteredOffers = computed(() => {
  let list = [...offers]

  if (selectedDeal.value) list = list.filter((o) => getField(o, 'Deal Type') === selectedDeal.value)

  if (selectedProduct.value) list = list.filter((o) => getField(o, 'Product') === selectedProduct.value)

  if (selectedDelivery.value) list = list.filter((o) => getField(o, 'Delivery Term') === selectedDelivery.value)

  // Sorting
  if (sortBy.value === 'price') {
    list.sort((a, b) => parseFloat(getField(a, 'Price')) - parseFloat(getField(b, 'Price')))
  }

  if (sortBy.value === 'date') {
    list.sort((a, b) => new Date(getField(a, 'Validity')) - new Date(getField(b, 'Validity')))
  }

  return list
})

// Modal control
function openDetails(offer) {
  selectedOffer.value = offer
}

function closeDetails() {
  selectedOffer.value = null
}

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
      <!-- Deal Type -->
      <div class="relative inline-block">
        <select v-model="selectedDeal" class="filter-box pr-8">
          <option value="">Deal Type</option>
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
          <option value="price">Price</option>
          <option value="date">Validity</option>
        </select>
        <button v-if="sortBy" class="clear-btn" @click.stop="sortBy = ''" type="button">
          <XIcon class="w-3 h-3" />
        </button>
      </div>
    </div>

    <!-- GRID LIST -->
    <div class="grid lg:grid-cols-4 sm:grid-cols-2 grid-cols-1 gap-4">
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
          <div class="label">Price</div>
          <div class="value">{{ getField(item, 'Price') }}</div>
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
          <div v-for="d in selectedOffer.data" :key="d.label" class="detail-row">
            <span class="label">{{ d.label }}</span>
            <span class="value">{{ d.value }}</span>
          </div>
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
</style>
