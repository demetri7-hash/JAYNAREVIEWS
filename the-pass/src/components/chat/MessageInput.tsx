'use client'

import { useState, useRef, KeyboardEvent } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { 
  Send, 
  Paperclip, 
  Smile, 
  Camera,
  Plus,
  Workflow
} from 'lucide-react'

interface MessageInputProps {
  onSendMessage: (content: string) => void
  placeholder?: string
}

export default function MessageInput({ onSendMessage, placeholder }: MessageInputProps) {
  const { t } = useLanguage()
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
            <div className="grid grid-cols-2 gap-2">
              <button className="flex items-center gap-2 p-2 text-sm hover:bg-pass-border rounded transition-colors">
                <Workflow className="w-4 h-4 text-blue-400" />
                Start Workflow
              </button>
              <button className="flex items-center gap-2 p-2 text-sm hover:bg-pass-border rounded transition-colors">
                <Camera className="w-4 h-4 text-green-400" />
                Upload Photo
              </button>
              <button className="flex items-center gap-2 p-2 text-sm hover:bg-pass-border rounded transition-colors">
                <div className="w-4 h-4 text-yellow-400">⭐</div>
                Submit Review
              </button>
              <button className="flex items-center gap-2 p-2 text-sm hover:bg-pass-border rounded transition-colors">
                <div className="w-4 h-4 text-red-400">⚠️</div>
                Report Issue
              </button>
            </div>
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
