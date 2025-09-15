'use client'

import { useState, useEffect, useRef } from 'react'
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  ChevronRight,
  Camera,
  MessageSquare,
  Filter,
  MoreVertical
} from 'lucide-react'

interface MobileTaskCardProps {
  task: {
    id: string
    title: string
    description?: string
    status: 'pending' | 'in_progress' | 'completed' | 'failed'
    dueDate?: string
    priority?: 'low' | 'medium' | 'high'
    assignedBy?: string
    estimatedTime?: number
  }
  onStatusChange: (taskId: string, status: string) => void
  onOpenDetails: (taskId: string) => void
}

export function MobileTaskCard({ task, onStatusChange, onOpenDetails }: MobileTaskCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [swipeOffset, setSwipeOffset] = useState(0)
  const [isSwipeRevealed, setIsSwipeRevealed] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const startX = useRef(0)
  const currentX = useRef(0)
  const isDragging = useRef(false)

  const getStatusIcon = () => {
    switch (task.status) {
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />
      case 'in_progress':
        return <Clock className="w-5 h-5 text-blue-500" />
      case 'failed':
        return <AlertTriangle className="w-5 h-5 text-red-500" />
      default:
        return <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
    }
  }

  const getStatusColor = () => {
    switch (task.status) {
      case 'completed':
        return 'bg-green-50 border-green-200'
      case 'in_progress':
        return 'bg-blue-50 border-blue-200'
      case 'failed':
        return 'bg-red-50 border-red-200'
      default:
        return 'bg-white border-gray-200'
    }
  }

  const getPriorityIndicator = () => {
    if (!task.priority || task.priority === 'low') return null
    
    const colors = {
      medium: 'bg-yellow-400',
      high: 'bg-red-500'
    }
    
    return (
      <div className={`w-1 h-full absolute left-0 top-0 rounded-l-lg ${colors[task.priority]}`} />
    )
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    if (task.status === 'completed') return
    
    startX.current = e.touches[0].clientX
    currentX.current = startX.current
    isDragging.current = true
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current || task.status === 'completed') return
    
    currentX.current = e.touches[0].clientX
    const diff = currentX.current - startX.current
    
    // Only allow right swipe for actions
    if (diff > 0) {
      setSwipeOffset(Math.min(diff, 100))
      
      // Provide haptic feedback at threshold
      if (diff > 50 && !isSwipeRevealed) {
        setIsSwipeRevealed(true)
        // Trigger haptic feedback if available
        if ('vibrate' in navigator) {
          navigator.vibrate(10)
        }
      }
    }
  }

  const handleTouchEnd = () => {
    isDragging.current = false
    
    if (swipeOffset > 75) {
      // Complete the action
      if (task.status === 'pending') {
        onStatusChange(task.id, 'in_progress')
      } else if (task.status === 'in_progress') {
        onStatusChange(task.id, 'completed')
      }
    }
    
    // Reset swipe state
    setSwipeOffset(0)
    setIsSwipeRevealed(false)
  }

  const formatDueDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = date.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) return 'Overdue'
    if (diffDays === 0) return 'Due today'
    if (diffDays === 1) return 'Due tomorrow'
    return `Due in ${diffDays} days`
  }

  return (
    <div className="relative mb-3">
      {/* Swipe Action Background */}
      {swipeOffset > 0 && (
        <div className="absolute inset-0 flex items-center justify-start pl-4 rounded-lg bg-gradient-to-r from-green-500 to-blue-500">
          <div className="text-white font-medium">
            {task.status === 'pending' ? 'Start Task' : 'Complete'}
          </div>
        </div>
      )}
      
      {/* Main Card */}
      <div
        ref={cardRef}
        className={`relative rounded-lg border-2 shadow-sm transition-all duration-200 ${getStatusColor()}`}
        style={{ transform: `translateX(${swipeOffset}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {getPriorityIndicator()}
        
        <div className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center space-x-3 flex-1">
              <button
                onClick={() => {
                  if (task.status === 'pending') {
                    onStatusChange(task.id, 'in_progress')
                  } else if (task.status === 'in_progress') {
                    onStatusChange(task.id, 'completed')
                  }
                }}
                className="touch-target"
                disabled={task.status === 'completed' || task.status === 'failed'}
              >
                {getStatusIcon()}
              </button>
              
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900 truncate">
                  {task.title}
                </h3>
                {task.assignedBy && (
                  <p className="text-xs text-gray-500 mt-1">
                    Assigned by {task.assignedBy}
                  </p>
                )}
              </div>
            </div>
            
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="touch-target p-1 rounded-full hover:bg-gray-100"
            >
              <ChevronRight 
                className={`w-4 h-4 text-gray-400 transition-transform ${
                  isExpanded ? 'rotate-90' : ''
                }`} 
              />
            </button>
          </div>

          {/* Due Date & Time */}
          <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
            {task.dueDate && (
              <span className={`${
                new Date(task.dueDate) < new Date() ? 'text-red-600 font-medium' : ''
              }`}>
                {formatDueDate(task.dueDate)}
              </span>
            )}
            {task.estimatedTime && (
              <span className="flex items-center">
                <Clock className="w-3 h-3 mr-1" />
                {task.estimatedTime}m
              </span>
            )}
          </div>

          {/* Expanded Content */}
          {isExpanded && (
            <div className="border-t pt-3 mt-3 space-y-3">
              {task.description && (
                <p className="text-sm text-gray-600">{task.description}</p>
              )}
              
              {/* Action Buttons */}
              <div className="flex space-x-2">
                <button
                  onClick={() => onOpenDetails(task.id)}
                  className="flex-1 flex items-center justify-center space-x-2 bg-blue-600 text-white py-2 px-3 rounded-lg text-sm font-medium"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Details</span>
                </button>
                
                {task.status === 'in_progress' && (
                  <button
                    onClick={() => {
                      // Open camera for photo capture
                      const input = document.createElement('input')
                      input.type = 'file'
                      input.accept = 'image/*'
                      input.capture = 'environment'
                      input.click()
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium flex items-center justify-center"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                )}
                
                <button
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Mobile Filter Component
export function MobileTaskFilter({ 
  currentFilter, 
  onFilterChange 
}: { 
  currentFilter: string
  onFilterChange: (filter: string) => void 
}) {
  const [isOpen, setIsOpen] = useState(false)
  
  const filters = [
    { value: 'all', label: 'All Tasks', count: 0 },
    { value: 'pending', label: 'To Do', count: 0 },
    { value: 'in_progress', label: 'In Progress', count: 0 },
    { value: 'completed', label: 'Completed', count: 0 }
  ]

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm font-medium shadow-sm"
      >
        <Filter className="w-4 h-4" />
        <span>{filters.find(f => f.value === currentFilter)?.label || 'All Tasks'}</span>
        <ChevronRight className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
          {filters.map((filter) => (
            <button
              key={filter.value}
              onClick={() => {
                onFilterChange(filter.value)
                setIsOpen(false)
              }}
              className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg ${
                currentFilter === filter.value ? 'bg-blue-50 text-blue-700 font-medium' : ''
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// Pull to Refresh Component
export function PullToRefresh({ 
  onRefresh, 
  children 
}: { 
  onRefresh: () => Promise<void>
  children: React.ReactNode 
}) {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [pullDistance, setPullDistance] = useState(0)
  const [isPulling, setIsPulling] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const startY = useRef(0)

  const handleTouchStart = (e: React.TouchEvent) => {
    if (containerRef.current?.scrollTop === 0) {
      startY.current = e.touches[0].clientY
      setIsPulling(true)
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isPulling) return
    
    const currentY = e.touches[0].clientY
    const distance = Math.max(0, (currentY - startY.current) * 0.5)
    setPullDistance(Math.min(distance, 80))
  }

  const handleTouchEnd = async () => {
    if (pullDistance > 60 && !isRefreshing) {
      setIsRefreshing(true)
      try {
        await onRefresh()
      } finally {
        setIsRefreshing(false)
      }
    }
    
    setIsPulling(false)
    setPullDistance(0)
  }

  return (
    <div 
      ref={containerRef}
      className="relative h-full overflow-y-auto"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull to refresh indicator */}
      <div 
        className="absolute top-0 left-0 right-0 flex items-center justify-center bg-blue-50 transition-all duration-200"
        style={{ 
          height: `${pullDistance}px`,
          transform: `translateY(-${Math.max(0, 80 - pullDistance)}px)`
        }}
      >
        {isRefreshing ? (
          <div className="flex items-center space-x-2 text-blue-600">
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm font-medium">Refreshing...</span>
          </div>
        ) : pullDistance > 60 ? (
          <span className="text-sm font-medium text-blue-600">Release to refresh</span>
        ) : pullDistance > 20 ? (
          <span className="text-sm text-blue-600">Pull down to refresh</span>
        ) : null}
      </div>
      
      <div style={{ paddingTop: isPulling ? `${pullDistance}px` : '0' }}>
        {children}
      </div>
    </div>
  )
}
