// Analytics and Performance Monitoring System
import { DatabaseService } from './database'

export interface AnalyticsEvent {
  id?: string
  event_type: 'page_view' | 'task_completion' | 'workflow_start' | 'workflow_complete' | 'user_action' | 'error' | 'performance'
  user_id?: string
  session_id: string
  data: Record<string, any>
  timestamp?: Date
  metadata?: Record<string, any>
}

export interface PerformanceMetric {
  id?: string
  metric_type: 'page_load' | 'api_response' | 'component_render' | 'database_query' | 'user_interaction'
  value: number
  unit: 'ms' | 'seconds' | 'bytes' | 'count'
  context: Record<string, any>
  timestamp?: Date
  user_id?: string
}

export interface ShiftMetrics {
  shift_id: string
  start_time: Date
  end_time?: Date
  total_tasks: number
  completed_tasks: number
  completion_rate: number
  average_task_time: number
  delays_count: number
  efficiency_score: number
  quality_score?: number
  user_id: string
  workflow_performance: Record<string, any>
}

class AnalyticsService {
  private db: typeof DatabaseService
  private sessionId: string
  private performanceObserver?: PerformanceObserver
  private metricsBuffer: AnalyticsEvent[] = []
  private flushInterval: NodeJS.Timeout | null = null

  constructor() {
    this.db = DatabaseService
    this.sessionId = this.generateSessionId()
    this.setupPerformanceMonitoring()
    this.startMetricsBuffer()
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private setupPerformanceMonitoring() {
    if (typeof window === 'undefined') return

    // Monitor page load performance
    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      this.trackPerformance({
        metric_type: 'page_load',
        value: navigation.loadEventEnd - navigation.fetchStart,
        unit: 'ms',
        context: {
          page: window.location.pathname,
          navigation_type: navigation.type,
          dns_time: navigation.domainLookupEnd - navigation.domainLookupStart,
          connect_time: navigation.connectEnd - navigation.connectStart,
          response_time: navigation.responseEnd - navigation.responseStart,
          dom_ready: navigation.domContentLoadedEventEnd - navigation.fetchStart
        }
      })
    })

