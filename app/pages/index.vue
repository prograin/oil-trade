<template>
  <main id="home">
    <!-- Hero Section -->
    <section class="home-section-hero">
      <h2>Welcome to Oil Market</h2>
      <p>
        Track global oil demand and supply, connect buyers and sellers efficiently, and make data-driven decisions in
        the oil industry.
      </p>
      <a href="#demand">Explore Market</a>
    </section>

    <!-- Market Cards -->
    <section class="home-section-cards">
      <div>
        <h3>Latest Offers</h3>
        <p>Check the most recent oil offers available in the market.</p>
      </div>
      <div>
        <h3>Latest Demands</h3>
        <p>View the latest oil demand requests from buyers worldwide.</p>
      </div>
      <div>
        <h3>Market Stats</h3>
        <p>Get quick insights into oil prices, trends, and analytics.</p>
      </div>
    </section>

    <!-- About Section -->
    <section class="home-section-about">
      <h3 class="text-2xl font-bold text-yellow-400 mb-4">About Oil Market</h3>
      <p class="text-gray-300">
        Oil Market is a platform that bridges the gap between oil suppliers and buyers. Our goal is to make oil trading
        transparent, fast, and efficient with real-time data and user-friendly tools.
      </p>
    </section>
  </main>
</template>

<script setup></script>

<style scoped>
@reference "tailwindcss";

main {
  @apply flex flex-col flex-1 p-6 justify-start items-start;
}

/* Hero Section  */
.home-section-hero {
  @apply w-full mb-12 bg-gradient-to-r from-gray-800 via-black to-gray-900 p-8 rounded shadow-lg;
}
.home-section-hero > h2 {
  @apply text-3xl md:text-4xl font-bold text-yellow-400 mb-4;
}
.home-section-hero > p {
  @apply text-gray-300 mb-6;
}
.home-section-hero > a {
  @apply bg-yellow-400 text-black font-bold px-6 py-3 rounded hover:bg-yellow-500 transition;
}

/* Market Cards */
.home-section-cards {
  @apply w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6;
}
.home-section-cards > div {
  @apply bg-gray-800 p-6 rounded shadow hover:shadow-lg transition w-full;
}
.home-section-cards > div > h3 {
  @apply text-xl font-semibold text-yellow-400 mb-2;
}
.home-section-cards > div > p {
  @apply text-gray-300;
}

.home-section-about {
  @apply mt-12 bg-gray-800 p-6 rounded shadow;
}
.home-section-about > h3 {
  @apply text-2xl font-bold text-yellow-400 mb-4;
}
.home-section-about > p {
  @apply text-gray-300;
}
</style>
