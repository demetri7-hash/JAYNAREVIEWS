'use client'

import React, { useState, useEffect } from 'react'
import { useUser } from '../../contexts/UserContext'
import ReviewSystem from '../../components/reviews/ReviewSystem'

interface ReviewTemplate {
  id: string
  name: string
  department: string
  shift_type: string
  completed: boolean
  instance: any
}

export default function ReviewsPage() {
  const { user } = useUser()
  const [reviews, setReviews] = useState<ReviewTemplate[]>([])
  const [selectedReview, setSelectedReview] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadReviews()
    }
  }, [user])

  const loadReviews = async () => {
    if (!user) return

    try {
      const response = await fetch(`/api/review-validation?employee_id=${user.id}`)
      const data = await response.json()
      
      if (data.success) {
        setReviews(data.reviews)
      }
    } catch (error) {
      console.error('Error loading reviews:', error)
    } finally {
      setLoading(false)
    }
  }

  const checkWorkflowRequirements = async (department: string, shift: string) => {
    if (!user) return

    try {
      const response = await fetch('/api/review-validation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'check_workflow_requirements',
          employee_id: user.id,
          workflow_department: department,
          workflow_shift: shift
        })
      })

      const data = await response.json()
      
      if (data.success) {
        if (data.workflow_allowed) {
          alert('✅ All required reviews completed! You can access your workflows.')
        } else {
          alert(`⚠️ ${data.message}`)
        }
      }
    } catch (error) {
      console.error('Error checking workflow requirements:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (selectedReview) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b border-gray-200 p-4">
          <button
            onClick={() => setSelectedReview(null)}
            className="text-blue-600 hover:text-blue-700 mb-2"
          >
            ← Back to Reviews
          </button>
        </div>
        <ReviewSystem 
          template_id={selectedReview}
          onComplete={() => {
            setSelectedReview(null)
            loadReviews()
          }}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">📋 Review System</h1>
          <p className="text-gray-600 mt-2">
            Complete reviews to maintain quality standards and access workflows
          </p>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">🚀 Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => checkWorkflowRequirements('BOH', 'opening')}
              className="p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 text-left"
            >
              <h3 className="font-medium text-blue-900">Check BOH Opening Requirements</h3>
              <p className="text-blue-700 text-sm mt-1">Verify if you can access BOH opening workflows</p>
            </button>
            <button
              onClick={() => checkWorkflowRequirements('BOH', 'closing')}
              className="p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 text-left"
            >
              <h3 className="font-medium text-green-900">Check BOH Closing Requirements</h3>
              <p className="text-green-700 text-sm mt-1">Verify if you can access BOH closing workflows</p>
            </button>
          </div>
        </div>

        {/* Review Categories */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* BOH Reviews */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">🍳 Back of House Reviews</h2>
            <div className="space-y-4">
              {reviews
                .filter(review => review.department === 'BOH')
                .map(review => (
                  <div
                    key={review.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      review.completed
                        ? 'border-green-300 bg-green-50 hover:bg-green-100'
                        : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
                    }`}
                    onClick={() => setSelectedReview(review.id)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-gray-900">{review.name}</h3>
                      {review.completed ? (
                        <span className="text-green-600 text-sm">✅ Completed</span>
                      ) : (
                        <span className="text-amber-600 text-sm">⏳ Pending</span>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm capitalize">
                      Shift: {review.shift_type}
                    </p>
                    {review.instance && (
                      <div className="mt-2 text-sm">
                        <span className={`inline-block px-2 py-1 rounded ${
                          review.instance.percentage >= 85
                            ? 'bg-green-100 text-green-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          Score: {review.instance.percentage?.toFixed(1) || 0}%
                        </span>
                        {review.instance.requires_manager_followup && (
                          <span className="ml-2 text-red-600 text-xs">⚠️ Requires Manager Review</span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>

          {/* FOH Reviews */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">🏪 Front of House Reviews</h2>
            <div className="space-y-4">
              {reviews
                .filter(review => review.department === 'FOH')
                .map(review => (
                  <div
                    key={review.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      review.completed
                        ? 'border-green-300 bg-green-50 hover:bg-green-100'
                        : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
                    }`}
                    onClick={() => setSelectedReview(review.id)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-gray-900">{review.name}</h3>
                      {review.completed ? (
                        <span className="text-green-600 text-sm">✅ Completed</span>
                      ) : (
                        <span className="text-amber-600 text-sm">⏳ Pending</span>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm capitalize">
                      Shift: {review.shift_type}
                    </p>
                    {review.instance && (
                      <div className="mt-2 text-sm">
                        <span className={`inline-block px-2 py-1 rounded ${
                          review.instance.percentage >= 85
                            ? 'bg-green-100 text-green-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          Score: {review.instance.percentage?.toFixed(1) || 0}%
                        </span>
                        {review.instance.requires_manager_followup && (
                          <span className="ml-2 text-red-600 text-xs">⚠️ Requires Manager Review</span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              
              {reviews.filter(review => review.department === 'FOH').length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>🚧 FOH reviews coming soon!</p>
                  <p className="text-sm mt-1">Currently integrated within FOH workflows</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">📖 How Reviews Work</h3>
          <div className="text-blue-800 space-y-2 text-sm">
            <p>• <strong>Password Protected:</strong> Manual reviews require password "JaynaGyro3130"</p>
            <p>• <strong>Required Before Workflows:</strong> Complete reviews before accessing daily checklists</p>
            <p>• <strong>6-Hour Update Window:</strong> You can update reviews within 6 hours of completion</p>
            <p>• <strong>Manager Notifications:</strong> Scores below 85% or ratings of 1 notify managers</p>
            <p>• <strong>Audit Trail:</strong> All changes are tracked and never overwritten</p>
          </div>
        </div>
      </div>
    </div>
  )
}