    // Monitor Core Web Vitals
    if ('PerformanceObserver' in window) {
      // Largest Contentful Paint (LCP)
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1]
        this.trackPerformance({
          metric_type: 'page_load',
          value: lastEntry.startTime,
          unit: 'ms',
          context: {
            metric: 'lcp',
            element: (lastEntry as any).element?.tagName,
            page: window.location.pathname
          }
        })
      })
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })

      // First Input Delay (FID)
      const fidObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          this.trackPerformance({
            metric_type: 'user_interaction',
            value: (entry as any).processingStart - entry.startTime,
            unit: 'ms',
            context: {
              metric: 'fid',
              interaction_type: (entry as any).name,
              page: window.location.pathname
            }
          })
        })
      })
      fidObserver.observe({ entryTypes: ['first-input'] })

      // Cumulative Layout Shift (CLS)
      let clsValue = 0
      const clsObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value
          }
        })
        this.trackPerformance({
          metric_type: 'page_load',
          value: clsValue,
          unit: 'count',
          context: {
            metric: 'cls',
            page: window.location.pathname
          }
        })
      })
      clsObserver.observe({ entryTypes: ['layout-shift'] })
    }
  }

  private startMetricsBuffer() {
    // Flush metrics every 10 seconds
    this.flushInterval = setInterval(() => {
      this.flushMetrics()
    }, 10000)
  }

  private async flushMetrics() {
    if (this.metricsBuffer.length === 0) return

    try {
      const events = [...this.metricsBuffer]
      this.metricsBuffer = []

      // Batch insert analytics events
      const result = await this.db.analytics.createEvents(events)
      if (!result.success) {
        throw result.error
      }
    } catch (error) {
      console.error('Failed to flush analytics metrics:', error)
      // Re-add events to buffer for retry
      this.metricsBuffer.unshift(...this.metricsBuffer)
    }
  }

  // Public methods for tracking events
  async trackEvent(event: Omit<AnalyticsEvent, 'session_id' | 'timestamp'>): Promise<void> {
    const fullEvent: AnalyticsEvent = {
      ...event,
      session_id: this.sessionId,
      timestamp: new Date()
    }

    // Add to buffer for batch processing
    this.metricsBuffer.push(fullEvent)

    // For critical events, flush immediately
    if (event.event_type === 'error') {
      await this.flushMetrics()
    }
  }

  async trackPerformance(metric: Omit<PerformanceMetric, 'timestamp'>): Promise<void> {
    try {
      const fullMetric: PerformanceMetric = {
        ...metric,
        timestamp: new Date()
      }

      const result = await this.db.analytics.createPerformanceMetric(fullMetric)
      if (!result.success) {
        throw result.error
      }
    } catch (error) {
      console.error('Failed to track performance metric:', error)
    }
  }

  async trackPageView(page: string, userId?: string): Promise<void> {
    await this.trackEvent({
      event_type: 'page_view',
      user_id: userId,
      data: {
        page,
        referrer: document.referrer,
        user_agent: navigator.userAgent,
        screen_resolution: `${screen.width}x${screen.height}`,
        viewport: `${window.innerWidth}x${window.innerHeight}`
      }
    })
  }

  async trackTaskCompletion(taskId: string, workflowId: string, userId: string, duration: number): Promise<void> {
    await this.trackEvent({
      event_type: 'task_completion',
      user_id: userId,
      data: {
        task_id: taskId,
        workflow_id: workflowId,
        duration_ms: duration,
        completion_time: new Date().toISOString()
      }
    })
  }

  async trackWorkflowStart(workflowId: string, userId: string): Promise<void> {
    await this.trackEvent({
      event_type: 'workflow_start',
      user_id: userId,
      data: {
        workflow_id: workflowId,
        start_time: new Date().toISOString()
      }
    })
  }

  async trackWorkflowComplete(workflowId: string, userId: string, totalDuration: number, metrics: any): Promise<void> {
    await this.trackEvent({
      event_type: 'workflow_complete',
      user_id: userId,
      data: {
        workflow_id: workflowId,
        total_duration_ms: totalDuration,
        completion_time: new Date().toISOString(),
        metrics
      }
    })
  }

  async trackUserAction(action: string, userId: string, data: Record<string, any>): Promise<void> {
    await this.trackEvent({
      event_type: 'user_action',
      user_id: userId,
      data: {
        action,
        ...data
      }
    })
  }

  async trackError(error: Error, context: Record<string, any>, userId?: string): Promise<void> {
    await this.trackEvent({
      event_type: 'error',
      user_id: userId,
      data: {
        error_message: error.message,
        error_stack: error.stack,
        error_name: error.name,
        context,
        user_agent: navigator.userAgent,
        page: window.location.pathname
      }
    })
  }

  // Analytics query methods
  async getShiftMetrics(userId: string, startDate: Date, endDate: Date): Promise<ShiftMetrics[]> {
    try {
      return await this.db.getShiftMetrics(userId, startDate, endDate)
    } catch (error) {
      console.error('Failed to get shift metrics:', error)
      return []
    }
  }

  async getUserPerformanceStats(userId: string, days: number = 30): Promise<any> {
    try {
      const endDate = new Date()
      const startDate = new Date(endDate.getTime() - (days * 24 * 60 * 60 * 1000))

      const [events, metrics, shifts] = await Promise.all([
        this.db.getAnalyticsEvents(userId, startDate, endDate),
        this.db.getPerformanceMetrics(userId, startDate, endDate),
        this.db.getShiftMetrics(userId, startDate, endDate)
      ])

      return {
        total_tasks: events.filter(e => e.event_type === 'task_completion').length,
        total_workflows: events.filter(e => e.event_type === 'workflow_complete').length,
        average_task_time: this.calculateAverageTaskTime(events),
        completion_rate: this.calculateCompletionRate(events),
        efficiency_trend: this.calculateEfficiencyTrend(shifts),
        performance_scores: this.calculatePerformanceScores(metrics),
        activity_summary: this.generateActivitySummary(events)
      }
    } catch (error) {
      console.error('Failed to get user performance stats:', error)
      return null
    }
  }

  async getSystemPerformanceReport(): Promise<any> {
    try {
      const endDate = new Date()
      const startDate = new Date(endDate.getTime() - (7 * 24 * 60 * 60 * 1000)) // Last 7 days

      const metrics = await this.db.getPerformanceMetrics(undefined, startDate, endDate)

      return {
        page_load_average: this.calculateAverageMetric(metrics, 'page_load'),
        api_response_average: this.calculateAverageMetric(metrics, 'api_response'),
        error_rate: this.calculateErrorRate(metrics),
        user_satisfaction: this.calculateUserSatisfaction(metrics),
        system_health: this.assessSystemHealth(metrics)
      }
    } catch (error) {
      console.error('Failed to get system performance report:', error)
      return null
    }
  }

  // Helper methods for calculations
  private calculateAverageTaskTime(events: AnalyticsEvent[]): number {
    const taskEvents = events.filter(e => e.event_type === 'task_completion')
    if (taskEvents.length === 0) return 0

    const totalTime = taskEvents.reduce((sum, event) => sum + (event.data.duration_ms || 0), 0)
    return totalTime / taskEvents.length
  }

  private calculateCompletionRate(events: AnalyticsEvent[]): number {
    const workflowStarts = events.filter(e => e.event_type === 'workflow_start').length
    const workflowCompletes = events.filter(e => e.event_type === 'workflow_complete').length
    
    if (workflowStarts === 0) return 0
    return (workflowCompletes / workflowStarts) * 100
  }

  private calculateEfficiencyTrend(shifts: ShiftMetrics[]): number[] {
    return shifts.map(shift => shift.efficiency_score).slice(-7) // Last 7 shifts
  }

  private calculatePerformanceScores(metrics: PerformanceMetric[]): any {
    const pageLoadMetrics = metrics.filter(m => m.metric_type === 'page_load')
    const apiMetrics = metrics.filter(m => m.metric_type === 'api_response')

    return {
      page_load_score: this.scorePerformance(pageLoadMetrics, 2000), // Good if under 2s
      api_response_score: this.scorePerformance(apiMetrics, 500), // Good if under 500ms
      overall_score: this.calculateOverallScore(metrics)
    }
  }

  private scorePerformance(metrics: PerformanceMetric[], threshold: number): number {
    if (metrics.length === 0) return 100

    const goodMetrics = metrics.filter(m => m.value <= threshold).length
    return (goodMetrics / metrics.length) * 100
  }

  private calculateOverallScore(metrics: PerformanceMetric[]): number {
    // Simplified scoring algorithm
    const avgScore = metrics.reduce((sum, metric) => {
      let score = 100
      if (metric.metric_type === 'page_load' && metric.value > 3000) score -= 30
      if (metric.metric_type === 'api_response' && metric.value > 1000) score -= 20
      return sum + Math.max(0, score)
    }, 0)

    return metrics.length > 0 ? avgScore / metrics.length : 100
  }

  private generateActivitySummary(events: AnalyticsEvent[]): any {
    const summary = events.reduce((acc, event) => {
      acc[event.event_type] = (acc[event.event_type] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return {
      ...summary,
      most_active_day: this.findMostActiveDay(events),
      peak_hours: this.findPeakHours(events)
    }
  }

  private findMostActiveDay(events: AnalyticsEvent[]): string {
    const dayCount = events.reduce((acc, event) => {
      const day = event.timestamp?.toDateString() || 'Unknown'
      acc[day] = (acc[day] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return Object.entries(dayCount).sort(([,a], [,b]) => b - a)[0]?.[0] || 'No data'
  }

  private findPeakHours(events: AnalyticsEvent[]): number[] {
    const hourCount = events.reduce((acc, event) => {
      const hour = event.timestamp?.getHours() || 0
      acc[hour] = (acc[hour] || 0) + 1
      return acc
    }, {} as Record<number, number>)

    return Object.entries(hourCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([hour]) => parseInt(hour))
  }

  private calculateAverageMetric(metrics: PerformanceMetric[], type: string): number {
    const filtered = metrics.filter(m => m.metric_type === type)
    if (filtered.length === 0) return 0
    
    return filtered.reduce((sum, m) => sum + m.value, 0) / filtered.length
  }

  private calculateErrorRate(metrics: PerformanceMetric[]): number {
    // This would need to be implemented based on how errors are tracked
    return 0
  }

  private calculateUserSatisfaction(metrics: PerformanceMetric[]): number {
    // Simplified satisfaction based on performance thresholds
    const good = metrics.filter(m => 
      (m.metric_type === 'page_load' && m.value < 2000) ||
      (m.metric_type === 'api_response' && m.value < 500)
    ).length

    return metrics.length > 0 ? (good / metrics.length) * 100 : 100
  }

  private assessSystemHealth(metrics: PerformanceMetric[]): 'excellent' | 'good' | 'fair' | 'poor' {
    const avgPageLoad = this.calculateAverageMetric(metrics, 'page_load')
    const avgApiResponse = this.calculateAverageMetric(metrics, 'api_response')

    if (avgPageLoad < 1500 && avgApiResponse < 300) return 'excellent'
    if (avgPageLoad < 2500 && avgApiResponse < 500) return 'good'
    if (avgPageLoad < 4000 && avgApiResponse < 1000) return 'fair'
    return 'poor'
  }

  // Cleanup method
  destroy() {
    if (this.flushInterval) {
      clearInterval(this.flushInterval)
    }
    this.flushMetrics() // Final flush
  }
}

// Singleton instance
export const analyticsService = new AnalyticsService()

// React hook for analytics
export function useAnalytics() {
  const trackPageView = (page: string, userId?: string) => {
    analyticsService.trackPageView(page, userId)
  }

  const trackUserAction = (action: string, userId: string, data: Record<string, any> = {}) => {
    analyticsService.trackUserAction(action, userId, data)
  }

  const trackTaskCompletion = (taskId: string, workflowId: string, userId: string, duration: number) => {
    analyticsService.trackTaskCompletion(taskId, workflowId, userId, duration)
  }

  const trackError = (error: Error, context: Record<string, any> = {}, userId?: string) => {
    analyticsService.trackError(error, context, userId)
  }

  return {
    trackPageView,
    trackUserAction,
    trackTaskCompletion,
    trackError,
    analytics: analyticsService
  }
}