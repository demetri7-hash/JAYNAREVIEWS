'use client'

import { useState, useEffect } from 'react'
import { supabase, db } from '@/lib/supabase'
import { useLanguage } from '@/contexts/LanguageContext'
import ChannelList from '@/components/chat/ChannelList'
import MessageList from '@/components/chat/MessageList'
import MessageInput from '@/components/chat/MessageInput'
import WorkflowSidebar from '@/components/workflows/WorkflowSidebar'
import type { Channel, Message, User } from '@/types'
import { 
  Hash, 
  Users, 
  Settings, 
  Phone, 
  Globe,
  Menu,
  X
} from 'lucide-react'

export default function ThePassApp() {
  const { language, setLanguage, t } = useLanguage()
  const [user, setUser] = useState<User | null>(null)
  const [channels, setChannels] = useState<Channel[]>([])
  const [activeChannel, setActiveChannel] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Initialize app
  useEffect(() => {
    initializeApp()
    setMounted(true)
  }, [])

  const initializeApp = async () => {
    try {
      // Check authentication
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        // Set user from session
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.name || session.user.email || 'User',
          avatar_url: session.user.user_metadata?.avatar_url,
          language_preference: 'en',
          notification_settings: {
            workflow_updates: true,
            mentions: true,
            reviews: true,
            system_alerts: true,
            email_notifications: false,
            push_notifications: true
          },
          status: 'online',
          last_seen: new Date().toISOString(),
          created_at: new Date().toISOString()
        })
      } else {
        // Create demo user for now
        setUser({
          id: 'demo-user-' + Date.now(),
          email: 'demo@thepass.com',
          name: 'Demo User',
          avatar_url: 'https://ui-avatars.com/api/?name=Demo+User&background=4f46e5&color=ffffff',
          language_preference: language,
          notification_settings: {
            workflow_updates: true,
            mentions: true,
            reviews: true,
            system_alerts: true,
            email_notifications: false,
            push_notifications: true
          },
          status: 'online',
          last_seen: new Date().toISOString(),
          created_at: new Date().toISOString()
        })
      }

      // Load channels
      await loadChannels()
      
      setLoading(false)
    } catch (error) {
      console.error('Failed to initialize app:', error)
      setLoading(false)
    }
  }

  const loadChannels = async () => {
    try {
      const channelData = await db.getChannels()
      setChannels(channelData)
      
      // Auto-select first channel if none selected
      if (channelData.length > 0 && !activeChannel) {
        setActiveChannel(channelData[0].id)
      }
    } catch (error) {
      console.error('Failed to load channels:', error)
    }
  }

  const loadMessages = async (channelId: string) => {
    try {
      const messageData = await db.getMessages(channelId)
      setMessages(messageData)
    } catch (error) {
      console.error('Failed to load messages:', error)
    }
  }

  const handleChannelSelect = (channelId: string) => {
    setActiveChannel(channelId)
    loadMessages(channelId)
    setSidebarOpen(false) // Close sidebar on mobile
  }

  const handleSendMessage = async (content: string) => {
    if (!activeChannel || !user) return

    try {
      const newMessage = await db.createMessage({
        channel_id: activeChannel,
        user_id: user.id,
        content,
        message_type: 'text'
      })

      if (newMessage) {
        setMessages(prev => [...prev, newMessage])
      }
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }

  const createDefaultChannels = async () => {
    if (!user) return

    const defaultChannels = [
      {
        name: 'general',
        description: 'General discussions and announcements',
        type: 'utility' as const,
        department: 'BOTH' as const,
        created_by: user.id
      },
      {
        name: 'foh-today',
        description: 'Front of house daily operations',
        type: 'workflow' as const,
        department: 'FOH' as const,
        created_by: user.id
      },
      {
        name: 'boh-today',
        description: 'Back of house daily operations',
        type: 'workflow' as const,
        department: 'BOH' as const,
        created_by: user.id
      },
      {
        name: 'reviews',
        description: 'Daily reviews and team feedback',
        type: 'management' as const,
        department: 'BOTH' as const,
        created_by: user.id
      }
    ]

    try {
      for (const channelData of defaultChannels) {
        await db.createChannel(channelData)
      }
      await loadChannels()
    } catch (error) {
      console.error('Failed to create default channels:', error)
    }
  }

  // Show loading screen
  if (loading || !mounted) {
    return (
      <div className="flex items-center justify-center h-screen bg-pass-dark">
        <div className="text-center">
          <div className="spinner mb-4"></div>
          <h1 className="text-2xl font-bold text-pass-text mb-2">{t('appName')}</h1>
          <p className="text-pass-text-muted">{t('loading')}</p>
        </div>
      </div>
    )
  }

  const activeChannelData = channels.find(c => c.id === activeChannel)

  return (
    <div className="flex h-screen bg-pass-dark text-pass-text">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        w-64 bg-pass-sidebar border-r border-pass-border flex flex-col
        fixed inset-y-0 left-0 z-50 transform transition-transform duration-200 ease-in-out
        md:relative md:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Header */}
        <div className="p-4 border-b border-pass-border">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold">{t('appName')}</h1>
              <div className="flex items-center text-xs text-pass-text-muted">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                {user?.name}
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden text-pass-text-muted hover:text-pass-text"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Channel List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <ChannelList
            channels={channels}
            activeChannel={activeChannel}
            onChannelSelect={handleChannelSelect}
            onCreateChannel={createDefaultChannels}
          />
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-pass-border">
          <div className="flex items-center justify-between text-xs text-pass-text-muted">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as any)}
                className="bg-transparent border-none text-xs"
              >
                <option value="en">EN</option>
                <option value="es">ES</option>
                <option value="tr">TR</option>
              </select>
            </div>
            <a
              href="tel:916-513-3192"
              className="flex items-center gap-1 hover:text-red-400"
            >
              <Phone className="w-3 h-3" />
              <span className="hidden sm:inline">Emergency</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-pass-dark border-b border-pass-border p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="md:hidden text-pass-text-muted hover:text-pass-text"
              >
                <Menu className="w-5 h-5" />
              </button>
              <Hash className="w-5 h-5 text-pass-text-muted" />
              <h2 className="text-lg font-semibold">
                {activeChannelData?.name || t('selectChannel')}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-pass-text-muted" />
              <span className="text-sm text-pass-text-muted">1</span>
            </div>
          </div>
          {activeChannelData?.description && (
            <p className="text-sm text-pass-text-muted mt-1">
              {activeChannelData.description}
            </p>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-hidden">
          {activeChannel ? (
            <MessageList 
              messages={messages}
              currentUser={user}
              channelId={activeChannel}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Hash className="w-16 h-16 text-pass-text-muted mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">{t('welcome')}</h3>
                <p className="text-pass-text-muted mb-6">{t('selectChannel')}</p>
                {channels.length === 0 && (
                  <button
                    onClick={createDefaultChannels}
                    className="px-4 py-2 bg-pass-accent hover:bg-pass-accent-hover text-white rounded-md transition-colors"
                  >
                    {t('createChannel')}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Message Input */}
        {activeChannel && (
          <MessageInput
            onSendMessage={handleSendMessage}
            placeholder={t('typeMessage')}
          />
        )}
      </div>
    </div>
  )
}
