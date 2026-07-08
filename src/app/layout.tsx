import type { Metadata } from 'next'
import { DM_Serif_Display, Space_Grotesk } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/context/AuthContext'
import { SettingsProvider } from '@/context/SettingsContext'
import { DataProvider } from '@/context/DataContext'

import { Inter } from 'next/font/google'

const inter = Inter({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Agency OS — Performance Intelligence',
  description: 'Track lead sources, campaign ROI, and niche profitability. Built for agency founders who want clarity.',
  keywords: 'agency management, ROI tracker, lead source tracking, agency operating system',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <AuthProvider>
          <SettingsProvider>
            <DataProvider>
              {children}
            </DataProvider>
          </SettingsProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
