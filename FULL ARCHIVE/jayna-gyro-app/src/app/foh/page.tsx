'use client';

import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import Card from '@/components/ui/Card';
import { useLanguage } from '@/contexts/LanguageContext';
import { t } from '@/lib/translations';
import { Clock, ArrowRight, Sunset, Wine, History } from 'lucide-react';

export default function FOHDashboard() {
  const router = useRouter();
  const { language } = useLanguage();

  const shifts = [
    {
      key: 'am',
      icon: Clock,
      title: t('foh.am', language),
      description: language === 'es' 
        ? 'Configuración matutina y apertura del restaurante'
        : language === 'tr'
        ? 'Sabah kurulumu ve restoran açılışı'
        : 'Morning setup and restaurant opening',
      color: '#059669',
      path: '/foh/am'
    },
    {
      key: 'transition',
      icon: ArrowRight,
      title: t('foh.transition', language),
      description: language === 'es'
        ? 'Cambio de turno del mediodía'
        : language === 'tr'
        ? 'Öğle vardiya değişimi'
        : 'Mid-day shift transition',
      color: '#DC2626',
      path: '/foh/transition'
    },
    {
      key: 'pm',
      icon: Sunset,
      title: t('foh.pm', language),
      description: language === 'es'
        ? 'Procedimientos de cierre nocturno'
        : language === 'tr'
        ? 'Akşam kapanış prosedürleri'
        : 'Evening closing procedures',
      color: '#7C2D12',
      path: '/foh/pm'
    },
    {
      key: 'bar',
      icon: Wine,
      title: t('foh.bar', language),
      description: language === 'es'
        ? 'Operaciones especializadas del bar'
        : language === 'tr'
        ? 'Özelleşmiş bar işlemleri'
        : 'Specialized bar operations',
      color: '#7C3AED',
      path: '/foh/bar'
    },
    {
      key: 'history',
      icon: History,
      title: language === 'es' ? 'Mi Historial' : language === 'tr' ? 'Geçmişim' : 'My Past Worksheets',
      description: language === 'es'
        ? 'Ver mis hojas de trabajo anteriores'
        : language === 'tr'
        ? 'Önceki çalışma sayfalarımı görüntüle'
        : 'View my previous worksheets',
      color: '#059669',
      path: '/worksheets?department=FOH'
    }
  ];

  return (
    <Layout 
      title={t('nav.foh', language)}
      showBackButton 
      onBack={() => router.push('/')}
    >
      <div className="text-center mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          {language === 'es' 
            ? 'Selecciona tu turno'
            : language === 'tr'
            ? 'Vardiyani seç'
            : 'Select Your Shift'
          }
        </h2>
        <p className="text-gray-600">
          {language === 'es'
            ? 'Elige el turno que estás comenzando'
            : language === 'tr'
            ? 'Başladığınız vardiyayı seçin'
            : 'Choose the shift you are starting'
          }
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
        {shifts.map((shift) => {
          const IconComponent = shift.icon;
          return (
            <Card
              key={shift.key}
              className="p-6 hover:shadow-md transition-all duration-200 cursor-pointer"
              onClick={() => router.push(shift.path)}
            >
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-lg text-white" style={{ backgroundColor: shift.color }}>
                  <IconComponent className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900 mb-1">
                    {shift.title}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {shift.description}
                  </p>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400" />
              </div>
            </Card>
          );
        })}
      </div>

      {/* Quick Stats */}
      <div className="mt-12 bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          {language === 'es' ? 'Estado de Hoy' : language === 'tr' ? 'Bugünün Durumu' : 'Today\'s Status'}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-600">0</div>
            <div className="text-sm text-gray-600">
              {language === 'es' ? 'Completados' : language === 'tr' ? 'Tamamlandı' : 'Completed'}
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-orange-600">0</div>
            <div className="text-sm text-gray-600">
              {language === 'es' ? 'En Progreso' : language === 'tr' ? 'Devam Eden' : 'In Progress'}
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">100%</div>
            <div className="text-sm text-gray-600">
              {language === 'es' ? 'Precisión' : language === 'tr' ? 'Doğruluk' : 'Accuracy'}
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600">7</div>
            <div className="text-sm text-gray-600">
              {language === 'es' ? 'Esta Semana' : language === 'tr' ? 'Bu Hafta' : 'This Week'}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
