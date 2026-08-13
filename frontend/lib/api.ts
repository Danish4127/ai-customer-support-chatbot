// Central API service layer. All backend communication lives here so UI
// components never build URLs or handle raw fetch logic themselves.

import type { ChatResponse, HistoryResponse } from '@/types/chat'

// Base URL comes from the environment. Falls back to localhost for dev.
const API_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || 'http://localhost:3000'

/** A friendly, user-safe error. UI shows `.message` directly. */
export class ApiError extends Error {
  status?: number
  constructor(message: string, status?: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

const FRIENDLY_NETWORK_ERROR =
  "Sorry, I'm having trouble connecting right now. Please try again."

/**
 * Small fetch wrapper that normalizes errors into ApiError with friendly
 * messages, so the backend never leaks internal details to the user.
 */
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...init?.headers,
      },
    })
  } catch {
    // Network failure / backend unreachable / CORS blocked.
    throw new ApiError(FRIENDLY_NETWORK_ERROR)
  }

  if (!res.ok) {
    if (res.status >= 500) {
      throw new ApiError(
        'Our support service ran into a problem. Please try again shortly.',
        res.status,
      )
    }
    if (res.status === 400) {
      throw new ApiError(
        'That request could not be processed. Please check and try again.',
        res.status,
      )
    }
    throw new ApiError('Something went wrong. Please try again.', res.status)
  }

  // Some endpoints (email) may return an empty body.
  const text = await res.text()
  return (text ? JSON.parse(text) : {}) as T
}

/** POST /chat — send a message, optionally continuing a session. */
export function sendMessage(message: string, sessionId?: string) {
  return request<ChatResponse>('/chat', {
    method: 'POST',
    body: JSON.stringify({ message, sessionId }),
  })
}

/** GET /chat/{sessionId}/history — load a previous conversation. */
export function getHistory(sessionId: string) {
  return request<HistoryResponse>(
    `/chat/${encodeURIComponent(sessionId)}/history`,
  )
}

/** POST /email/summary — email the conversation summary. */
export function emailSummary(to: string, sessionId: string) {
  return request<{ success?: boolean }>('/email/summary', {
    method: 'POST',
    body: JSON.stringify({ to, sessionId }),
  })
}

/** GET /health — check whether the backend is up. */
export async function checkHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_URL}/health`)
    return res.ok
  } catch {
    return false
  }
}
