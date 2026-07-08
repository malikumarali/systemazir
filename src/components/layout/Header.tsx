'use client'

import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useSettings } from '@/context/SettingsContext'
import { Bell, DollarSign } from 'lucide-react'

const PAGE_TITLES: Record<string, { title: string; subtitle: string }> = {
  '/dashboard': { title: 'Analytics Dashboard', subtitle: 'ROI, Revenue, Niche intelligence' },
  '/leads': { title: 'Lead Source Tracker', subtitle: 'Every deal attributed to its origin' },
  '/leads/new': { title: 'Add Lead', subtitle: 'Record a new lead or client deal' },
  '/matrix': { title: 'Revenue Matrix', subtitle: 'Expense & revenue breakdown' },
  '/matrix/inbound': { title: 'Inbound Matrix', subtitle: 'Meta Ads & Google Ads performance' },
  '/matrix/outbound': { title: 'Outbound Matrix', subtitle: 'Cold Call, Email & DM funnels' },
  '/settings': { title: 'Settings', subtitle: 'Configure workspace & exchange rates' },
}

export default function Header() {
  const pathname = usePathname()
  const { settings, updateCurrencyDisplay } = useSettings()
  const pageInfo = PAGE_TITLES[pathname] || { title: 'Systemizer', subtitle: '' }
  const currencyOptions: Array<'USD' | 'PKR' | 'Both'> = ['USD', 'PKR', 'Both']

  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      height: 52,
      flexShrink: 0,
      background: 'var(--bar-bg)',
      borderBottom: '1px solid var(--bar-border)',
    }}>
      {/* Page title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 2, height: 20, background: 'var(--sienna)', borderRadius: 0, flexShrink: 0 }} />
        <div>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.1rem',
            color: 'var(--bar-text)',
            lineHeight: 1.1,
          }}>
            {pageInfo.title}
          </h1>
          {pageInfo.subtitle && (
            <p style={{ fontSize: 14, color: 'var(--bar-text-dim)', marginTop: 1 }}>
              {pageInfo.subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Right controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {/* Live Ops indicator */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '5px 10px',
          border: '1px solid var(--bar-border)',
          borderRadius: 2,
          fontSize: 14,
          color: 'var(--bar-text-dim)',
          marginRight: 6,
        }}>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#4a9e6b', flexShrink: 0 }} />
          Live
        </div>

        {/* Currency toggle */}
        <div style={{
          display: 'flex', alignItems: 'center',
          border: '1px solid var(--bar-border)',
          borderRadius: 2,
          overflow: 'hidden',
        }}>
          <DollarSign size={12} color="var(--bar-text-dim)" strokeWidth={1.5} style={{ marginLeft: 8 }} />
          {currencyOptions.map((opt, i) => (
            <button
              key={opt}
              onClick={() => updateCurrencyDisplay(opt)}
              id={`currency-toggle-${opt.toLowerCase()}`}
              style={{
                padding: '5px 9px',
                fontSize: 14,
                fontWeight: 600,
                background: settings.currencyDisplay === opt ? 'var(--sienna)' : 'transparent',
                color: settings.currencyDisplay === opt ? '#ffffff' : 'var(--bar-text-dim)',
                border: 'none',
                borderLeft: i > 0 ? '1px solid var(--bar-border)' : 'none',
                cursor: 'pointer',
                transition: 'background-color 0.1s ease, color 0.1s ease',
                fontFamily: 'var(--font-sans)',
              }}
            >
              {opt}
            </button>
          ))}
        </div>

        {/* Notifications */}
        <button
          style={{
            width: 32, height: 32,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '1px solid var(--bar-border)',
            borderRadius: 2,
            background: 'transparent',
            cursor: 'pointer',
            color: 'var(--bar-text-dim)',
            transition: 'color 0.1s ease, background-color 0.1s ease',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.color = 'var(--bar-text)'
            ;(e.currentTarget as HTMLButtonElement).style.background = 'var(--bar-hover)'
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.color = 'var(--bar-text-dim)'
            ;(e.currentTarget as HTMLButtonElement).style.background = 'transparent'
          }}
          id="header-notifications"
        >
          <Bell size={14} strokeWidth={1.5} />
        </button>
      </div>
    </header>
  )
}
