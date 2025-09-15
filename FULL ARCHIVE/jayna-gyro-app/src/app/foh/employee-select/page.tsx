'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useLanguage } from '@/contexts/LanguageContext';
import { t } from '@/lib/translations';
import { Users, ChevronDown } from 'lucide-react';

export default function FOHEmployeeSelect() {
  const router = useRouter();
  const { language } = useLanguage();
  const [selectedEmployee, setSelectedEmployee] = useState('');

  // This would come from Supabase in real app
  const fohEmployees = [
    { id: '1', name: 'Maria Garcia', languages: ['es', 'en'], shifts: ['AM', 'Transition', 'PM'] },
    { id: '2', name: 'John Smith', languages: ['en'], shifts: ['AM', 'PM', 'Bar'] },
    { id: '3', name: 'Sofia Hernandez', languages: ['es', 'en'], shifts: ['Transition', 'PM'] },
    { id: '4', name: 'Mike Johnson', languages: ['en'], shifts: ['AM', 'Transition'] },
    { id: '5', name: 'Ana Rodriguez', languages: ['es'], shifts: ['PM', 'Bar'] }
  ];

  const handleContinue = () => {
    if (selectedEmployee) {
      // Store selected employee in localStorage for the session
      const employee = fohEmployees.find(e => e.id === selectedEmployee);
      localStorage.setItem('current-employee', JSON.stringify(employee));
      router.push('/foh');
    }
  };

  return (
    <Layout 
      title={language === 'es' ? 'Seleccionar Empleado FOH' : language === 'tr' ? 'FOH Çalışanı Seç' : 'Select FOH Employee'}
      showBackButton 
      onBack={() => router.push('/')}
    >
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <Users className="h-16 w-16 text-blue-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {language === 'es' ? '¿Quién eres?' : language === 'tr' ? 'Sen kimsin?' : 'Who are you?'}
          </h2>
          <p className="text-gray-600">
            {language === 'es' 
              ? 'Selecciona tu nombre para comenzar tus tareas de trabajo'
              : language === 'tr'
              ? 'İş görevlerinize başlamak için adınızı seçin'
              : 'Select your name to begin your work tasks'
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
              className="w-full p-4 border border-gray-300 rounded-lg text-lg appearance-none bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">
                {language === 'es' ? 'Selecciona tu nombre...' : language === 'tr' ? 'Adını seç...' : 'Select your name...'}
              </option>
              {fohEmployees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
          </div>

          {selectedEmployee && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">
                {language === 'es' ? 'Información del Empleado' : language === 'tr' ? 'Çalışan Bilgileri' : 'Employee Information'}
              </h3>
              {(() => {
                const employee = fohEmployees.find(e => e.id === selectedEmployee);
                return employee ? (
                  <div className="space-y-1 text-sm">
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
                        {language === 'es' ? 'Turnos Autorizados:' : language === 'tr' ? 'Yetkili Vardiyalar:' : 'Authorized Shifts:'}
                      </span>
                      <span className="ml-2 text-gray-900">{employee.shifts.join(', ')}</span>
                    </div>
                  </div>
                ) : null;
              })()}
            </div>
          )}

          <Button 
            onClick={handleContinue}
            disabled={!selectedEmployee}
            className="w-full"
            size="lg"
          >
            {language === 'es' ? 'Continuar' : language === 'tr' ? 'Devam Et' : 'Continue'}
          </Button>
        </Card>

        {/* Quick Access Note */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            {language === 'es' 
              ? '💡 Tu selección se recordará durante esta sesión'
              : language === 'tr'
              ? '💡 Seçiminiz bu oturum boyunca hatırlanacaktır'
              : '💡 Your selection will be remembered for this session'
            }
          </p>
        </div>
      </div>
    </Layout>
  );
}
