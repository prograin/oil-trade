<script setup lang="ts">
import type { FieldStatus, CatalogField, Role } from '@/types/bid'
import { useSuggestions } from '@/composables/useSuggestions'
import { useDraft } from '@/composables/useDraft'
import { Check, X } from 'lucide-vue-next'
import { nextTick } from 'vue'

const props = defineProps<{
  viewerRole: Role
  view: boolean
  user: Record<string, any>
  bid_id: number | null
  offer: Record<string, any>
  negotiation_field: Array<{ value: string; label: string }>
}>()

const { showWarning } = useWarningModal()

const isSeller = computed(() => props.viewerRole === 'seller')
const isBuyer = computed(() => props.viewerRole === 'buyer')
const isViewer = computed(() => props.viewerRole === 'viewer')

const canNegotiate = computed(() => (isSeller.value || isBuyer.value) && !props.view)
const canReview = computed(() => isSeller.value || isBuyer.value)

const context = computed(() => ({
  product: props.offer.product,
  listedPrice: `${props.offer.price} USD/BBL`,
  quantity: `${props.offer.quantity} BBL`,
}))

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'submitted'): void
}>()
const onClose = () => emit('close')

const suggestions = useSuggestions(props.bid_id, props.user.id, props.offer.user_id, fieldsCatalog)

const bidId = computed(() => suggestions.bidId.value)
const sortedHistory = computed(() => suggestions.sortedHistory.value)

const refresh = async () => {
  await suggestions.refresh()
}
const reviewField = (suggestionId: string, fieldKey: string, status: FieldStatus) => {
  if (!canReview.value) return
  suggestions.reviewField(suggestionId, fieldKey, status)
}

const { draft, selectedFieldKey, selectedValue, draftComment, selectedField, addDraftField, removeDraft, cancelDraft, buildPayload } =
  useDraft(fieldsCatalog)

const submitNegotiation = async () => {
  if (props.view) return
  if (!draft.value.length) return

  const valueField = draft.value.find((d) => d.key === 'price')?.value

  if (!valueField) {
    showWarning({
      title: 'Price required',
      message: 'Please enter a price before submitting your negotiation.',
    })
    return
  }

  const suggestionPayload = buildPayload()

  const res = await $fetch<{ success: boolean; bid_id: number; message?: string }>(`/api/offer/${props.offer.id}/negotiate`, {
    method: 'POST',
    body: {
      value: Number(valueField),
      suggestion: suggestionPayload,
      ...(bidId.value ? { bid_id: bidId.value } : {}),
    },
  })

  if (!res?.bid_id) return

  suggestions.bidId.value = res.bid_id

  cancelDraft()
  await refresh()
  emit('submitted')
}

const roleLabel = (role: Role) => {
  if (role === 'seller') return 'Seller'
  if (role === 'buyer') return 'Buyer'
  return 'Viewer'
}
const suggestionLabel = (actor: Role) => {
  return actor === props.viewerRole ? 'Your Suggestion' : `${roleLabel(actor)} Suggestion`
}
const cardToneClass = (actor: Role) => {
  if (actor === props.viewerRole) return 'card-tone-you'
  if (actor === 'seller') return 'card-tone-seller'
  if (actor === 'buyer') return 'card-tone-buyer'
  return 'card-tone-other'
}
</script>

