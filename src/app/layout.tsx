import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/context/AuthContext'
import { SettingsProvider } from '@/context/SettingsContext'
import { DataProvider } from '@/context/DataContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Agency OS — Prototype',
  description: 'Track lead sources, campaign ROI, and niche profitability for your agency',
  keywords: 'agency management, ROI tracker, lead source tracking, agency OS',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
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
