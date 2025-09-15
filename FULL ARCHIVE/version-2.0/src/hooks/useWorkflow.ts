import { useState } from 'react'
import { useUser } from '@/contexts/UserContext'

interface StartWorkflowParams {
  workflow_type: 'foh-morning' | 'boh-prep' | 'foh-closing' | 'boh-closing'
  department: 'FOH' | 'BOH'
  shift_type: string
}

interface WorkflowResponse {
  success: boolean
  worksheet?: any
  workflow_message?: any
  template?: string
  task_count?: number
  message?: string
  error?: string
}

export function useWorkflow() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user } = useUser()

  const startWorkflow = async (params: StartWorkflowParams): Promise<WorkflowResponse | null> => {
    if (!user) {
      setError('User not logged in')
      return null
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/workflow/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          employee_name: user.name, // This will be converted to employee_id in API
          department: params.department,
          shift_type: params.shift_type,
          workflow_type: params.workflow_type
        })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to start workflow')
        return data
      }

      return data
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to start workflow'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setIsLoading(false)
    }
  }

  const saveWorksheet = async (worksheetData: any): Promise<WorkflowResponse | null> => {
    if (!user) {
      setError('User not logged in')
      return null
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/worksheets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(worksheetData)
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to save worksheet')
        return data
      }

      return data
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to save worksheet'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setIsLoading(false)
    }
  }

  const submitReview = async (reviewData: any): Promise<WorkflowResponse | null> => {
    if (!user) {
      setError('User not logged in')
      return null
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...reviewData,
          employee_name: user.name
        })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to submit review')
        return data
      }

      return data
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to submit review'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setIsLoading(false)
    }
  }

  return {
    startWorkflow,
    saveWorksheet,
    submitReview,
    isLoading,
    error,
    clearError: () => setError(null)
  }
}
