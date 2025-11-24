<script setup>
import { ref, computed } from 'vue'
import { tabs } from '~/data/offers'

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
</script>

<template>
  <section class="max-w-7xl mx-auto p-6">
    <!-- FILTER BAR -->
    <div class="grid sm:grid-cols-4 grid-cols-1 gap-4 mb-6">
      <select v-model="selectedDeal" class="filter-box">
        <option value="">Deal Type</option>
        <option v-for="d in dealTypes" :key="d" :value="d">{{ d }}</option>
      </select>

      <select v-model="selectedProduct" class="filter-box">
        <option value="">Product</option>
        <option v-for="p in products" :key="p" :value="p">{{ p }}</option>
      </select>

      <select v-model="selectedDelivery" class="filter-box">
        <option value="">Delivery Term</option>
        <option v-for="d in deliveryTerms" :key="d" :value="d">{{ d }}</option>
      </select>

      <select v-model="sortBy" class="filter-box">
        <option value="">Sort</option>
        <option value="price">Price</option>
        <option value="date">Validity</option>
      </select>
    </div>

    <!-- GRID LIST -->
    <div class="grid lg:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-4">
      <div v-for="item in filteredOffers" :key="item.id" class="offer-card" @click="openDetails(item)">
        <h3 class="title">{{ item.title }}</h3>
        <p class="subtitle">{{ item.subtitle }}</p>

        <!-- REQUIRED FIELDS -->
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

    <!-- DETAIL MODAL SLIDEOVER -->
    <div v-if="selectedOffer" class="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-end z-50" @click.self="closeDetails">
      <div class="slide-panel">
        <h2 class="detail-title">{{ selectedOffer.title }}</h2>
        <p class="detail-subtitle">{{ selectedOffer.subtitle }}</p>

        <div class="space-y-3 mt-4">
          <div v-for="d in selectedOffer.data" :key="d.label" class="detail-row">
            <span class="label">{{ d.label }}</span>
            <span class="value">{{ d.value }}</span>
          </div>
        </div>

        <button @click="closeDetails" class="close-btn">Close</button>
      </div>
    </div>
  </section>
</template>

<style scoped>
@reference "tailwindcss";

/* Filter Elements */
.filter-box {
  @apply p-2 bg-gray-900 text-gray-200 rounded;
}

/* Cards */
.offer-card {
  @apply bg-gray-800 p-4 rounded-xl shadow-md hover:shadow-xl cursor-pointer
         hover:bg-gray-700 transition border border-gray-700;
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

/* Slide Panel */
.slide-panel {
  @apply bg-gray-900 w-full sm:w-[420px] h-full p-6 overflow-y-auto shadow-xl
         border-l border-gray-700;
}
.detail-title {
  @apply text-xl font-bold text-yellow-400;
}
.detail-subtitle {
  @apply text-gray-400;
}
.detail-row {
  @apply flex justify-between bg-gray-800 p-2 rounded shadow;
}
.close-btn {
  @apply mt-6 w-full py-2 bg-red-700 text-white rounded hover:bg-red-600 transition;
}
</style>
