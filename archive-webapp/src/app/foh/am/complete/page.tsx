'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useLanguage } from '@/contexts/LanguageContext';
import { CheckCircle, Clock, User, Calendar, Download, Home } from 'lucide-react';

export default function FOHAMComplete() {
  const router = useRouter();
  const { language } = useLanguage();
  const [worksheetData, setWorksheetData] = useState<any>(null);

  useEffect(() => {
    const data = localStorage.getItem('completed-worksheet');
    if (data) {
      setWorksheetData(JSON.parse(data));
    } else {
      router.push('/foh');
    }
  }, [router]);

  if (!worksheetData) {
    return (
      <Layout title="Loading...">
        <div className="text-center py-12">Loading...</div>
      </Layout>
    );
  }

  const completedTasks = worksheetData.items.filter((item: any) => item.completed);
  const totalTasks = worksheetData.items.length;
  const issuesFound = worksheetData.items.filter((item: any) => item.note && item.note.length > 0);
  const photosUploaded = worksheetData.items.filter((item: any) => item.photoUrl);

  return (
    <Layout 
      title={language === 'es' ? 'Trabajo Completado' : language === 'tr' ? 'İş Tamamlandı' : 'Work Complete'}
    >
      <div className="max-w-2xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-8">
          <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {language === 'es' ? '¡Excelente trabajo!' : language === 'tr' ? 'Harika iş!' : 'Great job!'}
          </h1>
          <p className="text-gray-600">
            {language === 'es' 
              ? 'Has completado exitosamente tu turno de apertura FOH AM'
              : language === 'tr'
              ? 'FOH AM açılış vardiyasını başarıyla tamamladınız'
              : 'You have successfully completed your FOH AM Opening shift'
            }
          </p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{completedTasks.length}</div>
            <div className="text-sm text-gray-600">
              {language === 'es' ? 'Tareas Completadas' : language === 'tr' ? 'Tamamlanan Görevler' : 'Tasks Completed'}
            </div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{worksheetData.completion_percentage}%</div>
            <div className="text-sm text-gray-600">
              {language === 'es' ? 'Porcentaje' : language === 'tr' ? 'Yüzde' : 'Percentage'}
            </div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{photosUploaded.length}</div>
            <div className="text-sm text-gray-600">
              {language === 'es' ? 'Fotos Subidas' : language === 'tr' ? 'Yüklenen Fotoğraflar' : 'Photos Uploaded'}
            </div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{issuesFound.length}</div>
            <div className="text-sm text-gray-600">
              {language === 'es' ? 'Notas/Problemas' : language === 'tr' ? 'Notlar/Sorunlar' : 'Notes/Issues'}
            </div>
          </Card>
        </div>

        {/* Worksheet Details */}
        <Card className="p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {language === 'es' ? 'Detalles del Trabajo' : language === 'tr' ? 'İş Detayları' : 'Worksheet Details'}
          </h3>
          
          <div className="space-y-3 text-sm">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-gray-500" />
              <span className="text-gray-600">
                {language === 'es' ? 'Empleado:' : language === 'tr' ? 'Çalışan:' : 'Employee:'}
              </span>
              <span className="font-medium">{worksheetData.employee?.name || 'Unknown'}</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="text-gray-600">
                {language === 'es' ? 'Completado:' : language === 'tr' ? 'Tamamlandı:' : 'Completed:'}
              </span>
              <span className="font-medium">
                {new Date(worksheetData.submitted_at).toLocaleString(
                  language === 'tr' ? 'tr-TR' : language === 'es' ? 'es-ES' : 'en-US'
                )}
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="text-gray-600">
                {language === 'es' ? 'Turno:' : language === 'tr' ? 'Vardiya:' : 'Shift:'}
              </span>
              <span className="font-medium">FOH AM Opening</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-lg">{worksheetData.language_used === 'es' ? '🇪🇸' : worksheetData.language_used === 'tr' ? '🇹🇷' : '🇺🇸'}</span>
              <span className="text-gray-600">
                {language === 'es' ? 'Idioma usado:' : language === 'tr' ? 'Kullanılan dil:' : 'Language used:'}
              </span>
              <span className="font-medium">
                {worksheetData.language_used === 'es' ? 'Español' : worksheetData.language_used === 'tr' ? 'Türkçe' : 'English'}
              </span>
            </div>
          </div>
        </Card>

        {/* Issues Found */}
        {issuesFound.length > 0 && (
          <Card className="p-6 mb-6 border-l-4 border-yellow-500">
            <h3 className="text-lg font-semibold text-yellow-800 mb-4">
              {language === 'es' ? 'Notas y Problemas Reportados' : language === 'tr' ? 'Bildirilen Notlar ve Sorunlar' : 'Notes and Issues Reported'}
            </h3>
            <div className="space-y-2">
              {issuesFound.map((item: any, index: number) => (
                <div key={index} className="bg-yellow-50 p-3 rounded">
                  <p className="font-medium text-sm text-yellow-900">{item.text}</p>
                  <p className="text-sm text-yellow-700 mt-1">{item.note}</p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Actions */}
        <div className="space-y-4">
          <Button 
            onClick={() => router.push('/')}
            className="w-full"
            size="lg"
          >
            <Home className="h-4 w-4 mr-2" />
            {language === 'es' ? 'Volver al Inicio' : language === 'tr' ? 'Ana Sayfaya Dön' : 'Return to Home'}
          </Button>
          
          <div className="grid grid-cols-2 gap-4">
            <Button 
              variant="outline"
              onClick={() => router.push('/worksheets')}
            >
              {language === 'es' ? 'Ver Historial' : language === 'tr' ? 'Geçmişi Görüntüle' : 'View History'}
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => {
                // In real app, this would generate and download a PDF
                alert(language === 'es' ? 'Descarga en desarrollo' : language === 'tr' ? 'İndirme geliştiriliyor' : 'Download in development');
              }}
            >
              <Download className="h-4 w-4 mr-2" />
              {language === 'es' ? 'Descargar PDF' : language === 'tr' ? 'PDF İndir' : 'Download PDF'}
            </Button>
          </div>
        </div>

        {/* Thank You Message */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg text-center">
          <p className="text-blue-800">
            {language === 'es' 
              ? '¡Gracias por tu arduo trabajo manteniendo los altos estándares de Jayna Gyro!'
              : language === 'tr'
              ? 'Jayna Gyro\'nun yüksek standartlarını korumak için sıkı çalışmanız için teşekkürler!'
              : 'Thank you for your hard work maintaining Jayna Gyro\'s high standards!'
            }
          </p>
        </div>
      </div>
    </Layout>
  );
}
