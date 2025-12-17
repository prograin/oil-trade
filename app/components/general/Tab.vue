<script setup>
import { ref, reactive } from 'vue'
import { ChevronDown, ChevronDownIcon } from 'lucide-vue-next'
import { tabs } from '~/data/offers'

const props = defineProps({
  data: { type: Array, default: () => [] },
  refresh: { type: Function },
  activeTab: { type: String, required: true },
})

import { FilePlus } from 'lucide-vue-next'

const { showError } = useErrorModal()
const { askQuestion } = useQuestionModal()
const { showSuccess } = useSuccessModal()

const openItems = reactive({})
const openBids = reactive({})

const filteredData = computed(() => {
  if (props.activeTab === 'actives') {
    return props.data.filter((row) => row.is_active.value === true || row.is_active.value === 1)
  }
  return props.data
})

function toggleBids(itemId) {
  openBids[itemId] = !openBids[itemId]
}

function toggleItem(itemId) {
  if (!openItems[tabId]) openItems[tabId] = {}
  openItems[itemId] = !openItems[itemId]
}

function onConfirm(bidId, status) {
  askQuestion('Confirm Bid?', 'Are you sure you want to confirm this bid?', async () => {
    try {
      const res = await $fetch(`/api/bid/${bidId}/confirm`, { method: 'POST' })
      if (res.success) {
        showSuccess({
          title: 'Bid confirmed',
          message: 'The bid has been successfully confirmed.',
        })

        await props.refresh?.()
      }
    } catch (error) {
      showError({
        title: error?.data?.statusMessage || 'CRITICAL',
        message: error?.data?.message || 'An unexpected error occurred.',
      })
    }
  })
}

async function onDelete(itemId) {
  askQuestion('Delete offer?', 'Are you sure you want to delete this offer? This action cannot be undone.', async () => {
    try {
      await $fetch(`/api/offer/${itemId}`, { method: 'DELETE' })
      await props.refresh?.()
    } catch (error) {
      showError({
        title: error?.data?.statusMessage || 'CRITICAL',
        message: error?.data?.message || 'An unexpected error occurred.',
      })
    }
  })
}
</script>

<template>
  <section class="tab">
    <!-- Create Button For First  -->
    <div v-if="!filteredData || filteredData.length === 0" class="tab-first-created-container">
      <button @click="$router.push('/add/offer')" class="tab-first-created-button group">
        <FilePlus class="tab-first-created-icon" />
        <span class="tab-first-created-label">
          {{ activeTab === 'offers' ? 'New Offer' : 'New Demand' }}
        </span>
      </button>
    </div>

    <!-- Tab Content -->
    <!-- data : [[{label,value}]] -->
    <div v-else class="tab-content">
      <div v-for="item in filteredData" :key="item.id.value" class="tab-item">
        <!-- Header -->
        <div class="tab-item-header" v-on:click="toggleItem(item.id.value)">
          <div class="tab-item-header-container">
            <h3 class="tab-item-header-titile">{{ item.product.value }}</h3>
          </div>
          <!-- <ChevronDown
            :class="[
              'w-5 h-5 transition-transform duration-300',
              openItems[tab.id]?.[item.id] ? 'rotate-180 text-yellow-400' : 'text-gray-400',
            ]"
          /> -->
        </div>

        <!-- Details -->
        <div class="tab-item-detail">
          <div class="tab-item-detail-container">
            <template v-for="d in item" :key="d.label">
              <div v-if="!['ID', 'User', 'Bids', 'is_active'].includes(d.label)" class="tab-item-detail-data-dev">
                <span class="text-gray-400 font-semibold">{{ d.label }}</span>
                <span class="text-white font-bold">{{ d.value }}</span>
              </div>
            </template>
          </div>

          <!-- Bids -->
          <!-- {bids:{value:[{}]}} -->
          <div v-if="item.bids && item.bids.value.length > 0" class="bids-section pt-4 border-t">
            <button type="button" class="bids-header" @click="toggleBids(item.id)">
              <span class="bids-title">
                Bids
                <span class="bids-count">
                  {{ item.bids.value.length }}
                </span>
              </span>

              <ChevronDown :class="['chevron-icon', openBids[item.id] ? 'open' : 'close']" />
            </button>

            <transition name="fade">
              <div v-show="openBids[item.id]" class="bids-body">
                <!-- EXISTING BIDS -->
                <div v-for="bid in item.bids.value" :key="bid.id" class="bid-row">
                  <!-- normal mode -->

                  <span class="bid-user">{{ bid.bidder }}</span>
                  <span class="bid-price">{{ bid.value }} USD/BBL</span>
                  <span class="bid-time">{{ bid.created_at }}</span>
                  <button
                    :disabled="bid.is_confirmed"
                    :class="['bid-btn', { disable: bid.is_confirmed }, bid.is_confirmed ? 'confirmed' : 'no-confirmed ']"
                    v-on:click="onConfirm(bid.id, !bid.confirmed)"
                  >
                    {{ bid.is_confirmed ? 'Confirmed' : 'Confirm' }}
                  </button>
                </div>
              </div>
            </transition>
          </div>

          <!-- Action Button -->
          <div class="flex gap-2 mt-3 justify-end">
            <button class="edit-button">Edit</button>
            <button class="delete-button" v-on:click="onDelete(item.id.value)">Delete</button>
            <!-- <button class="book-button">Book</button> -->
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
@reference "tailwindcss";

