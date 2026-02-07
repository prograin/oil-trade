import { ref, watchEffect, computed } from 'vue'
import type { Suggestion, SuggestionField, SuggestionsResponse, SuggestionRowApi, Role, FieldStatus, CatalogField } from '@/types/bid'
import { safeParseJson, labelByKey, computeOverall } from '@/utils/fields'

export function useSuggestions(bid_id: number | null, viewer_user_id: number, owner_id: number, fieldsCatalog: CatalogField[]) {
  const { showError } = useErrorModal()

  const bidId = ref<number | null>(bid_id || null)
  const history = ref<Suggestion[]>([])

  const url = computed(() => (bidId.value ? `/api/bid/${bidId.value}/suggestions` : '/api/bid/0/suggestions'))

  const { data, pending, error, refresh } = useFetch<SuggestionsResponse>(url, {
    method: 'GET',
    immediate: !!bidId.value, // don't run when null
    watch: [bidId], // refetch when bidId changes
  })

  const normalizeSuggestionToFields = (suggestion: unknown): SuggestionField[] => {
    const parsed = safeParseJson(suggestion)
    if (Array.isArray(parsed)) {
      return (parsed as SuggestionField[]).map((x) => ({
        field: String(x.field),
        field_name: String(x.field_name ?? labelByKey(x.field, fieldsCatalog)),
        value: String(x.value),
        status: (x.status ?? 'pending') as FieldStatus,
      }))
    }
    if (parsed && typeof parsed === 'object') {
      return Object.entries(parsed).map(([field, v]) => {
        const value = v && typeof v === 'object' ? String(v.value ?? '') : String(v ?? '')
        const status = (v && typeof v === 'object' ? v.status : 'pending') as FieldStatus
        const field_name =
          v && typeof v === 'object' ? String(v.field_name ?? labelByKey(field, fieldsCatalog)) : labelByKey(field, fieldsCatalog)
        return { field, field_name, value, status }
      })
    }
    return []
  }

  const toActor = (rowUserId: number): Role => (rowUserId === owner_id ? 'seller' : 'buyer')

  watchEffect(() => {
    if (!data.value?.success) return
    history.value = (data.value.results ?? []).map((row: SuggestionRowApi) => ({
      id: String(row.id),
      actor: toActor(row.user_id),
      createdAt: row.created_at ?? new Date().toISOString(),
      nickname: row.nickname,
      user_id: row.user_id,
      bid_id: row.bid_id,
      fields: normalizeSuggestionToFields(row.suggestion),
      overall: computeOverall(normalizeSuggestionToFields(row.suggestion)),
    }))
  })

  const sortedHistory = computed(() =>
    [...history.value].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).reverse(),
  )

  const reviewField = async (suggestionId: string, fieldKey: string, status: FieldStatus) => {
    const s = history.value.find((x) => x.id === suggestionId)
    if (!s) return

    const f = s.fields.find((x) => x.field === fieldKey)
    if (!f) return

    // prevent owner from reviewing own suggestion
    if (s.user_id === viewer_user_id) return

    f.status = status
    s.overall = computeOverall(s.fields)

    try {
      await $fetch(`/api/suggestions/${suggestionId}`, { method: 'PATCH', body: { suggestion: s.fields } })
      await refresh()
    } catch (error: any) {
      showError({
        title: error?.data?.statusMessage || 'CRITICAL',
        message: error?.data?.message || 'An unexpected error occurred.',
      })
      await refresh()
    }
  }

  return { bidId, history, sortedHistory, pending, error, refresh, reviewField }
}
