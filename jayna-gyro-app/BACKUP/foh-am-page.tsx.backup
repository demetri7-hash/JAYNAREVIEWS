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

export default function FOHAMWorksheet() {
  const router = useRouter();
  const { language } = useLanguage();
  const [currentEmployee, setCurrentEmployee] = useState<any>(null);
  const [items, setItems] = useState<WorksheetItemData[]>([]);
  const [currentCategory, setCurrentCategory] = useState(0);
  const [startTime] = useState(new Date());
  const [showReviewCheck, setShowReviewCheck] = useState(true);

  // Load FOH AM Opening Checklist based on reference files
  useEffect(() => {
    const employee = localStorage.getItem('current-employee');
    if (employee) {
      setCurrentEmployee(JSON.parse(employee));
    }

    // This data is extracted from "FOH OPENING CHECKLIST.md"
    const fohAMItems: WorksheetItemData[] = [
      // Dining Room & Patio Setup
      { id: '1', text: 'Remove chairs and re-wipe all tables', category: 'Dining Room & Patio Setup', required: true, requiresPhoto: false, requiresNote: false, completed: false },
      { id: '2', text: 'Wipe table sides, legs, chairs, and banquette sofas', category: 'Dining Room & Patio Setup', required: true, requiresPhoto: false, requiresNote: false, completed: false },
      { id: '3', text: 'Don\'t forget the top wood ledge of sofas (especially outside)', category: 'Dining Room & Patio Setup', required: true, requiresPhoto: false, requiresNote: false, completed: false },
      { id: '4', text: 'Ensure chairs are tucked in and tables are aligned and evenly spaced', category: 'Dining Room & Patio Setup', required: true, requiresPhoto: false, requiresNote: false, completed: false },
      { id: '5', text: 'Place lamps on tables, hide charging cables', category: 'Dining Room & Patio Setup', required: true, requiresPhoto: false, requiresNote: false, completed: false },
      { id: '6', text: '"Salt to the Street" -- salt shakers toward parking lot, pepper toward kitchen', category: 'Dining Room & Patio Setup', required: true, requiresPhoto: false, requiresNote: false, completed: false },
      { id: '7', text: 'Wipe and dry menus --- remove stickiness', category: 'Dining Room & Patio Setup', required: true, requiresPhoto: false, requiresNote: false, completed: false },
      { id: '8', text: 'Turn on all dining room lights', category: 'Dining Room & Patio Setup', required: true, requiresPhoto: false, requiresNote: false, completed: false },
      { id: '9', text: 'Unlock doors and flip both signs to "OPEN"', category: 'Dining Room & Patio Setup', required: true, requiresPhoto: true, requiresNote: false, completed: false },
      { id: '10', text: 'Check and refill all rollups (napkin + silverware)', category: 'Dining Room & Patio Setup', required: true, requiresPhoto: false, requiresNote: false, completed: false },
      { id: '11', text: 'Wipe patio tables and barstools with fresh towel', category: 'Dining Room & Patio Setup', required: true, requiresPhoto: false, requiresNote: false, completed: false },
      { id: '12', text: 'Raise blinds', category: 'Dining Room & Patio Setup', required: true, requiresPhoto: false, requiresNote: false, completed: false },
      { id: '13', text: 'Windex front doors', category: 'Dining Room & Patio Setup', required: true, requiresPhoto: false, requiresNote: false, completed: false },
      { id: '14', text: 'Wipe down front of registers', category: 'Dining Room & Patio Setup', required: true, requiresPhoto: false, requiresNote: false, completed: false },

      // Cleanliness & Walkthrough
      { id: '15', text: 'Sweep perimeter and remove cobwebs from: Pergola area', category: 'Cleanliness & Walkthrough', required: true, requiresPhoto: false, requiresNote: false, completed: false },
      { id: '16', text: 'Sweep perimeter and remove cobwebs from: Back wall', category: 'Cleanliness & Walkthrough', required: true, requiresPhoto: false, requiresNote: false, completed: false },
      { id: '17', text: 'Sweep perimeter and remove cobwebs from: Between sofas', category: 'Cleanliness & Walkthrough', required: true, requiresPhoto: false, requiresNote: false, completed: false },
      { id: '18', text: 'Sweep perimeter and remove cobwebs from: Under all tables and planter boxes', category: 'Cleanliness & Walkthrough', required: true, requiresPhoto: false, requiresNote: false, completed: false },
      { id: '19', text: 'Review previous night\'s closing checklist for any notes', category: 'Cleanliness & Walkthrough', required: true, requiresPhoto: false, requiresNote: true, completed: false },

      // Bathroom Checks
      { id: '20', text: 'Clean toilets thoroughly: bowl, lid, seat, under seat, and floor around and behind', category: 'Bathroom Checks [DAILY!]', required: true, requiresPhoto: true, requiresNote: false, completed: false },
      { id: '21', text: 'Windex mirrors', category: 'Bathroom Checks [DAILY!]', required: true, requiresPhoto: false, requiresNote: false, completed: false },
      { id: '22', text: 'Dust: Top of hand dryer', category: 'Bathroom Checks [DAILY!]', required: true, requiresPhoto: false, requiresNote: false, completed: false },
      { id: '23', text: 'Dust: Soap dispenser', category: 'Bathroom Checks [DAILY!]', required: true, requiresPhoto: false, requiresNote: false, completed: false },
      { id: '24', text: 'Dust: Lip around perimeter of bathroom wall', category: 'Bathroom Checks [DAILY!]', required: true, requiresPhoto: false, requiresNote: false, completed: false },
      { id: '25', text: 'Scrub and clean sink + remove mold from drain', category: 'Bathroom Checks [DAILY!]', required: true, requiresPhoto: true, requiresNote: false, completed: false },
      { id: '26', text: 'Dry and polish all surfaces', category: 'Bathroom Checks [DAILY!]', required: true, requiresPhoto: false, requiresNote: false, completed: false },
      { id: '27', text: 'Restock: Toilet paper', category: 'Bathroom Checks [DAILY!]', required: true, requiresPhoto: false, requiresNote: false, completed: false },
      { id: '28', text: 'Restock: Paper towels', category: 'Bathroom Checks [DAILY!]', required: true, requiresPhoto: false, requiresNote: false, completed: false },
      { id: '29', text: 'Restock: Toilet seat covers', category: 'Bathroom Checks [DAILY!]', required: true, requiresPhoto: false, requiresNote: false, completed: false },

      // Expo Station & Sauce Prep
      { id: '30', text: 'Fill 1 sanitation tub at expo with ¾ sanitizer + 2 new microfiber towels', category: 'Expo Station & Sauce Prep', required: true, requiresPhoto: false, requiresNote: false, completed: false },
      { id: '31', text: 'One towel must be hanging half in/half out (health code requirement)', category: 'Expo Station & Sauce Prep', required: true, requiresPhoto: true, requiresNote: false, completed: false }
    ];

    setItems(fohAMItems);
  }, []);

  // Show review check first
  if (showReviewCheck) {
    return (
      <ReviewCheck
        department="FOH"
        shiftType="AM"
        onContinue={() => setShowReviewCheck(false)}
      />
    )
  }

  const categories = [...new Set(items.map(item => item.category))];
  const currentCategoryItems = items.filter(item => item.category === categories[currentCategory]);
  const completedInCategory = currentCategoryItems.filter(item => item.completed).length;
  const totalCompleted = items.filter(item => item.completed).length;
  const completionPercentage = items.length > 0 ? Math.round((totalCompleted / items.length) * 100) : 0;

  const updateItem = (id: string, updates: Partial<WorksheetItemData>) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, ...updates, timestamp: new Date().toISOString() } : item
    ));
  };

  const handlePhotoUpload = (itemId: string) => {
    // In real app, this would handle camera/file upload
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        // In real app, upload to Supabase Storage
        const mockUrl = `photo_${itemId}_${Date.now()}.jpg`;
        updateItem(itemId, { photoUrl: mockUrl });
      }
    };
    input.click();
  };

  const getTranslatedText = (text: string): string => {
    // Basic translation for common terms
    if (language === 'es') {
      return text
        .replace(/Remove chairs/gi, 'Remover sillas')
        .replace(/Wipe/gi, 'Limpiar')
        .replace(/Turn on/gi, 'Encender')
        .replace(/Check/gi, 'Verificar')
        .replace(/Clean/gi, 'Limpiar')
        .replace(/Restock/gi, 'Reabastecer');
    } else if (language === 'tr') {
      return text
        .replace(/Remove chairs/gi, 'Sandalyeleri kaldır')
        .replace(/Wipe/gi, 'Sil')
        .replace(/Turn on/gi, 'Aç')
        .replace(/Check/gi, 'Kontrol et')
        .replace(/Clean/gi, 'Temizle')
        .replace(/Restock/gi, 'Yeniden stokla');
    }
    return text;
  };

  const canGoNext = currentCategory < categories.length - 1;
  const canGoPrev = currentCategory > 0;

  return (
    <Layout 
      title={`FOH AM Opening - ${categories[currentCategory]}`}
      showBackButton 
      onBack={() => router.push('/foh')}
    >
      {/* Progress Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-gray-500" />
            <span className="text-sm text-gray-600">
              {language === 'es' ? 'Iniciado:' : language === 'tr' ? 'Başladı:' : 'Started:'} {startTime.toLocaleTimeString()}
            </span>
          </div>
          <div className="text-sm font-medium text-gray-900">
            {completionPercentage}% {language === 'es' ? 'Completo' : language === 'tr' ? 'Tamamlandı' : 'Complete'}
          </div>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
            style={{ width: `${completionPercentage}%` }}
          ></div>
        </div>
        
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>{currentCategory + 1} / {categories.length}</span>
          <span>{totalCompleted} / {items.length} {language === 'es' ? 'tareas' : language === 'tr' ? 'görev' : 'tasks'}</span>
        </div>
      </div>

      {/* Current Category */}
      <Card className="p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            {categories[currentCategory]}
          </h2>
          <div className="text-sm text-gray-600">
            {completedInCategory} / {currentCategoryItems.length}
          </div>
        </div>

        <div className="space-y-4">
          {currentCategoryItems.map((item) => (
            <div key={item.id} className={`p-4 rounded-lg border ${item.completed ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'}`}>
              <div className="flex items-start space-x-3">
                <button
                  onClick={() => updateItem(item.id, { completed: !item.completed })}
                  className={`mt-1 h-5 w-5 rounded border-2 flex items-center justify-center ${
                    item.completed ? 'bg-green-500 border-green-500' : 'border-gray-300 hover:border-green-500'
                  }`}
                >
                  {item.completed && <CheckCircle className="h-3 w-3 text-white" />}
                </button>
                
                <div className="flex-1">
                  <p className={`text-sm ${item.completed ? 'text-green-800 line-through' : 'text-gray-900'}`}>
                    {getTranslatedText(item.text)}
                    {item.required && <span className="text-red-500 ml-1">*</span>}
                  </p>
                  
                  {(item.requiresPhoto || item.requiresNote) && (
                    <div className="mt-2 space-y-2">
                      {item.requiresPhoto && (
                        <div className="flex items-center space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handlePhotoUpload(item.id)}
                          >
                            <Camera className="h-4 w-4 mr-1" />
                            {item.photoUrl ? '✓ Photo' : (language === 'es' ? 'Foto Requerida' : language === 'tr' ? 'Fotoğraf Gerekli' : 'Photo Required')}
                          </Button>
                        </div>
                      )}
                      
                      {item.requiresNote && (
                        <div>
                          <textarea
                            value={item.note || ''}
                            onChange={(e) => updateItem(item.id, { note: e.target.value })}
                            placeholder={language === 'es' ? 'Agregar nota...' : language === 'tr' ? 'Not ekle...' : 'Add note...'}
                            className="w-full p-2 text-sm border border-gray-300 rounded"
                            rows={2}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Navigation */}
      <div className="flex space-x-4">
        <Button 
          variant="outline" 
          onClick={() => setCurrentCategory(prev => Math.max(0, prev - 1))}
          disabled={!canGoPrev}
          className="flex-1"
        >
          ← {language === 'es' ? 'Anterior' : language === 'tr' ? 'Önceki' : 'Previous'}
        </Button>
        
        {canGoNext ? (
          <Button 
            onClick={() => setCurrentCategory(prev => prev + 1)}
            className="flex-1"
          >
            {language === 'es' ? 'Siguiente' : language === 'tr' ? 'Sonraki' : 'Next'} →
          </Button>
        ) : (
          <Button 
            onClick={() => {
              // Save worksheet and redirect
              const worksheetData = {
                employee: currentEmployee,
                shift_type: 'AM',
                department: 'FOH',
                language_used: language,
                items: items,
                completion_percentage: completionPercentage,
                submitted_at: new Date().toISOString()
              };
              localStorage.setItem('completed-worksheet', JSON.stringify(worksheetData));
              router.push('/foh/am/complete');
            }}
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
