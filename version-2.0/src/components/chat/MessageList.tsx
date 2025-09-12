'use client'

import { useEffect, useRef } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import MessageCard from './MessageCard'
import WorkflowCard from '@/components/workflows/WorkflowCard'
import type { Message, User } from '@/types'
import { Hash } from 'lucide-react'

interface MessageListProps {
  messages: Message[]
  currentUser: User | null
  channelId: string
}

export default function MessageList({ messages, currentUser, channelId }: MessageListProps) {
  const { t } = useLanguage()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Hash className="w-16 h-16 text-pass-text-muted mx-auto mb-4 opacity-50" />
          <p className="text-pass-text-muted">{t('noMessages')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
      {messages.map((message, index) => {
        // Group messages by same user within 5 minutes
        const prevMessage = messages[index - 1]
        const showAvatar = !prevMessage || 
          prevMessage.user_id !== message.user_id ||
          (new Date(message.created_at).getTime() - new Date(prevMessage.created_at).getTime()) > 300000 // 5 minutes

        // Render different message types
        switch (message.message_type) {
          case 'workflow':
            return (
              <WorkflowCard
                key={message.id}
                message={message}
                showAvatar={showAvatar}
                isOwn={message.user_id === currentUser?.id}
              />
            )
          case 'system':
            return (
              <div key={message.id} className="system-message">
                {message.content}
              </div>
            )
          default:
            return (
              <MessageCard
                key={message.id}
                message={message}
                showAvatar={showAvatar}
                isOwn={message.user_id === currentUser?.id}
              />
            )
        }
      })}
      
      {/* Scroll anchor */}
      <div ref={messagesEndRef} />
    </div>
  )
}
