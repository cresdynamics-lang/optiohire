'use client'

import { useState, useEffect, useRef } from 'react'
import { Send, X, Maximize2, Minimize2, HelpCircle, Settings, Sparkles, Headphones } from 'lucide-react'
import { Button } from '@/components/ui/button'

type ChatMessage = {
  role: 'user' | 'assistant'
  content: string
  colorIndex?: number
}

// Colors for AI message bubbles - cycles through on each response
const AI_COLORS = [
  { bubble: 'bg-[#f0f0ff] border-[#d0d0ff]', header: 'text-[#2D2DDD]', label: 'AI' },
  { bubble: 'bg-[#f0fff4] border-[#a3e6b8]', header: 'text-[#16a34a]', label: 'AI' },
  { bubble: 'bg-[#fdf4ff] border-[#e9b8f0]', header: 'text-[#9333ea]', label: 'AI' },
  { bubble: 'bg-[#fff0f0] border-[#fdb8b8]', header: 'text-[#dc2626]', label: 'AI' },
]

// Simple markdown renderer - bold, bullet lists, headings, paragraphs
function renderMarkdown(text: string) {
  const lines = text.split('\n')
  const elements: JSX.Element[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    // Skip empty lines
    if (line.trim() === '') {
      i++
      continue
    }

    // Heading ##
    if (line.startsWith('## ')) {
      elements.push(
        <p key={i} className="font-bold text-[13px] mt-2 mb-0.5 text-gray-900 dark:text-gray-100">
          {renderInline(line.replace('## ', ''))}
        </p>
      )
      i++
      continue
    }

    // Heading #
    if (line.startsWith('# ')) {
      elements.push(
        <p key={i} className="font-bold text-[14px] mt-2 mb-0.5 text-gray-900 dark:text-gray-100">
          {renderInline(line.replace('# ', ''))}
        </p>
      )
      i++
      continue
    }

    // Bullet list
    if (line.startsWith('- ') || line.startsWith('* ') || /^\d+\.\s/.test(line)) {
      const items: string[] = []
      while (i < lines.length && (lines[i].startsWith('- ') || lines[i].startsWith('* ') || /^\d+\.\s/.test(lines[i]))) {
        items.push(lines[i].replace(/^[-*]\s|^\d+\.\s/, ''))
        i++
      }
      elements.push(
        <ul key={`list-${i}`} className="list-disc pl-4 my-1 space-y-0.5">
          {items.map((item, idx) => (
            <li key={idx} className="text-[13px] text-gray-800 dark:text-gray-200">{renderInline(item)}</li>
          ))}
        </ul>
      )
      continue
    }

    // Normal paragraph
    elements.push(
      <p key={i} className="text-[13px] leading-relaxed text-gray-800 dark:text-gray-200">
        {renderInline(line)}
      </p>
    )
    i++
  }

  return <div className="space-y-1">{elements}</div>
}

function renderInline(text: string): (string | JSX.Element)[] {
  // Handle **bold**
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={idx} className="font-semibold">{part.slice(2, -2)}</strong>
    }
    return part
  })
}

// Typing dots animation component
function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-4 py-3 h-full">
      <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
      <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
      <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" />
    </div>
  )
}

const getDynamicSuggestions = () => {
  if (typeof window === 'undefined') return ['Screen candidates', 'Fix an issue', 'Create shortlist', 'Explain scores']
  const path = window.location.pathname
  
  if (path.includes('/candidates')) {
    return ['Filter by experience', 'Schedule interview', 'Show top candidates', 'Reject all unqualified']
  }
  if (path.includes('/jobs')) {
    return ['Create new job posting', 'Close this job', 'Analyze applicants', 'Update job description']
  }
  if (path.includes('/settings')) {
    return ['Update company profile', 'Manage users', 'Change password', 'Integration settings']
  }
  
  return ['Screen candidates', 'Create new job', 'Fix an issue', 'Explain candidate scores']
}


