'use client'

import { useState, useEffect, useRef } from 'react'
import { MessageCircle, Send, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

type ChatMessage = {
  role: 'user' | 'assistant'
  content: string
}

export function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content:
        "Hi! I'm your OptioHire HR assistant. Ask me anything about job postings, email routing, AI screening, or interviews.",
    },
  ])
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }

  useEffect(() => {
    if (isOpen) scrollToBottom()
  }, [isOpen, messages.length])

  const handleSend = async () => {
    const question = input.trim()
    if (!question || isSending) return

    setInput('')
    setMessages((prev) => [...prev, { role: 'user', content: question }])
    setIsSending(true)

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'

      const resp = await fetch(`${backendUrl}/api/hr/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ question }),
      })

      const data = await resp.json().catch(() => ({}))
      if (!resp.ok || !data?.reply) {
        const errMsg =
          data?.error ||
          'I could not reach the AI assistant right now. Please try again in a moment.'
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: errMsg,
          },
        ])
      } else {
        setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }])
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            'Something went wrong while contacting the assistant. Please check your network and try again.',
        },
      ])
    } finally {
      setIsSending(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-[120] flex flex-col items-end gap-2">
      {isOpen && (
        <div className="w-80 sm:w-96 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-[#2D2DDD] to-[#1515a8]">
            <div>
              <p className="text-sm font-semibold text-white">OptioHire Assistant</p>
              <p className="text-[11px] text-white/80">
                HR help • AI powered by Groq
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white"
              aria-label="Close assistant"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 max-h-72 overflow-y-auto px-3 py-3 space-y-2 text-sm">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-3 py-2 whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-[#2D2DDD] text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-50'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <div className="border-t border-gray-200 dark:border-gray-800 px-3 py-2 bg-gray-50 dark:bg-gray-900/60">
            <div className="flex items-end gap-2">
              <textarea
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 resize-none rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-2 py-1.5 text-xs text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2D2DDD]"
                placeholder="Ask anything about your jobs, candidates, or email setup..."
              />
              <Button
                type="button"
                size="icon"
                disabled={isSending || !input.trim()}
                onClick={handleSend}
                className="h-8 w-8 rounded-full bg-[#2D2DDD] hover:bg-[#2424c0] text-white shadow-none hover:shadow-none disabled:opacity-50"
              >
                {isSending ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
            <p className="mt-1 text-[10px] text-gray-500 dark:text-gray-400">
              Assistant does not see live candidate data; answers are guidance only.
            </p>
          </div>
        </div>
      )}
      <Button
        type="button"
        size="icon"
        onClick={() => setIsOpen((open) => !open)}
        className="h-11 w-11 rounded-full bg-[#2D2DDD] hover:bg-[#2424c0] text-white shadow-lg hover:shadow-xl"
        aria-label="Open HR assistant chat"
      >
        <MessageCircle className="w-5 h-5" />
      </Button>
    </div>
  )
}

