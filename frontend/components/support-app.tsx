'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  ApiError,
  checkHealth,
  getHistory,
  sendMessage,
} from '@/lib/api'
import type { ChatMessage } from '@/types/chat'
import { ChatInput } from '@/components/chat-input'
import { ChatWindow } from '@/components/chat-window'
import { EmailModal } from '@/components/email-modal'
import { Header } from '@/components/header'
import { Sidebar } from '@/components/sidebar'

const SESSION_KEY = 'support_session_id'

// Simple unique id for local message keys.
function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export function SupportApp() {
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [online, setOnline] = useState<boolean | null>(null)

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [emailOpen, setEmailOpen] = useState(false)

  // Prevent double-initialization in React strict mode.
  const initialized = useRef(false)

  // On mount: check backend health + restore a saved session.
  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    checkHealth().then(setOnline)

    const saved =
      typeof window !== 'undefined'
        ? window.localStorage.getItem(SESSION_KEY)
        : null

    if (saved) {
      setSessionId(saved)
      loadHistory(saved)
    }
  }, [])

  // Load a previous conversation from the backend.
  const loadHistory = useCallback(async (id: string) => {
    setIsLoadingHistory(true)
    setError(null)
    try {
      const data = await getHistory(id)
      const restored: ChatMessage[] = data.messages.map((m) => ({
        id: makeId(),
        role: m.role,
        content: m.content,
        timestamp: new Date().toISOString(),
      }))
      setMessages(restored)
    } catch (err) {
      // A missing/expired session shouldn't block a fresh start.
      setError(
        err instanceof ApiError
          ? err.message
          : 'Could not load your previous conversation.',
      )
    } finally {
      setIsLoadingHistory(false)
    }
  }, [])

  // Send a message to the backend and append the reply.
  const handleSend = useCallback(
    async (text: string) => {
      setError(null)

      const userMessage: ChatMessage = {
        id: makeId(),
        role: 'user',
        content: text,
        timestamp: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, userMessage])
      setIsTyping(true)

      try {
        const res = await sendMessage(text, sessionId ?? undefined)

        // Persist the session id returned by the backend.
        if (res.sessionId && res.sessionId !== sessionId) {
          setSessionId(res.sessionId)
          window.localStorage.setItem(SESSION_KEY, res.sessionId)
        }

        const aiMessage: ChatMessage = {
          id: makeId(),
          role: 'assistant',
          content: res.reply,
          timestamp: res.timestamp ?? new Date().toISOString(),
        }
        setMessages((prev) => [...prev, aiMessage])
        setOnline(true)
      } catch (err) {
        setError(
          err instanceof ApiError
            ? err.message
            : "Sorry, I'm having trouble connecting right now. Please try again.",
        )
        if (err instanceof ApiError && !err.status) setOnline(false)
      } finally {
        setIsTyping(false)
      }
    },
    [sessionId],
  )

  // Start a brand-new conversation.
  const handleNewChat = useCallback(() => {
    setSessionId(null)
    setMessages([])
    setError(null)
    setIsTyping(false)
    window.localStorage.removeItem(SESSION_KEY)
    setSidebarOpen(false)
  }, [])

  return (
    <div className="flex h-dvh w-full overflow-hidden bg-background">
      <Sidebar
        sessionId={sessionId}
        messageCount={messages.filter((m) => m.role !== 'system').length}
        onNewChat={handleNewChat}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          online={online}
          onNewChat={handleNewChat}
          onEmail={() => setEmailOpen(true)}
          onToggleSidebar={() => setSidebarOpen(true)}
        />

        <ChatWindow
          messages={messages}
          isTyping={isTyping}
          isLoadingHistory={isLoadingHistory}
          error={error}
          onPickSuggestion={handleSend}
        />

        <ChatInput onSend={handleSend} disabled={isTyping} />
      </div>

      <EmailModal
        open={emailOpen}
        sessionId={sessionId}
        onClose={() => setEmailOpen(false)}
      />
    </div>
  )
}
