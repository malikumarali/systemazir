'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, X, RotateCcw, Cpu, ChevronDown, ChevronUp } from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  thinking?: string
  timestamp: Date
}

interface SidebarChatbotProps {
  isOpen: boolean
  onClose: () => void
}

const SUGGESTED_PROMPTS = [
  'Which lead source has the best ROI?',
  'Explain the Revenue Matrix to me',
  'What is a good ROAS for Meta Ads?',
  'How should I prioritize my niches?',
]

export default function SidebarChatbot({ isOpen, onClose }: SidebarChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [expandedThinking, setExpandedThinking] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (text?: string) => {
    const content = (text || input).trim()
    if (!content || loading) return

    setInput('')
    const userMsg: Message = { id: `u-${Date.now()}`, role: 'user', content, timestamp: new Date() }
    setMessages(prev => [...prev, userMsg])
    setLoading(true)

    const assistantId = `a-${Date.now()}`
    setMessages(prev => [...prev, { id: assistantId, role: 'assistant', content: '', thinking: '', timestamp: new Date() }])

    try {
      const conversationHistory = [...messages, userMsg].map(m => ({
        role: m.role, content: m.content,
      }))

      const token = localStorage.getItem('agencyos_token')
      const user = localStorage.getItem('agencyos_user')
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      }
      if (token) headers['Authorization'] = `Bearer ${token}`
      if (user) {
        try {
          const parsed = JSON.parse(user)
          headers['x-demo-user-id'] = parsed.id
        } catch {}
      }

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers,
        body: JSON.stringify({ messages: conversationHistory }),
      })

      if (!res.ok) throw new Error('Network error')
      if (!res.body) throw new Error('No stream body')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const raw = line.slice(6).trim()
          if (raw === '[DONE]') continue
          try {
            const parsed = JSON.parse(raw)
            const delta = parsed.choices?.[0]?.delta
            if (!delta) continue

            const thinking = delta.reasoning_content
            const content = delta.content

            setMessages(prev => prev.map(m => {
              if (m.id !== assistantId) return m
              return {
                ...m,
                thinking: thinking != null ? (m.thinking || '') + thinking : m.thinking,
                content: content != null ? m.content + content : m.content,
              }
            }))
          } catch { /* skip malformed chunks */ }
        }
      }
    } catch (e) {
      setMessages(prev => prev.map(m =>
        m.id === assistantId
          ? { ...m, content: 'Connection error. Please try again.' }
          : m
      ))
    } finally {
      setLoading(false)
    }
  }

  const clearChat = () => {
    setMessages([])
    setExpandedThinking(null)
  }

  if (!isOpen) return null

  return (
    <div
      className="animate-slide-right"
      style={{
        position: 'fixed',
        top: 0, left: 224,
        width: 340,
        height: '100vh',
        background: 'var(--ink-800)',
        borderRight: '1px solid var(--ink-600)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 50,
      }}
    >
      {/* Sienna top line */}
      <div style={{ height: 3, background: 'var(--sienna)', flexShrink: 0 }} />

      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '14px 16px',
        borderBottom: '1px solid var(--ink-600)',
        flexShrink: 0,
      }}>
        <div style={{
          width: 28, height: 28,
          background: 'var(--sienna-faint)',
          border: '1px solid rgba(211,47,47,0.25)',
          borderRadius: 2,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Cpu size={13} color="var(--sienna)" strokeWidth={1.5} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 17, color: 'var(--cream)' }}>Nemotron Agent</div>
          <div style={{ fontSize: 13, color: 'var(--ink-400)' }}>nvidia/nemotron-3-super-120b</div>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {messages.length > 0 && (
            <button
              onClick={clearChat}
              style={{
                width: 26, height: 26,
                background: 'transparent',
                border: '1px solid var(--ink-600)',
                borderRadius: 2,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: 'var(--ink-400)',
              }}
              title="Clear chat"
            >
              <RotateCcw size={12} strokeWidth={1.5} />
            </button>
          )}
          <button
            onClick={onClose}
            style={{
              width: 26, height: 26,
              background: 'transparent',
              border: '1px solid var(--ink-600)',
              borderRadius: 2,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: 'var(--ink-400)',
            }}
          >
            <X size={12} strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 14px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {messages.length === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{
              textAlign: 'center',
              padding: '24px 16px 16px',
            }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--cream)', marginBottom: 6 }}>
                Ask the agent
              </div>
              <p style={{ fontSize: 15, color: 'var(--ink-400)', lineHeight: 1.5 }}>
                Get insights about your leads, ROI, campaign performance, and more.
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {SUGGESTED_PROMPTS.map(prompt => (
                <button
                  key={prompt}
                  onClick={() => sendMessage(prompt)}
                  style={{
                    textAlign: 'left',
                    padding: '10px 12px',
                    background: 'var(--ink-700)',
                    border: '1px solid var(--ink-600)',
                    borderLeft: '2px solid var(--ink-500)',
                    borderRadius: 2,
                    fontSize: 15,
                    color: 'var(--ink-200)',
                    cursor: 'pointer',
                    transition: 'border-color 0.1s ease, color 0.1s ease',
                    fontFamily: 'var(--font-sans)',
                  }}
                  onMouseEnter={e => {
                    ;(e.currentTarget as HTMLButtonElement).style.borderLeftColor = 'var(--sienna)'
                    ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--cream)'
                  }}
                  onMouseLeave={e => {
                    ;(e.currentTarget as HTMLButtonElement).style.borderLeftColor = 'var(--ink-500)'
                    ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--ink-200)'
                  }}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map(msg => (
          <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', gap: 6 }} className="animate-enter">
            {/* Thinking block */}
            {msg.thinking && (
              <div>
                <button
                  onClick={() => setExpandedThinking(expandedThinking === msg.id ? null : msg.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    background: 'none', border: 'none', cursor: 'pointer',
                    fontSize: 13, fontWeight: 600, letterSpacing: '0.08em',
                    textTransform: 'uppercase', color: 'var(--ink-400)',
                    padding: '4px 0',
                  }}
                >
                  {expandedThinking === msg.id ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
                  Reasoning {expandedThinking === msg.id ? '▲' : '▼'}
                </button>
                {expandedThinking === msg.id && (
                  <div style={{
                    background: 'var(--ink-900)',
                    border: '1px solid var(--ink-600)',
                    borderLeft: '2px solid var(--ink-500)',
                    borderRadius: 2,
                    padding: '10px 12px',
                    fontSize: 14,
                    color: 'var(--ink-300)',
                    lineHeight: 1.6,
                    maxHeight: 200,
                    overflowY: 'auto',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                  }}>
                    {msg.thinking}
                  </div>
                )}
              </div>
            )}

            {/* User bubble */}
            {msg.role === 'user' && (
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <div style={{
                  background: 'var(--sienna)',
                  color: 'var(--cream)',
                  borderRadius: '2px 2px 0 2px',
                  padding: '9px 12px',
                  maxWidth: '85%',
                  fontSize: 17,
                  lineHeight: 1.5,
                  fontWeight: 400,
                }}>
                  {msg.content}
                </div>
              </div>
            )}

            {/* Assistant bubble */}
            {msg.role === 'assistant' && (
              <div>
                <div style={{
                  background: 'var(--ink-700)',
                  border: '1px solid var(--ink-600)',
                  borderRadius: '2px 2px 2px 0',
                  padding: '10px 12px',
                  fontSize: 17,
                  color: msg.content ? 'var(--ink-100)' : 'var(--ink-400)',
                  lineHeight: 1.65,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}>
                  {msg.content || (loading ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div className="spinner" style={{ width: 12, height: 12 }} />
                      <span style={{ fontSize: 14 }}>Thinking…</span>
                    </span>
                  ) : '—')}
                </div>
                <div style={{ fontSize: 13, color: 'var(--ink-500)', marginTop: 4 }}>
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            )}
          </div>
        ))}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div style={{
        padding: '12px 14px',
        borderTop: '1px solid var(--ink-600)',
        flexShrink: 0,
      }}>
        <div style={{
          display: 'flex',
          gap: 8,
          alignItems: 'flex-end',
        }}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                sendMessage()
              }
            }}
            placeholder="Ask anything about your agency…"
            rows={1}
            disabled={loading}
            id="chatbot-input"
            style={{
              flex: 1,
              background: 'var(--ink-900)',
              border: '1px solid var(--ink-600)',
              borderRadius: 2,
              padding: '9px 12px',
              fontSize: 17,
              color: 'var(--cream)',
              outline: 'none',
              resize: 'none',
              fontFamily: 'var(--font-sans)',
              lineHeight: 1.4,
              maxHeight: 120,
              overflowY: 'auto',
            }}
          />
          <button
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
            className="btn btn-primary press-effect"
            style={{ padding: '9px 12px', flexShrink: 0 }}
          >
            {loading ? (
              <div className="spinner" style={{ width: 14, height: 14 }} />
            ) : (
              <Send size={14} strokeWidth={1.5} />
            )}
          </button>
        </div>
        <div style={{ fontSize: 13, color: 'var(--ink-500)', marginTop: 6, textAlign: 'center' }}>
          Shift+Enter for newline · Enter to send
        </div>
      </div>
    </div>
  )
}
