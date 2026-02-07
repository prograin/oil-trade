import { ref, computed } from 'vue'
import type { CatalogField, DraftField, SuggestionField } from '@/types/bid'
import { formatValue } from '@/utils/fields'

export function useDraft(fieldsCatalog: CatalogField[]) {
  const selectedFieldKey = ref('')
  const selectedValue = ref('')
  const draft = ref<DraftField[]>([])
  const draftComment = ref('')

  const selectedField = computed(() => fieldsCatalog.find((f) => f.key === selectedFieldKey.value))

  const addDraftField = () => {
    const f = selectedField.value
    if (!f) return
    const raw = String(selectedValue.value || '').trim()
    if (!raw) return
    if (draft.value.some((x) => x.key === f.key)) return
    draft.value.push({
      key: f.key,
      label: f.label,
      raw,
      value: formatValue(f, raw),
    })
    selectedValue.value = ''
  }

  const removeDraft = (idx: number) => draft.value.splice(idx, 1)
  const cancelDraft = () => {
    draft.value = []
    draftComment.value = ''
    selectedFieldKey.value = ''
    selectedValue.value = ''
  }

  const buildPayload = (): SuggestionField[] =>
    draft.value.map((d) => ({ field: d.key, field_name: d.label, value: d.value, status: 'pending' }))

  return { draft, selectedFieldKey, selectedValue, draftComment, selectedField, addDraftField, removeDraft, cancelDraft, buildPayload }
}
