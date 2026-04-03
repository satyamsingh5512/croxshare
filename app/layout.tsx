import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' })
const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://share.satym.in'

let metadataBase: URL | undefined
try {
  metadataBase = new URL(appUrl)
} catch {
  metadataBase = undefined
}

export const metadata: Metadata = {
  metadataBase,
  title: 'Croxshare - Local file sharing over WiFi',
  description: 'Share files instantly between devices on the same WiFi network. No login, no cloud, no limits.',
  alternates: {
    canonical: '/',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        {children}
      </body>
    </html>
  )
}
