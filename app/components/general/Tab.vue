<script setup>
import { ref, reactive } from "vue";

const tabs = [
  {
    id: "offers",
    label: "Offers",
    items: [
      {
        title: `Offer 1`,
        subtitle: `Qty: 4`,
      },
    ],
  },
  {
    id: "demands",
    label: "Demands",
    items: [
      {
        title: `Demand 1`,
        subtitle: `Qty: 2`,
      },
    ],
  },
];

const activeTab = ref("demands");
const openItems = reactive({});

function isContentActive(tabId) {
  console.log(activeTab.value == tabId);
  return activeTab.value == tabId;
}

function toggleItem(tabId, itemTitle) {
  if (!openItems[tabId]) openItems[tabId] = {};
  openItems[tabId][itemTitle] = !openItems[tabId][itemTitle];
}

function isItemOpen(tabId, itemTitle) {
  return openItems[tabId]?.[itemTitle] || false;
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
      <div v-for="item in tab.items" :key="item.title" class="tab-item" v-show="isContentActive(tab.id)">
        <button v-on:click="toggleItem(tab.id, item.title)">
          <span>{{ item.title }}</span>
          <span>{{ item.subtitle }}</span>
        </button>

        <div v-show="isItemOpen(tab.id, item.title)">
          <button class="edit">Edit</button>
          <button class="delete">Delete</button>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
@reference "tailwindcss";
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
.tab-item > button {
  @apply w-full text-left px-4 py-3 flex justify-between items-center focus:outline-none;
}
.tab-item > button > span:first-child {
  @apply font-semibold text-yellow-400;
}
.tab-item > button > span:last-child {
  @apply text-gray-400 text-sm;
}

.tab-item > div {
  @apply px-4 pb-3 flex gap-2;
}
.tab-item > div > button.edit {
  @apply bg-yellow-400 text-black px-3 py-1 rounded hover:bg-yellow-500 transition text-sm;
}
.tab-item > div > button.delete {
  @apply bg-red-600 px-3 py-1 rounded hover:bg-red-700 transition text-sm;
}
</style>
