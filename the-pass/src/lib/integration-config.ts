/**
 * API Integration Configuration and Testing Utilities
 * Manages environment variables, validates API connections, and provides configuration helpers
 */

import { toastAPI, isToastConfigured } from './toast-api'
import { homebaseAPI, isHomebaseConfigured } from './homebase-api'

export interface IntegrationConfig {
  toast: {
    enabled: boolean
    configured: boolean
    apiKey: string
    restaurantId: string
    baseURL: string
    timeout: number
  }
  homebase: {
    enabled: boolean
    configured: boolean
    apiKey: string
    companyId: string
    baseURL: string
    timeout: number
  }
  features: {
    smartPrepLists: boolean
    intelligentTaskAssignment: boolean
    rushPeriodDetection: boolean
    automatedWorkflows: boolean
  }
  sync: {
    toastInterval: number
    homebaseInterval: number
    logRetentionDays: number
    errorRetentionDays: number
  }
  thresholds: {
    rushPeriodOrdersPerHour: number
    prepConfidence: number
    workloadBalanceFactor: number
  }
  monitoring: {
    debugLogging: boolean
    webhookURL?: string
    alertEmail?: string
  }
}

export class IntegrationConfigManager {
  private static instance: IntegrationConfigManager
  private config: IntegrationConfig

  private constructor() {
    this.config = this.loadConfiguration()
  }

  public static getInstance(): IntegrationConfigManager {
    if (!IntegrationConfigManager.instance) {
      IntegrationConfigManager.instance = new IntegrationConfigManager()
    }
    return IntegrationConfigManager.instance
  }

  /**
   * Get the complete integration configuration
   */
  public getConfig(): IntegrationConfig {
    return { ...this.config }
  }

  /**
   * Check if any integrations are enabled and configured
   */
  public hasIntegrationsEnabled(): boolean {
    return (this.config.toast.enabled && this.config.toast.configured) ||
           (this.config.homebase.enabled && this.config.homebase.configured)
  }

  /**
   * Check if specific integration is ready to use
   */
  public isIntegrationReady(integration: 'toast' | 'homebase'): boolean {
    const intConfig = this.config[integration]
    return intConfig.enabled && intConfig.configured
  }

  /**
   * Get missing configuration requirements
   */
  public getMissingConfiguration(): string[] {
    const missing: string[] = []

    if (this.config.toast.enabled && !this.config.toast.configured) {
      if (!this.config.toast.apiKey) missing.push('TOAST_API_KEY')
      if (!this.config.toast.restaurantId) missing.push('TOAST_RESTAURANT_ID')
    }

    if (this.config.homebase.enabled && !this.config.homebase.configured) {
      if (!this.config.homebase.apiKey) missing.push('HOMEBASE_API_KEY')
      if (!this.config.homebase.companyId) missing.push('HOMEBASE_COMPANY_ID')
    }

    return missing
  }

  /**
   * Validate and test all configured integrations
   */
  public async validateIntegrations(): Promise<{
    toast: { configured: boolean; connected: boolean; error?: string }
    homebase: { configured: boolean; connected: boolean; error?: string }
    overall: { ready: boolean; warnings: string[] }
  }> {
    const results = {
      toast: { configured: false, connected: false, error: undefined as string | undefined },
      homebase: { configured: false, connected: false, error: undefined as string | undefined },
      overall: { ready: false, warnings: [] as string[] }
    }

    // Test TOAST integration
    if (this.config.toast.enabled) {
      results.toast.configured = this.config.toast.configured
      
      if (this.config.toast.configured) {
        try {
          results.toast.connected = await toastAPI.testConnection()
        } catch (error) {
          results.toast.error = error instanceof Error ? error.message : 'Unknown connection error'
        }
      } else {
        results.toast.error = 'Missing configuration: ' + this.getMissingConfiguration().filter(key => key.startsWith('TOAST_')).join(', ')
      }
    }

    // Test Homebase integration
    if (this.config.homebase.enabled) {
      results.homebase.configured = this.config.homebase.configured
      
      if (this.config.homebase.configured) {
        try {
          results.homebase.connected = await homebaseAPI.testConnection()
        } catch (error) {
          results.homebase.error = error instanceof Error ? error.message : 'Unknown connection error'
        }
      } else {
        results.homebase.error = 'Missing configuration: ' + this.getMissingConfiguration().filter(key => key.startsWith('HOMEBASE_')).join(', ')
      }
    }

    // Determine overall readiness
    const toastReady = !this.config.toast.enabled || (results.toast.configured && results.toast.connected)
    const homebaseReady = !this.config.homebase.enabled || (results.homebase.configured && results.homebase.connected)
    results.overall.ready = toastReady && homebaseReady

    // Add warnings
    if (this.config.toast.enabled && !results.toast.connected) {
      results.overall.warnings.push('TOAST integration enabled but not connected')
    }
    if (this.config.homebase.enabled && !results.homebase.connected) {
      results.overall.warnings.push('Homebase integration enabled but not connected')
    }
    if (!this.hasIntegrationsEnabled()) {
      results.overall.warnings.push('No integrations enabled - THE PASS will work in standalone mode')
    }

    return results
  }

