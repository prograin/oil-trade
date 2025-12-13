<template>
  <transition name="fade">
    <div v-if="open" class="modal-overlay" @click="closeSuccess">
      <div class="modal-box" @click.stop>
        <!-- Icon -->
        <div class="flex justify-center mb-4">
          <div class="p-3 rounded-full bg-emerald-500/20 text-emerald-400">
            <CheckCircle2Icon class="w-8 h-8" />
          </div>
        </div>

        <h2 class="modal-title">{{ title }}</h2>
        <p class="modal-message">{{ message }}</p>

        <button class="modal-button" @click="closeSuccess">OK</button>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { CheckCircle2Icon } from 'lucide-vue-next'

// Assumes you have a composable like useErrorModal, but for success:
const { open, title, message, closeSuccess } = useSuccessModal()
</script>

<style scoped>
@reference "tailwindcss";

/* Overlay */
.modal-overlay {
  @apply fixed inset-0 p-6 bg-black/60 flex items-center justify-center z-50;
}

/* Modal box — neutral dark */
.modal-box {
  @apply bg-gray-900 text-white 
         p-6 rounded shadow-2xl w-80 max-w-full;
}

/* Title (soft green highlight) */
.modal-title {
  @apply text-xl font-bold mb-3 text-emerald-400 text-center;
}

/* Message */
.modal-message {
  @apply text-gray-300 mb-6 text-center;
}

/* Button — success style */
.modal-button {
  @apply bg-emerald-600/80 text-white px-4 py-2 rounded-lg
         hover:bg-emerald-600 
         active:bg-emerald-700 active:scale-95
         transition w-full font-semibold;
}

/* Fade transition (same as error modal) */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
