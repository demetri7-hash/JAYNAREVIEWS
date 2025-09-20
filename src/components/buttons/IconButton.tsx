'use client'

import React from 'react'
import { cn } from '@/lib/utils'

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive'
  size?: 'sm' | 'md' | 'lg'
  icon: React.ReactNode
  label?: string // For accessibility
}

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ 
    className, 
    variant = 'ghost', 
    size = 'md', 
    icon,
    label,
    ...props 
  }, ref) => {
    
    const baseClasses = [
      // Base styles - ensures minimum touch target of 44px
      'inline-flex items-center justify-center font-medium transition-all duration-200',
      'focus:outline-none focus:ring-2 focus:ring-offset-2',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      'touch-manipulation', // Improves touch responsiveness
      'flex-shrink-0', // Prevents icon buttons from shrinking
    ]

    const variantClasses = {
      primary: [
        'bg-gradient-to-r from-blue-600 to-blue-700',
        'text-white shadow-lg shadow-blue-500/25',
        'hover:from-blue-700 hover:to-blue-800 hover:shadow-xl hover:shadow-blue-500/30',
        'focus:ring-blue-500',
        'active:scale-95'
      ],
      secondary: [
        'bg-gradient-to-r from-slate-100 to-slate-200',
        'text-slate-600 border border-slate-300',
        'hover:from-slate-200 hover:to-slate-300 hover:border-slate-400 hover:text-slate-900',
        'focus:ring-slate-500',
        'active:scale-95'
      ],
      ghost: [
        'text-slate-400 bg-transparent',
        'hover:bg-slate-100 hover:text-slate-600',
        'focus:ring-slate-500',
        'active:scale-95'
      ],
      destructive: [
        'bg-gradient-to-r from-red-600 to-red-700',
        'text-white shadow-lg shadow-red-500/25',
        'hover:from-red-700 hover:to-red-800 hover:shadow-xl hover:shadow-red-500/30',
        'focus:ring-red-500',
        'active:scale-95'
      ]
    }

    const sizeClasses = {
      sm: 'min-w-[36px] min-h-[36px] w-9 h-9 rounded-lg text-sm',
      md: 'min-w-[44px] min-h-[44px] w-11 h-11 rounded-lg sm:rounded-xl',
      lg: 'min-w-[48px] min-h-[48px] w-12 h-12 rounded-xl'
    }

    return (
      <button
        className={cn(
          baseClasses,
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        ref={ref}
        aria-label={label}
        title={label}
        {...props}
      >
        {icon}
      </button>
    )
  }
)

IconButton.displayName = "IconButton"

export { IconButton }