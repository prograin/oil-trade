<script setup>
definePageMeta({
  middleware: ['auth'],
})

const { user } = useUserSession()

const {
  data: offersData,
  error: offersError,
  refresh: offersRefresh,
} = await useFetch('/api/my/offer?include=bids', { method: 'GET', server: false })

const {
  data: demandsData,
  error: demandsError,
  refresh: demandsRefresh,
} = await useFetch('/api/my/demand', { method: 'GET', server: false })

const activeMetric = ref('offers')
let activeCounts = 0

function onMetricClicked(metric) {
  activeMetric.value = metric
}

const activeRefresh = () => {
  if (activeMetric.value === 'offers') {
    return offersRefresh()
  }

  if (activeMetric.value === 'demands') {
    return demandsRefresh()
  }

  // actives → refresh both
  return Promise.all([offersRefresh(), demandsRefresh()])
}

const results = computed(() => {
  const offersRows = offersData.value?.results ?? []
  const demandsRows = demandsData.value?.results ?? []

  // reset counter on each recompute
  activeCounts = 0

  const offers = offersRows.map((row) => {
    if (row.is_active === true || row.is_active === 1) activeCounts++

    return {
      type: { label: 'Type', value: row.type ?? 'offer' },

      id: { label: 'ID', value: row.id },
      product: { label: 'Product', value: row.product },

      quantity: { label: 'Quantity', value: row.quantity },
      deal_type: { label: 'Deal Type', value: row.deal_type },

      delivery_term: { label: 'Delivery Term', value: row.delivery_term },
      delivery_detail: { label: 'Delivery Detail', value: row.delivery_detail },
      transfer_zone: { label: 'Transfer Zone', value: row.transfer_zone },

      benchmark_based: { label: 'Benchmark Based', value: row.benchmark_based },
      payment_term: { label: 'Payment Term', value: row.payment_term },
      operation_cost: { label: 'Operation Cost', value: row.operation_cost },
      down_payment: { label: 'Down Payment', value: row.down_payment },

      price: { label: 'Price', value: row.price }, // offers have price
      validity: { label: 'Validity', value: row.validity },

      user_name: { label: 'User', value: row.user_name },
      api: { label: 'API', value: row.api },
      sulfur: { label: 'Sulfur', value: row.sulfur },

      bids: { label: 'Bids', value: row.bids },
      created_at: { label: 'Created At', value: row.created_at },
      is_active: { label: 'Is Active', value: row.is_active },
    }
  })

  const demands = demandsRows.map((row) => {
    if (row.is_active === true || row.is_active === 1) activeCounts++

    return {
      type: { label: 'Type', value: row.type ?? 'demand' },

      id: { label: 'ID', value: row.id },
      document_type: { label: 'Document Type', value: row.document_type },
      product: { label: 'Product', value: row.product },

      api_min: { label: 'API Min', value: row.api_min },
      api_max: { label: 'API Max', value: row.api_max },
      sulfur_max: { label: 'Sulfur Max', value: row.sulfur_max },

      quantity: { label: 'Quantity', value: row.quantity },
      deal_type: { label: 'Deal Type', value: row.deal_type },

      delivery_term: { label: 'Delivery Term', value: row.delivery_term },
      delivery_detail: { label: 'Delivery Detail', value: row.delivery_detail },
      transfer_zone: { label: 'Transfer Zone', value: row.transfer_zone },

      benchmark_based: { label: 'Benchmark Based', value: row.benchmark_based },
      payment_term: { label: 'Payment Term', value: row.payment_term },
      operation_cost: { label: 'Operation Cost', value: row.operation_cost },
      down_payment: { label: 'Down Payment', value: row.down_payment },

      target_price: { label: 'Target Price', value: row.target_price }, // demands have target_price
      validity: { label: 'Validity', value: row.validity },

      user_name: { label: 'User', value: row.user_name },
      created_at: { label: 'Created At', value: row.created_at },
      is_active: { label: 'Is Active', value: row.is_active },
    }
  })

  return {
    offers,
    demands,
  }
})
</script>

<template>
  <main class="dashboard">
    <!-- Dashboard Header -->
    <div class="dashboard-header">
      <!-- User Info Card -->
      <section v-if="user" class="dashboard-user-info">
        <img src="https://randomuser.me/api/portraits/men/75.jpg" alt="User Avatar" class="rounded" />
        <div class="user-details grid grid-cols-2 gap-x-4">
          <!-- User Name spans both columns -->
          <p class="user-name text-yellow-400 font-bold col-span-2">{{ user.nickname }}</p>

          <!-- Level -->
          <span class="text-yellow-400 font-semibold text-sm">Level</span>
          <span class="text-gray-200 text-sm">Expert</span>

          <!-- Sales -->
          <span class="text-yellow-400 font-semibold">Sales</span>
          <span class="text-gray-200 text-sm">15</span>

          <!-- Purchases -->
          <span class="text-yellow-400 font-semibold text-sm">Purchases</span>
          <span class="text-gray-200 text-sm">8</span>
        </div>
      </section>

      <!-- Metrics Cards -->
      <section class="dashboard-main-contents">
        <button v-on:click="onMetricClicked('offers')" :class="{ active: activeMetric === 'offers' }">
          <p class="metric-label">Offers</p>
          <p class="metric-value">{{ results.offers.length }}</p>
        </button>

        <button v-on:click="onMetricClicked('demands')" :class="{ active: activeMetric === 'demands' }">
          <p class="metric-label">Demands</p>
          <p class="metric-value">{{ results.demands.length }}</p>
        </button>

        <button v-on:click="onMetricClicked('actives')" :class="{ active: activeMetric === 'actives' }">
          <p class="metric-label">Actives</p>
          <p class="metric-value">{{ activeCounts }}</p>
        </button>
      </section>
    </div>

    <!-- Tabs -->
    <section class="flex flex-col flex-1">
      <GeneralTab :data="results" :refresh="activeRefresh" :activeTab="activeMetric" />
    </section>
  </main>
</template>

<style scoped>
@reference "tailwindcss";
main {
  @apply p-4 space-y-5 flex flex-col justify-start flex-1
         w-full sm:max-w-6xl sm:mx-auto;
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
