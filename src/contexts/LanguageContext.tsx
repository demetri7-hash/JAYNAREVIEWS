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
  },

  // Homepage translations
  appTitle: {
    en: 'Jayna Gyro Task Manager',
    es: 'Administrador de Tareas Jayna Gyro',
    tr: 'Jayna Gyro Görev Yöneticisi'
  },
  appDescription: {
    en: 'Simple task management for restaurant staff',
    es: 'Gestión simple de tareas para el personal del restaurante',
    tr: 'Restoran personeli için basit görev yönetimi'
  },
  signInWithGoogle: {
    en: 'Sign in with Google',
    es: 'Iniciar sesión con Google',
    tr: 'Google ile Giriş Yap'
  },
  secureLogin: {
    en: 'Secure login for restaurant staff only',
    es: 'Inicio de sesión seguro solo para personal del restaurante',
    tr: 'Sadece restoran personeli için güvenli giriş'
  },
  signOut: {
    en: 'Sign out',
    es: 'Cerrar sesión',
    tr: 'Çıkış Yap'
  },
  myTasks: {
    en: 'My Tasks',
    es: 'Mis Tareas',
    tr: 'Görevlerim'
  },
  viewCompleteAssignedTasks: {
    en: 'View and complete your assigned tasks',
    es: 'Ver y completar tus tareas asignadas',
    tr: 'Atanan görevlerinizi görün ve tamamlayın'
  },
  pendingTasks: {
    en: 'Pending',
    es: 'Pendiente',
    tr: 'Bekliyor'
  },
  completedToday: {
    en: 'Completed today',
    es: 'Completado hoy',
    tr: 'Bugün tamamlanan'
  },
  viewMyTasks: {
    en: 'View My Tasks',
    es: 'Ver Mis Tareas',
    tr: 'Görevlerimi Gör'
  },
  createTask: {
    en: 'Create Task',
    es: 'Crear Tarea',
    tr: 'Görev Oluştur'
  },
  createNewTasksAssign: {
    en: 'Create new tasks and assign to staff',
    es: 'Crear nuevas tareas y asignar al personal',
    tr: 'Yeni görevler oluşturun ve personele atayın'
  },
  createNewTask: {
    en: 'Create New Task',
    es: 'Crear Nueva Tarea',
    tr: 'Yeni Görev Oluştur'
  },
  managerDashboard: {
    en: 'Manager Dashboard',
    es: 'Panel del Gerente',
    tr: 'Yönetici Paneli'
  },
  comprehensiveTaskManagement: {
    en: 'Comprehensive task management and team oversight',
    es: 'Gestión integral de tareas y supervisión del equipo',
    tr: 'Kapsamlı görev yönetimi ve ekip denetimi'
  },
  openManagerDashboard: {
    en: 'Open Manager Dashboard',
    es: 'Abrir Panel del Gerente',
    tr: 'Yönetici Panelini Aç'
  },
  teamActivity: {
    en: 'Team Activity',
    es: 'Actividad del Equipo',
    tr: 'Ekip Etkinliği'
  },
  teamPerformanceInsights: {
    en: 'Team performance insights and activity tracking',
    es: 'Información sobre el rendimiento del equipo y seguimiento de actividades',
    tr: 'Ekip performans bilgileri ve aktivite takibi'
  },
  viewTeamActivity: {
    en: 'View Team Activity',
    es: 'Ver Actividad del Equipo',
    tr: 'Ekip Etkinliğini Gör'
  },
  weeklyReports: {
    en: 'Weekly Reports',
    es: 'Informes Semanales',
    tr: 'Haftalık Raporlar'
  },
  weeklyPerformanceReports: {
    en: 'Weekly performance reports and analytics',
    es: 'Informes de rendimiento semanal y análisis',
    tr: 'Haftalık performans raporları ve analizler'
  },
  viewWeeklyReports: {
    en: 'View Weekly Reports',
    es: 'Ver Informes Semanales',
    tr: 'Haftalık Raporları Gör'
  },
  transferRequests: {
    en: 'Transfer Requests',
    es: 'Solicitudes de Transferencia',
    tr: 'Transfer Talepleri'
  },
  recentCompletionsUpdates: {
    en: 'Team performance insights and activity tracking',
    es: 'Información sobre el rendimiento del equipo y seguimiento de actividades',
    tr: 'Ekip performans bilgileri ve aktivite takibi'
  },
  viewAllActivity: {
    en: 'View All Activity',
    es: 'Ver Toda la Actividad',
    tr: 'Tüm Aktiviteyi Gör'
  },
  viewArchivedWeeklyReports: {
    en: 'View archived weekly performance reports',
    es: 'Ver informes de rendimiento semanal archivados',
    tr: 'Arşivlenmiş haftalık performans raporlarını görüntüle'
  },
  manageTaskTransfers: {
    en: 'Manage task transfers and reassignments',
    es: 'Gestionar transferencias de tareas y reasignaciones',
    tr: 'Görev transferlerini ve yeniden atamalarını yönetin'
  },
  viewTransfers: {
    en: 'View Transfers',
    es: 'Ver Transferencias',
    tr: 'Transferleri Gör'
  },
  reviewApproveTransfers: {
    en: 'Review and approve transfer requests',
    es: 'Revisar y aprobar solicitudes de transferencia',
    tr: 'Transfer taleplerini inceleyin ve onaylayın'
  },
  viewTransferRequestsAssigned: {
    en: 'View transfer requests assigned to you',
    es: 'Ver solicitudes de transferencia asignadas a ti',
    tr: 'Size atanan transfer taleplerini görüntüleyin'
  },
  pendingApproval: {
    en: 'Pending approval',
    es: 'Pendiente de aprobación',
    tr: 'Onay bekliyor'
  },
  viewTransferRequests: {
    en: 'View Transfer Requests',
    es: 'Ver Solicitudes de Transferencia',
    tr: 'Transfer Taleplerini Gör'
  }
};

// Language flag emojis
export const languageFlags = {
  en: '🇺🇸',
  es: '🇪🇸',
  tr: '🇹🇷'
};