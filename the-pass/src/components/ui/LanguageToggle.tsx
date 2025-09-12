import React, { useState } from 'react'
import { useTranslation, languageNames, languageFlags } from '@/context/TranslationContext'

interface LanguageToggleProps {
  className?: string
  compact?: boolean
}

export default function LanguageToggle({ className = '', compact = false }: LanguageToggleProps) {
  const { language, setLanguage, t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)

  const languages = [
    { code: 'en' as const, name: languageNames.en, flag: languageFlags.en },
    { code: 'es' as const, name: languageNames.es, flag: languageFlags.es },
    { code: 'tr' as const, name: languageNames.tr, flag: languageFlags.tr }
  ]

  const currentLanguage = languages.find(lang => lang.code === language)

  const handleLanguageChange = (langCode: 'en' | 'es' | 'tr') => {
    setLanguage(langCode)
    setIsOpen(false)
  }

  if (compact) {
    return (
      <div className={`relative ${className}`}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-1 px-2 py-1 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
          title={t('nav.language')}
        >
          <span className="text-lg">{currentLanguage?.flag}</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-10" 
              onClick={() => setIsOpen(false)}
            />
            
            {/* Dropdown */}
            <div className="absolute right-0 mt-1 py-1 bg-white rounded-md shadow-lg border border-gray-200 z-20 min-w-[120px]">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                  className={`w-full flex items-center space-x-2 px-3 py-2 text-sm hover:bg-gray-100 transition-colors ${
                    language === lang.code ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                  }`}
                >
                  <span className="text-base">{lang.flag}</span>
                  <span className="font-medium">{lang.name}</span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
      >
        <span className="text-xl">{currentLanguage?.flag}</span>
        <span className="font-medium text-gray-700">{currentLanguage?.name}</span>
        <svg 
          className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 mt-2 py-2 bg-white rounded-lg shadow-xl border border-gray-200 z-20 min-w-[160px]">
            <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">
              {t('nav.selectLanguage')}
            </div>
            
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={`w-full flex items-center space-x-3 px-4 py-3 text-sm hover:bg-gray-50 transition-colors ${
                  language === lang.code ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                }`}
              >
                <span className="text-xl">{lang.flag}</span>
                <div className="flex-1 text-left">
                  <div className="font-medium">{lang.name}</div>
                  <div className="text-xs text-gray-500">
                    {lang.code === 'en' && 'English'}
                    {lang.code === 'es' && 'Mexican Spanish'}
                    {lang.code === 'tr' && 'Turkish'}
                  </div>
                </div>
                {language === lang.code && (
                  <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}