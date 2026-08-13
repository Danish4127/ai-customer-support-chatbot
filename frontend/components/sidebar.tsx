'use client'

import { Headset, MessageSquare, Plus, ShieldCheck, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SidebarProps {
  sessionId: string | null
  messageCount: number
  onNewChat: () => void
  open: boolean
  onClose: () => void
}

export function Sidebar({
  sessionId,
  messageCount,
  onNewChat,
  open,
  onClose,
}: SidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-foreground/30 backdrop-blur-sm md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-border bg-sidebar p-4 transition-transform duration-300 md:static md:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Headset className="size-5" />
            </div>
            <div className="leading-tight">
              <p className="text-sm font-semibold text-sidebar-foreground">
                AI Support
              </p>
              <p className="text-xs text-muted-foreground">Support workspace</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary md:hidden"
          >
            <X className="size-5" />
          </button>
        </div>

        <button
          type="button"
          onClick={onNewChat}
          className="mb-6 flex w-full items-center gap-2 rounded-lg bg-primary px-3 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          <Plus className="size-4" />
          New Chat
        </button>

        <div className="mb-2 px-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Current Conversation
        </div>
        <div className="rounded-xl border border-border bg-card p-3">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
              <MessageSquare className="size-4" />
            </div>
            <div className="min-w-0 leading-tight">
              <p className="truncate text-sm font-medium text-card-foreground">
                {sessionId ? 'Active session' : 'No session yet'}
              </p>
              <p className="truncate font-mono text-xs text-muted-foreground">
                {sessionId
                  ? `${sessionId.slice(0, 8)}… · ${messageCount} msg`
                  : 'Start typing to begin'}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-auto flex items-center gap-2 rounded-xl bg-secondary px-3 py-2.5 text-xs text-muted-foreground">
          <ShieldCheck className="size-4 shrink-0 text-[var(--online)]" />
          <span>Your conversation is private and secure.</span>
        </div>
      </aside>
    </>
  )
}
