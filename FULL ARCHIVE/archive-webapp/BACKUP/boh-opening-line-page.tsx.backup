'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import ReviewCheck from '@/components/ReviewCheck';
import { useLanguage } from '@/contexts/LanguageContext';
import { Camera, Upload, AlertCircle, CheckCircle, Clock } from 'lucide-react';

interface WorksheetItemData {
  id: string;
  text: string;
  category: string;
  required: boolean;
  requiresPhoto: boolean;
  requiresNote: boolean;
  completed: boolean;
  note?: string;
  photoUrl?: string;
  timestamp?: string;
}

export default function BOHOpeningLineWorksheet() {
  const router = useRouter();
  const { language } = useLanguage();
  const [currentEmployee, setCurrentEmployee] = useState<any>(null);
  const [items, setItems] = useState<WorksheetItemData[]>([]);
  const [currentCategory, setCurrentCategory] = useState(0);
  const [startTime] = useState(new Date());
  const [showReviewCheck, setShowReviewCheck] = useState(true);

  // Load BOH Opening Line Checklist
  useEffect(() => {
    const employee = localStorage.getItem('current-employee');
    if (employee) {
      setCurrentEmployee(JSON.parse(employee));
    }

    // This data is extracted from the BOH_Opening_Line checklist items
    const bohOpeningLineItems: WorksheetItemData[] = [
      // Equipment Setup
      { id: '1', text: 'Turn on all line equipment (grills, fryers, warmers)', category: 'Equipment Setup', required: true, requiresPhoto: true, requiresNote: false, completed: false },
      { id: '2', text: 'Check oil levels and quality in fryers', category: 'Equipment Setup', required: true, requiresPhoto: false, requiresNote: true, completed: false },
      { id: '3', text: 'Preheat all cooking surfaces to proper temperatures', category: 'Equipment Setup', required: true, requiresPhoto: false, requiresNote: false, completed: false },
      { id: '4', text: 'Test temperature probes and thermometers', category: 'Equipment Setup', required: true, requiresPhoto: false, requiresNote: false, completed: false },

      // Food Safety & Temperature
      { id: '5', text: 'Check walk-in cooler and freezer temperatures', category: 'Food Safety & Temperature', required: true, requiresPhoto: true, requiresNote: true, completed: false },
      { id: '6', text: 'Verify all refrigerated units are at proper temp (below 41°F)', category: 'Food Safety & Temperature', required: true, requiresPhoto: false, requiresNote: true, completed: false },
      { id: '7', text: 'Check expiration dates on all prepped items', category: 'Food Safety & Temperature', required: true, requiresPhoto: false, requiresNote: false, completed: false },
      { id: '8', text: 'Rotate stock using FIFO (First In, First Out) method', category: 'Food Safety & Temperature', required: true, requiresPhoto: false, requiresNote: false, completed: false },

      // Prep Station Setup
      { id: '9', text: 'Set up cutting boards with proper color coding', category: 'Prep Station Setup', required: true, requiresPhoto: false, requiresNote: false, completed: false },
      { id: '10', text: 'Fill and position all sauce containers', category: 'Prep Station Setup', required: true, requiresPhoto: false, requiresNote: false, completed: false },
      { id: '11', text: 'Stock line with fresh ingredients from prep', category: 'Prep Station Setup', required: true, requiresPhoto: true, requiresNote: false, completed: false },
      { id: '12', text: 'Check portion sizes and containers', category: 'Prep Station Setup', required: true, requiresPhoto: false, requiresNote: false, completed: false },

      // Cleanliness & Sanitation
      { id: '13', text: 'Sanitize all work surfaces and cutting boards', category: 'Cleanliness & Sanitation', required: true, requiresPhoto: false, requiresNote: false, completed: false },
      { id: '14', text: 'Set up hand wash stations with soap and towels', category: 'Cleanliness & Sanitation', required: true, requiresPhoto: false, requiresNote: false, completed: false },
      { id: '15', text: 'Check sanitizer solution concentration (200-400 ppm)', category: 'Cleanliness & Sanitation', required: true, requiresPhoto: false, requiresNote: true, completed: false },
      { id: '16', text: 'Clean and sanitize all utensils and tools', category: 'Cleanliness & Sanitation', required: true, requiresPhoto: false, requiresNote: false, completed: false },

      // Final Checks
      { id: '17', text: 'Review daily specials and prep requirements', category: 'Final Checks', required: true, requiresPhoto: false, requiresNote: true, completed: false },
      { id: '18', text: 'Confirm line setup is complete and ready for service', category: 'Final Checks', required: true, requiresPhoto: true, requiresNote: false, completed: false }
    ];

    // Add multilingual support
    const translatedItems = bohOpeningLineItems.map(item => ({
      ...item,
      text: getTranslatedText(item.id, item.text)
    }));

    setItems(translatedItems);
  }, [language]);

  const getTranslatedText = (id: string, englishText: string) => {
    const translations: any = {
      es: {
        '1': 'Encender todo el equipo de línea (parrillas, freidoras, calentadores)',
        '2': 'Verificar niveles y calidad del aceite en freidoras',
        '3': 'Precalentar todas las superficies de cocción a temperaturas adecuadas',
        '4': 'Probar sondas de temperatura y termómetros',
        '5': 'Verificar temperaturas del refrigerador y congelador',
        '6': 'Verificar que todas las unidades refrigeradas estén a temperatura adecuada (debajo de 41°F)',
        '7': 'Verificar fechas de vencimiento en todos los artículos preparados',
        '8': 'Rotar inventario usando método FIFO (Primero en Entrar, Primero en Salir)',
        '9': 'Configurar tablas de cortar con código de colores adecuado',
        '10': 'Llenar y posicionar todos los contenedores de salsa',
        '11': 'Abastecer línea con ingredientes frescos de preparación',
        '12': 'Verificar tamaños de porciones y contenedores',
        '13': 'Sanitizar todas las superficies de trabajo y tablas de cortar',
        '14': 'Configurar estaciones de lavado de manos con jabón y toallas',
        '15': 'Verificar concentración de solución sanitizante (200-400 ppm)',
        '16': 'Limpiar y sanitizar todos los utensilios y herramientas',
        '17': 'Revisar especiales diarios y requisitos de preparación',
        '18': 'Confirmar que la configuración de línea está completa y lista para servicio'
      },
      tr: {
        '1': 'Tüm hat ekipmanlarını açın (ızgara, fritöz, ısıtıcılar)',
        '2': 'Fritözlerde yağ seviyelerini ve kalitesini kontrol edin',
        '3': 'Tüm pişirme yüzeylerini uygun sıcaklıklara ısıtın',
        '4': 'Sıcaklık problarını ve termometreleri test edin',
        '5': 'Soğuk hava deposu ve dondurucu sıcaklıklarını kontrol edin',
        '6': 'Tüm soğutulmuş birimlerin uygun sıcaklıkta olduğunu doğrulayın (41°F altında)',
        '7': 'Tüm hazırlanmış ürünlerde son kullanma tarihlerini kontrol edin',
        '8': 'FIFO (İlk Giren, İlk Çıkar) yöntemini kullanarak stoku döndürün',
        '9': 'Uygun renk kodlamasıyla kesme tahtalarını hazırlayın',
        '10': 'Tüm sos kaplarını doldurun ve konumlandırın',
        '11': 'Hattı hazırlıktan gelen taze malzemelerle stokla',
        '12': 'Porsiyon boyutlarını ve kapları kontrol edin',
        '13': 'Tüm çalışma yüzeylerini ve kesme tahtalarını dezenfekte edin',
        '14': 'El yıkama istasyonlarını sabun ve havlularla hazırlayın',
        '15': 'Dezenfektan çözelti konsantrasyonunu kontrol edin (200-400 ppm)',
        '16': 'Tüm mutfak eşyalarını ve aletleri temizleyin ve dezenfekte edin',
        '17': 'Günlük özel menüleri ve hazırlık gereksinimlerini gözden geçirin',
        '18': 'Hat kurulumunun tamamlandığını ve servise hazır olduğunu onaylayın'
      }
    }
    return translations[language]?.[id] || englishText;
  }

  // Show review check first
  if (showReviewCheck) {
    return (
      <ReviewCheck
        department="BOH"
        shiftType="Opening Line"
        onContinue={() => setShowReviewCheck(false)}
      />
    )
  }

  const categories = [...new Set(items.map(item => item.category))];
  const currentCategoryItems = items.filter(item => item.category === categories[currentCategory]);
  const completedItems = items.filter(item => item.completed);
  const totalCompleted = completedItems.length;
  const completionPercentage = items.length > 0 ? Math.round((totalCompleted / items.length) * 100) : 0;

  const handleItemComplete = (itemId: string, note?: string, photoUrl?: string) => {
    setItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId
          ? { ...item, completed: true, note, photoUrl, timestamp: new Date().toISOString() }
          : item
      )
    );
  };

  const handleItemIncomplete = (itemId: string) => {
    setItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId
          ? { ...item, completed: false, note: undefined, photoUrl: undefined, timestamp: undefined }
          : item
      )
    );
  };

  const handleNext = () => {
    if (currentCategory < categories.length - 1) {
      setCurrentCategory(currentCategory + 1);
    }
  };

  const handlePrevious = () => {
    if (currentCategory > 0) {
      setCurrentCategory(currentCategory - 1);
    }
  };

  const handleComplete = () => {
    const worksheetData = {
      employee_name: currentEmployee?.name || 'Unknown',
      employee_id: currentEmployee?.id,
      shift_type: 'BOH Opening Line',
      department: 'BOH',
      language_used: language,
      completion_percentage: completionPercentage,
      time_started: startTime.toISOString(),
      time_completed: new Date().toISOString(),
      worksheet_data: {
        items: items,
        categories: categories,
        total_items: items.length,
        completed_items: totalCompleted
      },
      photos: items.filter(item => item.photoUrl).map(item => item.photoUrl),
      issues_flagged: items.filter(item => !item.completed && item.required).map(item => item.text)
    };

    console.log('BOH Opening Line Worksheet completed:', worksheetData);
    router.push('/boh/opening-line/complete');
  };

  return (
    <Layout 
      title={`BOH Opening Line - ${categories[currentCategory]}`}
      showBackButton 
      onBack={() => router.push('/boh')}
    >
      {/* Progress Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm text-gray-600">
            {language === 'es' 
              ? `Categoría ${currentCategory + 1} de ${categories.length}`
              : language === 'tr'
              ? `Kategori ${currentCategory + 1} / ${categories.length}`
              : `Category ${currentCategory + 1} of ${categories.length}`
            }
          </div>
          <div className="text-sm font-medium text-gray-900">
            {completionPercentage}% {language === 'es' ? 'Completado' : language === 'tr' ? 'Tamamlandı' : 'Complete'}
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-green-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${completionPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Category Progress */}
      <div className="mb-6">
        <div className="flex space-x-1 mb-2">
          {categories.map((_, index) => (
            <div
              key={index}
              className={`flex-1 h-1 rounded-full ${
                index < currentCategory ? 'bg-green-500' :
                index === currentCategory ? 'bg-blue-500' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
        <h2 className="text-lg font-semibold text-gray-900">
          {categories[currentCategory]}
        </h2>
      </div>

      {/* Checklist Items */}
      <div className="space-y-4">
        {currentCategoryItems.map((item) => (
          <Card key={item.id} className="p-4">
            <div className="flex items-start space-x-3">
              <button
                onClick={() => item.completed ? handleItemIncomplete(item.id) : handleItemComplete(item.id)}
                className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center ${
                  item.completed
                    ? 'bg-green-500 border-green-500 text-white'
                    : 'border-gray-300 hover:border-green-500'
                }`}
              >
                {item.completed && <CheckCircle className="w-3 h-3" />}
              </button>
              
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <p className={`text-sm ${item.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                    {item.text}
                    {item.required && <span className="text-red-500 ml-1">*</span>}
                  </p>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    {item.requiresPhoto && (
                      <Camera className={`w-4 h-4 ${item.completed ? 'text-green-500' : 'text-gray-400'}`} />
                    )}
                    {item.requiresNote && (
                      <AlertCircle className={`w-4 h-4 ${item.completed ? 'text-green-500' : 'text-gray-400'}`} />
                    )}
                  </div>
                </div>
                
                {item.completed && item.timestamp && (
                  <p className="text-xs text-gray-500 mt-1">
                    {language === 'es' ? 'Completado' : language === 'tr' ? 'Tamamlandı' : 'Completed'}: {new Date(item.timestamp).toLocaleTimeString()}
                  </p>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Navigation */}
      <div className="mt-8 flex justify-between">
        <Button
          onClick={handlePrevious}
          variant="outline"
          disabled={currentCategory === 0}
        >
          ← {language === 'es' ? 'Anterior' : language === 'tr' ? 'Önceki' : 'Previous'}
        </Button>

        {currentCategory < categories.length - 1 ? (
          <Button
            onClick={handleNext}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {language === 'es' ? 'Siguiente' : language === 'tr' ? 'Sonraki' : 'Next'} →
          </Button>
        ) : (
          <Button
            onClick={handleComplete}
            className="flex-1 bg-green-600 hover:bg-green-700"
            disabled={completionPercentage < 100}
          >
            {language === 'es' ? 'Completar' : language === 'tr' ? 'Tamamla' : 'Complete'} ✓
          </Button>
        )}
      </div>

      {/* Requirements Warning */}
      {completionPercentage < 100 && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <p className="text-sm text-yellow-800">
              {language === 'es' 
                ? `${items.length - totalCompleted} tareas restantes para completar`
                : language === 'tr'
                ? `Tamamlanacak ${items.length - totalCompleted} görev kaldı`
                : `${items.length - totalCompleted} tasks remaining to complete`
              }
            </p>
          </div>
        </div>
      )}
    </Layout>
  );
}
