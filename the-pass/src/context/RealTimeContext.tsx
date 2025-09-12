'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useSession } from 'next-auth/react'

export interface RealTimeMessage {
  id: string
  type: 'notification' | 'task_update' | 'review_update' | 'workflow_update' | 'system_announcement' | 'heartbeat'
  payload: any
  timestamp: string
  userId?: string
  broadcast?: boolean
}

interface RealTimeContextType {
  isConnected: boolean
  sendMessage: (message: Omit<RealTimeMessage, 'id' | 'timestamp'>) => void
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error'
  lastMessage: RealTimeMessage | null
  messageHistory: RealTimeMessage[]
  subscribe: (type: string, callback: (message: RealTimeMessage) => void) => () => void
  retryConnection: () => void
}

const RealTimeContext = createContext<RealTimeContextType | undefined>(undefined)

interface WebSocketManager {
  ws: WebSocket | null
  reconnectAttempts: number
  maxReconnectAttempts: number
  reconnectDelay: number
  subscribers: Map<string, Set<(message: RealTimeMessage) => void>>
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error'
  messageQueue: RealTimeMessage[]
  heartbeatInterval: NodeJS.Timeout | null
  lastHeartbeat: number
}

export function RealTimeProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession()
  const [wsManager, setWsManager] = useState<WebSocketManager>({
    ws: null,
    reconnectAttempts: 0,
    maxReconnectAttempts: 5,
    reconnectDelay: 1000,
    subscribers: new Map(),
    connectionStatus: 'disconnected',
    messageQueue: [],
    heartbeatInterval: null,
    lastHeartbeat: Date.now()
  })
  
  const [lastMessage, setLastMessage] = useState<RealTimeMessage | null>(null)
  const [messageHistory, setMessageHistory] = useState<RealTimeMessage[]>([])

  const createWebSocketConnection = () => {
    if (!session?.user?.id) return

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const wsUrl = `${protocol}//${window.location.host}/api/websocket?userId=${session.user.id}`

    try {
      setWsManager(prev => ({ ...prev, connectionStatus: 'connecting' }))
      
      const ws = new WebSocket(wsUrl)

      ws.onopen = () => {
        console.log('WebSocket connected')
        setWsManager(prev => ({
          ...prev,
          ws,
          connectionStatus: 'connected',
          reconnectAttempts: 0,
          lastHeartbeat: Date.now()
        }))

        // Start heartbeat
        const heartbeatInterval = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'heartbeat', timestamp: Date.now() }))
            setWsManager(prev => ({ ...prev, lastHeartbeat: Date.now() }))
          }
        }, 30000) // 30 seconds

        setWsManager(prev => ({ ...prev, heartbeatInterval }))

        // Send queued messages
        wsManager.messageQueue.forEach(message => {
          ws.send(JSON.stringify(message))
        })
        setWsManager(prev => ({ ...prev, messageQueue: [] }))
      }

      ws.onmessage = (event) => {
        try {
          const message: RealTimeMessage = JSON.parse(event.data)
          
          // Skip heartbeat responses
          if (message.type === 'heartbeat') return

          // Add unique ID if not present
          if (!message.id) {
            message.id = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
          }

          setLastMessage(message)
          setMessageHistory(prev => [...prev.slice(-99), message]) // Keep last 100 messages

          // Notify subscribers
          const typeSubscribers = wsManager.subscribers.get(message.type) || new Set()
          const allSubscribers = wsManager.subscribers.get('*') || new Set()
          
          const combinedSubscribers = Array.from(typeSubscribers).concat(Array.from(allSubscribers))
          combinedSubscribers.forEach((callback: (message: RealTimeMessage) => void) => {
            try {
              callback(message)
            } catch (error) {
              console.error('Error in subscriber callback:', error)
            }
          })

          // Handle specific message types
          switch (message.type) {
            case 'notification':
              // Show browser notification if permission granted
              if (Notification.permission === 'granted') {
                new Notification(message.payload.title || 'New Notification', {
                  body: message.payload.message,
                  icon: '/favicon.ico',
                  tag: message.id
                })
              }
              break
            
            case 'system_announcement':
              // Handle system announcements
              console.log('System announcement:', message.payload)
              break
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error)
        }
      }

      ws.onclose = () => {
        console.log('WebSocket disconnected')
        setWsManager(prev => {
          if (prev.heartbeatInterval) {
            clearInterval(prev.heartbeatInterval)
          }
          return {
            ...prev,
            ws: null,
            connectionStatus: 'disconnected',
            heartbeatInterval: null
          }
        })

        // Attempt reconnection
        if (wsManager.reconnectAttempts < wsManager.maxReconnectAttempts) {
          setTimeout(() => {
            setWsManager(prev => ({
              ...prev,
              reconnectAttempts: prev.reconnectAttempts + 1,
              reconnectDelay: Math.min(prev.reconnectDelay * 2, 30000) // Max 30 seconds
            }))
            createWebSocketConnection()
          }, wsManager.reconnectDelay)
        }
      }

      ws.onerror = (error) => {
        console.error('WebSocket error:', error)
        setWsManager(prev => ({ ...prev, connectionStatus: 'error' }))
      }

    } catch (error) {
      console.error('Failed to create WebSocket connection:', error)
      setWsManager(prev => ({ ...prev, connectionStatus: 'error' }))
    }
  }

  const sendMessage = (message: Omit<RealTimeMessage, 'id' | 'timestamp'>) => {
    const fullMessage: RealTimeMessage = {
      ...message,
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      userId: session?.user?.id
    }

    if (wsManager.ws && wsManager.ws.readyState === WebSocket.OPEN) {
      wsManager.ws.send(JSON.stringify(fullMessage))
    } else {
      // Queue message for when connection is restored
      setWsManager(prev => ({
        ...prev,
        messageQueue: [...prev.messageQueue, fullMessage]
      }))
    }
  }

  const subscribe = (type: string, callback: (message: RealTimeMessage) => void) => {
    if (!wsManager.subscribers.has(type)) {
      wsManager.subscribers.set(type, new Set())
    }
    wsManager.subscribers.get(type)!.add(callback)

    // Return unsubscribe function
    return () => {
      const subscribers = wsManager.subscribers.get(type)
      if (subscribers) {
        subscribers.delete(callback)
        if (subscribers.size === 0) {
          wsManager.subscribers.delete(type)
        }
      }
    }
  }

  const retryConnection = () => {
    setWsManager(prev => ({
      ...prev,
      reconnectAttempts: 0,
      reconnectDelay: 1000
    }))
    createWebSocketConnection()
  }

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  // Create WebSocket connection when user is authenticated
  useEffect(() => {
    if (session?.user?.id && !wsManager.ws) {
      createWebSocketConnection()
    }

    return () => {
      if (wsManager.ws) {
        wsManager.ws.close()
      }
      if (wsManager.heartbeatInterval) {
        clearInterval(wsManager.heartbeatInterval)
      }
    }
  }, [session?.user?.id])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (wsManager.ws) {
        wsManager.ws.close()
      }
      if (wsManager.heartbeatInterval) {
        clearInterval(wsManager.heartbeatInterval)
      }
    }
  }, [])

  const value: RealTimeContextType = {
    isConnected: wsManager.connectionStatus === 'connected',
    sendMessage,
    connectionStatus: wsManager.connectionStatus,
    lastMessage,
    messageHistory,
    subscribe,
    retryConnection
  }

  return (
    <RealTimeContext.Provider value={value}>
      {children}
    </RealTimeContext.Provider>
  )
}