<template>
  <!-- Backdrop -->
  <div class="modal-backdrop" role="dialog" aria-modal="true" aria-label="Negotiation Modal" @click.self="onClose">
    <div class="modal-panel">
      <!-- Header -->
      <header class="modal-header">
        <div class="min-w-0">
          <div class="text-amber-400 font-black text-lg tracking-tight">Negotiation</div>
        </div>

        <button class="icon-btn" type="button" aria-label="Close" @click="onClose">✕</button>
      </header>

      <div class="modal-body">
        <!-- Context -->
        <section class="section-shell">
          <div class="section-title">
            <div class="section-title__left">
              <div class="section-kicker">Offer info</div>
              <div class="section-heading">Details</div>
            </div>
          </div>
          <div class="section-body">
            <div class="grid gap-2 sm:grid-cols-3">
              <div class="kv-row">
                <span class="kv-label">Product</span>
                <span class="kv-value">{{ context.product }}</span>
              </div>
              <div class="kv-row">
                <span class="kv-label">Price</span>
                <span class="kv-value">{{ context.listedPrice }}</span>
              </div>
              <div class="kv-row">
                <span class="kv-label">Quantity</span>
                <span class="kv-value">{{ context.quantity }}</span>
              </div>
            </div>
          </div>
        </section>

        <!-- History -->
        <section class="section-shell">
          <div class="section-title">
            <div class="section-title__left">
              <div class="section-kicker">Negotiation</div>
              <div class="section-heading">History</div>
            </div>
            <div class="section-meta">{{ sortedHistory.length }} items</div>
          </div>
          <div class="section-body">
            <div class="timeline">
              <div v-for="s in sortedHistory" :key="s.id" class="timeline-row">
                <div class="timeline-side">
                  <div class="timeline-connector"></div>

                  <article class="card" :class="cardToneClass(s.actor)">
                    <div class="card-head">
                      <span class="who-pill">{{ suggestionLabel(s.actor) }}</span>

                      <span class="text-xs text-slate-400">
                        {{
                          new Date(s.createdAt).toLocaleString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        }}
                      </span>
                    </div>

                    <div class="p-3 space-y-2">
                      <div v-for="(f, idx) in s.fields" :key="idx" class="field-row">
                        <div>
                          <div class="field-name">{{ f.field_name }}</div>
                          <div class="field-value">{{ f.value }}</div>
                        </div>

                        <div v-if="canReview && s.actor !== viewerRole && s.user_id !== user.id" class="flex gap-2">
                          <button
                            class="icon-action icon-accept"
                            :class="f.status === 'accepted' ? 'is-selected-accept' : ''"
                            type="button"
                            title="Accept"
                            aria-label="Accept"
                            @click="reviewField(s.id, f.field, 'accepted')"
                          >
                            <Check class="h-4 w-4" />
                          </button>

                          <button
                            class="icon-action icon-deny"
                            :class="f.status === 'denied' ? 'is-selected-deny' : ''"
                            type="button"
                            title="Deny"
                            aria-label="Deny"
                            @click="reviewField(s.id, f.field, 'denied')"
                          >
                            <X class="h-4 w-4" />
                          </button>
                        </div>

                        <!-- Status badge for owner or after review -->
                        <div v-else>
                          <span class="status-pill" :class="f.status">
                            {{ f.status }}
                          </span>
                        </div>
                      </div>
                    </div>
                  </article>
                </div>
              </div>
            </div>
          </div>
        </section>
        <!-- Add Negotiation -->
        <section class="section-shell" v-if="canNegotiate">
          <div class="section-title">
            <div class="section-title__left">
              <div class="section-kicker"></div>
              <div class="section-heading">Add negotiation</div>
            </div>
            <div class="section-meta">Build a draft, then submit</div>
          </div>
          <div class="section-body">
            <div class="builder mt-3">
              <div class="grid gap-3 md:grid-cols-[1.2fr_1.8fr_auto] p-3">
                <div>
                  <!-- <label class="field-label" for="fieldSelect">Negotiation Field</label> -->
                  <select id="fieldSelect" class="control" v-model="selectedFieldKey">
                    <option value="" disabled>Select field…</option>
                    <option v-for="f in props.negotiation_field" :key="f.value" :value="f.value">
                      {{ f.label }}
                    </option>
                  </select>
                </div>

                <div>
                  <!-- <label class="field-label" for="valueInput">Your Value</label> -->

                  <!-- dynamic input type -->
                  <select v-if="selectedField?.type === 'select'" id="valueInput" class="control" v-model="selectedValue">
                    <option value="" disabled>Select option…</option>
                    <option v-for="opt in selectedField?.options || []" :key="opt" :value="opt">
                      {{ opt }}
                    </option>
                  </select>

                  <input v-else-if="selectedField?.type === 'date'" id="valueInput" class="control" type="date" v-model="selectedValue" />

                  <input
                    v-else
                    id="valueInput"
                    class="control"
                    :type="selectedField?.type === 'number' ? 'number' : 'text'"
                    :step="selectedField?.type === 'number' ? 'any' : undefined"
                    :placeholder="selectedField?.placeholder || 'Enter value…'"
                    v-model="selectedValue"
                  />
                </div>

                <div class="flex md:items-end">
                  <button class="btn btn-primary w-full md:w-auto" type="button" @click="addDraftField">+ Add</button>
                </div>
              </div>

              <div class="px-3 pb-3 space-y-2">
                <div v-if="draft.length === 0" class="text-xs text-slate-400 px-1">No fields added yet.</div>

                <div v-for="(d, idx) in draft" :key="d.key" class="draft-row">
                  <div class="min-w-0">
                    <div class="text-xs text-slate-400">{{ d.label }}</div>
                    <div class="font-black text-slate-100 truncate">{{ d.value }}</div>
                  </div>

                  <button class="btn btn-danger" type="button" @click="removeDraft(idx)">Remove</button>
                </div>
              </div>

              <div class="builder-foot">
                <button class="btn btn-ghost" type="button" @click="cancelDraft">Cancel</button>
                <button class="btn btn-primary" type="button" :disabled="draft.length === 0" @click="submitNegotiation">
                  Submit Negotiation
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<style scoped>
@reference "tailwindcss";

