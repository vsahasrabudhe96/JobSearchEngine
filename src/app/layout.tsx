import type { Metadata } from 'next'
import { Navbar } from '@/components/layout/navbar'
import './globals.css'

export const metadata: Metadata = {
  title: 'JobFinder - Discover Your Next Opportunity',
  description: 'AI-powered job discovery with resume matching.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-mesh">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>
      </body>
    </html>
  )
}
