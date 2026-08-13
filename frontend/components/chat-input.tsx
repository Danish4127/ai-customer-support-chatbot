'use client'

import { type KeyboardEvent, useEffect, useRef, useState } from 'react'
import { Loader2, SendHorizonal } from 'lucide-react'

interface ChatInputProps {
  onSend: (message: string) => void
  disabled: boolean
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [value, setValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-grow the textarea up to a max height.
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`
  }, [value])

  function submit() {
    const trimmed = value.trim()
    if (!trimmed || disabled) return // ignore empty messages
    onSend(trimmed)
    setValue('') // clear input after successful submission
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    // Enter sends, Shift+Enter adds a newline.
    // Guard against IME composition (CJK) and Safari's 229 keyCode quirk.
    if (
      e.key === 'Enter' &&
      !e.shiftKey &&
      !e.nativeEvent.isComposing &&
      e.keyCode !== 229
    ) {
      e.preventDefault()
      submit()
    }
  }

  return (
    <div className="border-t border-border bg-card px-4 py-3 md:px-6">
      <div className="mx-auto flex max-w-3xl items-end gap-2">
        <div className="flex flex-1 items-end rounded-2xl border border-border bg-background px-3 py-2 transition-colors focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-ring/30">
          <label htmlFor="chat-input" className="sr-only">
            Type your message
          </label>
          <textarea
            id="chat-input"
            ref={textareaRef}
            rows={1}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message…"
            className="chat-scroll max-h-40 flex-1 resize-none bg-transparent text-sm leading-relaxed text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
        </div>
        <button
          type="button"
          onClick={submit}
          disabled={disabled || !value.trim()}
          aria-label="Send message"
          className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm transition-all hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40"
        >
          {disabled ? (
            <Loader2 className="size-5 animate-spin" />
          ) : (
            <SendHorizonal className="size-5" />
          )}
        </button>
      </div>
      <p className="mx-auto mt-2 max-w-3xl px-1 text-center text-[11px] text-muted-foreground">
        Press{' '}
        <kbd className="rounded border border-border bg-secondary px-1 font-mono">
          Enter
        </kbd>{' '}
        to send ·{' '}
        <kbd className="rounded border border-border bg-secondary px-1 font-mono">
          Shift + Enter
        </kbd>{' '}
        for a new line
      </p>
    </div>
  )
}
