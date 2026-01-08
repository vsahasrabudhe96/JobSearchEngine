'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Briefcase, Search, FileText, Sparkles } from 'lucide-react'

const navItems = [
  { href: '/', label: 'Jobs', icon: Briefcase },
  { href: '/searches', label: 'Searches', icon: Search },
  { href: '/resumes', label: 'Resumes', icon: FileText },
  { href: '/recommendations', label: 'Matches', icon: Sparkles },
]

export function Navbar() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-surface-200">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-md">
              <Briefcase className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-xl">Job<span className="text-brand-600">Finder</span></span>
          </Link>
          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
              const Icon = item.icon
              return (
                <Link key={item.href} href={item.href} className={cn('flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all', isActive ? 'bg-brand-50 text-brand-700' : 'text-surface-600 hover:bg-surface-100')}>
                  <Icon className="w-4 h-4" />{item.label}
                </Link>
              )
            })}
          </div>
        </div>
      </nav>
    </header>
  )
}
