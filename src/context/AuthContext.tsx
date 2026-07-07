'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { User } from '@/lib/types'

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
    const storedUser = localStorage.getItem('agencyos_user')
    const storedToken = localStorage.getItem('agencyos_token')
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch {
        localStorage.removeItem('agencyos_user')
        localStorage.removeItem('agencyos_token')
      }
    }

    const verifySession = async () => {
      if (storedToken) {
        try {
          const res = await fetch('/api/auth/me', {
            headers: { 'Authorization': `Bearer ${storedToken}` }
          })
          const json = await res.json()
          if (res.ok && json.ok) {
            setUser(json.data.user)
            localStorage.setItem('agencyos_user', JSON.stringify(json.data.user))
          } else {
            setUser(null)
            localStorage.removeItem('agencyos_user')
            localStorage.removeItem('agencyos_token')
          }
        } catch {
          // Fallback to offline local storage user if network fails
        }
      }
      setIsLoading(false)
    }

    verifySession()
  }, [])

  const login = async (email: string, password: string): Promise<{ error?: string }> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const json = await res.json()
      if (!res.ok || !json.ok) {
        return { error: json.error || 'Invalid credentials' }
      }
      
      const { user: loggedInUser, token } = json.data
      setUser(loggedInUser)
      localStorage.setItem('agencyos_user', JSON.stringify(loggedInUser))
      if (token) {
        localStorage.setItem('agencyos_token', token)
      } else {
        localStorage.removeItem('agencyos_token')
      }
      return {}
    } catch (e: any) {
      return { error: e.message || 'An error occurred during login.' }
    }
  }

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch {}
    setUser(null)
    localStorage.removeItem('agencyos_user')
    localStorage.removeItem('agencyos_token')
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
