'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'es' | 'tr';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  getText: (en: string, es?: string, tr?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  // Load language preference from localStorage on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('preferred_language') as Language;
    if (savedLanguage && ['en', 'es', 'tr'].includes(savedLanguage)) {
      setLanguage(savedLanguage);
    }
  }, []);

  // Save language preference to localStorage when changed
  const updateLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('preferred_language', lang);
    
    // Also update user profile in database
    fetch('/api/user/language', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ language: lang })
    }).catch(console.error);
  };

  // Get text in current language with fallbacks
  const getText = (en: string, es?: string, tr?: string): string => {
    switch (language) {
      case 'es':
        return es || en;
      case 'tr':
        return tr || en;
      default:
        return en;
    }
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: updateLanguage, getText }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Static translations for common UI elements
export const staticTranslations = {
  // Navigation
  taskManagement: {
    en: 'Task Management',
    es: 'Gestión de Tareas',
    tr: 'Görev Yönetimi'
  },
  userManagement: {
    en: 'User Management',
    es: 'Gestión de Usuarios',
    tr: 'Kullanıcı Yönetimi'
  },
  managerUpdates: {
    en: 'Manager Updates',
    es: 'Actualizaciones del Gerente',
    tr: 'Yönetici Güncellemeleri'
  },
  
  // Common buttons
  save: {
    en: 'Save',
    es: 'Guardar',
    tr: 'Kaydet'
  },
  cancel: {
    en: 'Cancel',
    es: 'Cancelar',
    tr: 'İptal'
  },
  create: {
    en: 'Create',
    es: 'Crear',
    tr: 'Oluştur'
  },
  edit: {
    en: 'Edit',
    es: 'Editar',
    tr: 'Düzenle'
  },
  delete: {
    en: 'Delete',
    es: 'Eliminar',
    tr: 'Sil'
  },
  
  // Status
  completed: {
    en: 'Completed',
    es: 'Completado',
    tr: 'Tamamlandı'
  },
  pending: {
    en: 'Pending',
    es: 'Pendiente',
    tr: 'Bekliyor'
  },
  active: {
    en: 'Active',
    es: 'Activo',
    tr: 'Aktif'
  },
  
  // Priority levels
  low: {
    en: 'Low',
    es: 'Bajo',
    tr: 'Düşük'
  },
  medium: {
    en: 'Medium',
    es: 'Medio',
    tr: 'Orta'
  },
  high: {
    en: 'High',
    es: 'Alto',
    tr: 'Yüksek'
  },
  critical: {
    en: 'Critical',
    es: 'Crítico',
    tr: 'Kritik'
  }
};

// Language flag emojis
export const languageFlags = {
  en: '🇺🇸',
  es: '🇪🇸',
  tr: '🇹🇷'
};