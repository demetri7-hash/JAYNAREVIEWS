'use client'

import { useState, useEffect } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { supabase } from '@/lib/supabase'
import Button from '@/components/ui/Button'
import { 
  ArrowLeft,
  Star,
  Camera,
  MessageSquare,
  Save,
  AlertTriangle,
  CheckCircle2,
  Plus,
  X
} from 'lucide-react'
import { useRouter } from 'next/navigation'

interface ReviewTemplate {
  id: string
  template_name: string
  department: 'FOH' | 'BOH'
  review_categories: any
  pass_threshold: number
  requires_manager_photo: boolean
}

interface CloseReviewData {
  shift_date: string
  template_name: string
  department: 'FOH' | 'BOH'
  scores: any
  issues_found: string[]
  photos: string[]
  notes: string
  reviewer_name: string
}

export default function CreateCloseReview() {
  const { language } = useLanguage()
  const router = useRouter()
  const [department, setDepartment] = useState<'FOH' | 'BOH'>('FOH')
  const [template, setTemplate] = useState<ReviewTemplate | null>(null)
  const [scores, setScores] = useState<any>({})
  const [issues, setIssues] = useState<string[]>([])
  const [newIssue, setNewIssue] = useState('')
  const [notes, setNotes] = useState('')
  const [reviewerName, setReviewerName] = useState('')
  const [photos, setPhotos] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  // Translation helper
  const t = (key: string) => {
    const translations: any = {
      en: {
        createCloseReview: 'Create Close Review',
        selectDepartment: 'Select Department',
        reviewDate: 'Review Date',
        reviewerName: 'Reviewer Name',
        categoryScores: 'Category Scores',
        issuesFound: 'Issues Found',
        addIssue: 'Add Issue',
        reviewNotes: 'Review Notes',
        photos: 'Photos',
        overallScore: 'Overall Score',
        passed: 'PASSED',
        failed: 'FAILED',
        passThreshold: 'Pass Threshold',
        saveReview: 'Save Review',
        cancel: 'Cancel',
        scoreOutOf: 'Score out of',
        enterIssueDescription: 'Enter issue description...',
        enterReviewNotes: 'Enter review notes...',
        enterReviewerName: 'Enter reviewer name...',
        deleteIssue: 'Delete issue',
        required: 'Required'
      },
      es: {
        createCloseReview: 'Crear Revisión de Cierre',
        selectDepartment: 'Seleccionar Departamento',
        reviewDate: 'Fecha de Revisión',
        reviewerName: 'Nombre del Revisor',
        categoryScores: 'Puntuaciones por Categoría',
        issuesFound: 'Problemas Encontrados',
        addIssue: 'Agregar Problema',
        reviewNotes: 'Notas de Revisión',
        photos: 'Fotos',
        overallScore: 'Puntuación General',
        passed: 'APROBADO',
        failed: 'REPROBADO',
        passThreshold: 'Umbral de Aprobación',
        saveReview: 'Guardar Revisión',
        cancel: 'Cancelar',
        scoreOutOf: 'Puntuación de',
        enterIssueDescription: 'Ingrese descripción del problema...',
        enterReviewNotes: 'Ingrese notas de revisión...',
        enterReviewerName: 'Ingrese nombre del revisor...',
        deleteIssue: 'Eliminar problema',
        required: 'Obligatorio'
      },
      tr: {
        createCloseReview: 'Kapanış İncelemesi Oluştur',
        selectDepartment: 'Bölüm Seç',
        reviewDate: 'İnceleme Tarihi',
        reviewerName: 'İncelemeci Adı',
        categoryScores: 'Kategori Puanları',
        issuesFound: 'Bulunan Sorunlar',
        addIssue: 'Sorun Ekle',
        reviewNotes: 'İnceleme Notları',
        photos: 'Fotoğraflar',
        overallScore: 'Genel Puan',
        passed: 'GEÇTİ',
        failed: 'KALDI',
        passThreshold: 'Geçme Eşiği',
        saveReview: 'İncelemeyi Kaydet',
        cancel: 'İptal',
        scoreOutOf: 'Puan:',
        enterIssueDescription: 'Sorun açıklamasını girin...',
        enterReviewNotes: 'İnceleme notlarını girin...',
        enterReviewerName: 'İncelemeci adını girin...',
        deleteIssue: 'Sorunu sil',
        required: 'Gerekli'
      }
    }
    return translations[language]?.[key] || key
  }

  useEffect(() => {
    loadReviewTemplate()
  }, [department])

  const loadReviewTemplate = async () => {
    try {
      // Load template based on department - using BOH Close Line Review as default
      const templateName = department === 'FOH' ? 'FOH_PM_Close_Review' : 'BOH_Close_Line_Review'
      
      const { data, error } = await supabase
        .from('review_templates')
        .select('*')
        .eq('template_name', templateName)
        .eq('active', true)
        .single()

      if (error) throw error
      
      setTemplate(data)
      
      // Initialize scores for each category
      const initialScores: any = {}
      Object.entries(data.review_categories).forEach(([category, config]: [string, any]) => {
        initialScores[category] = config.max_score || 5
      })
      setScores(initialScores)
    } catch (error) {
      console.error('Error loading template:', error)
    }
  }

  const calculateOverallScore = () => {
    if (!template) return { score: 0, maxScore: 0, percentage: 0 }

    let totalScore = 0
    let maxScore = 0

    Object.entries(template.review_categories).forEach(([category, config]: [string, any]) => {
      const categoryScore = scores[category] || 0
      totalScore += categoryScore
      maxScore += config.max_score || 5
    })

    const percentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0

    return { score: totalScore, maxScore, percentage }
  }

  const addIssue = () => {
    if (newIssue.trim()) {
      setIssues([...issues, newIssue.trim()])
      setNewIssue('')
    }
  }

  const removeIssue = (index: number) => {
    setIssues(issues.filter((_, i) => i !== index))
  }

  const saveReview = async () => {
    if (!template || !reviewerName.trim()) return

    setLoading(true)
    try {
      const overallScore = calculateOverallScore()
      const overallPass = overallScore.percentage >= template.pass_threshold

      const reviewData: CloseReviewData = {
        shift_date: new Date().toISOString().split('T')[0],
        template_name: template.template_name,
        department,
        scores,
        issues_found: issues,
        photos,
        notes: notes.trim(),
        reviewer_name: reviewerName.trim()
      }

      const { error } = await supabase
        .from('close_reviews')
        .insert({
          ...reviewData,
          overall_pass: overallPass,
          overall_score: overallScore.score,
          max_score: overallScore.maxScore,
          pass_percentage: overallScore.percentage
        })

      if (error) throw error

      // Redirect back to manager dashboard
      router.push('/manager?tab=reviews&message=Review created successfully')
    } catch (error) {
      console.error('Error saving review:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!template) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const overallScore = calculateOverallScore()
  const isOverallPass = overallScore.percentage >= template.pass_threshold

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
              {t('createCloseReview')}
            </h1>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Basic Info */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('selectDepartment')}
              </label>
              <select
                className="w-full p-2 border border-gray-300 rounded-md"
                value={department}
                onChange={(e) => setDepartment(e.target.value as 'FOH' | 'BOH')}
              >
                <option value="FOH">FOH</option>
                <option value="BOH">BOH</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('reviewDate')}
              </label>
              <input
                type="date"
                className="w-full p-2 border border-gray-300 rounded-md"
                defaultValue={new Date().toISOString().split('T')[0]}
                readOnly
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('reviewerName')} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder={t('enterReviewerName')}
                value={reviewerName}
                onChange={(e) => setReviewerName(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Category Scores */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Star className="h-5 w-5 text-yellow-500 mr-2" />
            {t('categoryScores')}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(template.review_categories).map(([category, config]: [string, any]) => (
              <div key={category} className="bg-gray-50 rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {category}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max={config.max_score || 5}
                    className="w-20 p-2 border border-gray-300 rounded-md text-center"
                    value={scores[category] || 0}
                    onChange={(e) => setScores({
                      ...scores,
                      [category]: parseInt(e.target.value) || 0
                    })}
                  />
                  <span className="text-sm text-gray-600">
                    / {config.max_score || 5}
                  </span>
                  <div className="flex-1 ml-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          ((scores[category] || 0) / (config.max_score || 5)) >= 0.8
                            ? 'bg-green-500'
                            : ((scores[category] || 0) / (config.max_score || 5)) >= 0.6
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                        }`}
                        style={{
                          width: `${Math.min(((scores[category] || 0) / (config.max_score || 5)) * 100, 100)}%`
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Overall Score Display */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">{t('overallScore')}</h3>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>{overallScore.score} / {overallScore.maxScore}</span>
                <span>{overallScore.percentage.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className={`h-4 rounded-full transition-all duration-300 ${
                    isOverallPass ? 'bg-green-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.min(overallScore.percentage, 100)}%` }}
                ></div>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {t('passThreshold')}: {template.pass_threshold}%
              </div>
            </div>
            <div className={`ml-6 px-4 py-2 rounded-full font-semibold ${
              isOverallPass 
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {isOverallPass ? (
                <>
                  <CheckCircle2 className="h-4 w-4 inline mr-1" />
                  {t('passed')}
                </>
              ) : (
                <>
                  <AlertTriangle className="h-4 w-4 inline mr-1" />
                  {t('failed')}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Issues Found */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center text-red-600">
            <AlertTriangle className="h-5 w-5 mr-2" />
            {t('issuesFound')}
          </h3>
          
          <div className="space-y-3">
            {issues.map((issue, index) => (
              <div key={index} className="flex items-center gap-2 bg-red-50 p-3 rounded-lg">
                <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></div>
                <span className="flex-1 text-gray-700">{issue}</span>
                <button
                  onClick={() => removeIssue(index)}
                  className="text-red-600 hover:text-red-800 p-1"
                  title={t('deleteIssue')}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
            
            <div className="flex gap-2">
              <input
                type="text"
                className="flex-1 p-2 border border-gray-300 rounded-md"
                placeholder={t('enterIssueDescription')}
                value={newIssue}
                onChange={(e) => setNewIssue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addIssue()}
              />
              <Button
                onClick={addIssue}
                variant="outline"
                disabled={!newIssue.trim()}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Review Notes */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <MessageSquare className="h-5 w-5 mr-2 text-blue-600" />
            {t('reviewNotes')}
          </h3>
          <textarea
            className="w-full p-3 border border-gray-300 rounded-md"
            rows={4}
            placeholder={t('enterReviewNotes')}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-end">
          <Button
            variant="outline"
            onClick={() => router.back()}
          >
            {t('cancel')}
          </Button>
          <Button
            onClick={saveReview}
            disabled={loading || !reviewerName.trim()}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Saving...' : t('saveReview')}
          </Button>
        </div>
      </div>
    </div>
  )
}
