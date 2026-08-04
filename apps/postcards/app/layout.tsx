import React from 'react'
import { Plus_Jakarta_Sans } from 'next/font/google'
import { Toaster } from 'sonner'
import './globals.css'
import Providers from './providers'
import { ChunkLoadErrorHandler } from '@/components/chunk-load-error-handler'

const jakartaSans = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-display' })

export const metadata = {
  title: 'Postcards | Mechanical Cupcakes OS',
  description: 'Send digital postcards to someone special',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${jakartaSans.variable} font-sans`}>
        <Providers>
          <ChunkLoadErrorHandler />
          {children}
          <Toaster
            theme="light"
            className="toaster group"
            toastOptions={{
              classNames: {
                toast:
                  'group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg',
                description: 'group-[.toast]:text-muted-foreground',
                actionButton:
                  'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
                cancelButton:
                  'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground',
              },
            }}
          />
        </Providers>
      </body>
    </html>
  )
}
