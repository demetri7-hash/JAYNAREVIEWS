'use client'

import { useState } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import type { Message } from '@/types'
import { 
  Clock, 
  CheckCircle2, 
  Circle, 
  Camera, 
  AlertCircle,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react'

interface WorkflowCardProps {
  message: Message
  showAvatar?: boolean
  isOwn?: boolean
}

export default function WorkflowCard({ message, showAvatar = true, isOwn = false }: WorkflowCardProps) {
  const { t } = useLanguage()
  const [expanded, setExpanded] = useState(false)

  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } catch {
      return 'now'
    }
  }

  const getUserName = () => {
    return (message as any).user?.name || 'Unknown User'
  }

  const getAvatarUrl = () => {
    const name = getUserName()
    return (message as any).user?.avatar_url || 
           `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=4f46e5&color=ffffff`
  }

  const getStatusIcon = () => {
    switch (message.metadata?.workflow_status) {
      case 'started':
        return <Play className="w-4 h-4 text-blue-400" />
      case 'in_progress':
        return <Clock className="w-4 h-4 text-yellow-400" />
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-green-400" />
      case 'paused':
        return <Pause className="w-4 h-4 text-orange-400" />
      default:
        return <Circle className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusColor = () => {
    switch (message.metadata?.workflow_status) {
      case 'started':
        return 'border-blue-500 bg-blue-900 bg-opacity-20'
      case 'in_progress':
        return 'border-yellow-500 bg-yellow-900 bg-opacity-20'
      case 'completed':
        return 'border-green-500 bg-green-900 bg-opacity-20'
      case 'paused':
        return 'border-orange-500 bg-orange-900 bg-opacity-20'
      default:
        return 'border-gray-600 bg-gray-800'
    }
  }

  const completionPercentage = message.metadata?.completion_percentage || 0

  return (
    <div className="message-fade-in">
      <div className={`workflow-card border-l-4 ${getStatusColor()}`}>
        {/* Header */}
        <div className="workflow-header">
          <div className="flex items-center gap-3">
            {showAvatar && (
              <img
                src={getAvatarUrl()}
                alt={getUserName()}
                className="w-6 h-6 rounded-lg"
              />
            )}
            <div className="flex items-center gap-2">
              {getStatusIcon()}
              <span className="font-semibold text-pass-text">
                {getUserName()}
              </span>
            </div>
            <span className="text-xs text-pass-text-muted">
              {formatTime(message.created_at)}
            </span>
          </div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-pass-text-muted hover:text-pass-text text-sm"
          >
            {expanded ? 'Collapse' : 'Details'}
          </button>
        </div>

        {/* Content */}
        <div className="mb-3">
          <p className="text-pass-text mb-2">{message.content}</p>
          
          {/* Progress Bar */}
          {completionPercentage > 0 && (
            <div className="workflow-progress">
              <div 
                className="workflow-progress-bar"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          )}
          
          <div className="flex items-center justify-between text-xs text-pass-text-muted mt-2">
            <span>{completionPercentage}% complete</span>
            <span>{message.metadata?.workflow_status || 'unknown'}</span>
          </div>
        </div>

        {/* Expanded Details */}
        {expanded && (
          <div className="border-t border-gray-700 pt-3 mt-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Quick Actions */}
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-pass-text">Quick Actions</h4>
                <div className="flex gap-2">
                  <button className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded transition-colors">
                    <CheckCircle2 className="w-3 h-3 mr-1 inline" />
                    Complete Item
                  </button>
                  <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors">
                    <Camera className="w-3 h-3 mr-1 inline" />
                    Add Photo
                  </button>
                </div>
              </div>

              {/* Status Info */}
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-pass-text">Status</h4>
                <div className="text-xs text-pass-text-muted space-y-1">
                  <div>Started: {formatTime(message.created_at)}</div>
                  {message.metadata?.worksheet_id && (
                    <div>ID: {message.metadata.worksheet_id.slice(-8)}</div>
                  )}
                </div>
              </div>
            </div>

            {/* Sample Checklist Preview */}
            <div className="mt-4">
              <h4 className="text-sm font-semibold text-pass-text mb-2">Recent Items</h4>
              <div className="space-y-1">
                <div className="checklist-item completed">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  <span>Clean and sanitize prep surfaces</span>
                </div>
                <div className="checklist-item">
                  <Circle className="w-4 h-4 text-gray-400" />
                  <span>Check refrigeration temperatures</span>
                </div>
                <div className="checklist-item">
                  <Circle className="w-4 h-4 text-gray-400" />
                  <span>Stock condiment stations</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Thread Indicator */}
        {message.reply_count && message.reply_count > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-700 text-sm text-pass-accent">
            View {message.reply_count} {message.reply_count === 1 ? 'update' : 'updates'} →
          </div>
        )}
      </div>
    </div>
  )
}
