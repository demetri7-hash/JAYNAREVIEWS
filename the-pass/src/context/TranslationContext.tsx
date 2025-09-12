import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import translations, { Translation } from '@/lib/translations'

type Language = 'en' | 'es' | 'tr'

interface TranslationContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
  formatString: (template: string, ...args: any[]) => string
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined)

// Helper function to get nested translation value
function getNestedTranslation(obj: any, key: string): string {
  const keys = key.split('.')
  let result = obj
  
  for (const k of keys) {
    if (result && typeof result === 'object' && k in result) {
      result = result[k]
    } else {
      return key // Return the key if translation not found
    }
  }
  
  return typeof result === 'string' ? result : key
}

interface TranslationProviderProps {
  children: ReactNode
}

export function TranslationProvider({ children }: TranslationProviderProps) {
  const [language, setLanguageState] = useState<Language>('en')

  // Load saved language preference on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('app-language') as Language
    if (savedLanguage && ['en', 'es', 'tr'].includes(savedLanguage)) {
      setLanguageState(savedLanguage)
    } else {
      // Detect browser language
      const browserLang = navigator.language.toLowerCase()
      if (browserLang.startsWith('es')) {
        setLanguageState('es')
      } else if (browserLang.startsWith('tr')) {
        setLanguageState('tr')
      } else {
        setLanguageState('en')
      }
    }
  }, [])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem('app-language', lang)
    
    // Update document language attribute
    document.documentElement.lang = lang
    
    // Update document direction for RTL languages if needed
    // (Turkish and Spanish are LTR, but this is here for future expansion)
    document.documentElement.dir = 'ltr'
  }

  const t = (key: string): string => {
    return getNestedTranslation(translations[language], key)
  }

  const formatString = (template: string, ...args: any[]): string => {
    return template.replace(/{(\d+)}/g, (match, number) => {
      return typeof args[number] !== 'undefined' ? args[number] : match
    })
  }

  const value: TranslationContextType = {
    language,
    setLanguage,
    t,
    formatString
  }

  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  )
}

export function useTranslation() {
  const context = useContext(TranslationContext)
  if (context === undefined) {
    throw new Error('useTranslation must be used within a TranslationProvider')
  }
  return context
}

// Language names for the language selector
export const languageNames = {
  en: 'English',
  es: 'Español',
  tr: 'Türkçe'
}

// Language flags/icons
export const languageFlags = {
  en: '🇺🇸',
  es: '🇲🇽', 
  tr: '🇹🇷'
}