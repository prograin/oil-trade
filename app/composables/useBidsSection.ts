// ~/composables/useBids.ts
import { ref } from 'vue'

type Bid = {
  id: number
  user_id: number
  nickname: string
  value: number
  created_at: string
}

type BidsApiResponse = { results: Bid[] }

export function useBids() {
  // offerId -> bids[]
  const bidsByOffer = ref<Record<number, Bid[]>>({})
  // offerId -> loading flag
  const loadingByOffer = ref<Record<number, boolean>>({})

  const { showError } = useErrorModal()
  const { showSuccess } = useSuccessModal()

  const getBids = (offerId: number) => bidsByOffer.value[offerId] ?? []
  const isLoading = (offerId: number) => !!loadingByOffer.value[offerId]

  async function fetchBids(offerId: number) {
    if (!offerId) return
    loadingByOffer.value[offerId] = true
    try {
      const bidsData = await $fetch<BidsApiResponse>(`/api/offer/${offerId}/bids`, { method: 'GET' })
      bidsByOffer.value[offerId] = bidsData.results ?? []
    } catch (error: any) {
      showError({
        title: error?.data?.statusMessage || 'CRITICAL',
        message: error?.data?.message || 'Failed to load bids.',
      })
    } finally {
      loadingByOffer.value[offerId] = false
    }
  }

  async function ensureBids(offerId: number) {
    if (!offerId) return
    if (bidsByOffer.value[offerId]) return
    await fetchBids(offerId)
  }

  async function deleteBid(offerId: number, bidId: number) {
    if (!offerId || !bidId) return
    try {
      const res = await $fetch<{ message?: string }>(`/api/bid/${bidId}`, { method: 'DELETE' })
      showSuccess({
        title: 'Bid Deleted',
        message: res?.message || 'The bid was deleted successfully.',
      })
      await fetchBids(offerId)
    } catch (error: any) {
      showError({
        title: error?.data?.statusMessage || 'CRITICAL',
        message: error?.data?.message || 'Failed to delete bid.',
      })
    }
  }

  function hasUserBid(offerId: number, userId?: number) {
    if (!offerId || !userId) return false
    return getBids(offerId).some((b) => b.user_id === userId)
  }

  return {
    bidsByOffer,
    getBids,
    isLoading,
    fetchBids,
    ensureBids,
    deleteBid,
    hasUserBid,
  }
}
