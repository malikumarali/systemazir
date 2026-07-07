'use client'

import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useSettings } from '@/context/SettingsContext'
import { Bell, DollarSign, Sparkles, LogOut, MessageCircle, X } from 'lucide-react'

const PAGE_TITLES: Record<string, { title: string; subtitle: string }> = {
  '/dashboard': { title: 'Analytics Dashboard', subtitle: 'ROI, Revenue, and Niche insights' },
  '/leads': { title: 'Lead Source Tracker', subtitle: 'Track every deal to its acquisition channel' },
  '/leads/new': { title: 'Add Lead', subtitle: 'Record a new lead or deal' },
  '/matrix': { title: 'Revenue Matrix', subtitle: 'Expense & Revenue tracking' },
  '/matrix/inbound': { title: 'Inbound Matrix', subtitle: 'Meta Ads & Google Ads tracking' },
  '/matrix/outbound': { title: 'Outbound Matrix', subtitle: 'Cold Call, Email & DM tracking' },
  '/settings': { title: 'Settings', subtitle: 'Configure your agency workspace' },
}

export default function Header() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const { settings, updateCurrencyDisplay } = useSettings()
  const [assistantOpen, setAssistantOpen] = useState(false)
  const [chatInput, setChatInput] = useState('')
  const [messages, setMessages] = useState<Array<{ role: 'assistant' | 'user'; content: string }>>([
    { role: 'assistant', content: 'Ask me anything about Agency OS, or tap a FAQ below.' },
  ])

  const pageInfo = PAGE_TITLES[pathname] || { title: 'Agency OS', subtitle: '' }
  const currencyOptions: Array<'USD' | 'PKR' | 'Both'> = ['USD', 'PKR', 'Both']

  const FAQ_ANSWERS: Record<string, string> = {
    'How do I add a lead?':
      'Open Lead Tracker, click "New Lead", then fill in the source, deal value, and status details.',
    'What does the heatmap show?':
      'The heatmap visualizes ROI performance by comparing budget and conversion metrics, helping you spot the strongest campaign combinations.',
    'Can I create a new account?':
      'Account creation is not enabled in this demo yet. You can login with a demo Founder or Team account.',
    'What is Live Ops?':
      'Live Ops is the active operations indicator for your dashboard. It means you are viewing the latest campaign and pipeline performance.',
  }

  const sendAssistantMessage = (question: string) => {
    const response = FAQ_ANSWERS[question] ||
      'I can answer built-in FAQs now. API-powered responses will be available once the key is integrated.'

    setMessages(prev => [...prev, { role: 'user', content: question }, { role: 'assistant', content: response }])
  }

  const handleSend = (event: React.FormEvent) => {
    event.preventDefault()
    if (!chatInput.trim()) return
    sendAssistantMessage(chatInput.trim())
    setChatInput('')
  }

  return (
    <>
      <header className="flex items-center justify-between px-6 py-4 border-b border-slate-800/70 bg-slate-950/60 backdrop-blur-xl">
        <div>
          <h1 className="text-white font-semibold text-lg leading-tight">{pageInfo.title}</h1>
          {pageInfo.subtitle && <p className="text-slate-500 text-xs mt-0.5">{pageInfo.subtitle}</p>}
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs border border-slate-800/80 bg-slate-900/70">
            <span className="text-slate-500">Live Ops</span>
            <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-red-200">Active</span>
          </div>

          <button
            onClick={() => setAssistantOpen(true)}
            className="inline-flex items-center gap-2 rounded-full border border-slate-800/80 bg-slate-900/70 px-3 py-2 text-slate-200 hover:border-blue-500/40 hover:bg-slate-800/80 transition-all text-xs font-medium"
            id="header-ai-agent"
          >
            <MessageCircle className="w-4 h-4 text-blue-300" />
            AI Agent
          </button>

          <div className="flex items-center gap-1 p-1 rounded-xl border border-slate-800/80 bg-slate-900/70">
            <DollarSign className="w-3.5 h-3.5 text-slate-500 ml-1" />
            {currencyOptions.map((opt) => (
              <button
                key={opt}
                onClick={() => updateCurrencyDisplay(opt)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  settings.currencyDisplay === opt
                    ? 'bg-gradient-to-r from-blue-500 to-red-500 text-white shadow-lg shadow-blue-500/20'
                    : 'text-slate-400 hover:text-slate-100'
                }`}
                id={`currency-toggle-${opt.toLowerCase()}`}
              >
                {opt}
              </button>
            ))}
          </div>

          <button
            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all border border-slate-800/80 bg-slate-900/70"
            id="header-notifications"
          >
            <Bell className="w-4 h-4" />
          </button>

          <button
            onClick={logout}
            className="flex items-center gap-2 rounded-full border border-slate-800/80 bg-slate-900/70 px-3 py-2 text-slate-200 hover:border-red-500/40 hover:bg-slate-800/80 transition-all"
            id="header-user-logout"
          >
            <span className="w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-red-500 text-xs font-bold text-white">
              {user?.name?.charAt(0)}
            </span>
            <div className="text-left text-[11px] leading-tight">
              <div className="font-semibold text-slate-100">{user?.name}</div>
              <div className="text-slate-500">{user?.role || 'Founder'}</div>
            </div>
            <LogOut className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      </header>

      {assistantOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/60 px-4 py-6 sm:items-center sm:px-6">
          <div className="w-full max-w-2xl rounded-3xl border border-slate-800/90 bg-slate-950 shadow-2xl shadow-black/50 overflow-hidden">
            <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-slate-800/80 bg-slate-900/80">
              <div>
                <div className="text-sm font-semibold text-white">AI Assistant</div>
                <div className="text-xs text-slate-500">Built-in FAQ mode. API integration coming later.</div>
              </div>
              <button
                onClick={() => setAssistantOpen(false)}
                className="rounded-full p-2 text-slate-300 hover:bg-slate-800 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4 p-5">
              <div className="space-y-4">
                <div className="space-y-3 rounded-3xl border border-slate-800/80 bg-slate-950/90 p-4">
                  {messages.map((message, index) => (
                    <div key={index} className={message.role === 'user' ? 'text-right' : 'text-left'}>
                      <div className={message.role === 'user' ? 'inline-block rounded-2xl bg-blue-500/15 px-4 py-3 text-sm text-slate-100' : 'inline-block rounded-2xl bg-slate-900 px-4 py-3 text-sm text-slate-200'}>
                        {message.content}
                      </div>
                    </div>
                  ))}
                </div>
                <form onSubmit={handleSend} className="flex gap-3">
                  <input
                    value={chatInput}
                    onChange={(event) => setChatInput(event.target.value)}
                    placeholder="Ask about Agency OS..."
                    className="input-field flex-1"
                  />
                  <button
                    type="submit"
                    className="rounded-2xl bg-gradient-to-r from-blue-500 to-red-500 px-4 py-2 text-xs font-semibold text-white hover:opacity-90 transition"
                  >
                    Send
                  </button>
                </form>
              </div>
              <aside className="space-y-4 rounded-3xl border border-slate-800/80 bg-slate-950/90 p-4">
                <div className="text-sm font-semibold text-white">Quick FAQ</div>
                <div className="grid gap-2">
                  {Object.keys(FAQ_ANSWERS).map((question) => (
                    <button
                      key={question}
                      onClick={() => sendAssistantMessage(question)}
                      className="w-full rounded-2xl border border-slate-800/80 bg-slate-900 px-4 py-3 text-left text-sm text-slate-200 hover:border-blue-500/50 hover:bg-slate-900/95 transition"
                    >
                      {question}
                    </button>
                  ))}
                </div>
                <div className="rounded-2xl border border-slate-800/80 bg-slate-900 p-4 text-sm text-slate-400">
                  <div className="mb-2 font-semibold text-slate-100">API key status</div>
                  <p className="text-xs leading-relaxed">
                    API integration is not enabled yet. When ready, you can connect a key here to unlock live AI answers.
                  </p>
                </div>
              </aside>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