  /**
   * Get configuration summary for dashboard display
   */
  public getConfigurationSummary(): {
    integrations: { name: string; status: 'enabled' | 'disabled' | 'error'; configured: boolean }[]
    features: { name: string; enabled: boolean; description: string }[]
    sync: { name: string; interval: string; description: string }[]
  } {
    return {
      integrations: [
        {
          name: 'TOAST POS',
          status: this.config.toast.enabled ? (this.config.toast.configured ? 'enabled' : 'error') : 'disabled',
          configured: this.config.toast.configured
        },
        {
          name: 'Homebase Scheduling',
          status: this.config.homebase.enabled ? (this.config.homebase.configured ? 'enabled' : 'error') : 'disabled',
          configured: this.config.homebase.configured
        }
      ],
      features: [
        {
          name: 'Smart Prep Lists',
          enabled: this.config.features.smartPrepLists,
          description: 'Auto-generate prep tasks based on sales projections'
        },
        {
          name: 'Intelligent Task Assignment',
          enabled: this.config.features.intelligentTaskAssignment,
          description: 'Assign tasks to employees based on schedule and skills'
        },
        {
          name: 'Rush Period Detection',
          enabled: this.config.features.rushPeriodDetection,
          description: 'Automatically detect busy periods and create additional tasks'
        },
        {
          name: 'Automated Workflows',
          enabled: this.config.features.automatedWorkflows,
          description: 'Full automation including morning prep and shift transitions'
        }
      ],
      sync: [
        {
          name: 'TOAST Data Sync',
          interval: `${this.config.sync.toastInterval} minutes`,
          description: 'Sales data, inventory levels, menu performance'
        },
        {
          name: 'Homebase Data Sync',
          interval: `${this.config.sync.homebaseInterval} minutes`,
          description: 'Employee schedules, time clock, labor costs'
        }
      ]
    }
  }

  /**
   * Load configuration from environment variables
   */
  private loadConfiguration(): IntegrationConfig {
    return {
      toast: {
        enabled: this.getEnvBoolean('ENABLE_TOAST_INTEGRATION', true),
        configured: isToastConfigured(),
        apiKey: process.env.TOAST_API_KEY || '',
        restaurantId: process.env.TOAST_RESTAURANT_ID || '',
        baseURL: process.env.TOAST_BASE_URL || 'https://api.toasttab.com',
        timeout: this.getEnvNumber('TOAST_API_TIMEOUT', 30000)
      },
      homebase: {
        enabled: this.getEnvBoolean('ENABLE_HOMEBASE_INTEGRATION', true),
        configured: isHomebaseConfigured(),
        apiKey: process.env.HOMEBASE_API_KEY || '',
        companyId: process.env.HOMEBASE_COMPANY_ID || '',
        baseURL: process.env.HOMEBASE_BASE_URL || 'https://api.joinhomebase.com',
        timeout: this.getEnvNumber('HOMEBASE_API_TIMEOUT', 30000)
      },
      features: {
        smartPrepLists: this.getEnvBoolean('ENABLE_SMART_PREP_LISTS', true),
        intelligentTaskAssignment: this.getEnvBoolean('ENABLE_INTELLIGENT_TASK_ASSIGNMENT', true),
        rushPeriodDetection: this.getEnvBoolean('ENABLE_RUSH_PERIOD_DETECTION', true),
        automatedWorkflows: this.getEnvBoolean('ENABLE_AUTOMATED_WORKFLOWS', true)
      },
      sync: {
        toastInterval: this.getEnvNumber('TOAST_SYNC_INTERVAL', 15),
        homebaseInterval: this.getEnvNumber('HOMEBASE_SYNC_INTERVAL', 30),
        logRetentionDays: this.getEnvNumber('INTEGRATION_LOG_RETENTION_DAYS', 30),
        errorRetentionDays: this.getEnvNumber('SYNC_ERROR_RETENTION_DAYS', 7)
      },
      thresholds: {
        rushPeriodOrdersPerHour: this.getEnvNumber('RUSH_PERIOD_THRESHOLD', 50),
        prepConfidence: this.getEnvNumber('PREP_CONFIDENCE_THRESHOLD', 0.7),
        workloadBalanceFactor: this.getEnvNumber('WORKLOAD_BALANCE_FACTOR', 0.8)
      },
      monitoring: {
        debugLogging: this.getEnvBoolean('ENABLE_API_DEBUG_LOGGING', false),
        webhookURL: process.env.INTEGRATION_WEBHOOK_URL,
        alertEmail: process.env.INTEGRATION_ALERT_EMAIL
      }
    }
  }

  /**
   * Get environment variable as boolean with default
   */
  private getEnvBoolean(key: string, defaultValue: boolean): boolean {
    const value = process.env[key]
    if (value === undefined) return defaultValue
    return value.toLowerCase() === 'true'
  }

  /**
   * Get environment variable as number with default
   */
  private getEnvNumber(key: string, defaultValue: number): number {
    const value = process.env[key]
    if (value === undefined) return defaultValue
    const parsed = parseInt(value, 10)
    return isNaN(parsed) ? defaultValue : parsed
  }
}

