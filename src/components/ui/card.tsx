import { type HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

export function Card({ className, hover = false, padding = 'md', children, ...props }: CardProps) {
  const paddingStyles = { none: '', sm: 'p-4', md: 'p-6', lg: 'p-8' }
  return (
    <div className={cn('bg-white rounded-2xl border border-surface-200 shadow-sm transition-all duration-300', hover && 'hover:shadow-lg hover:border-surface-300 hover:-translate-y-0.5 cursor-pointer', paddingStyles[padding], className)} {...props}>
      {children}
    </div>
  )
}
