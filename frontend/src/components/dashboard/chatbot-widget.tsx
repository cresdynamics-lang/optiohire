'use client'

import { useState, useEffect, useRef } from 'react'
import { MessageCircle, Send, X, Maximize2, Minimize2, HelpCircle, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'

type ChatMessage = {
  role: 'user' | 'assistant'
  content: string
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
    },
  ])
  
  const [supportMessage, setSupportMessage] = useState('')
  const [supportStatus, setSupportStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')
  
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }

  useEffect(() => {
    if (isOpen && activeTab === 'chat') scrollToBottom()
  }, [isOpen, messages, activeTab])

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
          context // Sending context so the Agent knows where the HR is
        }),
      })

      if (!resp.ok) {
        throw new Error('Failed to reach AI')
      }

      // Handling streaming response
      const reader = resp.body?.getReader()
      const decoder = new TextDecoder()
      
      if (!reader) {
        throw new Error('No stream available')
      }

      setMessages((prev) => [...prev, { role: 'assistant', content: '' }])

      let done = false
      let fullReply = ''

      while (!done) {
        const { value, done: readerDone } = await reader.read()
        done = readerDone
        if (value) {
          const chunk = decoder.decode(value, { stream: true })
          
          // Parse OpenRouter SSE chunks
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
                    updated[updated.length - 1].content = fullReply
                    return updated
                  })
                }
              } catch (e) {
                // Ignore incomplete JSON chunks (can happen at chunk boundaries)
              }
            }
          }
        }
      }

    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Something went wrong while contacting the agent. Please check your network and try again.',
        },
      ])
    } finally {
      setIsSending(false)
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

      setMessages(prev => [...prev, { role: 'assistant', content: `✅ Action **${tool}** executed successfully!` }])
    } catch(err: any) {
      setMessages(prev => [...prev, { role: 'assistant', content: `❌ Failed to execute action: ${err.message}` }])
    }
  }

  const renderMessageContent = (content: string) => {
    const toolMatch = content.match(/```json\s*(\{[\s\S]*?"tool"[\s\S]*?\})\s*```/)
    if (toolMatch) {
      try {
        const toolData = JSON.parse(toolMatch[1])
        const cleanContent = content.replace(toolMatch[0], '').trim()
        return (
          <div className="flex flex-col gap-3 w-full">
            {cleanContent && <div className="whitespace-pre-wrap">{cleanContent}</div>}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-[#2D2DDD]/30 rounded-lg p-3 text-sm mt-2">
              <div className="font-semibold text-[#2D2DDD] flex items-center gap-2 mb-2">
                <Settings className="w-4 h-4 animate-spin-slow" /> Action Required: {toolData.tool}
              </div>
              <pre className="text-xs bg-white/50 dark:bg-black/20 p-2 rounded overflow-x-auto text-gray-600 dark:text-gray-300">
                {JSON.stringify(toolData.arguments, null, 2)}
              </pre>
              <Button 
                size="sm" 
                className="w-full mt-3 bg-[#2D2DDD] hover:bg-[#2424c0] text-white"
                onClick={() => executeTool(toolData.tool, toolData.arguments)}
              >
                Approve Action
              </Button>
            </div>
          </div>
        )
      } catch(e) {}
    }
    
    // Hide partial JSON blocks during stream so it doesn't look ugly
    if (content.includes('```json') && !content.includes('```', content.indexOf('```json') + 7)) {
      return content.split('```json')[0].trim()
    }

    return content
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
        <div className="fixed bottom-6 right-6 z-[120]">
          <Button
            type="button"
            size="icon"
            onClick={() => setIsOpen(true)}
            className="h-14 w-14 rounded-full bg-[#2D2DDD] hover:bg-[#2424c0] text-white shadow-2xl hover:shadow-xl transition-all"
            aria-label="Open AI Agent"
          >
            <MessageCircle className="w-6 h-6" />
          </Button>
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
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-800 bg-[#2D2DDD] text-white">
            <div className="flex items-center gap-3">
              {/* OptioHire Logo */}
              <div className="w-8 h-8 rounded bg-white p-1 flex items-center justify-center">
                <img src="/assets/logo/logo.png" alt="OptioHire" className="max-w-full max-h-full object-contain" />
              </div>
              <div>
                <p className="text-base font-bold">OptioHire Agent</p>
                <p className="text-[11px] text-white/80">AI-Powered HR Assistant</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-md transition-colors"
                aria-label={isExpanded ? "Collapse" : "Expand"}
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-md transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 dark:border-gray-800">
            <button
              className={`flex-1 py-3 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === 'chat' 
                  ? 'border-[#2D2DDD] text-[#2D2DDD]' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('chat')}
            >
              Ask AI Agent
            </button>
            <button
              className={`flex-1 py-3 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === 'support' 
                  ? 'border-[#2D2DDD] text-[#2D2DDD]' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('support')}
            >
              Contact Support
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-hidden flex flex-col bg-gray-50 dark:bg-gray-900/50">
            
            {/* AI Agent Chat Tab */}
            {activeTab === 'chat' && (
              <>
                <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
                  {messages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex ${
                        msg.role === 'user' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      {msg.role === 'assistant' && (
                        <div className="w-8 h-8 rounded-full bg-[#2D2DDD] flex items-center justify-center mr-2 flex-shrink-0">
                          <img src="/assets/logo/logo.png" alt="AI" className="w-5 h-5 object-contain invert brightness-0" />
                        </div>
                      )}
                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-[14px] leading-relaxed shadow-sm ${
                          msg.role === 'user'
                            ? 'bg-[#2D2DDD] text-white rounded-br-sm whitespace-pre-wrap'
                            : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border border-gray-100 dark:border-gray-700 rounded-bl-sm'
                        }`}
                      >
                        {msg.role === 'user' ? msg.content : renderMessageContent(msg.content)}
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
                
                <div className="border-t border-gray-200 dark:border-gray-800 p-4 bg-white dark:bg-gray-900">
                  <div className="flex items-end gap-3 relative">
                    <textarea
                      rows={isExpanded ? 3 : 1}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      className="flex-1 resize-none rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-3 pr-12 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2D2DDD]/50 transition-shadow"
                      placeholder="Ask the agent to summarize candidates, check emails, or navigate..."
                    />
                    <Button
                      type="button"
                      size="icon"
                      disabled={isSending || !input.trim()}
                      onClick={handleSendChat}
                      className="absolute right-2 bottom-2 h-9 w-9 rounded-lg bg-[#2D2DDD] hover:bg-[#2424c0] text-white disabled:opacity-50"
                    >
                      {isSending ? (
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Send className="w-4 h-4 ml-0.5" />
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
                  <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 text-[#2D2DDD] rounded-full flex items-center justify-center mb-3">
                    <HelpCircle className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Send to Admin</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Have an issue the AI can't solve? Send a message directly to the OptioHire admins.
                  </p>
                </div>

                <div className="flex-1 flex flex-col">
                  <textarea
                    className="flex-1 resize-none rounded-xl border border-gray-300 dark:border-gray-700 p-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D2DDD]/50 mb-4"
                    placeholder="Describe your issue or feature request in detail..."
                    value={supportMessage}
                    onChange={(e) => setSupportMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                  />
                  
                  <Button
                    type="button"
                    onClick={handleSendSupport}
                    disabled={!supportMessage.trim() || supportStatus === 'sending' || supportStatus === 'success'}
                    className={`w-full py-6 rounded-xl text-white font-medium transition-colors ${
                      supportStatus === 'success' 
                        ? 'bg-green-600 hover:bg-green-700'
                        : supportStatus === 'error'
                        ? 'bg-red-600 hover:bg-red-700'
                        : 'bg-[#2D2DDD] hover:bg-[#2424c0]'
                    }`}
                  >
                    {supportStatus === 'sending' ? 'Sending...' : 
                     supportStatus === 'success' ? 'Message Sent Successfully!' :
                     supportStatus === 'error' ? 'Failed to Send. Try Again.' :
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
