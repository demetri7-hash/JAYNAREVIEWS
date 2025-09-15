import React, { useState, useEffect } from 'react'
import { useUser } from '../../contexts/UserContext'

interface ReviewCategory {
  id: string
  name: string
  description: string
  max_rating: number
  order_index: number
  required: boolean
}

interface ReviewTemplate {
  id: string
  name: string
  department: string
  shift_type: string
  time_limit_hours: number
  review_categories: ReviewCategory[]
}

interface ReviewResponse {
  category_id: string
  rating: number
  notes: string
  photos: string[]
}

interface ReviewSystemProps {
  template_id?: string
  embedded?: boolean
  onComplete?: (reviewData: any) => void
}

export default function ReviewSystem({ template_id, embedded = false, onComplete }: ReviewSystemProps) {
  const { user } = useUser()
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(!embedded)
  const [password, setPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [template, setTemplate] = useState<ReviewTemplate | null>(null)
  const [responses, setResponses] = useState<ReviewResponse[]>([])
  const [loading, setLoading] = useState(false)
  const [reviewInstance, setReviewInstance] = useState<any>(null)
  const [canUpdate, setCanUpdate] = useState(true)

  useEffect(() => {
    if (embedded || !showPasswordPrompt) {
      loadReviewTemplate()
    }
  }, [template_id, embedded, showPasswordPrompt])

  const validatePassword = async () => {
    try {
      const response = await fetch('/api/review-validation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'validate_password',
          password
        })
      })

      const data = await response.json()
      
      if (data.success) {
        setShowPasswordPrompt(false)
        setPasswordError('')
        loadReviewTemplate()
      } else {
        setPasswordError('Invalid password. Please try again.')
      }
    } catch (error) {
      setPasswordError('Error validating password')
    }
  }

  const loadReviewTemplate = async () => {
    if (!template_id || !user) return

    try {
      setLoading(true)
      const today = new Date().toISOString().split('T')[0]
      
      const response = await fetch('/api/review-validation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'get_review_status',
          employee_id: user.id,
          template_id,
          date: today,
          shift_type: 'opening' // This should be dynamic based on current shift
        })
      })

      const data = await response.json()
      
      if (data.success) {
        setTemplate(data.template)
        setReviewInstance(data.review_instance)
        setCanUpdate(data.can_update)
        
        // Initialize responses from existing data or create empty ones
        if (data.review_instance?.review_responses) {
          const existingResponses = data.review_instance.review_responses.map((r: any) => ({
            category_id: r.category_id,
            rating: r.rating || 0,
            notes: r.notes || '',
            photos: r.photos || []
          }))
          setResponses(existingResponses)
        } else {
          const emptyResponses = data.template.review_categories.map((cat: ReviewCategory) => ({
            category_id: cat.id,
            rating: 0,
            notes: '',
            photos: []
          }))
          setResponses(emptyResponses)
        }
      }
    } catch (error) {
      console.error('Error loading review template:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateResponse = (categoryId: string, field: string, value: any) => {
    setResponses(prev => prev.map(response => 
      response.category_id === categoryId 
        ? { ...response, [field]: value }
        : response
    ))
  }

  const submitReview = async () => {
    if (!user || !template) return

    try {
      setLoading(true)
      const today = new Date().toISOString().split('T')[0]

      const response = await fetch('/api/review-validation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'submit_review',
          employee_id: user.id,
          template_id: template.id,
          date: today,
          shift_type: 'opening', // This should be dynamic
          responses,
          manager_override: false
        })
      })

      const data = await response.json()
      
      if (data.success) {
        if (onComplete) {
          onComplete(data)
        }
        
        // Show success message
        alert(`Review submitted successfully! Score: ${data.percentage.toFixed(1)}%`)
        
        // Reload to show updated state
        loadReviewTemplate()
      } else {
        alert(data.message || 'Error submitting review')
      }
    } catch (error) {
      console.error('Error submitting review:', error)
      alert('Error submitting review')
    } finally {
      setLoading(false)
    }
  }

  if (showPasswordPrompt) {
    return (
      <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-xl font-bold text-gray-900 mb-4">🔒 Review Access</h2>
        <p className="text-gray-600 mb-4">
          Enter the password to access manual review system:
        </p>
        <div className="space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && validatePassword()}
            placeholder="Enter password"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {passwordError && (
            <p className="text-red-600 text-sm">{passwordError}</p>
          )}
          <button
            onClick={validatePassword}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Access Review
          </button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!template) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-600">Review template not found</p>
      </div>
    )
  }

  const totalScore = responses.reduce((sum, r) => sum + (r.rating || 0), 0)
  const maxScore = template.review_categories.length * 5
  const percentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">{template.name}</h1>
          <p className="text-gray-600 mt-1">
            Department: {template.department} | Shift: {template.shift_type}
          </p>
          
          {reviewInstance && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Current Score: {percentage.toFixed(1)}%</p>
                  <p className="text-sm text-gray-600">
                    {totalScore} / {maxScore} points
                  </p>
                </div>
                {!canUpdate && (
                  <div className="text-amber-600 text-sm">
                    🔒 Update window expired - Contact manager to make changes
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="p-6 space-y-6">
          {template.review_categories
            .sort((a, b) => a.order_index - b.order_index)
            .map((category) => {
              const response = responses.find(r => r.category_id === category.id)
              
              return (
                <div key={category.id} className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">{category.name}</h3>
                  <p className="text-gray-600 text-sm mb-4">{category.description}</p>
                  
                  {/* Rating */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rating (1-{category.max_rating})
                    </label>
                    <div className="flex space-x-2">
                      {[1, 2, 3, 4, 5].slice(0, category.max_rating).map(rating => (
                        <button
                          key={rating}
                          onClick={() => canUpdate && updateResponse(category.id, 'rating', rating)}
                          disabled={!canUpdate}
                          className={`w-10 h-10 rounded-full border-2 ${
                            response?.rating === rating
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                          } ${!canUpdate ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                        >
                          {rating}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notes
                    </label>
                    <textarea
                      value={response?.notes || ''}
                      onChange={(e) => canUpdate && updateResponse(category.id, 'notes', e.target.value)}
                      disabled={!canUpdate}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                      placeholder="Add any notes or observations..."
                    />
                  </div>

                  {/* Photo placeholder - implement later */}
                  <div className="text-sm text-gray-500">
                    📸 Photo upload feature coming soon
                  </div>
                </div>
              )
            })}
        </div>

        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Total Score: {percentage.toFixed(1)}%</p>
              <p className="text-sm text-gray-600">
                {totalScore} / {maxScore} points
                {percentage < 85 && (
                  <span className="text-amber-600 ml-2">⚠️ Below passing threshold (85%)</span>
                )}
              </p>
            </div>
            
            {canUpdate && (
              <button
                onClick={submitReview}
                disabled={loading || responses.some(r => r.rating === 0)}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Submitting...' : reviewInstance ? 'Update Review' : 'Submit Review'}
              </button>
            )}
          </div>
          
          {reviewInstance && (
            <div className="mt-4 text-xs text-gray-500">
              Last updated: {new Date(reviewInstance.updated_at).toLocaleString()}
              {reviewInstance.locked_at && (
                <span className="ml-2">
                  | Update window closes: {new Date(reviewInstance.locked_at).toLocaleString()}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}