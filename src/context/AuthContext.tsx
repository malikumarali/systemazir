'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { User, UserRole } from '@/lib/types'
import { DEMO_USERS } from '@/lib/mockData'

interface AuthContextValue {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ error?: string }>
  logout: () => void
  isFounder: boolean
  isTeamMember: boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for stored session
    const stored = localStorage.getItem('agencyos_user')
    if (stored) {
      try {
        setUser(JSON.parse(stored))
      } catch {
        localStorage.removeItem('agencyos_user')
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<{ error?: string }> => {
    // Demo auth: accept any password for demo accounts
    const found = DEMO_USERS.find(u => u.email.toLowerCase() === email.toLowerCase())
    if (!found) {
      return { error: 'No account found with this email.' }
    }
    // For demo: password is 'demo123' for all accounts
    if (password !== 'demo123') {
      return { error: 'Invalid password. Use demo123 for demo accounts.' }
    }
    setUser(found)
    localStorage.setItem('agencyos_user', JSON.stringify(found))
    return {}
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('agencyos_user')
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        logout,
        isFounder: user?.role === 'founder',
        isTeamMember: user?.role === 'team_member',
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
