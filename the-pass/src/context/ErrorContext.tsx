'use client'

import { createContext, useContext, useState, ReactNode, useCallback } from 'react'

export interface GlobalError {
  id: string
  type: 'error' | 'warning' | 'info' | 'success'
  title: string
  message: string
  timestamp: Date
  action?: {
    label: string
    onClick: () => void
  }
  dismissible?: boolean
  autoHide?: boolean
  duration?: number
}

interface ErrorContextType {
  errors: GlobalError[]
  addError: (error: Omit<GlobalError, 'id' | 'timestamp'>) => void
  removeError: (id: string) => void
  clearAllErrors: () => void
  showError: (message: string, title?: string) => void
  showWarning: (message: string, title?: string) => void
  showSuccess: (message: string, title?: string) => void
  showInfo: (message: string, title?: string) => void
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined)

export function ErrorProvider({ children }: { children: ReactNode }) {
  const [errors, setErrors] = useState<GlobalError[]>([])

  const addError = useCallback((error: Omit<GlobalError, 'id' | 'timestamp'>) => {
    const newError: GlobalError = {
      ...error,
      id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      dismissible: error.dismissible ?? true,
      autoHide: error.autoHide ?? (error.type === 'success' || error.type === 'info'),
      duration: error.duration ?? 5000
    }

    setErrors(prev => [newError, ...prev.slice(0, 4)]) // Keep max 5 errors

    // Auto-hide if specified
    if (newError.autoHide) {
      setTimeout(() => {
        removeError(newError.id)
      }, newError.duration)
    }
  }, [])

  const removeError = useCallback((id: string) => {
    setErrors(prev => prev.filter(error => error.id !== id))
  }, [])

  const clearAllErrors = useCallback(() => {
    setErrors([])
  }, [])

  const showError = useCallback((message: string, title = 'Error') => {
    addError({
      type: 'error',
      title,
      message,
      dismissible: true,
      autoHide: false
    })
  }, [addError])

  const showWarning = useCallback((message: string, title = 'Warning') => {
    addError({
      type: 'warning',
      title,
      message,
      dismissible: true,
      autoHide: true
    })
  }, [addError])

  const showSuccess = useCallback((message: string, title = 'Success') => {
    addError({
      type: 'success',
      title,
      message,
      dismissible: true,
      autoHide: true
    })
  }, [addError])

  const showInfo = useCallback((message: string, title = 'Info') => {
    addError({
      type: 'info',
      title,
      message,
      dismissible: true,
      autoHide: true
    })
  }, [addError])

  const value: ErrorContextType = {
    errors,
    addError,
    removeError,
    clearAllErrors,
    showError,
    showWarning,
    showSuccess,
    showInfo
  }

  return (
    <ErrorContext.Provider value={value}>
      {children}
    </ErrorContext.Provider>
  )
}

export function useErrorManagement() {
  const context = useContext(ErrorContext)
  if (context === undefined) {
    throw new Error('useErrorManagement must be used within an ErrorProvider')
  }
  return context
}

// Hook for API error handling
export function useApiErrorHandling() {
  const { showError, showWarning } = useErrorManagement()

  const handleApiError = useCallback((error: any, context?: string) => {
    let message = 'An unexpected error occurred'
    let title = 'Error'

    if (error?.response?.status) {
      switch (error.response.status) {
        case 400:
          title = 'Bad Request'
          message = error.response.data?.message || 'Invalid request data'
          break
        case 401:
          title = 'Unauthorized'
          message = 'Please log in to continue'
          break
        case 403:
          title = 'Access Denied'
          message = 'You do not have permission to perform this action'
          break
        case 404:
          title = 'Not Found'
          message = 'The requested resource was not found'
          break
        case 422:
          title = 'Validation Error'
          message = error.response.data?.message || 'Please check your input and try again'
          break
        case 429:
          title = 'Rate Limited'
          message = 'Too many requests. Please wait a moment and try again'
          showWarning(message, title)
          return
        case 500:
          title = 'Server Error'
          message = 'A server error occurred. Please try again later'
          break
        default:
          title = `Error ${error.response.status}`
          message = error.response.data?.message || 'An unexpected error occurred'
      }
    } else if (error?.message) {
      if (error.message.includes('Network Error') || error.message.includes('fetch')) {
        title = 'Network Error'
        message = 'Please check your internet connection and try again'
      } else {
        message = error.message
      }
    }

    if (context) {
      message = `${context}: ${message}`
    }

    showError(message, title)
  }, [showError, showWarning])

  return { handleApiError }
}

// Hook for form validation errors
export function useFormErrorHandling() {
  const { showError, showWarning } = useErrorManagement()

  const handleValidationErrors = useCallback((errors: Record<string, string[]>) => {
    const errorMessages = Object.entries(errors)
      .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
      .join('\n')

    showWarning(errorMessages, 'Validation Error')
  }, [showWarning])

  const showFieldError = useCallback((field: string, message: string) => {
    showError(message, `${field} Error`)
  }, [showError])

  return { handleValidationErrors, showFieldError }
}

// Global error display component
export function GlobalErrorDisplay() {
  const { errors, removeError } = useErrorManagement()

  if (errors.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {errors.map((error) => (
        <ErrorToast
          key={error.id}
          error={error}
          onDismiss={() => removeError(error.id)}
        />
      ))}
    </div>
  )
}

function ErrorToast({ error, onDismiss }: { error: GlobalError; onDismiss: () => void }) {
  const getColorClasses = () => {
    switch (error.type) {
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800'
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800'
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800'
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800'
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800'
    }
  }

  const getIcon = () => {
    switch (error.type) {
      case 'error':
        return '❌'
      case 'warning':
        return '⚠️'
      case 'success':
        return '✅'
      case 'info':
        return 'ℹ️'
      default:
        return '🔔'
    }
  }

  return (
    <div className={`p-4 rounded-lg border shadow-lg ${getColorClasses()} animate-in slide-in-from-right-full`}>
      <div className="flex items-start gap-3">
        <span className="text-lg">{getIcon()}</span>
        <div className="flex-1 min-w-0">
          <p className="font-medium">{error.title}</p>
          <p className="text-sm mt-1 whitespace-pre-line">{error.message}</p>
          {error.action && (
            <button
              onClick={error.action.onClick}
              className="mt-2 text-sm font-medium underline hover:no-underline"
            >
              {error.action.label}
            </button>
          )}
        </div>
        {error.dismissible && (
          <button
            onClick={onDismiss}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  )
}