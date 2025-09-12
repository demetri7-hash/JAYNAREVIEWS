import React from 'react'
import { useRouter } from 'next/router'
import { useTranslation } from '@/context/TranslationContext'

interface BackButtonProps {
  href?: string
  label?: string
  className?: string
}

export default function BackButton({ 
  href, 
  label, 
  className = '' 
}: BackButtonProps) {
  const router = useRouter()
  const { t } = useTranslation()

  const handleBack = () => {
    if (href) {
      router.push(href)
    } else {
      router.back()
    }
  }

  return (
    <button
      onClick={handleBack}
      className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors ${className}`}
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
      </svg>
      <span>{label || t('actions.back')}</span>
    </button>
  )
}