'use client'

import { Package, RefreshCw, RotateCcw, Sparkles } from 'lucide-react'

const SUGGESTIONS = [
  { icon: Package, text: 'Where is my order?' },
  { icon: RefreshCw, text: 'How can I request a refund?' },
  { icon: RotateCcw, text: 'I was charged twice.' },
  { icon: Package, text: 'How do I return an item?' },
]

export function EmptyState({
  onPick,
}: {
  onPick: (text: string) => void
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-10 text-center">
      <div className="mb-5 flex size-14 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
        <Sparkles className="size-7" />
      </div>
      <h2 className="text-balance text-2xl font-semibold text-foreground">
        How can we help you today?
      </h2>
      <p className="mt-2 max-w-md text-pretty text-sm leading-relaxed text-muted-foreground">
        Fast, helpful support powered by AI. Ask a question below or pick a
        common topic to get started.
      </p>

      <div className="mt-8 grid w-full max-w-md grid-cols-1 gap-2.5 sm:grid-cols-2">
        {SUGGESTIONS.map(({ icon: Icon, text }) => (
          <button
            key={text}
            type="button"
            onClick={() => onPick(text)}
            className="group flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 text-left text-sm font-medium text-card-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-secondary text-muted-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
              <Icon className="size-4" />
            </span>
            <span className="text-pretty">{text}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
