import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { AppNav } from '@/components/app-nav'
import { getSettings } from '@/lib/store'
import './globals.css'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' })
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono' })

export const metadata: Metadata = {
  title: 'Smart Triage — Referral Intake & Triage',
  description:
    'AI-powered referral intake that reads faxed referrals, summarizes them, and gives clinics a structured triage workflow without EMR integration.',
  generator: 'v0.app',
  icons: {
    icon: [
      { url: '/icon-light-32x32.png', media: '(prefers-color-scheme: light)' },
      { url: '/icon-dark-32x32.png', media: '(prefers-color-scheme: dark)' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#f6f8f8',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const settings = getSettings()
  return (
    <html lang="en" className={`light ${geist.variable} ${geistMono.variable}`}>
      <body className="font-sans antialiased">
        <div className="flex min-h-dvh flex-col md:flex-row">
          <AppNav clinicName={settings.clinicName} mode={settings.mode} />
          <main className="min-w-0 flex-1">{children}</main>
        </div>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