/* ===== Modal layout (scroll fix included) ===== */
.modal-backdrop {
  @apply fixed inset-0 bg-black flex justify-center items-center p-0 overflow-hidden;
}

.modal-panel {
  @apply w-full h-full xl:h-[92vh] xl:w-1/2  flex flex-col overflow-hidden
    bg-gray-900 rounded ring-1 ring-gray-700/50;
}

.modal-header {
  @apply sticky top-0 z-20 flex items-center justify-between gap-3
    px-4 py-3 bg-gray-900 border-b border-gray-700/40;
}

.modal-body {
  @apply flex-1 min-h-0 overflow-y-auto p-4 space-y-4;
}

.icon-btn {
  @apply h-8 w-8 rounded bg-gray-800/50 text-gray-200 grid place-items-center hover:bg-gray-800/70 transition ring-1 ring-gray-700/40;
}

/* ===== Sections: keep SAME background as panel (no jumps) ===== */
.section-shell {
  @apply rounded bg-gray-800/50 ring-1 ring-gray-700/40;
}

.section-title {
  @apply flex items-center justify-between gap-3
    px-4 py-3 border-b border-gray-700/30;
}

.section-kicker {
  @apply text-xs text-gray-400;
}

.section-heading {
  @apply text-base font-bold text-yellow-400;
}

.section-meta {
  @apply text-xs text-gray-400;
}

.section-body {
  @apply p-4;
}

/* ===== Context rows: subtle fill, not shiny ===== */
.kv-row {
  @apply flex items-center justify-between gap-4
    rounded px-4 py-3 bg-gray-800/60 ring-1 ring-gray-700/30;
}

.kv-label {
  @apply text-xs text-gray-400;
}

.kv-value {
  @apply text-sm font-semibold text-gray-200;
}

/* ===== History: vertical line + connector ===== */
.timeline {
  @apply relative space-y-4;
}

/* vertical line */
.timeline::before {
  content: '';
  @apply absolute top-0 bottom-0 w-px bg-gray-700/50 left-[0.5rem];
}

.timeline-row {
  @apply relative;
}

/* make space for the line */
.timeline-side {
  @apply relative pl-10; /* pushes cards right */
}

/* connector from line to card */
.timeline-connector {
  @apply absolute  top-5 w-8 h-px bg-gray-700/50;
  transform: translateX(-100%);
}

/* Cards: same background family, minimal border */
.card {
  @apply rounded overflow-hidden bg-gray-900
    ring-1 ring-gray-700/40 transition;
}

