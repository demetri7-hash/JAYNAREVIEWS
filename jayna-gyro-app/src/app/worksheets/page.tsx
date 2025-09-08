'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Layout from '@/components/Layout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useLanguage } from '@/contexts/LanguageContext';
import { t } from '@/lib/translations';
import { Filter, Calendar, User, CheckCircle, Clock, AlertCircle, Download } from 'lucide-react';

function WorksheetsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { language } = useLanguage();
  const [filters, setFilters] = useState({
    department: searchParams.get('department') || 'all',
    shiftType: 'all',
    employee: 'all',
    status: 'all',
    dateRange: '7days'
  });

  // Mock data - in real app this would come from Supabase
  const worksheets = [
    {
      id: '1',
      employee_name: 'Maria Garcia',
      department: 'FOH',
      shift_type: 'AM',
      language_used: 'es',
      completion_percentage: 100,
      submitted_at: '2025-01-07T08:30:00Z',
      status: 'completed',
      issues_flagged: []
    },
    {
      id: '2',
      employee_name: 'Ahmed Yilmaz',
      department: 'BOH',
      shift_type: 'Morning Prep',
      language_used: 'tr',
      completion_percentage: 85,
      submitted_at: '2025-01-07T09:15:00Z',
      status: 'in_progress',
      issues_flagged: ['Low tomato stock']
    },
    {
      id: '3',
      employee_name: 'John Smith',
      department: 'FOH',
      shift_type: 'PM',
      language_used: 'en',
      completion_percentage: 100,
      submitted_at: '2025-01-06T22:45:00Z',
      status: 'completed',
      issues_flagged: []
    },
    {
      id: '4',
      employee_name: 'Sofia Hernandez',
      department: 'BOH',
      shift_type: 'Closing Prep/Dishwasher',
      language_used: 'es',
      completion_percentage: 95,
      submitted_at: '2025-01-06T23:30:00Z',
      status: 'completed',
      issues_flagged: ['Equipment needs maintenance']
    }
  ];

  const filteredWorksheets = worksheets.filter(w => {
    if (filters.department !== 'all' && w.department !== filters.department) return false;
    if (filters.shiftType !== 'all' && w.shift_type !== filters.shiftType) return false;
    return true;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'in_progress':
        return <Clock className="h-5 w-5 text-orange-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getLanguageFlag = (lang: string) => {
    switch (lang) {
      case 'es': return '🇪🇸';
      case 'tr': return '🇹🇷';
      default: return '🇺🇸';
    }
  };

  return (
    <Layout 
      title={t('nav.worksheets', language)}
      showBackButton 
      onBack={() => router.push('/')}
    >
      {/* Filters */}
      <Card className="p-4 mb-6">
        <div className="flex items-center space-x-2 mb-4">
          <Filter className="h-5 w-5 text-gray-500" />
          <h3 className="font-medium text-gray-900">
            {language === 'es' ? 'Filtros' : language === 'tr' ? 'Filtreler' : 'Filters'}
          </h3>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {language === 'es' ? 'Departamento' : language === 'tr' ? 'Departman' : 'Department'}
            </label>
            <select 
              value={filters.department} 
              onChange={(e) => setFilters({...filters, department: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="all">{language === 'es' ? 'Todos' : language === 'tr' ? 'Hepsi' : 'All'}</option>
              <option value="FOH">FOH</option>
              <option value="BOH">BOH</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {language === 'es' ? 'Turno' : language === 'tr' ? 'Vardiya' : 'Shift'}
            </label>
            <select 
              value={filters.shiftType} 
              onChange={(e) => setFilters({...filters, shiftType: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="all">{language === 'es' ? 'Todos' : language === 'tr' ? 'Hepsi' : 'All'}</option>
              <option value="AM">AM</option>
              <option value="PM">PM</option>
              <option value="Morning Prep">Morning Prep</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {language === 'es' ? 'Estado' : language === 'tr' ? 'Durum' : 'Status'}
            </label>
            <select 
              value={filters.status} 
              onChange={(e) => setFilters({...filters, status: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="all">{language === 'es' ? 'Todos' : language === 'tr' ? 'Hepsi' : 'All'}</option>
              <option value="completed">{language === 'es' ? 'Completado' : language === 'tr' ? 'Tamamlandı' : 'Completed'}</option>
              <option value="in_progress">{language === 'es' ? 'En Progreso' : language === 'tr' ? 'Devam Ediyor' : 'In Progress'}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {language === 'es' ? 'Período' : language === 'tr' ? 'Dönem' : 'Period'}
            </label>
            <select 
              value={filters.dateRange} 
              onChange={(e) => setFilters({...filters, dateRange: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="7days">{language === 'es' ? '7 días' : language === 'tr' ? '7 gün' : '7 days'}</option>
              <option value="30days">{language === 'es' ? '30 días' : language === 'tr' ? '30 gün' : '30 days'}</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4 text-center">
          <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">
            {filteredWorksheets.filter(w => w.status === 'completed').length}
          </div>
          <div className="text-sm text-gray-600">
            {language === 'es' ? 'Completados' : language === 'tr' ? 'Tamamlandı' : 'Completed'}
          </div>
        </Card>
        
        <Card className="p-4 text-center">
          <Clock className="h-8 w-8 text-orange-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">
            {filteredWorksheets.filter(w => w.status === 'in_progress').length}
          </div>
          <div className="text-sm text-gray-600">
            {language === 'es' ? 'En Progreso' : language === 'tr' ? 'Devam Ediyor' : 'In Progress'}
          </div>
        </Card>
        
        <Card className="p-4 text-center">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">
            {filteredWorksheets.reduce((acc, w) => acc + w.issues_flagged.length, 0)}
          </div>
          <div className="text-sm text-gray-600">
            {language === 'es' ? 'Problemas' : language === 'tr' ? 'Sorunlar' : 'Issues'}
          </div>
        </Card>
        
        <Card className="p-4 text-center">
          <User className="h-8 w-8 text-blue-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">
            {new Set(filteredWorksheets.map(w => w.employee_name)).size}
          </div>
          <div className="text-sm text-gray-600">
            {language === 'es' ? 'Empleados' : language === 'tr' ? 'Çalışanlar' : 'Employees'}
          </div>
        </Card>
      </div>

      {/* Worksheets List */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">
            {language === 'es' ? 'Hojas de Trabajo Recientes' : language === 'tr' ? 'Son Çalışma Sayfaları' : 'Recent Worksheets'} 
            ({filteredWorksheets.length})
          </h3>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            {language === 'es' ? 'Exportar' : language === 'tr' ? 'Dışa Aktar' : 'Export'}
          </Button>
        </div>

        {filteredWorksheets.map((worksheet) => (
          <Card 
            key={worksheet.id} 
            className="p-4 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => router.push(`/worksheets/${worksheet.id}`)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {getStatusIcon(worksheet.status)}
                <div>
                  <h4 className="font-medium text-gray-900">
                    {worksheet.employee_name} - {worksheet.department} {worksheet.shift_type}
                  </h4>
                  <div className="flex items-center space-x-2 text-sm text-gray-600 mt-1">
                    <span>{getLanguageFlag(worksheet.language_used)}</span>
                    <Calendar className="h-3 w-3" />
                    <span>
                      {new Date(worksheet.submitted_at).toLocaleDateString(
                        language === 'tr' ? 'tr-TR' : language === 'es' ? 'es-ES' : 'en-US'
                      )}
                    </span>
                    <span>•</span>
                    <span>{worksheet.completion_percentage}% {language === 'es' ? 'completado' : language === 'tr' ? 'tamamlandı' : 'complete'}</span>
                  </div>
                  {worksheet.issues_flagged.length > 0 && (
                    <div className="mt-2">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        {worksheet.issues_flagged.length} {language === 'es' ? 'problema(s)' : language === 'tr' ? 'sorun' : 'issue(s)'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">
                  {new Date(worksheet.submitted_at).toLocaleTimeString(
                    language === 'tr' ? 'tr-TR' : language === 'es' ? 'es-ES' : 'en-US',
                    { hour: '2-digit', minute: '2-digit' }
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredWorksheets.length === 0 && (
        <Card className="p-8 text-center">
          <div className="text-gray-500 mb-4">
            {language === 'es' ? 'No se encontraron hojas de trabajo' : language === 'tr' ? 'Çalışma sayfası bulunamadı' : 'No worksheets found'}
          </div>
          <p className="text-sm text-gray-400">
            {language === 'es' ? 'Intenta ajustar los filtros para ver más resultados' : language === 'tr' ? 'Daha fazla sonuç görmek için filtreleri ayarlamayı deneyin' : 'Try adjusting the filters to see more results'}
          </p>
        </Card>
      )}
    </Layout>
  );
}

export default function WorksheetsPage() {
  return (
    <Suspense fallback={
      <Layout title="Worksheets" showBackButton onBack={() => {}}>
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    }>
      <WorksheetsContent />
    </Suspense>
  );
}
