<script setup>
definePageMeta({ middleware: ['auth'] })

const { user } = useUserSession()

const { data: offersData, refresh: offersRefresh } = await useFetch('/api/my/offer?include=bids', {
  method: 'GET',
  server: false,
})

const { data: demandsData, refresh: demandsRefresh } = await useFetch('/api/my/demand', {
  method: 'GET',
  server: false,
})

const activeMetric = ref('offers')

function onMetricClicked(metric) {
  activeMetric.value = metric
}

const offersRows = computed(() => offersData.value?.results ?? [])
const demandsRows = computed(() => demandsData.value?.results ?? [])

const activeCounts = computed(() => {
  const all = [...offersRows.value, ...demandsRows.value]
  return all.filter((r) => r.is_active === true || r.is_active === 1 || r.is_active === '1').length
})

const activeRefresh = () => {
  if (activeMetric.value === 'offers') return offersRefresh()
  if (activeMetric.value === 'demands') return demandsRefresh()
  return Promise.all([offersRefresh(), demandsRefresh()])
}
</script>

<template>
  <main class="dashboard">
    <div class="dashboard-header">
      <section v-if="user" class="dashboard-user-info">
        <!-- <img src="https://randomuser.me/api/portraits/men/75.jpg" alt="User Avatar" class="rounded" /> -->
        <div class="user-details grid grid-cols-2 gap-x-4">
          <p class="user-name text-yellow-400 font-bold col-span-2">{{ user.nickname }}</p>
          <span class="text-yellow-400 font-semibold">Sales</span>
          <span class="text-gray-200 text-sm">15</span>
          <span class="text-yellow-400 font-semibold text-sm">Purchases</span>
          <span class="text-gray-200 text-sm">8</span>
        </div>
      </section>

      <section class="dashboard-main-contents">
        <button @click="onMetricClicked('offers')" :class="{ active: activeMetric === 'offers' }">
          <p class="metric-label">Offers</p>
          <p class="metric-value">{{ offersRows.length }}</p>
        </button>

        <button @click="onMetricClicked('demands')" :class="{ active: activeMetric === 'demands' }">
          <p class="metric-label">Demands</p>
          <p class="metric-value">{{ demandsRows.length }}</p>
        </button>

        <button @click="onMetricClicked('actives')" :class="{ active: activeMetric === 'actives' }">
          <p class="metric-label">Actives</p>
          <p class="metric-value">{{ activeCounts }}</p>
        </button>
      </section>
    </div>

    <!-- Explore-style content -->
    <section class="flex flex-col flex-1">
      <DashboardExploreList
        v-if="activeMetric === 'offers'"
        :items="offersRows"
        mode="Offers"
        :fetchBidsOnOpen="false"
        :enableConfirm="true"
        :refresh="activeRefresh"
      />

      <DashboardExploreList
        v-else-if="activeMetric === 'demands'"
        :items="demandsRows"
        mode="Demands"
        :fetchBidsOnOpen="false"
        :enableConfirm="false"
        :refresh="activeRefresh"
      />

      <!-- actives: combine, but bids UX only makes sense for offers -->
      <DashboardExploreList
        v-else
        :items="[...offersRows, ...demandsRows].filter((r) => r.is_active === true || r.is_active === 1 || r.is_active === '1')"
        mode="Offers"
        :fetchBidsOnOpen="false"
        :enableConfirm="true"
        :refresh="activeRefresh"
      />
    </section>
  </main>
</template>

<style scoped>
@reference "tailwindcss";
main {
  @apply p-4 space-y-5 flex flex-col justify-start flex-1
         w-full sm:mx-auto;
}

/* Dashboard Header */
.dashboard-header {
  @apply w-full flex flex-row mx-auto  gap-6;
}

/* User Info Card */
.dashboard-user-info {
  @apply flex flex-col justify-center gap-4 sm:gap-4 sm:flex-row items-center bg-gray-800 p-2 rounded shadow;
}

.dashboard-user-info img {
  @apply rounded sm:h-22 h-30 sm:w-22 w-30 mb-0;
}

.user-details {
  @apply justify-center ml-4;
}

.user-name {
  @apply text-xl font-bold text-yellow-400 border-b;
}

.user-level,
.user-stats {
  @apply text-gray-400 sm:text-sm text-lg;
}

/* Metrics Cards */
.dashboard-main-contents {
  @apply grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-3 flex-1 sm:flex-none gap-6 md:w-5/12 md:justify-start;
}

.dashboard-main-contents > button {
  @apply bg-gray-800  sm:w-full rounded shadow hover:bg-gray-700 hover:shadow-xl active:scale-95 active:bg-gray-600 transition flex flex-col items-center justify-center p-1;
}
.dashboard-main-contents > button.active {
  @apply bg-gray-600;
}

.metric-label {
  @apply text-gray-400 text-sm uppercase mb-1;
}

.metric-value {
  @apply text-4xl font-bold text-yellow-400;
}
</style>
