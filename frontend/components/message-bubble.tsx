'use client'

import { Bot, User } from 'lucide-react'
import type { ChatMessage } from '@/types/chat'
import { cn } from '@/lib/utils'

function formatTime(iso: string) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user'

  return (
    <div
      className={cn(
        'message-in flex w-full items-end gap-2.5',
        isUser ? 'justify-end' : 'justify-start',
      )}
    >
      {!isUser && (
        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Bot className="size-4" />
        </div>
      )}

      <div
        className={cn(
          'flex max-w-[78%] flex-col gap-1 sm:max-w-[70%]',
          isUser ? 'items-end' : 'items-start',
        )}
      >
        <div
          className={cn(
            'rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap shadow-sm',
            isUser
              ? 'rounded-br-md bg-primary text-primary-foreground'
              : 'rounded-bl-md border border-border bg-card text-card-foreground',
          )}
        >
          {message.content}
        </div>
        <span className="px-1 text-[11px] text-muted-foreground">
          {formatTime(message.timestamp)}
        </span>
      </div>

      {isUser && (
        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
          <User className="size-4" />
        </div>
      )}
    </div>
  )
}

/** Animated "AI is typing" indicator, styled like an assistant bubble. */
export function TypingIndicator() {
  return (
    <div className="message-in flex w-full items-end gap-2.5">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
        <Bot className="size-4" />
      </div>
      <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md border border-border bg-card px-4 py-3.5 shadow-sm">
        <span className="typing-dot size-2 rounded-full bg-muted-foreground" />
        <span className="typing-dot size-2 rounded-full bg-muted-foreground" />
        <span className="typing-dot size-2 rounded-full bg-muted-foreground" />
        <span className="sr-only">AI is typing…</span>
      </div>
    </div>
  )
}
