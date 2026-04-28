import React, { useState } from 'react'
import { Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'
import Providers from './providers'
import { ShellWrapper } from '@/components/shell/ShellWrapper'

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
          {children}
        </Providers>
      </body>
    </html>
  )
}
