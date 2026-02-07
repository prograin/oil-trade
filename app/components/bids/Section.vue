<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ChevronDownIcon, PencilIcon, Trash2Icon, EyeIcon } from 'lucide-vue-next'
import { useBids } from '@/composables/useBidsSection'

const props = defineProps<{
  offerId: number
  offerUserId: number
  user: Record<string, any>
  negotiationField: Array<{ value: string; label: string }>

  // These are only needed to build the modal offer payload
  quantity: string | number
  price: string | number
  product: string
}>()

const emit = defineEmits<{
  (e: 'submitted'): void
}>()

const { getBids, ensureBids, fetchBids, deleteBid, hasUserBid } = useBids()

const showBids = ref(false)

// negotiate modal state
const isNegotiateModalOpen = ref(false)
const viewNegotiateModal = ref(true)
const editingBidId = ref(null)
const activeBid = ref(null)

const bids = computed(() => getBids(props.offerId))
const isOwner = computed(() => !!props.user && props.offerUserId === props.user.id)

const bidsCount = computed(() => bids.value.length)

const canToggle = computed(() => {
  // keep same behavior: owner can’t open if no bids
  if (isOwner.value && bidsCount.value === 0) return false
  return true
})

const canShowChevron = computed(() => {
  return !isOwner.value || bidsCount.value > 0
})

const canPlaceBid = computed(() => {
  if (!props.user) return false
  if (isOwner.value) return false
  return !hasUserBid(props.offerId, props.user.id)
})

const viewerRoleForModal = computed(() => {
  // mirrors your existing logic:
  // - owner => seller
  // - view mode => viewer
  // - otherwise buyer
  if (!props.user) return 'viewer'
  if (isOwner.value) return 'seller'
  if (viewNegotiateModal.value) return 'viewer'
  return 'buyer'
})

function openNegotiateModal(bid: any = null, view = true) {
  activeBid.value = bid
  editingBidId.value = bid?.id || null
  viewNegotiateModal.value = view
  isNegotiateModalOpen.value = true
}

function closeNegotiateModal() {
  isNegotiateModalOpen.value = false
  activeBid.value = null
  editingBidId.value = null
}

async function onSubmitted() {
  await fetchBids(props.offerId)
  emit('submitted')
  //   closeNegotiateModal()
}

// load bids when offer changes
watch(
  () => props.offerId,
  async (id) => {
    if (!id) return
    await ensureBids(id)
  },
  { immediate: true },
)
</script>

<template>
  <div class="bids-section">
    <button type="button" class="bids-header" :disabled="!canToggle" @click="showBids = !showBids">
      <span class="bids-title">
        Bids
        <span class="bids-count">{{ bidsCount }}</span>
      </span>

      <ChevronDownIcon v-if="canShowChevron" class="w-5 h-5 transition-transform" :class="{ 'rotate-180': showBids }" />
    </button>

    <transition name="fade">
      <div v-if="showBids" class="bids-body">
        <div v-for="bid in bids" :key="bid.id" class="bid-row">
          <span class="bid-user">{{ bid.nickname }}</span>
          <span class="bid-price">{{ bid.value }} USD/BBL</span>
          <span class="bid-time">{{ bid.created_at }}</span>

          <!-- actions -->
          <div v-if="props.user && (bid.user_id === props.user.id || isOwner)" class="bid-actions">
            <button type="button" class="bid-btn-icon bid-btn--blue" @click.stop="openNegotiateModal(bid, false)">
              <PencilIcon class="w-4 h-4" />
            </button>

            <button v-if="!isOwner" type="button" class="bid-btn-icon bid-btn--red" @click.stop="deleteBid(props.offerId, bid.id)">
              <Trash2Icon class="w-4 h-4" />
            </button>
          </div>

          <div v-else>
            <button type="button" class="bid-btn-icon bid-btn--blue" @click.stop="openNegotiateModal(bid, true)">
              <EyeIcon class="w-4 h-4" />
            </button>
          </div>
        </div>

        <div v-if="canPlaceBid" class="bids-new-row">
          <button type="button" class="bids-new-btn" @click.stop="openNegotiateModal(null, false)">Bid</button>
        </div>

        <Teleport to="body">
          <transition name="fade">
            <BidsNegotiateModal
              v-if="isNegotiateModalOpen"
              :from="'explore'"
              :view="viewNegotiateModal"
              :viewerRole="viewerRoleForModal"
              :offer="{
                user_id: offerUserId,
                id: offerId,
                quantity,
                price,
                product,
              }"
              :negotiation_field="negotiationField"
              :bid_id="editingBidId"
              :user="user"
              @close="closeNegotiateModal"
              @submitted="onSubmitted"
            />
          </transition>
        </Teleport>
      </div>
    </transition>
  </div>
</template>

<style scoped>
@reference "tailwindcss";

/* BIDS (copied from your page so look stays identical) */
.bids-section {
  @apply mt-6 border-t border-gray-700 pt-4;
}
.bids-header {
  @apply w-full flex items-center justify-between
         bg-gray-800 px-4 py-2 rounded
         hover:bg-gray-700 transition
         cursor-pointer;
}
.bids-title {
  @apply flex items-center gap-2 text-gray-200 font-semibold;
}
.bids-count {
  @apply text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full;
}
.bids-body {
  @apply mt-3 space-y-2;
}
.bid-row {
  @apply flex items-center justify-between gap-3 bg-gray-800 px-3 py-2 rounded text-sm;
}
.bid-user {
  @apply font-semibold text-yellow-400;
}
.bid-price {
  @apply font-medium text-gray-100;
}
.bid-time {
  @apply text-xs text-right hidden lg:inline-block align-middle text-gray-400 flex-1;
}
.bid-actions {
  @apply flex items-center gap-2;
}
.bid-btn-icon {
  @apply rounded-full w-7 h-7 inline-flex items-center justify-center text-xs
         bg-gray-700 hover:bg-gray-600
         text-gray-200 transition;
}
.bid-btn--blue {
  @apply bg-blue-600 hover:bg-blue-500;
}
.bid-btn--red {
  @apply bg-red-600 hover:bg-red-500;
}
.bids-new-row {
  @apply flex items-center gap-2 mt-3;
}
.bids-new-btn {
  @apply w-full px-3 py-1 text-sm font-semibold
         bg-yellow-500 text-gray-900 rounded
         hover:bg-yellow-400 transition;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
