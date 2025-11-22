<script setup>
import { ref, reactive } from "vue";
import { ChevronDown } from "lucide-vue-next";
import { tabs } from "~/data/offers";

const activeTab = ref("offers");
const openItems = reactive({});
const openBids = reactive({});

function toggleBids(itemId) {
  openBids[itemId] = !openBids[itemId];
}

function toggleItem(tabId, itemId) {
  if (!openItems[tabId]) openItems[tabId] = {};
  openItems[tabId][itemId] = !openItems[tabId][itemId];
}
</script>

<template>
  <section class="tab">
    <!-- Tab Button -->
    <div class="tab-menu">
      <button v-for="tab in tabs" :key="tab.id" @click="activeTab = tab.id" :class="{ active: activeTab == tab.id }">
        {{ tab.label }}
      </button>
    </div>

    <!-- Tab Content -->
    <div v-for="tab in tabs" :key="tab.id" class="tab-content">
      <div v-for="item in tab.items" :key="item.title" class="tab-item" v-show="activeTab === tab.id">
        <!-- Header -->
        <div class="tab-item-header" v-on:click="toggleItem(tab.id, item.id)">
          <div class="tab-item-header-container">
            <h3 class="tab-item-header-titile">{{ item.title }}</h3>
            <p class="tab-item-header-subtitile">{{ item.subtitle }}</p>
          </div>
          <ChevronDown
            :class="[
              'w-5 h-5 transition-transform duration-300',
              openItems[tab.id]?.[item.id] ? 'rotate-180 text-yellow-400' : 'text-gray-400',
            ]"
          />
        </div>

        <!-- Details -->
        <div v-show="openItems[tab.id]?.[item.id]" class="tab-item-detail">
          <div class="tab-item-detail-container">
            <div v-for="d in item.data" :key="d.label" class="tab-item-detail-data-dev">
              <span class="text-yellow-300 font-semibold">{{ d.label }}</span>
              <span class="text-white font-bold">{{ d.value }}</span>
            </div>
          </div>

          <!-- Bids -->
          <div v-if="item.bids && item.bids.length" class="tab-item-detail-bid bg-gray-800 rounded p-2 mt-2">
            <div @click="toggleBids(item.id)" class="bid-items-header">
              <span>{{ openBids[item.id] ? "Hide Bids" : "Show Bids" }}</span>
              <ChevronDown :class="['chevron-icon', openBids[item.id] ? 'open' : 'close']" />
            </div>

            <div v-show="openBids[item.id]" class="mt-2 space-y-2">
              <div v-for="bid in item.bids" :key="bid.timestamp" class="bid-item">
                <div class="bid-item-container">
                  <p class="text-yellow-400">{{ bid.bidder }}</p>
                  <p class="text-gray-400 text-sm">{{ bid.value }} | {{ bid.timestamp }}</p>
                </div>
                <button :class="['bid-item-confirm-btn ', bid.confirmed ? 'confirmed' : 'no-confirmed ']">
                  {{ bid.confirmed ? "Confirmed" : "Confirm" }}
                </button>
              </div>
            </div>
          </div>
          <div class="flex gap-2 mt-3 justify-end">
            <button class="edit-button">Edit</button>
            <button class="delete-button">Delete</button>
            <button class="book-button">Book</button>
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
  @apply max-w-6xl mx-auto bg-gray-800 rounded p-6 shadow relative;
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
  @apply flex sm:flex-row flex-col gap-2 justify-between bg-gray-800 px-4 py-2 rounded shadow hover:bg-gray-600 transition;
}

.bid-item {
  @apply flex flex-col sm:flex-row sm:justify-between sm:items-center items-start gap-4 bg-gray-700 p-2 rounded;
}
.bid-items-header {
  @apply flex justify-between items-center w-full px-4 py-2 text-gray-200 rounded-md transition font-medium;
}
.bid-item-container {
  @apply flex sm:flex-row flex-col sm:justify-end justify-start sm:items-end items-start space-x-4;
}
.bid-item-confirm-btn {
  @apply px-2 py-1 rounded text-sm self-end sm:self-auto;
}
.bid-item-confirm-btn.confirmed {
  @apply bg-green-500 text-white;
}
.bid-item-confirm-btn.no-confirmed {
  @apply bg-gray-500 text-white;
}

.edit-button {
  @apply px-4 py-1 rounded-md text-gray-200 bg-gray-800 hover:bg-gray-700 transition font-medium text-sm;
}
.delete-button {
  @apply px-4 py-1 rounded-md text-gray-200 bg-gray-800 hover:bg-red-700 transition font-medium text-sm;
}
.book-button {
  @apply px-4 py-1 rounded-md text-gray-200 bg-gray-800 hover:bg-green-700 transition font-medium text-sm;
}
</style>
