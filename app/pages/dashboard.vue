<template>
  <main class="dashboard">
    <!-- Dashboard Header -->
    <div class="dashboard-header">
      <!-- User Info Card -->
      <section class="dashboard-user-info">
        <img src="https://randomuser.me/api/portraits/men/75.jpg" alt="User Avatar" class="rounded" />
        <div class="user-details grid grid-cols-2 gap-x-4">
          <!-- User Name spans both columns -->
          <p class="user-name text-yellow-400 font-bold col-span-2">Ahmadreza</p>

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
        <div>
          <p class="metric-label">Offers</p>
          <p class="metric-value">10</p>
        </div>

        <div>
          <p class="metric-label">Demands</p>
          <p class="metric-value">5</p>
        </div>

        <div>
          <p class="metric-label">Actives</p>
          <p class="metric-value">3</p>
        </div>
      </section>
    </div>

    <!-- Tabs -->
    <section>
      <GeneralTab />
    </section>
  </main>
</template>

<style scoped>
@reference "tailwindcss";
main {
  @apply p-6 space-y-5 flex-col justify-start flex-1;
}

/* Dashboard Header */
.dashboard-header {
  @apply max-w-6xl flex flex-row mx-auto justify-between gap-6;
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
  @apply grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-3 gap-6 flex-1;
}

.dashboard-main-contents > div {
  @apply bg-gray-800  sm:w-full rounded shadow hover:shadow-xl transition flex flex-col items-center justify-center p-1;
}

.metric-label {
  @apply text-gray-400 text-sm uppercase mb-1;
}

.metric-value {
  @apply text-4xl font-bold text-yellow-400;
}
</style>
