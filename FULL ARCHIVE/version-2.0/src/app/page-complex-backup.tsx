'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useLanguage } from '@/contexts/LanguageContext'
import ChannelList from '@/components/chat/ChannelList'
import MessageList from '@/components/chat/MessageList'
import MessageInput from '@/components/chat/MessageInput'
import type { Channel, Message, User } from '@/types'
import { 
  Hash, 
  Users, 
  Settings, 
  Phone, 
  Globe,
  Menu,
  X,
  LogOut,
  UserCheck,
  Clock,
  Shield,
  PlayCircle
} from 'lucide-react'

export default function ThePassApp() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { language, setLanguage, t } = useLanguage()
  const [user, setUser] = useState<User | null>(null)
  const [channels, setChannels] = useState<Channel[]>([])
  const [activeChannel, setActiveChannel] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [showWorkflows, setShowWorkflows] = useState(false)

  // Check authentication status
  useEffect(() => {
    if (status === 'loading') return
    
    if (!session) {
      router.push('/auth/signin')
      return
    }

    // Set user from session
    if (session.user) {
      const userData: User = {
        id: session.user.email || '',
        name: session.user.name || '',
        email: session.user.email || '',
        avatar: session.user.image || '',
        role: (session.user as any).role || 'employee',
        department: (session.user as any).department || 'FOH',
        isActive: (session.user as any).is_active || false,
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
      }
      setUser(userData)
    }

    initializeApp()
    setMounted(true)
  }, [session, status, router])

  // Initialize app
  const initializeApp = async () => {
    try {
      await loadChannels()
      setLoading(false)
    } catch (error) {
      console.error('Failed to initialize app:', error)
      setLoading(false)
    }
  }

  const loadChannels = async () => {
    try {
      const { data: channelData, error } = await supabase
        .from('channels')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error loading channels:', error)
        return
      }
      
      setChannels(channelData || [])
      
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
      const { data: messageData, error } = await supabase
        .from('messages')
        .select('*')
        .eq('channel_id', channelId)
        .order('created_at', { ascending: true })

      if (error) {
        console.error('Error loading messages:', error)
        return
      }
      
      setMessages(messageData || [])
    } catch (error) {
      console.error('Failed to load messages:', error)
    }
  }

  const handleChannelSelect = (channelId: string) => {
    setActiveChannel(channelId)
    loadMessages(channelId)
    setSidebarOpen(false)
  }

  const handleSendMessage = async (content: string) => {
    if (!user || !activeChannel) return

    try {
      // Create message using Supabase directly for now
      const { error } = await supabase
        .from('messages')
        .insert({
          channel_id: activeChannel,
          content,
          user_id: user.id,
          message_type: 'text',
          metadata: {
            user_name: user.name,
            user_avatar: user.avatar
          }
        })
      
      if (error) throw error
      
      // Reload messages
      loadMessages(activeChannel)
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }

  const createDefaultChannels = async () => {
    if (!session?.user?.employee) return

    try {
      const defaultChannels = [
        { name: 'foh-morning', description: 'Front of House Morning Operations' },
        { name: 'boh-prep', description: 'Back of House Prep & Kitchen' },
        { name: 'foh-closing', description: 'Front of House Closing Procedures' },
        { name: 'management', description: 'Management Communications' }
      ]

      for (const channel of defaultChannels) {
        const { error } = await supabase
          .from('channels')
          .insert({
            ...channel,
            created_by: session.user.employee.id,
            created_at: new Date().toISOString()
          })

        if (error) {
          console.error('Error creating channel:', channel.name, error)
        }
      }

      await loadChannels()
    } catch (error) {
      console.error('Failed to create channels:', error)
    }
  }

  const startWorkflow = async (workflowType: string) => {
    if (!session?.user?.employee) return

    try {
      const response = await fetch('/api/workflow/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          workflow_type: workflowType,
          employee_name: session.user.employee.name,
          employee_id: session.user.employee.id,
          department: session.user.employee.department
        })
      })

      const data = await response.json()
      
      if (data.success) {
        // Redirect to workflow execution page
        router.push(`/workflows/${data.worksheet.id}`)
      } else {
        alert('Failed to start workflow: ' + data.error)
      }
    } catch (error) {
      alert('Failed to start workflow')
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (!session) {
    return null // Will redirect to signin
  }

  // User needs approval
  if (session.user && !(session.user as any).is_active) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 p-8 text-center">
          <div className="mx-auto h-12 w-12 flex items-center justify-center bg-yellow-100 rounded-full">
            <Clock className="h-6 w-6 text-yellow-600" />
          </div>
          <div>
            <h2 className="mt-6 text-3xl font-bold text-gray-900">
              Account Pending Approval
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Your account has been created but requires manager approval before you can access the system.
            </p>
            <p className="mt-4 text-sm text-gray-500">
              Signed in as: {session.user.email}
            </p>
          </div>
          <button
            onClick={() => signOut()}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Sign Out
          </button>
        </div>
      </div>
    )
  }

  if (!mounted) {
    return <div className="min-h-screen bg-gray-50"></div>
  }

  const activeChannelData = channels.find(c => c.id === activeChannel)

  return (
    <div className="h-screen flex bg-gray-100">
      {/* Sidebar */}
      <div className={`${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } fixed inset-y-0 left-0 z-50 w-64 bg-slate-800 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
        
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-4 bg-slate-900">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center">
              <span className="text-white font-bold text-sm">JG</span>
            </div>
            <span className="text-white font-semibold">Jayna Gyro</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-400 hover:text-white"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-slate-700">
          <div className="flex items-center space-x-3">
            <img
              src={user?.avatar || '/default-avatar.png'}
              alt={user?.name}
              className="w-8 h-8 rounded-full"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user?.name}
              </p>
              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                  {user?.role}
                </span>
                <span className="text-xs text-gray-400">{user?.department}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto">
          {/* Workflows Section */}
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-300">Workflows</h3>
              <button
                onClick={() => setShowWorkflows(!showWorkflows)}
                className="text-gray-400 hover:text-white"
              >
                <PlayCircle className="h-4 w-4" />
              </button>
            </div>
            
            {showWorkflows && (
              <div className="space-y-1">
                <button
                  onClick={() => startWorkflow('foh-opening')}
                  className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-slate-700 rounded"
                >
                  FOH Opening (33 tasks)
                </button>
                <button
                  onClick={() => startWorkflow('foh-closing')}
                  className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-slate-700 rounded"
                >
                  FOH Closing (13 tasks)
                </button>
                <button
                  onClick={() => startWorkflow('boh-prep')}
                  className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-slate-700 rounded"
                >
                  BOH Prep (6 tasks)
                </button>
                <button
                  onClick={() => startWorkflow('missing-ingredients')}
                  className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-slate-700 rounded text-red-300"
                >
                  Report Missing Items
                </button>
              </div>
            )}
          </div>

          {/* Channels */}
          <ChannelList
            channels={channels}
            activeChannel={activeChannel}
            onChannelSelect={handleChannelSelect}
            onCreateChannel={createDefaultChannels}
          />
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700 space-y-2">
          {/* Manager Access */}
          {(user?.role === 'manager' || user?.role === 'admin') && (
            <button
              onClick={() => router.push('/admin/users')}
              className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-300 hover:bg-slate-700 rounded"
            >
              <Shield className="h-4 w-4" />
              <span>User Management</span>
            </button>
          )}
          
          <button
            onClick={() => signOut()}
            className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-300 hover:bg-slate-700 rounded"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <Menu className="h-6 w-6" />
            </button>
            
            <div className="flex items-center space-x-2">
              <Hash className="h-5 w-5 text-gray-400" />
              <span className="font-medium text-gray-900">
                {activeChannelData?.name || 'Select a channel'}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button className="text-gray-400 hover:text-gray-600">
              <Phone className="h-5 w-5" />
            </button>
            <button className="text-gray-400 hover:text-gray-600">
              <Users className="h-5 w-5" />
            </button>
            <button className="text-gray-400 hover:text-gray-600">
              <Settings className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        {activeChannel ? (
          <div className="flex-1 flex flex-col">
            <MessageList 
              messages={messages} 
              currentUser={user}
              channelId={activeChannel}
            />
            <MessageInput onSendMessage={handleSendMessage} />
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Hash className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No channel selected</h3>
              <p className="mt-1 text-sm text-gray-500">
                {channels.length === 0 ? (
                  <>
                    Get started by creating some channels.
                    <button
                      onClick={createDefaultChannels}
                      className="ml-1 text-indigo-600 hover:text-indigo-500"
                    >
                      Create default channels
                    </button>
                  </>
                ) : (
                  'Choose a channel from the sidebar to start chatting.'
                )}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}
