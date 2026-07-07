import type { Metadata } from 'next'
import { DM_Serif_Display, Space_Grotesk } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/context/AuthContext'
import { SettingsProvider } from '@/context/SettingsContext'
import { DataProvider } from '@/context/DataContext'

const dmSerifDisplay = DM_Serif_Display({
  weight: ['400'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
})

const spaceGrotesk = Space_Grotesk({
  weight: ['300', '400', '500', '600', '700'],
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
    <html lang="en" className={`${dmSerifDisplay.variable} ${spaceGrotesk.variable}`}>
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
