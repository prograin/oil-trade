<template>
  <main class="dashboard">
    <!-- Main Contents -->
    <section class="dashboard-main-contents">
      <div>
        <p>Offers</p>
        <p>10</p>
      </div>
      <div>
        <p>Demands</p>
        <p>5</p>
      </div>
      <div>
        <p>Actives</p>
        <p>3</p>
      </div>
    </section>

    <!-- Tabs -->
    <section>
      <GeneralTab />
    </section>
  </main>
</template>

<script lang="ts" setup></script>

<style scoped>
@reference "tailwindcss";

main {
  @apply p-6 space-y-12 flex-col justify-start flex-1;
}

.dashboard-main-contents {
  @apply max-w-6xl mx-auto grid grid-cols-3 sm:grid-cols-3 gap-6;
}
.dashboard-main-contents > div {
  @apply bg-gray-800 p-6 rounded shadow hover:shadow-xl transition flex flex-col items-center;
}
.dashboard-main-contents > div :first-child {
  @apply text-gray-400 text-sm uppercase;
}
.dashboard-main-contents > div :last-child {
  @apply text-3xl font-bold text-yellow-400;
}
</style>
