'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import type { Language } from '@/types'

interface LanguageContextType {
  language: Language
  setLanguage: (language: Language) => void
  t: (key: string, params?: Record<string, string>) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

// Enhanced translations with The Pass terminology
const translations = {
  en: {
    // App Core
    appName: 'The Pass',
    welcome: 'Welcome to The Pass',
    selectChannel: 'Select a channel to start collaborating',
    
    // Channels
    channels: 'Channels',
    createChannel: 'Create Channel',
    joinChannel: 'Join Channel',
    channelDescription: 'Channel Description',
    
    // Workflows
    startWorkflow: 'Start Workflow',
    completeWorkflow: 'Complete Workflow',
    workflowInProgress: 'Workflow In Progress',
    workflowComplete: 'Workflow Completed',
    checklistItem: 'Checklist Item',
    
    // Messages
    typeMessage: 'Type your message...',
    sendMessage: 'Send',
    uploadPhoto: 'Upload Photo',
    addReaction: 'Add Reaction',
    reply: 'Reply',
    
    // Departments & Shifts
    foh: 'Front of House',
    boh: 'Back of House',
    morning: 'Morning',
    evening: 'Evening',
    closing: 'Closing',
    
    // Actions
    complete: 'Complete',
    start: 'Start',
    pause: 'Pause',
    resume: 'Resume',
    save: 'Save',
    cancel: 'Cancel',
    edit: 'Edit',
    delete: 'Delete',
    
    // Status
    online: 'Online',
    away: 'Away',
    busy: 'Busy',
    offline: 'Offline',
    
    // Reviews
    submitReview: 'Submit Review',
    overallRating: 'Overall Rating',
    cleanliness: 'Cleanliness',
    equipment: 'Equipment',
    inventory: 'Inventory',
    comments: 'Comments',
    
    // Analytics
    dailyStats: 'Daily Stats',
    completionRate: 'Completion Rate',
    activeEmployees: 'Active Employees',
    averageRating: 'Average Rating',
    
    // Notifications
    newMessage: 'New message',
    workflowStarted: 'Workflow started',
    workflowCompleted: 'Workflow completed',
    reviewSubmitted: 'Review submitted',
    
    // Errors
    error: 'Error',
    loading: 'Loading...',
    noMessages: 'No messages yet',
    connectionError: 'Connection error',
    
    // Time
    justNow: 'just now',
    minutesAgo: 'minutes ago',
    hoursAgo: 'hours ago',
    yesterday: 'yesterday',
    
    // Emergency
    emergency: 'EMERGENCY',
    emergencyContact: 'Emergency Contact',
    callManager: 'Call Manager: (916) 513-3192'
  },
  es: {
    // App Core
    appName: 'The Pass',
    welcome: 'Bienvenido a The Pass',
    selectChannel: 'Selecciona un canal para comenzar a colaborar',
    
    // Channels
    channels: 'Canales',
    createChannel: 'Crear Canal',
    joinChannel: 'Unirse al Canal',
    channelDescription: 'Descripción del Canal',
    
    // Workflows
    startWorkflow: 'Iniciar Flujo de Trabajo',
    completeWorkflow: 'Completar Flujo de Trabajo',
    workflowInProgress: 'Flujo de Trabajo en Progreso',
    workflowComplete: 'Flujo de Trabajo Completado',
    checklistItem: 'Elemento de Lista',
    
    // Messages
    typeMessage: 'Escribe tu mensaje...',
    sendMessage: 'Enviar',
    uploadPhoto: 'Subir Foto',
    addReaction: 'Añadir Reacción',
    reply: 'Responder',
    
    // Departments & Shifts
    foh: 'Frente de Casa',
    boh: 'Fondo de Casa',
    morning: 'Mañana',
    evening: 'Tarde',
    closing: 'Cierre',
    
    // Actions
    complete: 'Completar',
    start: 'Iniciar',
    pause: 'Pausar',
    resume: 'Reanudar',
    save: 'Guardar',
    cancel: 'Cancelar',
    edit: 'Editar',
    delete: 'Eliminar',
    
    // Status
    online: 'En línea',
    away: 'Ausente',
    busy: 'Ocupado',
    offline: 'Desconectado',
    
    // Reviews
    submitReview: 'Enviar Revisión',
    overallRating: 'Calificación General',
    cleanliness: 'Limpieza',
    equipment: 'Equipo',
    inventory: 'Inventario',
    comments: 'Comentarios',
    
    // Analytics
    dailyStats: 'Estadísticas Diarias',
    completionRate: 'Tasa de Finalización',
    activeEmployees: 'Empleados Activos',
    averageRating: 'Calificación Promedio',
    
    // Notifications
    newMessage: 'Nuevo mensaje',
    workflowStarted: 'Flujo de trabajo iniciado',
    workflowCompleted: 'Flujo de trabajo completado',
    reviewSubmitted: 'Revisión enviada',
    
    // Errors
    error: 'Error',
    loading: 'Cargando...',
    noMessages: 'Aún no hay mensajes',
    connectionError: 'Error de conexión',
    
    // Time
    justNow: 'ahora mismo',
    minutesAgo: 'minutos atrás',
    hoursAgo: 'horas atrás',
    yesterday: 'ayer',
    
    // Emergency
    emergency: 'EMERGENCIA',
    emergencyContact: 'Contacto de Emergencia',
    callManager: 'Llamar al Gerente: (916) 513-3192'
  },
  tr: {
    // App Core
    appName: 'The Pass',
    welcome: 'The Pass\'a Hoş Geldiniz',
    selectChannel: 'İşbirliği yapmaya başlamak için bir kanal seçin',
    
    // Channels
    channels: 'Kanallar',
    createChannel: 'Kanal Oluştur',
    joinChannel: 'Kanala Katıl',
    channelDescription: 'Kanal Açıklaması',
    
    // Workflows
    startWorkflow: 'İş Akışını Başlat',
    completeWorkflow: 'İş Akışını Tamamla',
    workflowInProgress: 'İş Akışı Devam Ediyor',
    workflowComplete: 'İş Akışı Tamamlandı',
    checklistItem: 'Kontrol Listesi Öğesi',
    
    // Messages
    typeMessage: 'Mesajınızı yazın...',
    sendMessage: 'Gönder',
    uploadPhoto: 'Fotoğraf Yükle',
    addReaction: 'Tepki Ekle',
    reply: 'Yanıtla',
    
    // Departments & Shifts
    foh: 'Ön Salon',
    boh: 'Mutfak',
    morning: 'Sabah',
    evening: 'Akşam',
    closing: 'Kapanış',
    
    // Actions
    complete: 'Tamamla',
    start: 'Başlat',
    pause: 'Duraklat',
    resume: 'Devam Et',
    save: 'Kaydet',
    cancel: 'İptal',
    edit: 'Düzenle',
    delete: 'Sil',
    
    // Status
    online: 'Çevrimiçi',
    away: 'Uzakta',
    busy: 'Meşgul',
    offline: 'Çevrimdışı',
    
    // Reviews
    submitReview: 'İnceleme Gönder',
    overallRating: 'Genel Değerlendirme',
    cleanliness: 'Temizlik',
    equipment: 'Ekipman',
    inventory: 'Envanter',
    comments: 'Yorumlar',
    
    // Analytics
    dailyStats: 'Günlük İstatistikler',
    completionRate: 'Tamamlanma Oranı',
    activeEmployees: 'Aktif Çalışanlar',
    averageRating: 'Ortalama Değerlendirme',
    
    // Notifications
    newMessage: 'Yeni mesaj',
    workflowStarted: 'İş akışı başlatıldı',
    workflowCompleted: 'İş akışı tamamlandı',
    reviewSubmitted: 'İnceleme gönderildi',
    
    // Errors
    error: 'Hata',
    loading: 'Yükleniyor...',
    noMessages: 'Henüz mesaj yok',
    connectionError: 'Bağlantı hatası',
    
    // Time
    justNow: 'şimdi',
    minutesAgo: 'dakika önce',
    hoursAgo: 'saat önce',
    yesterday: 'dün',
    
    // Emergency
    emergency: 'ACİL DURUM',
    emergencyContact: 'Acil Durum İletişim',
    callManager: 'Müdürü Ara: (916) 513-3192'
  }
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('en')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Load saved language preference
    try {
      const savedLanguage = localStorage.getItem('the-pass-language') as Language
      if (savedLanguage && ['en', 'es', 'tr'].includes(savedLanguage)) {
        setLanguage(savedLanguage)
      }
    } catch (error) {
      console.warn('Failed to load language preference:', error)
    }
    setMounted(true)
  }, [])

  const updateLanguage = (newLanguage: Language) => {
    setLanguage(newLanguage)
    if (mounted) {
      try {
        localStorage.setItem('the-pass-language', newLanguage)
      } catch (error) {
        console.warn('Failed to save language preference:', error)
      }
    }
  }

  const t = (key: string, params?: Record<string, string>): string => {
    const keys = key.split('.')
    let value: any = translations[language]
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k]
      } else {
        // Fallback to English
        value = translations.en as any
        for (const fallbackKey of keys) {
          if (value && typeof value === 'object' && fallbackKey in value) {
            value = value[fallbackKey]
          } else {
            return key // Return key if not found
          }
        }
        break
      }
    }
    
    if (typeof value !== 'string') {
      return key
    }
    
    // Replace parameters
    if (params) {
      return Object.entries(params).reduce((str, [param, replacement]) => {
        return str.replace(new RegExp(`{{${param}}}`, 'g'), replacement)
      }, value)
    }
    
    return value
  }

  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-screen bg-pass-dark text-pass-text">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pass-accent"></div>
      </div>
    )
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage: updateLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
