'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import {
  LayoutDashboard, Target, DollarSign, Settings, LogOut, Zap, ChevronRight, Users
} from 'lucide-react'
import clsx from 'clsx'

const NAV_ITEMS = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    founderOnly: true,
    description: 'Analytics & ROI',
  },
  {
    label: 'Lead Tracker',
    href: '/leads',
    icon: Target,
    founderOnly: false,
    description: 'Manage leads',
  },
  {
    label: 'Revenue Matrix',
    href: '/matrix',
    icon: DollarSign,
    founderOnly: false,
    description: 'Inbound & Outbound',
  },
  {
    label: 'Team',
    href: '/settings',
    icon: Users,
    founderOnly: true,
    description: 'Manage team',
  },
  {
    label: 'Settings',
    href: '/settings',
    icon: Settings,
    founderOnly: true,
    description: 'Configure',
  },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { user, logout, isFounder } = useAuth()

  const visibleItems = NAV_ITEMS.filter((item) => {
    if (item.href === '/settings' && item.label === 'Team') return false
    return !item.founderOnly || isFounder
  })

  return (
    <aside className="w-64 flex flex-col border-r border-slate-800/70 bg-[radial-gradient(circle_at_top_left,rgba(79,124,255,0.12),transparent_30%),linear-gradient(180deg,#081120_0%,#0c172b_100%)]">
      <div className="p-6 border-b border-slate-800/70">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-blue-500 via-blue-600 to-red-500 shadow-lg shadow-blue-500/20">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-white font-semibold text-sm tracking-tight">Agency OS</div>
            <div className="text-slate-500 text-[11px]">Performance workspace</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        <div className="text-slate-500 text-[11px] font-semibold uppercase tracking-[0.35em] mb-3 px-3">
          Main
        </div>
        {visibleItems.map(({ label, href, icon: Icon, description }) => {
          const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
          return (
            <Link
              key={href + label}
              href={href}
              className={clsx(
                'group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 relative overflow-hidden',
                active
                  ? 'nav-active'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'
              )}
            >
              <div className={clsx('w-8 h-8 rounded-lg flex items-center justify-center', active ? 'bg-white/10' : 'bg-slate-800/70')}>
                <Icon className={clsx('w-4 h-4 flex-shrink-0', active ? 'text-blue-200' : '')} />
              </div>
              <div className="flex-1 min-w-0">
                <div className={clsx('text-sm font-medium', active ? 'text-blue-100' : '')}>{label}</div>
                <div className="text-slate-500 text-[11px] truncate">{description}</div>
              </div>
              {active && <ChevronRight className="w-3.5 h-3.5 text-red-300 flex-shrink-0" />}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
