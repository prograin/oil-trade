<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

type Option = { value: string; label: string }

const props = defineProps<{
  modelValue: string[]
  options: Option[]
  label?: string
  placeholder?: string
  helperText?: string
  error?: string
  disabled?: boolean

  /**
   * If true: hovering over the field opens the dropdown (and closes on leave).
   * If false: click-only (recommended to avoid accidental opens).
   */
  openOnHover?: boolean

  /**
   * If true: show "Clear selection" button at the bottom.
   * You can set false to remove it entirely.
   */
  showClear?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string[]): void
}>()

const rootEl = ref<HTMLElement | null>(null)
const open = ref(false)
const hoveringMenu = ref(false)

const placeholder = computed(() => props.placeholder ?? 'Select options')
const disabled = computed(() => props.disabled ?? false)
const openOnHover = computed(() => props.openOnHover ?? false)
const showClear = computed(() => props.showClear ?? true)

const internalValue = computed<string[]>({
  get() {
    return Array.isArray(props.modelValue) ? props.modelValue : []
  },
  set(v) {
    emit('update:modelValue', v)
  },
})

function labelFor(val: string) {
  return props.options.find((o) => o.value === val)?.label ?? val
}

function isSelected(val: string) {
  return internalValue.value.includes(val)
}

function openMenu() {
  if (disabled.value) return
  open.value = true
}

function closeMenu() {
  open.value = false
}

function toggle() {
  if (disabled.value) return
  open.value = !open.value
}

function toggleValue(val: string) {
  if (disabled.value) return

  if (isSelected(val)) {
    internalValue.value = internalValue.value.filter((x) => x !== val)
  } else {
    internalValue.value = [...internalValue.value, val]
  }
  // keep dropdown open while selecting multiple
  openMenu()
}

function remove(val: string) {
  if (disabled.value) return
  internalValue.value = internalValue.value.filter((x) => x !== val)
}

function clear() {
  if (disabled.value) return
  internalValue.value = []
}

let hoverCloseTimer: number | null = null

function onEnter() {
  if (!openOnHover.value) return
  if (hoverCloseTimer) window.clearTimeout(hoverCloseTimer)
  openMenu()
}

function onLeave() {
  if (!openOnHover.value) return
  if (hoverCloseTimer) window.clearTimeout(hoverCloseTimer)

  // Small delay so moving from trigger -> dropdown doesn't close it
  hoverCloseTimer = window.setTimeout(() => {
    if (!hoveringMenu.value) closeMenu()
  }, 120)
}

function onDocClick(e: MouseEvent) {
  if (!open.value) return
  const target = e.target as Node | null
  if (!rootEl.value || !target) return
  if (!rootEl.value.contains(target)) closeMenu()
}

function onKeyDown(e: KeyboardEvent) {
  if (!open.value) return
  if (e.key === 'Escape') closeMenu()
}

onMounted(() => {
  document.addEventListener('click', onDocClick)
  document.addEventListener('keydown', onKeyDown)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', onDocClick)
  document.removeEventListener('keydown', onKeyDown)
  if (hoverCloseTimer) window.clearTimeout(hoverCloseTimer)
})
</script>

<template>
  <div ref="rootEl" class="relative flex flex-col mx-0">
    <label v-if="label" class="text-gray-300 text-sm mb-1">{{ label }}</label>

    <!-- Trigger / Field -->
    <button
      type="button"
      class="p-2 rounded w-full bg-gray-100 text-black flex items-center justify-between gap-2 disabled:opacity-60"
      @click.stop="toggle"
      @mouseenter="onEnter"
      @mouseleave="onLeave"
      :disabled="disabled"
    >
      <!-- Selected items rendered INSIDE the field -->
      <div class="flex flex-wrap items-center gap-2 min-h-[22px] flex-1 text-left">
        <template v-if="internalValue.length">
          <span
            v-for="val in internalValue"
            :key="val"
            class="inline-flex items-center gap-1 bg-gray-200 text-gray-900 px-2 py-1 rounded text-xs"
          >
            {{ labelFor(val) }}
            <span
              role="button"
              class="text-gray-600 hover:text-gray-900 leading-none"
              @click.stop="remove(val)"
              aria-label="Remove"
              v-if="!disabled"
            >
              ×
            </span>
          </span>
        </template>

        <span v-else class="text-gray-500 text-sm">
          {{ placeholder }}
        </span>
      </div>

      <span class="text-gray-600 shrink-0">▾</span>
    </button>

    <!-- Dropdown (overlay, does NOT push layout) -->
    <div
      v-if="open"
      class="absolute z-50 top-full mt-2 w-full bg-white rounded shadow-lg border border-gray-500 max-h-56 overflow-auto"
      @mouseenter="hoveringMenu = true"
      @mouseleave=";(hoveringMenu = false), onLeave()"
    >
      <button
        v-for="opt in options"
        :key="opt.value"
        type="button"
        class="w-full px-3 py-2 text-left flex items-center justify-between hover:bg-gray-100"
        @click.stop="toggleValue(opt.value)"
        :disabled="disabled"
      >
        <span class="text-black">{{ opt.label }}</span>
        <span v-if="isSelected(opt.value)" class="text-black">✓</span>
      </button>

      <!-- Optional "Clear" only (no done/cancel). Remove if you don't want it. -->
      <div v-if="showClear && internalValue.length" class="border-t border-gray-200 p-2">
        <button
          type="button"
          class="w-full px-3 py-2 rounded bg-gray-100 hover:bg-gray-200 text-black text-sm"
          @click.stop="clear"
          :disabled="disabled"
        >
          Clear selection
        </button>
      </div>
    </div>

    <p v-if="helperText" class="text-gray-400 text-xs mt-1">{{ helperText }}</p>
    <label v-if="error" class="text-red-400 text-sm mt-1">{{ error }}</label>
  </div>
</template>
