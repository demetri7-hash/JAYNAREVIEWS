'use client'

import React from 'react'
import { cn } from '@/lib/utils'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'success'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  fullWidth?: boolean
  loading?: boolean
  children: React.ReactNode
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant = 'primary', 
    size = 'md', 
    fullWidth = false,
    loading = false,
    disabled,
    children, 
    ...props 
  }, ref) => {
    
    const baseClasses = [
      // Base styles - ensures minimum touch target of 44px
      'inline-flex items-center justify-center font-medium transition-all duration-200',
      'focus:outline-none focus:ring-2 focus:ring-offset-2',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      'touch-manipulation', // Improves touch responsiveness
      'relative overflow-hidden', // For loading state
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
        'text-slate-900 border border-slate-300',
        'hover:from-slate-200 hover:to-slate-300 hover:border-slate-400',
        'focus:ring-slate-500',
        'active:scale-95'
      ],
      outline: [
        'border-2 border-blue-600 text-blue-600 bg-transparent',
        'hover:bg-blue-600 hover:text-white',
        'focus:ring-blue-500',
        'active:scale-95'
      ],
      ghost: [
        'text-slate-600 bg-transparent',
        'hover:bg-slate-100 hover:text-slate-900',
        'focus:ring-slate-500',
        'active:scale-95'
      ],
      destructive: [
        'bg-gradient-to-r from-red-600 to-red-700',
        'text-white shadow-lg shadow-red-500/25',
        'hover:from-red-700 hover:to-red-800 hover:shadow-xl hover:shadow-red-500/30',
        'focus:ring-red-500',
        'active:scale-95'
      ],
      success: [
        'bg-gradient-to-r from-green-600 to-green-700',
        'text-white shadow-lg shadow-green-500/25',
        'hover:from-green-700 hover:to-green-800 hover:shadow-xl hover:shadow-green-500/30',
        'focus:ring-green-500',
        'active:scale-95'
      ]
    }

    const sizeClasses = {
      sm: 'min-h-[40px] px-3 py-2 text-sm rounded-lg',
      md: 'min-h-[44px] px-4 py-2.5 text-sm sm:text-base rounded-lg sm:rounded-xl',
      lg: 'min-h-[48px] px-6 py-3 text-base rounded-xl',
      xl: 'min-h-[52px] px-8 py-4 text-lg rounded-xl'
    }

    const widthClasses = fullWidth ? 'w-full' : ''

    return (
      <button
        className={cn(
          baseClasses,
          variantClasses[variant],
          sizeClasses[size],
          widthClasses,
          className
        )}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-inherit">
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        <span className={loading ? 'opacity-0' : 'opacity-100'}>
          {children}
        </span>
      </button>
    )
  }
)

Button.displayName = "Button"

export { Button }