export function useRealTime() {
  const context = useContext(RealTimeContext)
  if (context === undefined) {
    throw new Error('useRealTime must be used within a RealTimeProvider')
  }
  return context
}

// Custom hooks for specific real-time features
export function useNotifications() {
  const { subscribe, sendMessage } = useRealTime()
  const [notifications, setNotifications] = useState<RealTimeMessage[]>([])

  useEffect(() => {
    const unsubscribe = subscribe('notification', (message) => {
      setNotifications(prev => [message, ...prev.slice(0, 49)]) // Keep last 50
    })

    return unsubscribe
  }, [subscribe])

  const sendNotification = (payload: any) => {
    sendMessage({
      type: 'notification',
      payload,
      broadcast: true
    })
  }

  return { notifications, sendNotification }
}

export function useTaskUpdates() {
  const { subscribe, sendMessage } = useRealTime()
  const [taskUpdates, setTaskUpdates] = useState<RealTimeMessage[]>([])

  useEffect(() => {
    const unsubscribe = subscribe('task_update', (message) => {
      setTaskUpdates(prev => [message, ...prev.slice(0, 19)]) // Keep last 20
    })

    return unsubscribe
  }, [subscribe])

  const sendTaskUpdate = (payload: any) => {
    sendMessage({
      type: 'task_update',
      payload
    })
  }

  return { taskUpdates, sendTaskUpdate }
}

export function useWorkflowUpdates() {
  const { subscribe, sendMessage } = useRealTime()
  const [workflowUpdates, setWorkflowUpdates] = useState<RealTimeMessage[]>([])

  useEffect(() => {
    const unsubscribe = subscribe('workflow_update', (message) => {
      setWorkflowUpdates(prev => [message, ...prev.slice(0, 19)]) // Keep last 20
    })

    return unsubscribe
  }, [subscribe])

  const sendWorkflowUpdate = (payload: any) => {
    sendMessage({
      type: 'workflow_update',
      payload
    })
  }

  return { workflowUpdates, sendWorkflowUpdate }
}