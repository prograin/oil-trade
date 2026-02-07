<template>
  <teleport to="body">
    <transition name="fade">
      <div v-if="open" class="modal-overlay" @click="closeWarning">
        <div class="modal-box" @click.stop>
          <div class="flex justify-center mb-4">
            <div class="p-3 rounded-full bg-amber-500/20 text-amber-300">
              <AlertTriangleIcon class="w-8 h-8" />
            </div>
          </div>

          <h2 class="modal-title">{{ title }}</h2>
          <p class="modal-message">{{ message }}</p>

          <button class="modal-button" @click="closeWarning">OK</button>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup lang="ts">
import { AlertTriangleIcon } from 'lucide-vue-next'

const { open, title, message, closeWarning } = useWarningModal()
</script>

<style scoped>
@reference "tailwindcss";

/* Overlay */
.modal-overlay {
  /* IMPORTANT: higher than your negotiation modal */
  @apply fixed inset-0 p-6 bg-black/60 flex items-center justify-center z-[9999];
}

.modal-box {
  @apply bg-gray-900 text-white p-6 rounded shadow-2xl w-80 max-w-full ring-1 ring-amber-500/30;
}

/* Title (amber highlight) */
.modal-title {
  @apply text-xl font-bold mb-3 text-amber-300 text-center;
}

/* Message */
.modal-message {
  @apply text-gray-300 mb-6 text-center;
}

/* Button — warning button */
.modal-button {
  @apply bg-amber-500/85 text-black px-4 py-2 rounded-lg
         hover:bg-amber-500
         active:bg-amber-600 active:scale-95
         transition w-full font-semibold;
}

/* Fade transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
