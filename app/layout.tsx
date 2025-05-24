import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

const inter = Inter({ 
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'Jay Shah - Portfolio',
  description: 'Portfolio website of Jay Shah',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans`}>{children}</body>
    </html>
  )
} 