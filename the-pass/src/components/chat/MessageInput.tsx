'use client'

import { useState, useRef, KeyboardEvent } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { useUser } from '@/contexts/UserContext'
import { useWorkflow } from '@/hooks/useWorkflow'
import { 
  Send, 
  Paperclip, 
  Smile, 
  Camera,
  Plus,
  Workflow,
  Loader2
} from 'lucide-react'

interface MessageInputProps {
  onSendMessage: (content: string) => void
  placeholder?: string
}

export default function MessageInput({ onSendMessage, placeholder }: MessageInputProps) {
  const { t } = useLanguage()
  const { user } = useUser()
  const { startWorkflow, submitReview, isLoading, error } = useWorkflow()
  const [message, setMessage] = useState('')
  const [showActions, setShowActions] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSend = () => {
    const trimmedMessage = message.trim()
    if (!trimmedMessage) return

    onSendMessage(trimmedMessage)
    setMessage('')
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  const handleStartWorkflow = async (workflowType: 'foh-morning' | 'boh-prep' | 'foh-closing' | 'boh-closing') => {
    if (!user) {
      onSendMessage('❌ Please log in first to start workflows')
      return
    }

    const department = workflowType.startsWith('foh') ? 'FOH' : 'BOH'
    const shift_type = workflowType.includes('morning') ? 'Morning' : workflowType.includes('closing') ? 'Closing' : 'Prep'

    const result = await startWorkflow({
      workflow_type: workflowType,
      department,
      shift_type
    })

    if (result?.success) {
      onSendMessage(`🔥 **${result.template}** workflow started! 
      
✅ ${result.task_count} tasks loaded
📝 Worksheet ID: ${result.worksheet?.id?.slice(-8) || 'N/A'}
👤 Assigned to: ${user.name}

Ready to begin! Check off tasks as you complete them.`)
    } else {
      onSendMessage(`❌ Failed to start workflow: ${result?.error || 'Unknown error'}`)
    }
    setShowActions(false)
  }

  const handleSubmitReview = async () => {
    if (!user) {
      onSendMessage('❌ Please log in first to submit reviews')
      return
    }

    // Simple review for now - in real app this would be a form
    const result = await submitReview({
      shift_type: 'Current Shift',
      department: user.department,
      overall_rating: 4,
      comments: 'Review submitted via chat interface',
      language_used: user.language
    })

    if (result?.success) {
      onSendMessage(`⭐ **Review Submitted Successfully!**
      
✅ Overall Rating: 4/5 stars
📝 Comments: Review submitted via chat interface
👤 Submitted by: ${user.name}

Thank you for your feedback!`)
    } else {
      onSendMessage(`❌ Failed to submit review: ${result?.error || 'Unknown error'}`)
    }
    setShowActions(false)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value)
    
    // Auto-resize textarea
    const textarea = e.target
    textarea.style.height = 'auto'
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px'
  }

  return (
    <div className="border-t border-pass-border bg-pass-dark p-4">
      <div className="relative bg-pass-sidebar border border-pass-border rounded-lg">
        {/* Message Input */}
        <div className="flex items-end gap-3 p-3">
          {/* Actions Button */}
          <button
            onClick={() => setShowActions(!showActions)}
            className="flex-shrink-0 p-2 text-pass-text-muted hover:text-pass-text hover:bg-pass-border rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>

          {/* Textarea */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={placeholder || t('typeMessage')}
              className="message-input"
              rows={1}
              style={{ minHeight: '24px', maxHeight: '120px' }}
            />
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-1">
            <button className="p-2 text-pass-text-muted hover:text-pass-text hover:bg-pass-border rounded-lg transition-colors">
              <Paperclip className="w-4 h-4" />
            </button>
            <button className="p-2 text-pass-text-muted hover:text-pass-text hover:bg-pass-border rounded-lg transition-colors">
              <Smile className="w-4 h-4" />
            </button>
            <button className="p-2 text-pass-text-muted hover:text-pass-text hover:bg-pass-border rounded-lg transition-colors">
              <Camera className="w-4 h-4" />
            </button>
          </div>

          {/* Send Button */}
          <button
            onClick={handleSend}
            disabled={!message.trim()}
            className={`flex-shrink-0 p-2 rounded-lg transition-colors ${
              message.trim()
                ? 'bg-pass-accent hover:bg-pass-accent-hover text-white'
                : 'bg-gray-700 text-gray-400 cursor-not-allowed'
            }`}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

        {/* Expanded Actions */}
        {showActions && (
          <div className="border-t border-pass-border p-3">
            <div className="grid grid-cols-2 gap-2 mb-3">
              <button 
                onClick={() => handleStartWorkflow('foh-morning')}
                disabled={isLoading}
                className="flex items-center gap-2 p-2 text-sm hover:bg-pass-border rounded transition-colors disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Workflow className="w-4 h-4 text-blue-400" />}
                FOH Morning
              </button>
              <button 
                onClick={() => handleStartWorkflow('boh-prep')}
                disabled={isLoading}
                className="flex items-center gap-2 p-2 text-sm hover:bg-pass-border rounded transition-colors disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Workflow className="w-4 h-4 text-blue-400" />}
                BOH Prep
              </button>
              <button 
                onClick={() => handleStartWorkflow('foh-closing')}
                disabled={isLoading}
                className="flex items-center gap-2 p-2 text-sm hover:bg-pass-border rounded transition-colors disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Workflow className="w-4 h-4 text-blue-400" />}
                FOH Closing
              </button>
              <button 
                onClick={() => handleStartWorkflow('boh-closing')}
                disabled={isLoading}
                className="flex items-center gap-2 p-2 text-sm hover:bg-pass-border rounded transition-colors disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Workflow className="w-4 h-4 text-blue-400" />}
                BOH Closing
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button className="flex items-center gap-2 p-2 text-sm hover:bg-pass-border rounded transition-colors">
                <Camera className="w-4 h-4 text-green-400" />
                Upload Photo
              </button>
              <button 
                onClick={handleSubmitReview}
                disabled={isLoading}
                className="flex items-center gap-2 p-2 text-sm hover:bg-pass-border rounded transition-colors disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <div className="w-4 h-4 text-yellow-400">⭐</div>}
                Submit Review
              </button>
              <button className="flex items-center gap-2 p-2 text-sm hover:bg-pass-border rounded transition-colors">
                <div className="w-4 h-4 text-red-400">⚠️</div>
                Report Issue
              </button>
              <button 
                onClick={() => user ? onSendMessage(`👋 Hi! I'm ${user.name} from ${user.department}. How can I help?`) : onSendMessage('👋 Hello! How can I help?')}
                className="flex items-center gap-2 p-2 text-sm hover:bg-pass-border rounded transition-colors"
              >
                <div className="w-4 h-4 text-purple-400">💬</div>
                Say Hello
              </button>
            </div>
            {error && (
              <div className="mt-2 text-sm text-red-400 bg-red-900 bg-opacity-20 p-2 rounded">
                {error}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Helper Text */}
      <div className="flex items-center justify-between mt-2 text-xs text-pass-text-muted">
        <div>
          Press <kbd className="px-1 py-0.5 bg-pass-border rounded">Enter</kbd> to send, 
          <kbd className="px-1 py-0.5 bg-pass-border rounded ml-1">Shift+Enter</kbd> for new line
        </div>
        <div>
          {message.length}/2000
        </div>
      </div>
    </div>
  )
}
