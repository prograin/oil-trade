<script setup>
import { AlertTriangle } from 'lucide-vue-next'

const { open, title, message, confirm, close } = useQuestionModal()
</script>

<template>
  <Transition
    enter-active-class="transition-opacity duration-200"
    enter-from-class="opacity-0"
    leave-active-class="transition-opacity duration-200"
    leave-to-class="opacity-0"
  >
    <div v-if="open" class="modal-overlay" @click="close">
      <div class="modal-box" @click.stop>
        <!-- Icon -->
        <div class="flex justify-center mb-4">
          <div class="p-3 rounded-full bg-yellow-500/20 text-yellow-400">
            <AlertTriangle class="w-8 h-8" />
          </div>
        </div>

        <!-- Title -->
        <h2 class="modal-title">
          {{ title }}
        </h2>

        <!-- Message -->
        <p class="modal-message">
          {{ message }}
        </p>

        <!-- Buttons -->
        <div class="flex gap-3">
          <button type="button" class="btn-secondary" @click="close">Cancel</button>

          <button type="button" class="btn-primary" @click="confirm">Yes, continue</button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
@reference "tailwindcss";

.modal-overlay {
  @apply fixed inset-0 p-6 bg-black/60 flex items-center justify-center z-50;
}

.modal-box {
  @apply bg-gray-900 text-white p-6 rounded-xl shadow-2xl w-96 max-w-full
         ring-1 ring-white/10;
}

.modal-title {
  @apply text-lg font-semibold text-yellow-400 text-center mb-2;
}

.modal-message {
  @apply text-gray-300 text-center mb-6;
}

.btn-secondary {
  @apply flex-1 px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600
         active:scale-95 transition;
}

.btn-primary {
  @apply flex-1 px-4 py-2 rounded-lg bg-yellow-500 text-black
         hover:bg-yellow-400 active:scale-95
         transition font-semibold;
}
</style>
