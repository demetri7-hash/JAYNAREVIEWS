'use client';

import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import Card from '@/components/ui/Card';
import { useLanguage } from '@/contexts/LanguageContext';
import { t } from '@/lib/translations';
import { Clock, ChefHat, Sparkles, ArrowRight, Moon, Utensils, History } from 'lucide-react';

export default function BOHDashboard() {
  const router = useRouter();
  const { language } = useLanguage();

  const shifts = [
    {
      key: 'opening-line',
      icon: Clock,
      title: t('boh.opening_line', language),
      description: language === 'es' 
        ? 'Preparación de línea matutina'
        : language === 'tr'
        ? 'Sabah hat hazırlığı'
        : 'Morning line preparation',
      color: '#059669',
      path: '/boh/opening-line'
    },
    {
      key: 'morning-prep',
      icon: ChefHat,
      title: t('boh.morning_prep', language),
      description: language === 'es'
        ? 'Tareas de preparación de alimentos'
        : language === 'tr'
        ? 'Yemek hazırlama görevleri'
        : 'Food preparation tasks',
      color: '#DC2626',
      path: '/boh/morning-prep'
    },
    {
      key: 'morning-clean',
      icon: Sparkles,
      title: t('boh.morning_clean', language),
      description: language === 'es'
        ? 'Deberes de limpieza matutina'
        : language === 'tr'
        ? 'Sabah temizlik görevleri'
        : 'Morning cleaning duties',
      color: '#2563EB',
      path: '/boh/morning-clean'
    },
    {
      key: 'transition-line',
      icon: ArrowRight,
      title: t('boh.transition_line', language),
      description: language === 'es'
        ? 'Tareas de línea del mediodía'
        : language === 'tr'
        ? 'Öğle hat görevleri'
        : 'Mid-day line tasks',
      color: '#7C2D12',
      path: '/boh/transition-line'
    },
    {
      key: 'closing-line',
      icon: Moon,
      title: t('boh.closing_line', language),
      description: language === 'es'
        ? 'Cierre de línea nocturno'
        : language === 'tr'
        ? 'Akşam hat kapanışı'
        : 'Evening line closing',
      color: '#1F2937',
      path: '/boh/closing-line'
    },
    {
      key: 'closing-prep',
      icon: Utensils,
      title: t('boh.closing_prep', language),
      description: language === 'es'
        ? 'Preparación de cierre y lavaplatos'
        : language === 'tr'
        ? 'Kapanış hazırlığı ve bulaşık'
        : 'Closing prep and dishwashing',
      color: '#7C3AED',
      path: '/boh/closing-prep'
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
      path: '/worksheets?department=BOH'
    }
  ];

  return (
    <Layout 
      title={t('nav.boh', language)}
      showBackButton 
      onBack={() => router.push('/')}
    >
      <div className="text-center mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          {language === 'es' 
            ? 'Selecciona tu área de trabajo'
            : language === 'tr'
            ? 'Çalışma alanını seç'
            : 'Select Your Work Area'
          }
        </h2>
        <p className="text-gray-600">
          {language === 'es'
            ? 'Elige las tareas que necesitas completar'
            : language === 'tr'
            ? 'Tamamlamanız gereken görevleri seçin'
            : 'Choose the tasks you need to complete'
          }
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-5xl mx-auto">
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

      {/* Recipe Quick Access */}
      <div className="mt-12 bg-green-50 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          {language === 'es' ? 'Acceso Rápido a Recetas' : language === 'tr' ? 'Hızlı Tarif Erişimi' : 'Quick Recipe Access'}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="bg-white p-3 rounded-lg">
            <div className="font-semibold text-gray-900">Iskender Sauce</div>
            <div className="text-sm text-gray-600">2-2.5L batch</div>
          </div>
          <div className="bg-white p-3 rounded-lg">
            <div className="font-semibold text-gray-900">Rice & Chickpeas</div>
            <div className="text-sm text-gray-600">6-7qt batch</div>
          </div>
          <div className="bg-white p-3 rounded-lg">
            <div className="font-semibold text-gray-900">Hummus</div>
            <div className="text-sm text-gray-600">1.5-2 gal</div>
          </div>
          <div className="bg-white p-3 rounded-lg">
            <div className="font-semibold text-gray-900">Falafel</div>
            <div className="text-sm text-gray-600">Daily prep</div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
