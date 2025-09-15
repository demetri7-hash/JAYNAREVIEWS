'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Layout from '@/components/Layout'
import Button from '@/components/ui/Button'
import { CheckCircle, Clock, Camera, FileText } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

export default function BOHOpeningLineComplete() {
  const router = useRouter()
  const { language } = useLanguage()
  const [completionTime] = useState(new Date())

  const t = (key: string) => {
    const translations: any = {
      en: {
        worksheetComplete: 'Worksheet Complete!',
        congratulations: 'Congratulations! You have successfully completed the BOH Opening Line checklist.',
        completedAt: 'Completed at',
        whatNext: 'What would you like to do next?',
        backToBOH: 'Back to BOH Menu',
        startNewTask: 'Start New Task',
        viewWorksheets: 'View My Worksheets',
        excellentWork: 'Excellent work! Your line setup is complete and ready for service.'
      },
      es: {
        worksheetComplete: '¡Hoja de Trabajo Completada!',
        congratulations: '¡Felicitaciones! Has completado exitosamente la lista de verificación de Apertura de Línea BOH.',
        completedAt: 'Completado a las',
        whatNext: '¿Qué te gustaría hacer a continuación?',
        backToBOH: 'Volver al Menú BOH',
        startNewTask: 'Comenzar Nueva Tarea',
        viewWorksheets: 'Ver Mis Hojas de Trabajo',
        excellentWork: '¡Excelente trabajo! Tu configuración de línea está completa y lista para el servicio.'
      },
      tr: {
        worksheetComplete: 'Çalışma Sayfası Tamamlandı!',
        congratulations: 'Tebrikler! BOH Hat Açılışı kontrol listesini başarıyla tamamladınız.',
        completedAt: 'Tamamlanma saati',
        whatNext: 'Bundan sonra ne yapmak istersiniz?',
        backToBOH: 'BOH Menüsüne Dön',
        startNewTask: 'Yeni Görev Başlat',
        viewWorksheets: 'Çalışma Sayfalarımı Görüntüle',
        excellentWork: 'Mükemmel iş! Hat kurulumunuz tamamlandı ve servise hazır.'
      }
    }
    return translations[language]?.[key] || key
  }

  return (
    <Layout 
      title={t('worksheetComplete')}
      showBackButton={false}
    >
      <div className="text-center">
        {/* Success Icon */}
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>

        {/* Congratulations */}
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          {t('congratulations')}
        </h1>

        {/* Completion Time */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-center text-gray-600 mb-2">
            <Clock className="w-4 h-4 mr-2" />
            {t('completedAt')}: {completionTime.toLocaleTimeString()}
          </div>
          <p className="text-sm text-gray-500">
            {t('excellentWork')}
          </p>
        </div>

        {/* What's Next */}
        <h2 className="text-lg font-semibold text-gray-900 mb-6">
          {t('whatNext')}
        </h2>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            onClick={() => router.push('/boh')}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {t('backToBOH')}
          </Button>
          
          <Button
            onClick={() => router.push('/boh')}
            variant="outline"
            className="w-full"
          >
            {t('startNewTask')}
          </Button>
          
          <Button
            onClick={() => router.push('/worksheets?department=BOH')}
            variant="outline"
            className="w-full"
          >
            {t('viewWorksheets')}
          </Button>
        </div>
      </div>
    </Layout>
  )
}
