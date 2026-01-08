'use client'

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Spinner } from './spinner'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  icon?: ReactNode
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading = false, icon, disabled, children, ...props }, ref) => {
    const variantStyles = {
      primary: 'bg-brand-600 text-white hover:bg-brand-700 shadow-md hover:shadow-lg',
      secondary: 'bg-surface-200 text-surface-700 hover:bg-surface-300',
      ghost: 'bg-transparent hover:bg-surface-100 text-surface-600',
      danger: 'bg-red-500 text-white hover:bg-red-600',
    }
    const sizeStyles = { sm: 'px-3 py-1.5 text-sm rounded-lg gap-1.5', md: 'px-4 py-2.5 rounded-xl gap-2', lg: 'px-6 py-3 text-lg rounded-2xl gap-2.5' }

    return (
      <button ref={ref} disabled={disabled || loading} className={cn('inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:opacity-50 disabled:cursor-not-allowed', variantStyles[variant], sizeStyles[size], className)} {...props}>
        {loading && <Spinner size="sm" />}
        {!loading && icon}
        {children}
      </button>
    )
  }
)
Button.displayName = 'Button'