/* Tone variants (background + ring) */
.card-tone-you {
  @apply bg-violet-500/10 ring-violet-400/30 hover:ring-violet-400/40;
}
.card-tone-seller {
  @apply bg-amber-500/5 ring-amber-500/20 hover:ring-amber-500/30;
}
.card-tone-buyer {
  @apply bg-sky-500/5 ring-sky-500/20 hover:ring-sky-500/30;
}
.card-tone-other {
  @apply bg-gray-900 ring-gray-700/40 hover:ring-gray-600/50;
}
.card-head {
  @apply flex items-center justify-between gap-3
    px-4 py-3 border-b border-gray-700/30;
}

.who-pill {
  @apply text-xs font-semibold text-yellow-400;
}
.card-tone-you .who-pill {
  @apply text-violet-300;
}
.card-tone-seller .who-pill {
  @apply text-amber-300;
}
.card-tone-buyer .who-pill {
  @apply text-sky-300;
}
.card-tone-other .who-pill {
  @apply text-gray-200;
}

/* Field rows inside cards */
.field-row {
  @apply flex items-center justify-between gap-4 rounded px-3 py-2  bg-gray-800/60 ring-1 ring-gray-700/30;
}

.field-name {
  @apply text-xs text-gray-400;
}

.field-value {
  @apply text-sm font-semibold text-gray-200;
}

/* Status */
.status-pill {
  @apply text-xs px-2 py-0.5 rounded capitalize  bg-gray-800/60 text-gray-200 ring-1 ring-gray-700/30;
}
.status-pill.pending {
  @apply text-yellow-400;
}
.status-pill.accepted {
  @apply text-green-300;
}
.status-pill.denied {
  @apply text-red-300;
}

/* Review buttons: subtle, no bright borders */
.icon-action {
  @apply inline-flex items-center justify-center h-8 w-8 rounded-full
    bg-gray-800/60 text-gray-200
    ring-1 ring-gray-700/30
    transition
    hover:bg-gray-800/90 hover:ring-gray-600/40
    active:scale-95 active:bg-gray-900/80
    focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400/50;
}
.icon-accept {
  @apply text-green-300
    hover:bg-green-500/15 hover:ring-green-400/30
    active:bg-green-500/20;
}
.icon-deny {
  @apply text-red-300
    hover:bg-red-500/15 hover:ring-red-400/30
    active:bg-red-500/20;
}
.is-selected-accept {
  @apply bg-green-500/20 ring-green-400/40;
}
.is-selected-deny {
  @apply bg-red-500/20 ring-red-400/40;
}

/* ===== Builder: unified surfaces ===== */
.builder {
  @apply rounded-xl bg-gray-900 overflow-hidden ring-1 ring-gray-700/40;
}

.field-label {
  @apply block text-xs text-gray-400 mb-1;
}

.control {
  @apply w-full rounded px-3 py-2 text-sm text-gray-200 outline-none bg-gray-800/60 ring-1 ring-gray-700/30 focus:ring-2 focus:ring-yellow-400/60;
}

.builder-foot {
  @apply flex justify-end gap-2 px-4 py-3 border-t border-gray-700/30;
}

/* Draft rows (items in the draft list) */
.draft-row {
  @apply flex items-center justify-between gap-3
    rounded px-3 py-3
    bg-gray-800/60
    ring-1 ring-gray-700/30
    transition
    hover:bg-gray-800/80 hover:ring-gray-600/40;
}

/* Buttons: keep simple, not glossy */
.btn {
  @apply px-3 py-2 text-sm font-semibold rounded transition bg-gray-800/60 text-gray-200 hover:bg-gray-800/80 ring-1 ring-gray-700/30;
}
.btn-primary {
  @apply bg-yellow-500 text-gray-900 hover:bg-yellow-400 ring-0;
}
.btn-danger {
  @apply bg-red-600 text-gray-100 hover:bg-red-500 ring-0;
}
.btn-ghost {
  @apply bg-transparent hover:bg-gray-800/40 ring-1 ring-gray-700/30;
}
.btn:disabled {
  @apply opacity-50 cursor-not-allowed hover:bg-gray-800/60 hover:text-gray-200 active:scale-100;
}
</style>