.chevron-icon {
  @apply w-5 h-5 transition-transform duration-300;
}
.chevron-icon.open {
  @apply rotate-180 text-yellow-400;
}
.chevron-icon.close {
  @apply text-gray-400;
}

.tab {
  @apply flex flex-col flex-1 h-full w-full mx-auto bg-gray-800 rounded p-6 shadow relative justify-center;
}

.tab-first-created-container {
  @apply w-full flex flex-col items-center justify-center text-center text-gray-300 sm:py-20 space-y-8;
}
.tab-first-created-button {
  @apply p-8 rounded-full bg-gray-700/40 hover:bg-gray-700/60 shadow-xl 
         transition-all duration-300 active:scale-95 flex flex-col items-center  space-y-2 sm:space-y-4;
}
.tab-first-created-icon {
  @apply w-14 h-14 sm:w-20 sm:h-20 text-yellow-400 group-hover:text-yellow-300 transition-colors duration-300;
}
.tab-first-created-label {
  @apply text-sm sm:text-lg font-semibold text-yellow-300 group-hover:text-yellow-200 transition;
}

.tab-menu {
  @apply flex flex-row border-b border-gray-700 mb-6 space-x-4 shadow relative;
}
.tab-menu > button {
  @apply max-sm:w-full px-6 py-2 rounded-t text-gray-400 hover:text-yellow-400 transition focus:outline-none;
}
.tab-menu > button.active {
  @apply text-yellow-400 bg-gray-900;
}

.tab-content {
  @apply space-y-4 relative;
}

.tab-item {
  @apply bg-gray-900 rounded shadow hover:shadow-lg transition overflow-hidden;
}
.tab-item > div {
  @apply px-4 pb-3 flex gap-2;
}

.tab-item-header {
  @apply w-full text-left px-4 py-3 flex justify-between items-center focus:outline-none cursor-pointer;
}
.tab-item-header-titile {
  @apply font-semibold text-yellow-400;
}
.tab-item-header-subtitile {
  @apply text-gray-400 text-sm;
}

.tab-item-detail {
  @apply flex flex-col mt-3 space-y-3;
}
.tab-item-detail-container {
  @apply flex flex-col space-y-2;
}
.tab-item-detail-data-dev {
  @apply flex sm:flex-row flex-col gap-1 justify-between bg-gray-800 px-4 py-2 rounded shadow hover:bg-gray-600 transition;
}

/* Bids */
.bids-section {
  @apply border-t border-gray-700 pt-4;
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
  @apply flex items-center gap-3 bg-gray-800 px-3 py-2 rounded text-sm justify-around;
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
  @apply px-3 py-1 inline-flex  h-full items-center justify-center rounded text-xs
         bg-gray-700 hover:bg-gray-600 active:bg-gray-900 active:scale-95
         text-gray-200 transition disabled:active:scale-100;
}
.confirmed {
  @apply bg-green-600 text-white cursor-not-allowed opacity-80 disabled:bg-green-600;
}

.edit-button {
  @apply px-4 py-1 rounded-md text-gray-200 bg-gray-800 hover:bg-gray-700 transition font-medium text-sm active:bg-gray-900 active:scale-95;
}
.delete-button {
  @apply px-4 py-1 rounded-md text-gray-200 bg-gray-800 hover:bg-red-700 transition font-medium text-sm active:bg-red-900 active:scale-95;
}
.book-button {
  @apply px-4 py-1 rounded-md text-gray-200 bg-gray-800 hover:bg-green-700 transition font-medium text-sm active:scale-95;
}
</style>