// Export singleton instance
export const integrationConfig = IntegrationConfigManager.getInstance()

/**
 * Quick connection test utility for use in API routes or components
 */
export async function quickConnectionTest(): Promise<{
  toast: boolean
  homebase: boolean
  errors: string[]
}> {
  const errors: string[] = []
  let toastConnected = false
  let homebaseConnected = false

  const config = integrationConfig.getConfig()

  // Test TOAST if enabled
  if (config.toast.enabled && config.toast.configured) {
    try {
      toastConnected = await toastAPI.testConnection()
    } catch (error) {
      errors.push(`TOAST: ${error instanceof Error ? error.message : 'Connection failed'}`)
    }
  }

  // Test Homebase if enabled
  if (config.homebase.enabled && config.homebase.configured) {
    try {
      homebaseConnected = await homebaseAPI.testConnection()
    } catch (error) {
      errors.push(`Homebase: ${error instanceof Error ? error.message : 'Connection failed'}`)
    }
  }

  return {
    toast: toastConnected,
    homebase: homebaseConnected,
    errors
  }
}

/**
 * Environment validation utility
 */
export function validateEnvironmentSetup(): {
  valid: boolean
  errors: string[]
  warnings: string[]
  missingVariables: string[]
} {
  const errors: string[] = []
  const warnings: string[] = []
  const missingVariables: string[] = []

  const config = integrationConfig.getConfig()

  // Check for missing required variables
  const missing = integrationConfig.getMissingConfiguration()
  missingVariables.push(...missing)

  if (missing.length > 0) {
    errors.push(`Missing required environment variables: ${missing.join(', ')}`)
  }

  // Check for potentially problematic configurations
  if (config.toast.enabled && !config.toast.configured) {
    warnings.push('TOAST integration is enabled but not properly configured')
  }

  if (config.homebase.enabled && !config.homebase.configured) {
    warnings.push('Homebase integration is enabled but not properly configured')
  }

  if (config.monitoring.debugLogging && process.env.NODE_ENV === 'production') {
    warnings.push('Debug logging is enabled in production environment')
  }

  if (config.sync.toastInterval < 5) {
    warnings.push('TOAST sync interval is very frequent (<5 minutes) - may hit rate limits')
  }

  if (config.sync.homebaseInterval < 5) {
    warnings.push('Homebase sync interval is very frequent (<5 minutes) - may hit rate limits')
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    missingVariables
  }
}

/**
 * Configuration health check for system monitoring
 */
export async function configurationHealthCheck(): Promise<{
  status: 'healthy' | 'degraded' | 'unhealthy'
  details: {
    environment: 'valid' | 'invalid'
    connections: 'all_connected' | 'partially_connected' | 'none_connected'
    features: 'enabled' | 'limited' | 'disabled'
  }
  summary: string
}> {
  const envValidation = validateEnvironmentSetup()
  const connectionTest = await quickConnectionTest()
  const config = integrationConfig.getConfig()

  // Determine environment health
  const environmentHealth = envValidation.valid ? 'valid' : 'invalid'

  // Determine connection health
  let connectionHealth: 'all_connected' | 'partially_connected' | 'none_connected'
  const expectedConnections = []
  if (config.toast.enabled && config.toast.configured) expectedConnections.push('toast')
  if (config.homebase.enabled && config.homebase.configured) expectedConnections.push('homebase')

  const actualConnections = []
  if (connectionTest.toast) actualConnections.push('toast')
  if (connectionTest.homebase) actualConnections.push('homebase')

  if (expectedConnections.length === 0) {
    connectionHealth = 'none_connected' // No integrations enabled
  } else if (actualConnections.length === expectedConnections.length) {
    connectionHealth = 'all_connected'
  } else if (actualConnections.length > 0) {
    connectionHealth = 'partially_connected'
  } else {
    connectionHealth = 'none_connected'
  }

  // Determine feature health
  const enabledFeatures = Object.values(config.features).filter(Boolean).length
  const featureHealth = enabledFeatures > 2 ? 'enabled' : enabledFeatures > 0 ? 'limited' : 'disabled'

  // Overall status
  let status: 'healthy' | 'degraded' | 'unhealthy'
  if (environmentHealth === 'valid' && connectionHealth === 'all_connected' && featureHealth === 'enabled') {
    status = 'healthy'
  } else if (environmentHealth === 'valid' && connectionHealth !== 'none_connected') {
    status = 'degraded'
  } else {
    status = 'unhealthy'
  }

  // Summary message
  let summary = ''
  if (status === 'healthy') {
    summary = 'All integrations configured and connected successfully'
  } else if (status === 'degraded') {
    summary = `${expectedConnections.length - actualConnections.length} of ${expectedConnections.length} integrations having issues`
  } else {
    summary = 'Integration system requires configuration or troubleshooting'
  }

  return {
    status,
    details: {
      environment: environmentHealth,
      connections: connectionHealth,
      features: featureHealth
    },
    summary
  }
}