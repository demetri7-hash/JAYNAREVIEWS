'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/contexts/LanguageContext'
import { supabase } from '@/lib/supabase'
import Button from '@/components/ui/Button'
import { 
  ArrowRight,
  Star,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Info
} from 'lucide-react'

interface ReviewCheckProps {
  department: 'FOH' | 'BOH'
  shiftType: string
  onContinue: () => void
}

export default function ReviewCheck({ department, shiftType, onContinue }: ReviewCheckProps) {
  const { language } = useLanguage()
  const router = useRouter()
  const [hasReview, setHasReview] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)

  // Translation helper
  const t = (key: string) => {
    const translations: any = {
      en: {
        checkingReviews: 'Checking Reviews...',
        previousShiftReview: 'Previous Shift Review',
        reviewRequired: 'Review Required',
        reviewFoundMessage: 'A review from the previous shift has been found. Please review it before starting your checklist.',
        noReviewMessage: 'No review found from the previous shift. You can proceed directly to your opening checklist.',
        viewReview: 'View Review',
        continueToChecklist: 'Continue to Checklist',
        skipForNow: 'Skip for Now'
      },
      es: {
        checkingReviews: 'Verificando Revisiones...',
        previousShiftReview: 'Revisión de Turno Anterior',
        reviewRequired: 'Revisión Requerida',
        reviewFoundMessage: 'Se encontró una revisión del turno anterior. Por favor revísala antes de comenzar tu lista de verificación.',
        noReviewMessage: 'No se encontró revisión del turno anterior. Puedes proceder directamente a tu lista de verificación de apertura.',
        viewReview: 'Ver Revisión',
        continueToChecklist: 'Continuar a Lista de Verificación',
        skipForNow: 'Omitir por Ahora'
      },
      tr: {
        checkingReviews: 'İncelemeler Kontrol Ediliyor...',
        previousShiftReview: 'Önceki Vardiya İncelemesi',
        reviewRequired: 'İnceleme Gerekli',
        reviewFoundMessage: 'Önceki vardiyadan bir inceleme bulundu. Kontrol listenize başlamadan önce lütfen inceleyin.',
        noReviewMessage: 'Önceki vardiyadan inceleme bulunamadı. Doğrudan açılış kontrol listenize geçebilirsiniz.',
        viewReview: 'İncelemeyi Görüntüle',
        continueToChecklist: 'Kontrol Listesine Devam Et',
        skipForNow: 'Şimdilik Atla'
      }
    }
    return translations[language]?.[key] || key
  }

  useEffect(() => {
    checkForReview()
  }, [department])

  const checkForReview = async () => {
    setLoading(true)
    try {
      // Get yesterday's date
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayStr = yesterday.toISOString().split('T')[0]

      // Check for close review from yesterday
      const { data, error } = await supabase
        .from('close_reviews')
        .select('id')
        .eq('department', department)
        .eq('shift_date', yesterdayStr)
        .order('created_at', { ascending: false })
        .limit(1)

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      setHasReview(data && data.length > 0)
    } catch (error) {
      console.error('Error checking for reviews:', error)
      setHasReview(false)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('checkingReviews')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="max-w-2xl w-full mx-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-6">
            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
              hasReview ? 'bg-yellow-100' : 'bg-green-100'
            }`}>
              {hasReview ? (
                <Star className="h-8 w-8 text-yellow-600" />
              ) : (
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              )}
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {t('previousShiftReview')}
            </h2>
          </div>

          {hasReview ? (
            <>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <div className="flex items-start">
                  <Info className="h-5 w-5 text-yellow-600 mr-3 mt-0.5" />
                  <p className="text-yellow-800 text-sm">
                    {t('reviewFoundMessage')}
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={() => router.push(`/review/close?department=${department}`)}
                  className="bg-yellow-600 hover:bg-yellow-700 flex-1"
                >
                  <Star className="h-4 w-4 mr-2" />
                  {t('viewReview')}
                </Button>
                <Button
                  variant="outline"
                  onClick={onContinue}
                  className="flex-1"
                >
                  <ArrowRight className="h-4 w-4 mr-2" />
                  {t('skipForNow')}
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <div className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mr-3 mt-0.5" />
                  <p className="text-green-800 text-sm">
                    {t('noReviewMessage')}
                  </p>
                </div>
              </div>
              
              <Button
                onClick={onContinue}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                <ArrowRight className="h-4 w-4 mr-2" />
                {t('continueToChecklist')}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
