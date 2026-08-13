'use client'

import { useEffect, useRef } from 'react'
import { AlertCircle, Loader2 } from 'lucide-react'
import type { ChatMessage } from '@/types/chat'
import { EmptyState } from '@/components/empty-state'
import { MessageBubble, TypingIndicator } from '@/components/message-bubble'

interface ChatWindowProps {
  messages: ChatMessage[]
  isTyping: boolean
  isLoadingHistory: boolean
  error: string | null
  onPickSuggestion: (text: string) => void
}

export function ChatWindow({
  messages,
  isTyping,
  isLoadingHistory,
  error,
  onPickSuggestion,
}: ChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to the newest message / typing indicator.
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  // Only "real" messages are shown; system prompts are hidden from the user.
  const visibleMessages = messages.filter((m) => m.role !== 'system')

  if (isLoadingHistory) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 text-muted-foreground">
        <Loader2 className="size-6 animate-spin" />
        <p className="text-sm">Loading your conversation…</p>
      </div>
    )
  }

  const showEmptyState = visibleMessages.length === 0 && !isTyping

  return (
    <div className="chat-scroll flex-1 overflow-y-auto">
      {showEmptyState ? (
        <EmptyState onPick={onPickSuggestion} />
      ) : (
        <div className="mx-auto flex max-w-3xl flex-col gap-4 px-4 py-6 md:px-6">
          {visibleMessages.map((m) => (
            <MessageBubble key={m.id} message={m} />
          ))}
          {isTyping && <TypingIndicator />}

          {error && (
            <div className="flex items-center gap-2 self-center rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              <AlertCircle className="size-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      )}
    </div>
  )
}
