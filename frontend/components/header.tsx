'use client'

import { Headset, Mail, Menu, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface HeaderProps {
  online: boolean | null
  onNewChat: () => void
  onEmail: () => void
  onToggleSidebar: () => void
}

export function Header({
  online,
  onNewChat,
  onEmail,
  onToggleSidebar,
}: HeaderProps) {
  return (
    <header className="flex items-center justify-between gap-3 border-b border-border bg-card px-4 py-3 md:px-6">
      <div className="flex items-center gap-3">
        {/* Mobile sidebar toggle */}
        <button
          type="button"
          onClick={onToggleSidebar}
          aria-label="Open menu"
          className="flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none md:hidden"
        >
          <Menu className="size-5" />
        </button>

        <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
          <Headset className="size-5" />
        </div>
        <div className="leading-tight">
          <h1 className="text-sm font-semibold text-foreground">
            AI Customer Support
          </h1>
          <StatusPill online={online} />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onEmail}
          className="hidden items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none sm:flex"
        >
          <Mail className="size-4" />
          <span>Email Conversation</span>
        </button>
        <button
          type="button"
          onClick={onEmail}
          aria-label="Email conversation"
          className="flex size-9 items-center justify-center rounded-lg border border-border text-foreground transition-colors hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none sm:hidden"
        >
          <Mail className="size-4" />
        </button>
        <button
          type="button"
          onClick={onNewChat}
          className="flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          <Plus className="size-4" />
          <span className="hidden sm:inline">New Chat</span>
        </button>
      </div>
    </header>
  )
}

function StatusPill({ online }: { online: boolean | null }) {
  if (online === null) {
    return (
      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <span className="size-2 rounded-full bg-muted-foreground/50" />
        Checking status…
      </span>
    )
  }
  return (
    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <span
        className={cn(
          'size-2 rounded-full',
          online ? 'bg-[var(--online)] online-pulse' : 'bg-destructive',
        )}
      />
      {online ? 'Online' : 'Offline'}
    </span>
  )
}
