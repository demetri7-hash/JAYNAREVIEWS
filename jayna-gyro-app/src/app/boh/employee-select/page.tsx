'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useLanguage } from '@/contexts/LanguageContext';
import { t } from '@/lib/translations';
import { ChefHat, ChevronDown } from 'lucide-react';

export default function BOHEmployeeSelect() {
  const router = useRouter();
  const { language } = useLanguage();
  const [selectedEmployee, setSelectedEmployee] = useState('');

  // This would come from Supabase in real app  
  const bohEmployees = [
    { 
      id: '1', 
      name: 'Ahmed Yilmaz', 
      languages: ['tr', 'en'], 
      roles: ['Line Cook', 'Prep Cook'], 
      shifts: ['Opening Line', 'Morning Prep', 'Transition Line'] 
    },
    { 
      id: '2', 
      name: 'Carlos Martinez', 
      languages: ['es', 'en'], 
      roles: ['Lead Prep Cook'], 
      shifts: ['Morning Prep', 'Closing Prep/Dishwasher'] 
    },
    { 
      id: '3', 
      name: 'Fatima Kaya', 
      languages: ['tr', 'en'], 
      roles: ['Prep Cook', 'Dishwasher'], 
      shifts: ['Morning Clean', 'Closing Prep/Dishwasher'] 
    },
    { 
      id: '4', 
      name: 'Jose Rivera', 
      languages: ['es'], 
      roles: ['Line Cook'], 
      shifts: ['Opening Line', 'Transition Line', 'Closing Line'] 
    },
    { 
      id: '5', 
      name: 'David Kim', 
      languages: ['en'], 
      roles: ['Kitchen Manager'], 
      shifts: ['Opening Line', 'Morning Prep', 'Morning Clean', 'Transition Line', 'Closing Line', 'Closing Prep/Dishwasher'] 
    }
  ];

  const handleContinue = () => {
    if (selectedEmployee) {
      // Store selected employee in localStorage for the session
      const employee = bohEmployees.find(e => e.id === selectedEmployee);
      localStorage.setItem('current-employee', JSON.stringify(employee));
      router.push('/boh');
    }
  };

  return (
    <Layout 
      title={language === 'es' ? 'Seleccionar Empleado BOH' : language === 'tr' ? 'BOH Çalışanı Seç' : 'Select BOH Employee'}
      showBackButton 
      onBack={() => router.push('/')}
    >
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <ChefHat className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {language === 'es' ? '¿Quién eres?' : language === 'tr' ? 'Sen kimsin?' : 'Who are you?'}
          </h2>
          <p className="text-gray-600">
            {language === 'es' 
              ? 'Selecciona tu nombre para comenzar tus tareas de cocina'
              : language === 'tr'
              ? 'Mutfak görevlerinize başlamak için adınızı seçin'
              : 'Select your name to begin your kitchen tasks'
            }
          </p>
        </div>

        <Card className="p-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            {language === 'es' ? 'Tu Nombre' : language === 'tr' ? 'Adın' : 'Your Name'}
          </label>
          
          <div className="relative mb-6">
            <select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              className="w-full p-4 border border-gray-300 rounded-lg text-lg appearance-none bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="">
                {language === 'es' ? 'Selecciona tu nombre...' : language === 'tr' ? 'Adını seç...' : 'Select your name...'}
              </option>
              {bohEmployees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
          </div>

          {selectedEmployee && (
            <div className="mb-6 p-4 bg-green-50 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">
                {language === 'es' ? 'Información del Empleado' : language === 'tr' ? 'Çalışan Bilgileri' : 'Employee Information'}
              </h3>
              {(() => {
                const employee = bohEmployees.find(e => e.id === selectedEmployee);
                return employee ? (
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-600">
                        {language === 'es' ? 'Idiomas:' : language === 'tr' ? 'Diller:' : 'Languages:'}
                      </span>
                      <div className="flex space-x-1">
                        {employee.languages.map(lang => (
                          <span key={lang} className="text-lg">
                            {lang === 'en' ? '🇺🇸' : lang === 'es' ? '🇪🇸' : '🇹🇷'}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">
                        {language === 'es' ? 'Roles:' : language === 'tr' ? 'Roller:' : 'Roles:'}
                      </span>
                      <span className="ml-2 text-gray-900">{employee.roles.join(', ')}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">
                        {language === 'es' ? 'Áreas Autorizadas:' : language === 'tr' ? 'Yetkili Alanlar:' : 'Authorized Areas:'}
                      </span>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {employee.shifts.map(shift => (
                          <span key={shift} className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                            {shift}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : null;
              })()}
            </div>
          )}

          <Button 
            onClick={handleContinue}
            disabled={!selectedEmployee}
            className="w-full bg-green-600 hover:bg-green-700"
            size="lg"
          >
            {language === 'es' ? 'Continuar' : language === 'tr' ? 'Devam Et' : 'Continue'}
          </Button>
        </Card>

        {/* Kitchen Safety Reminder */}
        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="font-medium text-yellow-800 mb-2">
            {language === 'es' ? 'Recordatorio de Seguridad' : language === 'tr' ? 'Güvenlik Hatırlatması' : 'Safety Reminder'}
          </h3>
          <p className="text-sm text-yellow-700">
            {language === 'es' 
              ? '⚠️ Siempre lávese las manos antes de comenzar y use el equipo de seguridad adecuado.'
              : language === 'tr'
              ? '⚠️ Başlamadan önce her zaman ellerinizi yıkayın ve uygun güvenlik ekipmanlarını kullanın.'
              : '⚠️ Always wash hands before starting and use proper safety equipment.'
            }
          </p>
        </div>
      </div>
    </Layout>
  );
}
