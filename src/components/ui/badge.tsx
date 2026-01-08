import { type HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral'
  size?: 'sm' | 'md'
}

export function Badge({ className, variant = 'neutral', size = 'md', children, ...props }: BadgeProps) {
  const variantStyles = {
    success: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-100 text-amber-700 border-amber-200',
    error: 'bg-red-100 text-red-700 border-red-200',
    info: 'bg-accent-100 text-accent-700 border-accent-200',
    neutral: 'bg-surface-100 text-surface-600 border-surface-200',
  }
  const sizeStyles = { sm: 'px-2 py-0.5 text-xs', md: 'px-2.5 py-0.5 text-xs' }

  return <span className={cn('inline-flex items-center rounded-full font-medium border', variantStyles[variant], sizeStyles[size], className)} {...props}>{children}</span>
}
