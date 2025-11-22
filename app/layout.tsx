import './globals.css'
import type { Metadata } from 'next'
import { ThemeProvider } from '@/components/theme-provider'
import { ToastProvider } from '@/components/ui/Toast'

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
      <body>
        <ThemeProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
