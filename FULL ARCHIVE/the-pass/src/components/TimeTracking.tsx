'use client'

import { useState, useEffect, useRef } from 'react'
import { 
  Play, 
  Pause, 
  Square, 
  Timer, 
  TrendingUp, 
  Award,
  Clock,
  Target,
  Zap
} from 'lucide-react'

interface TimeTrackingProps {
  taskId: string
  taskTitle: string
  estimatedDuration?: number
  onTimeUpdate?: (duration: number) => void
  onComplete?: (totalTime: number) => void
}

export function TimeTracking({ 
  taskId, 
  taskTitle, 
  estimatedDuration, 
  onTimeUpdate, 
  onComplete 
}: TimeTrackingProps) {
  const [isRunning, setIsRunning] = useState(false)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [startTime, setStartTime] = useState<Date | null>(null)
  const [pausedTime, setPausedTime] = useState(0)
  const [sessions, setSessions] = useState<Array<{start: Date, end?: Date, duration?: number}>>([])
  const intervalRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    // Load saved time from localStorage
    const savedData = localStorage.getItem(`task-time-${taskId}`)
    if (savedData) {
      const { elapsedTime: saved, sessions: savedSessions } = JSON.parse(savedData)
      setElapsedTime(saved)
      setSessions(savedSessions || [])
    }
  }, [taskId])

  useEffect(() => {
    if (isRunning && startTime) {
      intervalRef.current = setInterval(() => {
        const now = new Date()
        const sessionTime = Math.floor((now.getTime() - startTime.getTime()) / 1000)
        const totalTime = pausedTime + sessionTime
        setElapsedTime(totalTime)
        onTimeUpdate?.(totalTime)
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRunning, startTime, pausedTime, onTimeUpdate])

  const startTimer = () => {
    const now = new Date()
    setStartTime(now)
    setIsRunning(true)
    
    // Add new session
    const newSession = { start: now }
    setSessions(prev => [...prev, newSession])
    
    // Save to localStorage
    saveTimeData(elapsedTime, [...sessions, newSession])
  }

  const pauseTimer = () => {
    if (startTime) {
      const now = new Date()
      const sessionDuration = Math.floor((now.getTime() - startTime.getTime()) / 1000)
      const totalTime = pausedTime + sessionDuration
      
      setIsRunning(false)
      setPausedTime(totalTime)
      setStartTime(null)
      
      // Update last session
      const updatedSessions = sessions.map((session, index) => 
        index === sessions.length - 1 
          ? { ...session, end: now, duration: sessionDuration }
          : session
      )
      setSessions(updatedSessions)
      
      // Save to localStorage
      saveTimeData(totalTime, updatedSessions)
    }
  }

  const stopTimer = () => {
    if (isRunning) {
      pauseTimer()
    }
    
    const finalTime = pausedTime || elapsedTime
    onComplete?.(finalTime)
    
    // Clear saved data
    localStorage.removeItem(`task-time-${taskId}`)
  }

  const resetTimer = () => {
    setIsRunning(false)
    setElapsedTime(0)
    setStartTime(null)
    setPausedTime(0)
    setSessions([])
    
    // Clear saved data
    localStorage.removeItem(`task-time-${taskId}`)
  }

  const saveTimeData = (time: number, sessionData: typeof sessions) => {
    localStorage.setItem(`task-time-${taskId}`, JSON.stringify({
      elapsedTime: time,
      sessions: sessionData
    }))
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  const getEfficiencyColor = () => {
    if (!estimatedDuration) return 'text-gray-600'
    
    const efficiency = estimatedDuration / (elapsedTime / 60)
    if (efficiency >= 1.2) return 'text-green-600'
    if (efficiency >= 0.8) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getEfficiencyIcon = () => {
    if (!estimatedDuration) return <Timer className="w-4 h-4" />
    
    const efficiency = estimatedDuration / (elapsedTime / 60)
    if (efficiency >= 1.2) return <Award className="w-4 h-4" />
    if (efficiency >= 0.8) return <Target className="w-4 h-4" />
    return <Zap className="w-4 h-4" />
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Timer className="w-5 h-5 text-blue-600" />
          <h3 className="font-medium text-gray-900">Time Tracking</h3>
        </div>
        {estimatedDuration && (
          <div className="flex items-center space-x-1 text-xs text-gray-500">
            <Clock className="w-3 h-3" />
            <span>Est. {estimatedDuration}m</span>
          </div>
        )}
      </div>

      {/* Timer Display */}
      <div className="text-center mb-6">
        <div className="text-3xl font-mono font-bold text-gray-900 mb-2">
          {formatTime(elapsedTime)}
        </div>
        <p className="text-sm text-gray-600 truncate">{taskTitle}</p>
        
        {estimatedDuration && elapsedTime > 0 && (
          <div className={`flex items-center justify-center space-x-1 mt-2 ${getEfficiencyColor()}`}>
            {getEfficiencyIcon()}
            <span className="text-xs font-medium">
              {elapsedTime / 60 > estimatedDuration ? 'Over' : 'Under'} estimated time
            </span>
          </div>
        )}
      </div>

      {/* Control Buttons */}
      <div className="flex space-x-2 mb-4">
        {!isRunning ? (
          <button
            onClick={startTimer}
            className="flex-1 flex items-center justify-center space-x-2 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
          >
            <Play className="w-4 h-4" />
            <span>{elapsedTime > 0 ? 'Resume' : 'Start'}</span>
          </button>
        ) : (
          <button
            onClick={pauseTimer}
            className="flex-1 flex items-center justify-center space-x-2 bg-yellow-600 text-white py-2 px-4 rounded-lg hover:bg-yellow-700 transition-colors"
          >
            <Pause className="w-4 h-4" />
            <span>Pause</span>
          </button>
        )}
        
        <button
          onClick={stopTimer}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          disabled={elapsedTime === 0}
        >
          <Square className="w-4 h-4" />
        </button>
        
        <button
          onClick={resetTimer}
          className="px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors"
          disabled={elapsedTime === 0}
        >
          Reset
        </button>
      </div>

      {/* Session History */}
      {sessions.length > 0 && (
        <div className="border-t pt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Work Sessions</h4>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {sessions.map((session, index) => (
              <div key={index} className="flex justify-between items-center text-xs text-gray-600">
                <span>
                  {session.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  {session.end && ` - ${session.end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                </span>
                {session.duration && (
                  <span className="font-mono">{formatTime(session.duration)}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Stats */}
      {elapsedTime > 0 && (
        <div className="border-t pt-4 mt-4">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-gray-900">{sessions.length}</div>
              <div className="text-xs text-gray-500">Sessions</div>
            </div>
            <div>
              <div className="text-lg font-bold text-gray-900">
                {sessions.length > 0 ? formatTime(Math.floor(elapsedTime / sessions.length)) : '0:00'}
              </div>
              <div className="text-xs text-gray-500">Avg/Session</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Productivity Insights Component
export function ProductivityInsights({ 
  dailyStats, 
  weeklyTrend 
}: { 
  dailyStats: {
    tasksCompleted: number
    totalTime: number
    avgTimePerTask: number
    efficiency: number
  }
  weeklyTrend: Array<{
    date: string
    tasksCompleted: number
    totalTime: number
    efficiency: number
  }>
}) {
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  const getEfficiencyBadge = (efficiency: number) => {
    if (efficiency >= 120) return { label: 'Excellent', color: 'bg-green-100 text-green-800' }
    if (efficiency >= 100) return { label: 'Great', color: 'bg-blue-100 text-blue-800' }
    if (efficiency >= 80) return { label: 'Good', color: 'bg-yellow-100 text-yellow-800' }
    return { label: 'Needs Focus', color: 'bg-red-100 text-red-800' }
  }

  const badge = getEfficiencyBadge(dailyStats.efficiency)

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-gray-900">Today's Productivity</h3>
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
          {badge.label}
        </div>
      </div>

      {/* Daily Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{dailyStats.tasksCompleted}</div>
          <div className="text-xs text-gray-500">Tasks Completed</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {formatDuration(dailyStats.totalTime)}
          </div>
          <div className="text-xs text-gray-500">Total Time</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">
            {formatDuration(dailyStats.avgTimePerTask)}
          </div>
          <div className="text-xs text-gray-500">Avg per Task</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600">{dailyStats.efficiency}%</div>
          <div className="text-xs text-gray-500">Efficiency</div>
        </div>
      </div>

      {/* Weekly Trend */}
      {weeklyTrend.length > 0 && (
        <div className="border-t pt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">7-Day Trend</h4>
          <div className="space-y-2">
            {weeklyTrend.slice(-7).map((day, index) => (
              <div key={day.date} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-xs text-gray-600">
                    {new Date(day.date).toLocaleDateString([], { weekday: 'short' })}
                  </span>
                </div>
                <div className="flex items-center space-x-3 text-xs">
                  <span className="text-gray-600">{day.tasksCompleted} tasks</span>
                  <span className="text-gray-600">{formatDuration(day.totalTime)}</span>
                  <span className={`font-medium ${
                    day.efficiency >= 100 ? 'text-green-600' : 
                    day.efficiency >= 80 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {day.efficiency}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Performance Tips */}
      <div className="border-t pt-4 mt-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">💡 Productivity Tips</h4>
        <div className="text-xs text-gray-600 space-y-1">
          {dailyStats.efficiency < 80 && (
            <p>• Consider breaking larger tasks into smaller chunks</p>
          )}
          {dailyStats.avgTimePerTask > 60 && (
            <p>• Try the Pomodoro technique for better focus</p>
          )}
          {dailyStats.tasksCompleted < 3 && (
            <p>• Set specific goals for each work session</p>
          )}
          <p>• Take regular breaks to maintain productivity</p>
        </div>
      </div>
    </div>
  )
}
