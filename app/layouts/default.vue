<template>
  <div class="layout">
    <Header />

    <main class="layout__main" :key="$route.fullPath">
      <slot />
    </main>

    <footer>
      <p>© 2025 Oil Cargo Offers. All rights reserved.</p>
    </footer>
  </div>
</template>

<script setup>
import Header from '~/components/Header.vue'
</script>