// Shared types that mirror the NestJS backend contract.

export type Role = 'system' | 'user' | 'assistant'

/** A message as returned by GET /chat/{sessionId}/history */
export interface ApiMessage {
  role: Role
  content: string
}

/** A message as rendered in the UI (adds local metadata). */
export interface ChatMessage {
  id: string
  role: Role
  content: string
  timestamp: string // ISO string
}

/** Response body of POST /chat */
export interface ChatResponse {
  sessionId: string
  reply: string
  timestamp: string
}

/** Response body of GET /chat/{sessionId}/history */
export interface HistoryResponse {
  sessionId: string
  messages: ApiMessage[]
}
