'use client'

import { type FormEvent, useEffect, useRef, useState } from 'react'
import { CheckCircle2, Loader2, Mail, X } from 'lucide-react'
import { ApiError, emailSummary } from '@/lib/api'

interface EmailModalProps {
  open: boolean
  sessionId: string | null
  onClose: () => void
}

type Status = 'idle' | 'sending' | 'success' | 'error'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function EmailModal({ open, sessionId, onClose }: EmailModalProps) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  // Reset and focus whenever the modal opens.
  useEffect(() => {
    if (open) {
      setEmail('')
      setStatus('idle')
      setError('')
      // Focus the input on the next tick.
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  // Close on Escape.
  useEffect(() => {
    if (!open) return
    function onKey(e: globalThis.KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')

    if (!EMAIL_RE.test(email.trim())) {
      setError('Please enter a valid email address.')
      return
    }
    if (!sessionId) {
      setError('Start a conversation before emailing a summary.')
      return
    }

    setStatus('sending')
    try {
      await emailSummary(email.trim(), sessionId)
      setStatus('success')
    } catch (err) {
      setStatus('error')
      setError(
        err instanceof ApiError
          ? err.message
          : 'Could not send the summary. Please try again.',
      )
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="email-modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute right-4 top-4 flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          <X className="size-5" />
        </button>

        {status === 'success' ? (
          <div className="flex flex-col items-center py-4 text-center">
            <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-accent text-[var(--online)]">
              <CheckCircle2 className="size-7" />
            </div>
            <h2
              id="email-modal-title"
              className="text-lg font-semibold text-card-foreground"
            >
              Summary sent
            </h2>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Conversation summary sent successfully.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-6 w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <div className="mb-4 flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                <Mail className="size-5" />
              </div>
              <div className="leading-tight">
                <h2
                  id="email-modal-title"
                  className="text-lg font-semibold text-card-foreground"
                >
                  Email Conversation
                </h2>
                <p className="text-sm text-muted-foreground">
                  We&apos;ll send a summary to your inbox.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} noValidate>
              <label
                htmlFor="email-address"
                className="mb-1.5 block text-sm font-medium text-card-foreground"
              >
                Email address
              </label>
              <input
                id="email-address"
                ref={inputRef}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                aria-invalid={!!error}
                aria-describedby={error ? 'email-error' : undefined}
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:ring-2 focus:ring-ring/30 focus:outline-none"
              />
              {error && (
                <p id="email-error" className="mt-2 text-sm text-destructive">
                  {error}
                </p>
              )}

              <div className="mt-5 flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={status === 'sending'}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {status === 'sending' && (
                    <Loader2 className="size-4 animate-spin" />
                  )}
                  {status === 'sending' ? 'Sending…' : 'Send Summary'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