export function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [activeTab, setActiveTab] = useState<'chat' | 'support'>('chat')

  const [input, setInput] = useState('')
  const [recentError, setRecentError] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: "Hi! I'm your OptioHire AI Agent. I can help you navigate the platform, screen candidates, and troubleshoot issues. How can I assist you today?",
      colorIndex: 0,
    },
  ])

  const [supportMessage, setSupportMessage] = useState('')
  const [supportStatus, setSupportStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')

  const [isSending, setIsSending] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement | null>(null)
  const colorCounterRef = useRef(1) // Track which color to use next

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }

  useEffect(() => {
    if (isOpen && activeTab === 'chat') scrollToBottom()
  }, [isOpen, messages, activeTab, isTyping])

  // Capture global errors so the agent knows what went wrong
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      setRecentError(`UI Error: ${event.message}`)
    }
    const handleRejection = (event: PromiseRejectionEvent) => {
      setRecentError(`Network Error: ${event.reason}`)
    }

    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleRejection)

    return () => {
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleRejection)
    }
  }, [])

  // Listen for the "open-hr-assistant" event dispatched by the overview card
  useEffect(() => {
    const handleOpenChatbot = () => {
      setIsOpen(true)
      setActiveTab('chat')
    }
    document.addEventListener('open-hr-assistant', handleOpenChatbot)
    return () => {
      document.removeEventListener('open-hr-assistant', handleOpenChatbot)
    }
  }, [])


  // Context gathering
  const getPageContext = () => {
    if (typeof window === 'undefined') return {}
    return {
      url: window.location.pathname,
      title: document.title,
      recentError: recentError
    }
  }

  const handleSendChat = async () => {
    const question = input.trim()
    if (!question || isSending) return

    setInput('')
    setMessages((prev) => [...prev, { role: 'user', content: question }])
    setIsSending(true)
    setIsTyping(true)

    const thisColorIndex = colorCounterRef.current % AI_COLORS.length
    colorCounterRef.current++

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'

      const conversationHistory = messages.slice(-10).map((msg) => ({
        role: msg.role,
        content: msg.content,
      }))

      const context = getPageContext()

      const resp = await fetch(`${backendUrl}/api/hr/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          question,
          conversationHistory,
          context
        }),
      })

      if (!resp.ok) {
        throw new Error('Failed to reach AI')
      }

      const reader = resp.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) {
        throw new Error('No stream available')
      }

      setIsTyping(false)
      setMessages((prev) => [...prev, { role: 'assistant', content: '', colorIndex: thisColorIndex }])

      let done = false
      let fullReply = ''

      while (!done) {
        const { value, done: readerDone } = await reader.read()
        done = readerDone
        if (value) {
          const chunk = decoder.decode(value, { stream: true })

          const lines = chunk.split('\n').filter(line => line.trim() !== '')
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.replace('data: ', '')
              if (data === '[DONE]') continue
              try {
                const parsed = JSON.parse(data)
                const contentChunk = parsed.choices?.[0]?.delta?.content || ''
                if (contentChunk) {
                  fullReply += contentChunk
                  setMessages((prev) => {
                    const updated = [...prev]
                    updated[updated.length - 1] = {
                      ...updated[updated.length - 1],
                      content: fullReply
                    }
                    return updated
                  })
                }
              } catch (e) {
                // Ignore incomplete JSON chunks
              }
            }
          }
        }
      }

    } catch (err: any) {
      setIsTyping(false)
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Something went wrong while contacting the agent. Please check your network and try again.',
          colorIndex: thisColorIndex,
        },
      ])
    } finally {
      setIsSending(false)
      setIsTyping(false)
    }
  }

  const executeTool = async (tool: string, args: any) => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'

      let endpoint = ''
      let method = 'POST'
      let body: any = {}

      if (tool === 'rejectCandidate') {
        endpoint = `/api/hr/candidates/${args.applicationId}/status`
        method = 'PATCH'
        body = { status: 'REJECTED', reason: args.reason }
      } else if (tool === 'shortlistCandidate') {
        endpoint = `/api/hr/candidates/${args.applicationId}/status`
        method = 'PATCH'
        body = { status: 'HIRED', reason: args.reason }
      } else if (tool === 'createJob') {
        endpoint = '/api/jobs'
        method = 'POST'
        body = args
      } else {
        throw new Error(`Unsupported tool: ${tool}`)
      }

      const res = await fetch(`${backendUrl}${endpoint}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(body)
      })

      if (!res.ok) throw new Error(`API returned ${res.status}`)

      setMessages(prev => [...prev, { role: 'assistant', content: `✅ Action **${tool}** executed successfully!`, colorIndex: 1 }])
    } catch (err: any) {
      setMessages(prev => [...prev, { role: 'assistant', content: `❌ Failed to execute action: ${err.message}`, colorIndex: 3 }])
    }
  }

  const renderMessageContent = (content: string, colorIndex: number = 0) => {
    const toolMatch = content.match(/```json\s*(\{[\s\S]*?"tool"[\s\S]*?\})\s*```/)
    if (toolMatch) {
      try {
        const toolData = JSON.parse(toolMatch[1])
        const cleanContent = content.replace(toolMatch[0], '').trim()
        return (
          <div className="flex flex-col gap-3 w-full">
            {cleanContent && <div className="whitespace-pre-wrap">{renderMarkdown(cleanContent)}</div>}
            <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-xl p-3 text-sm mt-2">
              <div className="font-semibold text-purple-700 dark:text-purple-300 flex items-center gap-2 mb-2">
                <Settings className="w-4 h-4" /> Action Required: {toolData.tool}
              </div>
              <pre className="text-xs bg-white/70 dark:bg-black/20 p-2 rounded-lg overflow-x-auto text-gray-600 dark:text-gray-300">
                {JSON.stringify(toolData.arguments, null, 2)}
              </pre>
              <Button
                size="sm"
                className="w-full mt-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg"
                onClick={() => executeTool(toolData.tool, toolData.arguments)}
              >
                Approve Action
              </Button>
            </div>
          </div>
        )
      } catch (e) { }
    }

    // Hide partial JSON blocks during stream
    if (content.includes('```json') && !content.includes('```', content.indexOf('```json') + 7)) {
      const beforeJson = content.split('```json')[0].trim()
      return renderMarkdown(beforeJson)
    }

    return renderMarkdown(content)
  }

  const handleSendSupport = async () => {
    if (!supportMessage.trim() || supportStatus === 'sending') return

    setSupportStatus('sending')
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'

      const resp = await fetch(`${backendUrl}/api/hr/support`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          message: supportMessage,
          context: getPageContext()
        }),
      })

      if (!resp.ok) throw new Error('Failed to send')

      setSupportStatus('success')
      setSupportMessage('')
      setTimeout(() => setSupportStatus('idle'), 3000)
    } catch (e) {
      setSupportStatus('error')
      setTimeout(() => setSupportStatus('idle'), 3000)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (activeTab === 'chat') handleSendChat()
      else handleSendSupport()
    }
  }

  return (
    <>
      {/* Floating Action Button */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-[120] flex flex-col items-end gap-3 animate-in slide-in-from-bottom-5 fade-in duration-500">
          <div className="bg-white dark:bg-gray-800 text-slate-800 dark:text-slate-200 text-sm px-4 py-2 rounded-xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] border border-slate-100 dark:border-slate-700 relative flex items-center gap-2 animate-bounce cursor-pointer" onClick={() => setIsOpen(true)}>
            <span className="font-medium">✨ Need help? Ask AI!</span>
            <div className="absolute -bottom-2 right-8 w-4 h-4 bg-white dark:bg-gray-800 border-b border-r border-slate-100 dark:border-slate-700 transform rotate-45"></div>
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="group relative flex items-center gap-3 px-6 py-4 rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white shadow-2xl hover:shadow-xl transition-all hover:-translate-y-1 active:scale-95 border border-white/20"
            aria-label="Open AI Agent"
          >
            <div className="absolute inset-0 rounded-full bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
            <img
              src="/assets/logo/logo-removebg-preview.png"
              alt="OptioHire AI"
              className="w-6 h-6 object-contain invert brightness-0"
            />
            <span className="font-semibold tracking-wide">Ask AI Agent</span>
            <span className="absolute top-0 right-0 -mt-1 -mr-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500 border-2 border-white dark:border-gray-900"></span>
            </span>
          </button>
        </div>
      )}

      {/* Slide-out Drawer */}
      {isOpen && (
        <div
          className={`fixed top-0 right-0 h-full z-[130] bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 shadow-2xl transition-all duration-300 flex flex-col ${
            isExpanded ? 'w-[800px] max-w-[90vw]' : 'w-[400px] max-w-[85vw]'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
            <div className="flex items-center gap-4">
              {/* OptioHire Logo - standing on its own, large */}
              <img
                src="/assets/logo/logo-removebg-preview.png"
                alt="OptioHire"
                className="w-16 h-16 object-contain"
              />
              <div>
                <p className="text-lg font-extrabold leading-tight tracking-tight">OptioHire Agent</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">AI-powered HR assistant</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-2 text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                aria-label={isExpanded ? 'Collapse' : 'Expand'}
              >
                {isExpanded ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-2 text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                aria-label="Close"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/80 px-4 py-4 gap-3">
            <button
              className={`flex items-center justify-center gap-2 flex-1 py-3.5 text-[15px] font-bold rounded-xl transition-all border-2 ${
                activeTab === 'chat'
                  ? 'border-purple-600 bg-white dark:bg-gray-800 text-purple-700 dark:text-purple-400 shadow-md transform scale-[1.02]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-200 dark:hover:bg-gray-800 hover:scale-[1.01]'
              }`}
              onClick={() => setActiveTab('chat')}
            >
              <Sparkles className="w-4 h-4" />
              Ask AI Agent
            </button>
            <button
              className={`flex items-center justify-center gap-2 flex-1 py-3.5 text-[15px] font-bold rounded-xl transition-all border-2 ${
                activeTab === 'support'
                  ? 'border-purple-600 bg-white dark:bg-gray-800 text-purple-700 dark:text-purple-400 shadow-md transform scale-[1.02]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-200 dark:hover:bg-gray-800 hover:scale-[1.01]'
              }`}
              onClick={() => setActiveTab('support')}
            >
              <Headphones className="w-4 h-4" />
              Contact Support
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-hidden flex flex-col bg-[#f5f5ff] dark:bg-gray-900/50">

            {/* AI Agent Chat Tab */}
            {activeTab === 'chat' && (
              <>
                {/* Date stamp */}
                <div className="flex justify-center pt-4 pb-1">
                  <span className="text-[11px] text-gray-400 bg-white dark:bg-gray-800 px-3 py-1 rounded-full shadow-sm border border-gray-100 dark:border-gray-700">
                    Today · {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
                  {messages.map((msg, idx) => {
                    const colorScheme = AI_COLORS[msg.colorIndex ?? 0]
                    return (
                      <div
                        key={idx}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        {msg.role === 'assistant' && (
                          <div className="relative w-10 h-10 flex items-center justify-center mr-2 flex-shrink-0 mt-0.5">
                            <img
                              src="/assets/logo/logo-removebg-preview.png"
                              alt="AI"
                              className="w-10 h-10 object-contain drop-shadow-sm"
                            />
                            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full shadow-sm" />
                          </div>
                        )}
                        <div
                          className={`max-w-[85%] rounded-2xl px-5 py-3.5 shadow-sm border ${
                            msg.role === 'user'
                              ? 'bg-purple-600 text-white rounded-br-sm border-purple-700 whitespace-pre-wrap text-[14px] leading-relaxed'
                              : `${colorScheme.bubble} dark:bg-gray-800 dark:border-gray-700 rounded-bl-sm text-[14px]`
                          }`}
                        >
                          {msg.role === 'user'
                            ? msg.content
                            : renderMessageContent(msg.content, msg.colorIndex ?? 0)
                          }
                          {msg.role === 'user' && (
                            <p className="text-[11px] text-white/70 mt-1.5 text-right font-medium">Sent</p>
                          )}
                        </div>
                      </div>
                    )
                  })}

                  {/* Typing animation */}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="w-10 h-10 flex items-center justify-center mr-2 flex-shrink-0 mt-0.5">
                        <img
                          src="/assets/logo/logo-removebg-preview.png"
                          alt="AI"
                          className="w-10 h-10 object-contain drop-shadow-sm"
                        />
                      </div>
                      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl rounded-bl-sm shadow-sm">
                        <TypingDots />
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Quick action chips */}
                {messages.length === 1 && (
                  <div className="px-5 pb-3 flex flex-wrap gap-2.5">
                    {getDynamicSuggestions().map((chip) => (
                      <button
                        key={chip}
                        onClick={() => { setInput(chip); }}
                        className="text-[13px] font-bold text-purple-700 border-2 border-purple-200 bg-purple-50 hover:bg-purple-600 hover:border-purple-600 hover:text-white px-4 py-2 rounded-full transition-all shadow-sm"
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                )}

                <div className="border-t border-gray-200 dark:border-gray-800 p-5 bg-white dark:bg-gray-900">
                  <div className="flex items-end gap-3 relative">
                    <textarea
                      rows={isExpanded ? 3 : 1}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      className="flex-1 resize-none rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-3.5 pr-14 text-[15px] text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/40 transition-shadow"
                      placeholder="Ask the agent anything..."
                    />
                    <Button
                      type="button"
                      size="icon"
                      disabled={isSending || !input.trim()}
                      onClick={handleSendChat}
                      className="absolute right-2 bottom-2 h-10 w-10 rounded-lg bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-40 transition-all hover:scale-105 active:scale-95 shadow-md"
                    >
                      {isSending ? (
                        <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Send className="w-5 h-5 ml-0.5" />
                      )}
                    </Button>
                  </div>
                </div>
              </>
            )}

            {/* Support Ticket Tab */}
            {activeTab === 'support' && (
              <div className="flex-1 p-6 flex flex-col h-full bg-white dark:bg-gray-900">
                <div className="mb-6 flex flex-col items-center text-center">
                  <div className="w-14 h-14 bg-[#f0f0ff] text-[#2D2DDD] rounded-full flex items-center justify-center mb-3 shadow-sm border border-[#d0d0ff]">
                    <HelpCircle className="w-7 h-7" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Send to Admin</h3>
                  <p className="text-sm text-gray-500 mt-1 max-w-xs">
                    Have an issue the AI can't solve? Send a message directly to the OptioHire admins.
                  </p>
                </div>

                <div className="flex-1 flex flex-col">
                  <textarea
                    className="flex-1 resize-none rounded-xl border border-gray-200 dark:border-gray-700 p-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D2DDD]/40 mb-4 bg-gray-50 dark:bg-gray-800 placeholder-gray-400"
                    placeholder="Describe your issue here..."
                    value={supportMessage}
                    onChange={(e) => setSupportMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                  />

                  <Button
                    type="button"
                    onClick={handleSendSupport}
                    disabled={!supportMessage.trim() || supportStatus === 'sending' || supportStatus === 'success'}
                    className={`w-full py-6 rounded-xl text-white font-semibold transition-all text-sm ${
                      supportStatus === 'success'
                        ? 'bg-green-600 hover:bg-green-700'
                        : supportStatus === 'error'
                        ? 'bg-red-600 hover:bg-red-700'
                        : 'bg-[#2D2DDD] hover:bg-[#2424c0] hover:scale-[1.01] active:scale-[0.99]'
                    }`}
                  >
                    {supportStatus === 'sending' ? 'Sending...' :
                      supportStatus === 'success' ? '✅ Message Sent Successfully!' :
                      supportStatus === 'error' ? '❌ Failed to Send. Try Again.' :
                      'Send Message'}
                  </Button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[125] transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}
