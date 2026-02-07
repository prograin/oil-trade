import type { CatalogField, FieldStatus, SuggestionField, SuggestionOverall } from '@/types/bid'

export const computeOverall = (fields: SuggestionField[]): SuggestionOverall => {
  if (fields.some((f) => f.status === 'denied')) return 'denied'
  if (fields.length > 0 && fields.every((f) => f.status === 'accepted')) return 'accepted'
  return 'pending'
}

export const fieldStatusClass = (st: FieldStatus) => {
  if (st === 'accepted') return 'accepted'
  if (st === 'denied') return 'denied'
  return 'pending'
}

export const overallClass = (ov: SuggestionOverall) => {
  if (ov === 'accepted') return 'accepted'
  if (ov === 'denied') return 'denied'
  return 'pending'
}

export const safeParseJson = (v: unknown): unknown => {
  if (typeof v !== 'string') return v
  try {
    return JSON.parse(v)
  } catch {
    return v
  }
}

export const labelByKey = (key: string, catalog: CatalogField[]) => catalog.find((f) => f.key === key)?.label ?? key

export const formatValue = (f: CatalogField, raw: string) => raw
