export type Role = 'buyer' | 'seller' | 'viewer'
export type From = 'dashboard' | 'explore'
export type FieldStatus = 'pending' | 'accepted' | 'denied'
export type SuggestionOverall = 'pending' | 'accepted' | 'denied'

export type CatalogField = {
  key: string
  label: string
  type: 'text' | 'number' | 'select' | 'date'
  options?: string[]
  placeholder?: string
}

export type SuggestionField = {
  field: string
  field_name: string
  value: string
  status: FieldStatus
}

export type Suggestion = {
  id: string
  actor: Role
  createdAt: string
  nickname: string
  user_id: number
  bid_id: number
  fields: SuggestionField[]
  overall: SuggestionOverall
}

export type SuggestionItemApi = {
  field: string
  value: string
  status?: FieldStatus
  field_name?: string
}

export type SuggestionRowApi = {
  id: number
  user_id: number
  nickname: string
  bid_id: number
  suggestion: unknown
  created_at?: string
}

export type SuggestionsResponse = { success: true; results: SuggestionRowApi[] } | { success: false; message: string }

export type DraftField = {
  key: string
  label: string
  value: string
  raw: string
}
