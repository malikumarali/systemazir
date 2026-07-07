'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import {
  LayoutDashboard, Target, DollarSign, Settings, LogOut, ChevronRight, Sparkles
} from 'lucide-react'
import SidebarChatbot from './SidebarChatbot'

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, founderOnly: true, description: 'Analytics & ROI' },
  { label: 'Lead Tracker', href: '/leads', icon: Target, founderOnly: false, description: 'Manage leads' },
  { label: 'Revenue Matrix', href: '/matrix', icon: DollarSign, founderOnly: false, description: 'Inbound & Outbound' },
  { label: 'Settings', href: '/settings', icon: Settings, founderOnly: true, description: 'Configure' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { user, logout, isFounder } = useAuth()
  const [chatbotOpen, setChatbotOpen] = useState(false)

  const visibleItems = NAV_ITEMS.filter(item => !item.founderOnly || isFounder)

  return (
    <>
      <aside style={{
        width: 224,
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--ink-800)',
        borderRight: '1px solid var(--ink-600)',
        position: 'relative',
      }}>
        {/* Sienna top accent line */}
        <div style={{ height: 3, background: 'var(--sienna)', flexShrink: 0 }} />

        {/* Wordmark */}
        <div style={{
          padding: '20px 18px 16px',
          borderBottom: '1px solid var(--ink-600)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 8, height: 8,
              background: 'var(--sienna)',
              borderRadius: 2,
              flexShrink: 0,
            }} />
            <div>
              <div style={{
                fontFamily: 'var(--font-sans)',
                fontWeight: 700,
                fontSize: 12,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'var(--cream)',
              }}>
                Agency OS
              </div>
              <div style={{ fontSize: 10, color: 'var(--ink-400)', marginTop: 1 }}>
                Performance workspace
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: 1 }}>
          <div style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--ink-400)',
            padding: '4px 8px 8px',
          }}>
            Main
          </div>
          {visibleItems.map(({ label, href, icon: Icon, description }) => {
            const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
            return (
              <Link
                key={href + label}
                href={href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: active ? '9px 10px 9px 8px' : '9px 10px',
                  borderRadius: 2,
                  textDecoration: 'none',
                  borderLeft: active ? '2px solid var(--sienna)' : '2px solid transparent',
                  background: active ? 'var(--sienna-faint)' : 'transparent',
                  transition: 'background-color 0.1s ease, border-color 0.1s ease',
                  cursor: 'pointer',
                }}
                onMouseEnter={e => {
                  if (!active) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)'
                }}
                onMouseLeave={e => {
                  if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent'
                }}
              >
                <div style={{
                  width: 28, height: 28,
                  background: active ? 'rgba(194,82,42,0.15)' : 'var(--ink-700)',
                  borderRadius: 2,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                  border: `1px solid ${active ? 'rgba(194,82,42,0.25)' : 'var(--ink-600)'}`,
                }}>
                  <Icon size={13} color={active ? 'var(--sienna-light)' : 'var(--ink-300)'} strokeWidth={1.5} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 13, fontWeight: 500,
                    color: active ? 'var(--cream)' : 'var(--ink-200)',
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>
                    {label}
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--ink-400)', marginTop: 1 }}>{description}</div>
                </div>
                {active && <ChevronRight size={12} color="var(--sienna)" strokeWidth={2} />}
              </Link>
            )
          })}
        </nav>

        {/* AI Agent Button */}
        <div style={{ padding: '10px', borderTop: '1px solid var(--ink-600)' }}>
          <button
            onClick={() => setChatbotOpen(prev => !prev)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 10px',
              borderRadius: 2,
              border: `1px solid ${chatbotOpen ? 'rgba(194,82,42,0.4)' : 'var(--ink-600)'}`,
              background: chatbotOpen ? 'var(--sienna-faint)' : 'transparent',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              position: 'relative',
            }}
          >
            {chatbotOpen && (
              <span style={{
                position: 'absolute', right: 8, top: 8,
                width: 5, height: 5,
                background: 'var(--sienna)',
                borderRadius: '50%',
              }} />
            )}
            <div style={{
              width: 28, height: 28,
              background: chatbotOpen ? 'rgba(194,82,42,0.15)' : 'var(--ink-700)',
              border: `1px solid ${chatbotOpen ? 'rgba(194,82,42,0.25)' : 'var(--ink-600)'}`,
              borderRadius: 2,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Sparkles size={13} color={chatbotOpen ? 'var(--sienna-light)' : 'var(--ink-300)'} strokeWidth={1.5} />
            </div>
            <div style={{ textAlign: 'left', flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: chatbotOpen ? 'var(--sienna-light)' : 'var(--ink-200)' }}>
                Nemotron Agent
              </div>
              <div style={{ fontSize: 10, color: 'var(--ink-400)' }}>Ask AI assistant</div>
            </div>
          </button>
        </div>

        {/* User + Logout */}
        <div style={{ padding: '10px', borderTop: '1px solid var(--ink-600)' }}>
          <button
            onClick={logout}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px',
              borderRadius: 2,
              border: '1px solid var(--ink-600)',
              background: 'transparent',
              cursor: 'pointer',
              transition: 'background-color 0.1s ease',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(217,79,79,0.06)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            id="sidebar-logout"
          >
            <div style={{
              width: 28, height: 28,
              background: 'var(--ink-700)',
              border: '1px solid var(--ink-600)',
              borderRadius: 2,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
              fontFamily: 'var(--font-display)',
              fontSize: 13,
              color: 'var(--cream)',
              fontWeight: 400,
            }}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-200)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.name}
              </div>
              <div style={{ fontSize: 10, color: 'var(--ink-400)', textTransform: 'capitalize' }}>{user?.role?.replace('_', ' ')}</div>
            </div>
            <LogOut size={12} color="var(--ink-400)" strokeWidth={1.5} />
          </button>
        </div>
      </aside>

      <SidebarChatbot isOpen={chatbotOpen} onClose={() => setChatbotOpen(false)} />
    </>
  )
}
