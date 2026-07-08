'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Settings, CurrencyDisplay } from '@/lib/types'
import { DEFAULT_EXCHANGE_RATE } from '@/lib/currency'
import { useAuth } from './AuthContext'

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

function getSettingsKey(userId: string | undefined): string {
  return userId ? `agencyos_settings_${userId}` : 'agencyos_settings_guest'
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS)

  // Load settings for the current user whenever they change
  useEffect(() => {
    const key = getSettingsKey(user?.id)
    const stored = localStorage.getItem(key)
    if (stored) {
      try {
        setSettings(JSON.parse(stored))
      } catch {
        localStorage.removeItem(key)
        setSettings(DEFAULT_SETTINGS)
      }
    } else {
      // Reset to defaults when switching to a user with no saved settings
      setSettings(DEFAULT_SETTINGS)
    }
  }, [user?.id])

  const save = (updated: Settings) => {
    const key = getSettingsKey(user?.id)
    setSettings(updated)
    localStorage.setItem(key, JSON.stringify(updated))
  }

  // Use functional form to avoid stale closure on rapid updates
  const updateExchangeRate = (rate: number) => {
    setSettings(prev => {
      const updated = { ...prev, exchangeRate: rate }
      const key = getSettingsKey(user?.id)
      localStorage.setItem(key, JSON.stringify(updated))
      return updated
    })
  }

  const updateCurrencyDisplay = (display: CurrencyDisplay) => {
    setSettings(prev => {
      const updated = { ...prev, currencyDisplay: display }
      const key = getSettingsKey(user?.id)
      localStorage.setItem(key, JSON.stringify(updated))
      return updated
    })
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
