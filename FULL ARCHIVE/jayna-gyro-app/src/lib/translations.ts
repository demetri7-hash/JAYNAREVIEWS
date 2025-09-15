import { Language, Translation } from '@/types';

export const translations: Translation = {
  // Navigation
  'home.title': {
    en: 'Jayna Gyro Employee App',
    es: 'Aplicación de Empleados Jayna Gyro',
    tr: 'Jayna Gyro Çalışan Uygulaması'
  },
  'nav.foh': {
    en: 'Front of House',
    es: 'Frente de Casa',
    tr: 'Ön Hizmet'
  },
  'nav.boh': {
    en: 'Back of House',
    es: 'Cocina',
    tr: 'Mutfak'
  },
  'nav.ordering': {
    en: 'Ordering',
    es: 'Pedidos',
    tr: 'Sipariş'
  },
  'nav.worksheets': {
    en: 'Past Worksheets',
    es: 'Hojas de Trabajo Anteriores',
    tr: 'Geçmiş Çalışma Sayfaları'
  },
  
  // FOH Shifts
  'foh.am': {
    en: 'AM Opening',
    es: 'Apertura Matutina',
    tr: 'Sabah Açılışı'
  },
  'foh.transition': {
    en: 'Transition',
    es: 'Transición',
    tr: 'Geçiş'
  },
  'foh.pm': {
    en: 'PM Closing',
    es: 'Cierre Nocturno',
    tr: 'Akşam Kapanışı'
  },
  'foh.bar': {
    en: 'Bar Operations',
    es: 'Operaciones de Bar',
    tr: 'Bar İşlemleri'
  },

  // BOH Shifts  
  'boh.opening_line': {
    en: 'Opening Line',
    es: 'Línea de Apertura',
    tr: 'Açılış Hattı'
  },
  'boh.morning_prep': {
    en: 'Morning Prep',
    es: 'Preparación Matutina',
    tr: 'Sabah Hazırlığı'
  },
  'boh.morning_clean': {
    en: 'Morning Clean',
    es: 'Limpieza Matutina',
    tr: 'Sabah Temizliği'
  },
  'boh.transition_line': {
    en: 'Transition Line',
    es: 'Línea de Transición',
    tr: 'Geçiş Hattı'
  },
  'boh.closing_line': {
    en: 'Closing Line',
    es: 'Línea de Cierre',
    tr: 'Kapanış Hattı'
  },
  'boh.closing_prep': {
    en: 'Closing Prep/Dishwasher',
    es: 'Preparación de Cierre/Lavaplatos',
    tr: 'Kapanış Hazırlığı/Bulaşıkçı'
  },

  // Common Actions
  'action.select': {
    en: 'Select',
    es: 'Seleccionar',
    tr: 'Seç'
  },
  'action.continue': {
    en: 'Continue',
    es: 'Continuar',
    tr: 'Devam Et'
  },
  'action.complete': {
    en: 'Complete',
    es: 'Completar',
    tr: 'Tamamla'
  },
  'action.submit': {
    en: 'Submit',
    es: 'Enviar',
    tr: 'Gönder'
  },
  'action.back': {
    en: 'Back',
    es: 'Atrás',
    tr: 'Geri'
  },
  'action.save': {
    en: 'Save',
    es: 'Guardar',
    tr: 'Kaydet'
  },

  // Form Fields
  'form.name': {
    en: 'Name',
    es: 'Nombre',
    tr: 'İsim'
  },
  'form.date': {
    en: 'Date',
    es: 'Fecha',
    tr: 'Tarih'
  },
  'form.notes': {
    en: 'Notes',
    es: 'Notas',
    tr: 'Notlar'
  },
  'form.photo': {
    en: 'Photo',
    es: 'Foto',
    tr: 'Fotoğraf'
  },
  'form.required': {
    en: 'Required',
    es: 'Requerido',
    tr: 'Gerekli'
  },

  // Status Messages
  'status.completed': {
    en: 'Completed',
    es: 'Completado',
    tr: 'Tamamlandı'
  },
  'status.in_progress': {
    en: 'In Progress',
    es: 'En Progreso',
    tr: 'Devam Ediyor'
  },
  'status.not_started': {
    en: 'Not Started',
    es: 'No Iniciado',
    tr: 'Başlanmadı'
  },

  // Emergency
  'emergency.contact': {
    en: 'Emergency Contact: 916-513-3192',
    es: 'Contacto de Emergencia: 916-513-3192',
    tr: 'Acil Durum İletişim: 916-513-3192'
  },

  // Cleaning Terms (from Spanish reference files)
  'clean.floors': {
    en: 'Floors',
    es: 'Pisos',
    tr: 'Zeminler'
  },
  'clean.sweep': {
    en: 'Sweep',
    es: 'Barrer',
    tr: 'Süpür'
  },
  'clean.mop': {
    en: 'Mop',
    es: 'Trapear',
    tr: 'Paspasla'
  },
  'clean.bathroom': {
    en: 'Bathroom',
    es: 'Baño',
    tr: 'Banyo'
  },

  // Inventory Terms
  'inventory.quantity': {
    en: 'Quantity',
    es: 'Cantidad',
    tr: 'Miktar'
  },
  'inventory.order_needed': {
    en: 'Order Needed?',
    es: '¿Se necesita pedido?',
    tr: 'Sipariş Gerekli mi?'
  },
  'inventory.urgent': {
    en: 'Urgent',
    es: 'Urgente',
    tr: 'Acil'
  }
};

export const t = (key: string, language: Language = 'en'): string => {
  return translations[key]?.[language] || key;
};

export const getLanguageFlag = (language: Language): string => {
  const flags = {
    en: '🇺🇸',
    es: '🇪🇸', 
    tr: '🇹🇷'
  };
  return flags[language];
};
