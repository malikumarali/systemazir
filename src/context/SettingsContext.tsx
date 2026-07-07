'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Settings, CurrencyDisplay } from '@/lib/types'
import { DEFAULT_EXCHANGE_RATE } from '@/lib/currency'

interface SettingsContextValue {
  settings: Settings
  updateExchangeRate: (rate: number) => void
  updateCurrencyDisplay: (display: CurrencyDisplay) => void
}

const SettingsContext = createContext<SettingsContextValue | null>(null)

const DEFAULT_SETTINGS: Settings = {
  exchangeRate: DEFAULT_EXCHANGE_RATE,
  currencyDisplay: 'Both',
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS)

  useEffect(() => {
    const stored = localStorage.getItem('agencyos_settings')
    if (stored) {
      try {
        setSettings(JSON.parse(stored))
      } catch {
        localStorage.removeItem('agencyos_settings')
      }
    }
  }, [])

  const save = (updated: Settings) => {
    setSettings(updated)
    localStorage.setItem('agencyos_settings', JSON.stringify(updated))
  }

  const updateExchangeRate = (rate: number) => {
    save({ ...settings, exchangeRate: rate })
  }

  const updateCurrencyDisplay = (display: CurrencyDisplay) => {
    save({ ...settings, currencyDisplay: display })
  }

  return (
    <SettingsContext.Provider value={{ settings, updateExchangeRate, updateCurrencyDisplay }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider')
  return ctx
}
