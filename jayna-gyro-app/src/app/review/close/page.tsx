'use client'

import { useState, useEffect } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { db, supabase } from '@/lib/supabase'
import Button from '@/components/ui/Button'
import { 
  ArrowLeft,
  Star,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Camera,
  MessageSquare,
  Info
} from 'lucide-react'
import { useRouter } from 'next/navigation'

interface CloseReview {
  id: string
  shift_date: string
  template_name: string
  department: 'FOH' | 'BOH'
  scores: any
  overall_pass: boolean
  issues_found: string[]
  photos?: string[]
  notes?: string
  reviewer_name: string
  created_at: string
}

interface ReviewTemplate {
  template_name: string
  department: 'FOH' | 'BOH'
  review_categories: any
  pass_threshold: number
}

export default function CloseReviewPage() {
  const { language } = useLanguage()
  const router = useRouter()
  const [review, setReview] = useState<CloseReview | null>(null)
  const [template, setTemplate] = useState<ReviewTemplate | null>(null)
  const [loading, setLoading] = useState(true)
  const [department] = useState<'FOH' | 'BOH'>('FOH') // This would come from route params

  // Translation helper
  const t = (key: string) => {
    const translations: any = {
      en: {
        previousCloseReview: 'Previous Close Review',
        noReviewAvailable: 'No Review Available',
        noReviewMessage: 'No close review found for yesterday. This usually means the previous shift needs to complete their closing review.',
        overallScore: 'Overall Score',
        passed: 'PASSED',
        failed: 'FAILED',
        issuesFound: 'Issues Found',
        reviewerNotes: 'Reviewer Notes',
        continueToChecklist: 'Continue to Checklist',
        backToMain: 'Back to Main Menu',
        reviewDate: 'Review Date',
        reviewedBy: 'Reviewed By',
        categories: 'Categories',
        score: 'Score',
        maxScore: 'Max Score',
        passThreshold: 'Pass Threshold',
        viewPhoto: 'View Photo'
      },
      es: {
        previousCloseReview: 'Revisión de Cierre Anterior',
        noReviewAvailable: 'No Hay Revisión Disponible',
        noReviewMessage: 'No se encontró revisión de cierre para ayer. Esto generalmente significa que el turno anterior necesita completar su revisión de cierre.',
        overallScore: 'Puntuación General',
        passed: 'APROBADO',
        failed: 'REPROBADO',
        issuesFound: 'Problemas Encontrados',
        reviewerNotes: 'Notas del Revisor',
        continueToChecklist: 'Continuar a Lista de Verificación',
        backToMain: 'Volver al Menú Principal',
        reviewDate: 'Fecha de Revisión',
        reviewedBy: 'Revisado Por',
        categories: 'Categorías',
        score: 'Puntuación',
        maxScore: 'Puntuación Máxima',
        passThreshold: 'Umbral de Aprobación',
        viewPhoto: 'Ver Foto'
      },
      tr: {
        previousCloseReview: 'Önceki Kapanış İncelemesi',
        noReviewAvailable: 'İnceleme Mevcut Değil',
        noReviewMessage: 'Dün için kapanış incelemesi bulunamadı. Bu genellikle önceki vardiyaların kapanış incelemelerini tamamlaması gerektiği anlamına gelir.',
        overallScore: 'Genel Puan',
        passed: 'GEÇTİ',
        failed: 'KALDI',
        issuesFound: 'Bulunan Sorunlar',
        reviewerNotes: 'İncelemeci Notları',
        continueToChecklist: 'Kontrol Listesine Devam Et',
        backToMain: 'Ana Menüye Dön',
        reviewDate: 'İnceleme Tarihi',
        reviewedBy: 'İnceleyen',
        categories: 'Kategoriler',
        score: 'Puan',
        maxScore: 'Maksimum Puan',
        passThreshold: 'Geçme Eşiği',
        viewPhoto: 'Fotoğrafı Görüntüle'
      }
    }
    return translations[language]?.[key] || key
  }

  useEffect(() => {
    loadPreviousReview()
  }, [department])

  const loadPreviousReview = async () => {
    setLoading(true)
    try {
      // Get yesterday's date
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayStr = yesterday.toISOString().split('T')[0]

      // Load the most recent close review for yesterday
      const { data: reviewData, error: reviewError } = await supabase
        .from('close_reviews')
        .select('*')
        .eq('department', department)
        .eq('shift_date', yesterdayStr)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (reviewError && reviewError.code !== 'PGRST116') {
        throw reviewError
      }

      if (reviewData) {
        setReview(reviewData)

        // Load the review template
        const { data: templateData, error: templateError } = await supabase
          .from('review_templates')
          .select('*')
          .eq('template_name', reviewData.template_name)
          .eq('active', true)
          .single()

        if (templateError) throw templateError
        setTemplate(templateData)
      }
    } catch (error) {
      console.error('Error loading review:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateOverallScore = () => {
    if (!review || !template) return { score: 0, maxScore: 0, percentage: 0 }

    let totalScore = 0
    let maxScore = 0

    Object.entries(template.review_categories).forEach(([category, config]: [string, any]) => {
      const categoryScore = review.scores[category] || 0
      totalScore += categoryScore
      maxScore += config.max_score || 5
    })

    const percentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0

    return { score: totalScore, maxScore, percentage }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(language, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!review) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center h-16">
              <button
                onClick={() => router.back()}
                className="mr-4 p-2 rounded-full hover:bg-gray-100"
              >
                <ArrowLeft className="h-6 w-6 text-gray-600" />
              </button>
              <h1 className="text-xl font-bold text-gray-900">
                {t('previousCloseReview')} - {department}
              </h1>
            </div>
          </div>
        </header>

        {/* No Review Available */}
        <div className="max-w-2xl mx-auto px-4 py-12">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <AlertTriangle className="h-16 w-16 text-amber-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {t('noReviewAvailable')}
            </h2>
            <p className="text-gray-600 mb-8">
              {t('noReviewMessage')}
            </p>
            <div className="flex gap-4 justify-center">
              <Button
                variant="outline"
                onClick={() => router.back()}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t('backToMain')}
              </Button>
              <Button
                onClick={() => router.push(`/${department.toLowerCase()}/opening`)}
              >
                {t('continueToChecklist')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const overallScore = calculateOverallScore()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <button
              onClick={() => router.back()}
              className="mr-4 p-2 rounded-full hover:bg-gray-100"
            >
              <ArrowLeft className="h-6 w-6 text-gray-600" />
            </button>
            <h1 className="text-xl font-bold text-gray-900">
              {t('previousCloseReview')} - {department}
            </h1>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Review Summary Card */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {formatDate(review.shift_date)}
              </h2>
              <p className="text-gray-600">
                {t('reviewedBy')}: {review.reviewer_name}
              </p>
            </div>
            <div className="text-right">
              <div className={`inline-flex items-center px-4 py-2 rounded-full text-lg font-semibold ${
                review.overall_pass 
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {review.overall_pass ? (
                  <>
                    <CheckCircle2 className="h-5 w-5 mr-2" />
                    {t('passed')}
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-5 w-5 mr-2" />
                    {t('failed')}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Overall Score */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold mb-2 flex items-center">
              <Star className="h-5 w-5 text-yellow-500 mr-2" />
              {t('overallScore')}
            </h3>
            <div className="flex items-center">
              <div className="flex-1">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>{overallScore.score} / {overallScore.maxScore}</span>
                  <span>{overallScore.percentage.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all duration-300 ${
                      overallScore.percentage >= (template?.pass_threshold || 85)
                        ? 'bg-green-500'
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.min(overallScore.percentage, 100)}%` }}
                  ></div>
                </div>
              </div>
              <div className="ml-4 text-sm text-gray-500">
                {t('passThreshold')}: {template?.pass_threshold || 85}%
              </div>
            </div>
          </div>
        </div>

        {/* Category Scores */}
        {template && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">{t('categories')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(template.review_categories).map(([category, config]: [string, any]) => {
                const categoryScore = review.scores[category] || 0
                const maxScore = config.max_score || 5
                const percentage = (categoryScore / maxScore) * 100

                return (
                  <div key={category} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium text-gray-900">{category}</h4>
                      <span className="text-sm text-gray-600">
                        {categoryScore} / {maxScore}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          percentage >= 80 ? 'bg-green-500' : 
                          percentage >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Issues Found */}
        {review.issues_found && review.issues_found.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center text-red-600">
              <AlertTriangle className="h-5 w-5 mr-2" />
              {t('issuesFound')}
            </h3>
            <ul className="space-y-2">
              {review.issues_found.map((issue, index) => (
                <li key={index} className="flex items-start">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">{issue}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Reviewer Notes */}
        {review.notes && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <MessageSquare className="h-5 w-5 mr-2 text-blue-600" />
              {t('reviewerNotes')}
            </h3>
            <p className="text-gray-700 whitespace-pre-wrap">{review.notes}</p>
          </div>
        )}

        {/* Photos */}
        {review.photos && review.photos.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Camera className="h-5 w-5 mr-2 text-purple-600" />
              Review Photos
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {review.photos.map((photo, index) => (
                <div key={index} className="relative">
                  <img
                    src={photo}
                    alt={`Review photo ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <button className="absolute inset-0 bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity duration-200 rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm">{t('viewPhoto')}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center">
          <Button
            variant="outline"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('backToMain')}
          </Button>
          <Button
            onClick={() => router.push(`/${department.toLowerCase()}/opening`)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {t('continueToChecklist')}
          </Button>
        </div>
      </div>
    </div>
  )
}
