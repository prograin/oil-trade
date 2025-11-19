<template>
  <div class="layout">
    <!-- Header -->
    <header class="layout-header">
      <div class="layout-header-container">
        <NuxtLink to="/" class="layout-header-home-link">Oil Market</NuxtLink>

        <!-- Home -->
        <nav v-if="route.path === '/'" class="space-x-4 flex items-center">
          <NuxtLink to="/" class="nav-link">
            <HomeIcon class="w-6 h-6" />
          </NuxtLink>

          <NuxtLink to="/login" class="nav-link">
            <LogInIcon class="w-6 h-6" />
          </NuxtLink>
        </nav>

        <!-- Login -->
        <nav v-else-if="route.path === '/login'" class="space-x-4 flex items-center">
          <NuxtLink to="/" class="nav-link">
            <HomeIcon class="w-6 h-6" />
          </NuxtLink>
        </nav>

        <!-- Dashboard -->
        <div class="flex items-center space-x-4" v-else-if="route.path.startsWith('/dashboard')">
          <!-- Add Menu -->
          <div class="layout-header-menu group">
            <button title="Add">
              <PlusIcon class="w-6 h-6" />
            </button>
            <div>
              <NuxtLink to="/add/offer" class="nav-link rounded-t"> <FuelIcon class="w-6 h-6" />Offer </NuxtLink>
              <NuxtLink to="/add/offer" class="nav-link rounded-b"> <TruckIcon class="w-6 h-6" />Demand </NuxtLink>
              <!-- <button class="rounded-b"><TruckIcon /> Demand</button> -->
            </div>
          </div>

          <div class="layout-header-menu group">
            <button title="Menu">
              <MenuIcon class="w-6 h-6" />
            </button>
            <div>
              <button class="rounded-t"><ChartLine /> Market Trends</button>
              <button class=""><CompassIcon /> Explore</button>
              <button class="rounded-b"><LogOutIcon /> Logout</button>
            </div>
          </div>
        </div>

        <!-- Add -->
        <nav v-else-if="route.path.startsWith('/add')" class="space-x-4 flex items-center">
          <NuxtLink to="/" class="nav-link">
            <HomeIcon class="w-6 h-6" />
          </NuxtLink>

          <NuxtLink to="/dashboard" class="nav-link">
            <UserIcon class="w-6 h-6" />
          </NuxtLink>
        </nav>
      </div>
    </header>

    <!-- Main Content -->
    <slot />

    <!-- Footer Content -->
    <footer class="layout-footer">
      <div>&copy; 2025 Oil Market. All rights reserved.</div>
    </footer>
  </div>
</template>

<script setup>
import {
  TruckIcon,
  PlusIcon,
  FuelIcon,
  MenuIcon,
  CompassIcon,
  LogOutIcon,
  ChartLine,
  HomeIcon,
  LogInIcon,
  UserIcon,
} from "lucide-vue-next";
import { useRoute } from "vue-router";
const route = useRoute();
</script>

<style scoped>
@reference "tailwindcss";

.layout {
  @apply flex flex-col min-h-screen justify-between;
}

.layout-header {
  @apply bg-gray-950 shadow-md;
}
.layout-header-container {
  @apply container mx-auto flex justify-between items-center p-4 max-w-screen;
}
.layout-header-home-link {
  @apply text-2xl font-bold text-yellow-400 transition-transform transition-colors duration-200 hover:text-yellow-500 hover:scale-105;
}
.layout-header-container > nav {
  @apply space-x-6;
}
.layout-header-container > nav > .nav-link {
  /* @apply hover:text-yellow-400 transition; */
  @apply text-yellow-400 text-2xl p-2 rounded hover:bg-gray-800 transition;
}

.layout-header-menu {
  @apply relative;
}
.layout-header-menu > button {
  @apply text-yellow-400 text-2xl p-2 rounded hover:bg-gray-800 transition;
}
.layout-header-menu > div {
  @apply absolute right-0  mt-2 w-44 bg-gray-800 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-all;
}
.layout-header-menu > div > button {
  @apply w-full text-left px-4 py-2 hover:bg-yellow-400 hover:text-black transition flex items-center gap-2;
}
.layout-header-menu > div > .nav-link {
  @apply w-full text-left px-4 py-2 hover:bg-yellow-400 hover:text-black transition flex items-center gap-2;
}

.layout-main {
  @apply flex flex-col flex-1 p-6 justify-center items-center;
}

.layout-footer {
  @apply bg-gray-950 text-gray-300 mt-6;
}
.layout-footer > div {
  @apply container mx-auto p-4 text-center;
}
</style>
