'use client'

import { useEffect } from 'react'

export function PWAProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Only register service worker in production and if supported
    if (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      process.env.NODE_ENV === 'production'
    ) {
      registerServiceWorker()
    }
  }, [])

  return <>{children}</>
}

async function registerServiceWorker() {
  try {
    console.log('[PWA] Registering service worker...')
    
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
      updateViaCache: 'none'
    })

    console.log('[PWA] Service worker registered successfully:', registration)

    // Check for updates
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing
      if (newWorker) {
        console.log('[PWA] New service worker installing...')
        
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              // New version available
              console.log('[PWA] New version available')
              showUpdatePrompt(registration)
            } else {
              // First time installation
              console.log('[PWA] App cached for offline use')
              showOfflineReadyMessage()
            }
          }
        })
      }
    })

    // Listen for controlling service worker changing
    let refreshing = false
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (refreshing) return
      refreshing = true
      window.location.reload()
    })

  } catch (error) {
    console.error('[PWA] Service worker registration failed:', error)
  }
}

function showUpdatePrompt(registration: ServiceWorkerRegistration) {
  // Create a simple update prompt
  const updatePrompt = document.createElement('div')
  updatePrompt.id = 'pwa-update-prompt'
  updatePrompt.className = 'fixed bottom-4 left-4 right-4 z-50 sm:left-auto sm:right-4 sm:w-96'
  updatePrompt.innerHTML = `
    <div class="bg-blue-600 text-white rounded-lg shadow-lg p-4">
      <div class="flex items-center justify-between">
        <div>
          <h3 class="font-medium">Update Available</h3>
          <p class="text-sm text-blue-100 mt-1">A new version of the app is ready.</p>
        </div>
        <div class="flex space-x-2">
          <button id="pwa-update-btn" class="bg-white text-blue-600 px-3 py-1 rounded text-sm font-medium hover:bg-blue-50">
            Update
          </button>
          <button id="pwa-dismiss-btn" class="text-blue-100 hover:text-white">
            ✕
          </button>
        </div>
      </div>
    </div>
  `

  document.body.appendChild(updatePrompt)

  // Handle update button click
  const updateBtn = document.getElementById('pwa-update-btn')
  updateBtn?.addEventListener('click', () => {
    if (registration.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' })
    }
    updatePrompt.remove()
  })

  // Handle dismiss button click
  const dismissBtn = document.getElementById('pwa-dismiss-btn')
  dismissBtn?.addEventListener('click', () => {
    updatePrompt.remove()
  })

  // Auto-dismiss after 10 seconds
  setTimeout(() => {
    if (document.getElementById('pwa-update-prompt')) {
      updatePrompt.remove()
    }
  }, 10000)
}

function showOfflineReadyMessage() {
  // Create a simple offline ready message
  const offlineMessage = document.createElement('div')
  offlineMessage.className = 'fixed bottom-4 left-4 right-4 z-50 sm:left-auto sm:right-4 sm:w-96'
  offlineMessage.innerHTML = `
    <div class="bg-green-600 text-white rounded-lg shadow-lg p-4">
      <div class="flex items-center justify-between">
        <div>
          <h3 class="font-medium">Ready for Offline Use</h3>
          <p class="text-sm text-green-100 mt-1">The app has been cached for offline access.</p>
        </div>
        <button class="text-green-100 hover:text-white" onclick="this.parentElement.parentElement.remove()">
          ✕
        </button>
      </div>
    </div>
  `

  document.body.appendChild(offlineMessage)

  // Auto-dismiss after 5 seconds
  setTimeout(() => {
    if (offlineMessage.parentElement) {
      offlineMessage.remove()
    }
  }, 5000)
}

// Utility functions for PWA features
export const pwaUtils = {
  // Check if app is installed
  isInstalled(): boolean {
    return window.matchMedia('(display-mode: standalone)').matches ||
           (window.navigator as any).standalone === true
  },

  // Check if app is installable
  isInstallable(): boolean {
    return !this.isInstalled() && 'serviceWorker' in navigator
  },

  // Request persistent storage (for offline data)
  async requestPersistentStorage(): Promise<boolean> {
    if ('storage' in navigator && 'persist' in navigator.storage) {
      return await navigator.storage.persist()
    }
    return false
  },

  // Get storage usage estimate
  async getStorageEstimate(): Promise<StorageEstimate | null> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      return await navigator.storage.estimate()
    }
    return null
  },

  // Share content using Web Share API
  async share(data: ShareData): Promise<boolean> {
    if ('share' in navigator) {
      try {
        await navigator.share(data)
        return true
      } catch (error) {
        console.error('Share failed:', error)
        return false
      }
    }
    return false
  },

  // Add to home screen prompt
  async promptInstall(): Promise<boolean> {
    const deferredPrompt = (window as any).deferredPrompt
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const choiceResult = await deferredPrompt.userChoice
      return choiceResult.outcome === 'accepted'
    }
    return false
  },

  // Get device info for responsive features
  getDeviceInfo() {
    return {
      isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
      isIOS: /iPad|iPhone|iPod/.test(navigator.userAgent),
      isAndroid: /Android/.test(navigator.userAgent),
      hasTouch: 'ontouchstart' in window,
      isStandalone: this.isInstalled(),
      orientation: window.screen?.orientation?.type || 'unknown'
    }
  },

  // Register for push notifications
  async requestNotificationPermission(): Promise<NotificationPermission> {
    if ('Notification' in window) {
      return await Notification.requestPermission()
    }
    return 'denied'
  }
}
