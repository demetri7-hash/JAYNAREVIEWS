'use client'

import type { Message } from '@/types'
import { 
  Star, 
  Camera, 
  MessageCircle, 
  MoreVertical,
  Smile
} from 'lucide-react'

interface MessageCardProps {
  message: Message
  showAvatar?: boolean
  isOwn?: boolean
}

export default function MessageCard({ message, showAvatar = true, isOwn = false }: MessageCardProps) {
  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString)
      const now = new Date()
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
      
      if (diffInMinutes < 1) return 'just now'
      if (diffInMinutes < 60) return `${diffInMinutes}m ago`
      if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
      
      return date.toLocaleDateString()
    } catch {
      return 'now'
    }
  }

  const getUserName = () => {
    // In a real app, this would come from the user relation
    return (message as any).user?.name || 'Unknown User'
  }

  const getAvatarUrl = () => {
    const name = getUserName()
    return (message as any).user?.avatar_url || 
           `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=4f46e5&color=ffffff`
  }

  return (
    <div className={`message-fade-in ${isOwn ? 'ml-12' : ''}`}>
      <div className="flex gap-3">
        {/* Avatar */}
        {showAvatar && (
          <img
            src={getAvatarUrl()}
            alt={getUserName()}
            className="w-8 h-8 rounded-lg flex-shrink-0"
          />
        )}
        
        {/* Message Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          {showAvatar && (
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-pass-text">
                {getUserName()}
              </span>
              <span className="text-xs text-pass-text-muted">
                {formatTime(message.created_at)}
              </span>
            </div>
          )}
          
          {/* Message Body */}
          <div className="text-pass-text">
            {message.message_type === 'photo' && message.metadata?.photo_url && (
              <div className="mb-2">
                <img
                  src={message.metadata.photo_url}
                  alt={message.metadata.photo_caption || 'Photo'}
                  className="photo-attachment max-w-xs rounded-lg"
                />
              </div>
            )}
            
            {message.content && (
              <div className="break-words">
                {message.content}
              </div>
            )}
            
            {/* Review Rating */}
            {message.message_type === 'review' && message.metadata?.rating && (
              <div className="flex items-center gap-2 mt-2">
                <div className="star-rating">
                  {Array.from({ length: 5 }, (_, i) => (
                    <span
                      key={i}
                      className={`star ${i < (message.metadata?.rating || 0) ? '' : 'empty'}`}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <span className="text-sm text-pass-text-muted">
                  {message.metadata.rating}/5
                </span>
              </div>
            )}
          </div>
          
          {/* Message Actions */}
          {!showAvatar && (
            <div className="opacity-0 group-hover:opacity-100 absolute right-4 top-1 flex items-center gap-1 bg-pass-sidebar border border-pass-border rounded-lg p-1 transition-opacity">
              <button className="p-1 hover:bg-pass-border rounded text-pass-text-muted hover:text-pass-text">
                <Smile className="w-4 h-4" />
              </button>
              <button className="p-1 hover:bg-pass-border rounded text-pass-text-muted hover:text-pass-text">
                <MessageCircle className="w-4 h-4" />
              </button>
              <button className="p-1 hover:bg-pass-border rounded text-pass-text-muted hover:text-pass-text">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
          )}
          
          {/* Thread Replies */}
          {message.reply_count && message.reply_count > 0 && (
            <div className="mt-2 text-sm text-pass-accent hover:text-pass-accent-hover cursor-pointer">
              {message.reply_count} {message.reply_count === 1 ? 'reply' : 'replies'}
            </div>
          )}
          
          {/* Reactions */}
          {message.reactions && message.reactions.length > 0 && (
            <div className="flex gap-1 mt-2">
              {message.reactions.map((reaction, index) => (
                <span key={index} className="reaction">
                  {reaction.emoji} 1
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
