import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ThemeProvider } from '@/components/theme-provider'
import { ToastProvider } from '@/components/ui/Toast'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' })

export const metadata: Metadata = {
  title: 'Nebay Share - Fast. Secure. Offline. Instant.',
  description: 'Transfer files directly between devices on the same network. No cloud, no limits, just pure speed.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} bg-dark-bg text-text-dark antialiased`}>
        <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-black via-deep-charcoal to-surface-muted">
          <div className="ambient-blob ambient-blob--primary" aria-hidden />
          <div className="ambient-blob ambient-blob--accent" aria-hidden />
          <div className="relative z-10">
            <ThemeProvider>
              <ToastProvider>
                {children}
              </ToastProvider>
            </ThemeProvider>
          </div>
        </div>
      </body>
    </html>
  )
}
