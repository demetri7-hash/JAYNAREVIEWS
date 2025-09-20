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
    en: 'THE PASS',
    es: 'THE PASS',
    tr: 'THE PASS'
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
    en: 'THE PASS',
    es: 'THE PASS',
    tr: 'THE PASS'
  },
  appDescription: {
    en: 'The Recipe for Restaurant Success',
    es: 'La Receta para el Éxito Restaurantero',
    tr: 'Restoran Başarısının Reçetesi'
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
  
  // User Management - Additional translations
  manageStaffAccess: {
    en: 'Manage staff access and permissions',
    es: 'Gestionar acceso y permisos del personal',
    tr: 'Personel erişim ve izinlerini yönetin'
  },
  activeUsers: {
    en: 'Active Users',
    es: 'Usuarios Activos',
    tr: 'Aktif Kullanıcılar'
  },
  archivedUsers: {
    en: 'Archived Users',
    es: 'Usuarios Archivados',
    tr: 'Arşivlenmiş Kullanıcılar'
  },
  loadingUsers: {
    en: 'Loading users...',
    es: 'Cargando usuarios...',
    tr: 'Kullanıcılar yükleniyor...'
  },
  manager: {
    en: 'Manager',
    es: 'Gerente',
    tr: 'Yönetici'
  },
  employee: {
    en: 'Employee',
    es: 'Empleado',
    tr: 'Çalışan'
  },
  archived: {
    en: 'Archived',
    es: 'Archivado',
    tr: 'Arşivlenmiş'
  },
  joinedOn: {
    en: 'Joined on',
    es: 'Se unió el',
    tr: 'Katıldığı tarih'
  },
  archive: {
    en: 'Archive',
    es: 'Archivar',
    tr: 'Arşivle'
  },
  reactivate: {
    en: 'Reactivate',
    es: 'Reactivar',
    tr: 'Yeniden Etkinleştir'
  },
  noActiveUsers: {
    en: 'No active users found',
    es: 'No se encontraron usuarios activos',
    tr: 'Aktif kullanıcı bulunamadı'
  },
  noArchivedUsers: {
    en: 'No archived users found',
    es: 'No se encontraron usuarios archivados',
    tr: 'Arşivlenmiş kullanıcı bulunamadı'
  },
  accessDenied: {
    en: 'Access Denied',
    es: 'Acceso Denegado',
    tr: 'Erişim Engellendi'
  },
  managerAccessRequired: {
    en: 'Manager access is required to view this page.',
    es: 'Se requiere acceso de gerente para ver esta página.',
    tr: 'Bu sayfayı görüntülemek için yönetici erişimi gereklidir.'
  },
  backToHome: {
    en: 'Back to Home',
    es: 'Volver al Inicio',
    tr: 'Ana Sayfaya Dön'
  },
  errorUpdatingUser: {
    en: 'Error updating user. Please try again.',
    es: 'Error al actualizar usuario. Inténtalo de nuevo.',
    tr: 'Kullanıcı güncellenirken hata oluştu. Lütfen tekrar deneyin.'
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
  },

  // Create Task Page translations
  createNewTaskPage: {
    en: 'Create New Task',
    es: 'Crear Nueva Tarea',
    tr: 'Yeni Görev Oluştur'
  },
  createTaskTemplate: {
    en: 'Create a task template for your restaurant staff',
    es: 'Crear una plantilla de tarea para el personal del restaurante',
    tr: 'Restoran personeli için görev şablonu oluşturun'
  },
  backToDashboard: {
    en: 'Back to Dashboard',
    es: 'Volver al Panel',
    tr: 'Panele Dön'
  },
  returnToDashboard: {
    en: 'Return to Dashboard',
    es: 'Volver al Panel',
    tr: 'Panele Dön'
  },
  accessRestricted: {
    en: 'Access Restricted',
    es: 'Acceso Restringido',
    tr: 'Erişim Kısıtlı'
  },
  managersOnlyAccess: {
    en: 'Only managers can create tasks. You need manager privileges to access this page.',
    es: 'Solo los gerentes pueden crear tareas. Necesitas privilegios de gerente para acceder a esta página.',
    tr: 'Sadece yöneticiler görev oluşturabilir. Bu sayfaya erişmek için yönetici yetkilerine ihtiyacınız var.'
  },
  loading: {
    en: 'Loading...',
    es: 'Cargando...',
    tr: 'Yükleniyor...'
  },
  taskTitle: {
    en: 'Task Title',
    es: 'Título de la Tarea',
    tr: 'Görev Başlığı'
  },
  taskTitlePlaceholder: {
    en: 'e.g., Clean prep tables',
    es: 'ej., Limpiar mesas de preparación',
    tr: 'örn., Hazırlık masalarını temizle'
  },
  description: {
    en: 'Description',
    es: 'Descripción',
    tr: 'Açıklama'
  },
  descriptionPlaceholder: {
    en: 'Detailed instructions for completing this task...',
    es: 'Instrucciones detalladas para completar esta tarea...',
    tr: 'Bu görevi tamamlamak için ayrıntılı talimatlar...'
  },
  frequency: {
    en: 'Frequency',
    es: 'Frecuencia',
    tr: 'Sıklık'
  },
  once: {
    en: 'Once',
    es: 'Una vez',
    tr: 'Bir kez'
  },
  daily: {
    en: 'Daily',
    es: 'Diario',
    tr: 'Günlük'
  },
  weekly: {
    en: 'Weekly',
    es: 'Semanal',
    tr: 'Haftalık'
  },
  monthly: {
    en: 'Monthly',
    es: 'Mensual',
    tr: 'Aylık'
  },
  yearly: {
    en: 'Yearly',
    es: 'Anual',
    tr: 'Yıllık'
  },
  dueDate: {
    en: 'Due Date',
    es: 'Fecha de Vencimiento',
    tr: 'Bitiş Tarihi'
  },
  dueTimePacific: {
    en: 'Due Time (Pacific Time)',
    es: 'Hora de Vencimiento (Hora del Pacífico)',
    tr: 'Bitiş Saati (Pasifik Saati)'
  },
  assignTo: {
    en: 'Assign To (Select Staff)',
    es: 'Asignar a (Seleccionar Personal)',
    tr: 'Atama (Personel Seç)'
  },
  noUsersFound: {
    en: 'No users found. You can assign later.',
    es: 'No se encontraron usuarios. Puedes asignar más tarde.',
    tr: 'Kullanıcı bulunamadı. Daha sonra atayabilirsiniz.'
  },
  requirements: {
    en: 'Requirements',
    es: 'Requisitos',
    tr: 'Gereksinimler'
  },
  requireNotes: {
    en: 'Require notes when completing this task',
    es: 'Requerir notas al completar esta tarea',
    tr: 'Bu görevi tamamlarken not gerektir'
  },
  requirePhotos: {
    en: 'Require photos when completing this task',
    es: 'Requerir fotos al completar esta tarea',
    tr: 'Bu görevi tamamlarken fotoğraf gerektir'
  },
  departmentTags: {
    en: 'Department Tags',
    es: 'Etiquetas de Departamento',
    tr: 'Departman Etiketleri'
  },
  departmentTagsDescription: {
    en: 'Select one or more departments for this task. This helps organize tasks and allows department managers to filter their relevant tasks.',
    es: 'Selecciona uno o más departamentos para esta tarea. Esto ayuda a organizar las tareas y permite a los gerentes de departamento filtrar sus tareas relevantes.',
    tr: 'Bu görev için bir veya daha fazla departman seçin. Bu, görevleri düzenlemeye yardımcı olur ve departman yöneticilerinin ilgili görevlerini filtrelemesine olanak tanır.'
  },
  backOfHouse: {
    en: 'Back of House',
    es: 'Cocina',
    tr: 'Mutfak'
  },
  frontOfHouse: {
    en: 'Front of House',
    es: 'Área de Servicio',
    tr: 'Servis Alanı'
  },
  morningShift: {
    en: 'Morning Shift',
    es: 'Turno Mañana',
    tr: 'Sabah Vardiyası'
  },
  eveningShift: {
    en: 'Evening Shift',
    es: 'Turno Noche',
    tr: 'Akşam Vardiyası'
  },
  prepKitchen: {
    en: 'Prep Kitchen',
    es: 'Cocina de Preparación',
    tr: 'Hazırlık Mutfağı'
  },
  cleaning: {
    en: 'Cleaning',
    es: 'Limpieza',
    tr: 'Temizlik'
  },
  catering: {
    en: 'Catering',
    es: 'Catering',
    tr: 'Catering'
  },
  specialTasks: {
    en: 'Special Tasks',
    es: 'Tareas Especiales',
    tr: 'Özel Görevler'
  },
  shiftTransitions: {
    en: 'Shift Transitions',
    es: 'Transiciones de Turno',
    tr: 'Vardiya Geçişleri'
  },
  selectAtLeastOneDepartment: {
    en: 'Please select at least one department.',
    es: 'Por favor selecciona al menos un departamento.',
    tr: 'Lütfen en az bir departman seçin.'
  },
  createTaskButton: {
    en: 'Create Task',
    es: 'Crear Tarea',
    tr: 'Görev Oluştur'
  },
  creating: {
    en: 'Creating...',
    es: 'Creando...',
    tr: 'Oluşturuluyor...'
  },
  taskTitleRequired: {
    en: 'Task title is required',
    es: 'El título de la tarea es obligatorio',
    tr: 'Görev başlığı gereklidir'
  },
  dueDateRequired: {
    en: 'Due date is required',
    es: 'La fecha de vencimiento es obligatoria',
    tr: 'Bitiş tarihi gereklidir'
  },
  dueTimeRequired: {
    en: 'Due time is required',
    es: 'La hora de vencimiento es obligatoria',
    tr: 'Bitiş saati gereklidir'
  },
  unexpectedError: {
    en: 'An unexpected error occurred',
    es: 'Ocurrió un error inesperado',
    tr: 'Beklenmeyen bir hata oluştu'
  },

  // My Tasks Page translations
  all: {
    en: 'All',
    es: 'Todos',
    tr: 'Tümü'
  },
  overdue: {
    en: 'Overdue',
    es: 'Vencido',
    tr: 'Gecikmiş'
  },
  loadingTasks: {
    en: 'Loading tasks...',
    es: 'Cargando tareas...',
    tr: 'Görevler yükleniyor...'
  },
  noTasksFound: {
    en: 'No tasks found',
    es: 'No se encontraron tareas',
    tr: 'Görev bulunamadı'
  },
  completeTask: {
    en: 'Complete Task',
    es: 'Completar Tarea',
    tr: 'Görevi Tamamla'
  },
  transferTask: {
    en: 'Transfer Task',
    es: 'Transferir Tarea',
    tr: 'Görevi Transfer Et'
  },
  due: {
    en: 'Due',
    es: 'Vence',
    tr: 'Bitiş'
  },
  requiresNotes: {
    en: 'Requires notes',
    es: 'Requiere notas',
    tr: 'Not gerektirir'
  },
  requiresPhoto: {
    en: 'Requires photo',
    es: 'Requiere foto',
    tr: 'Fotoğraf gerektirir'
  },
  loadMore: {
    en: 'Load More',
    es: 'Cargar Más',
    tr: 'Daha Fazla Yükle'
  },
  refresh: {
    en: 'Refresh',
    es: 'Actualizar',
    tr: 'Yenile'
  },
  pleaseAssignTask: {
    en: 'Please assign this task to at least one person',
    es: 'Por favor asigna esta tarea a al menos una persona',
    tr: 'Lütfen bu görevi en az bir kişiye atayın'
  },
  failedToCreateTask: {
    en: 'Failed to create task',
    es: 'Error al crear la tarea',
    tr: 'Görev oluşturulamadı'
  },

  // Additional missing translations for create-task page
  taskDetails: {
    en: 'Task Details',
    es: 'Detalles de la Tarea',
    tr: 'Görev Detayları'
  },
  taskDescription: {
    en: 'Task Description',
    es: 'Descripción de la Tarea',
    tr: 'Görev Açıklaması'
  },
  assignToUsers: {
    en: 'Assign to Users',
    es: 'Asignar a Usuarios',
    tr: 'Kullanıcılara Ata'
  },
  taskRequirements: {
    en: 'Task Requirements',
    es: 'Requisitos de la Tarea',
    tr: 'Görev Gereksinimleri'
  },
  managerOnlyAccess: {
    en: 'Manager-only access required',
    es: 'Se requiere acceso solo para gerentes',
    tr: 'Sadece yönetici erişimi gerekli'
  },
  oneTime: {
    en: 'One Time',
    es: 'Una Vez',
    tr: 'Bir Kez'
  },
  dueTime: {
    en: 'Due Time',
    es: 'Hora de Vencimiento',
    tr: 'Bitiş Saati'
  },
  notesDescription: {
    en: 'Require staff to include notes when completing this task',
    es: 'Requerir que el personal incluya notas al completar esta tarea',
    tr: 'Bu görevi tamamlarken personelin not eklemesini gerektir'
  },
  photoDescription: {
    en: 'Require staff to upload photos when completing this task',
    es: 'Requerir que el personal suba fotos al completar esta tarea',
    tr: 'Bu görevi tamamlarken personelin fotoğraf yüklemesini gerektir'
  },

  // Workflow Management translations (unique ones only)
  workflows: {
    en: 'Workflows',
    es: 'Flujos de Trabajo',
    tr: 'İş Akışları'
  },
  workflowManagement: {
    en: 'Workflow Management',
    es: 'Gestión de Flujos de Trabajo', 
    tr: 'İş Akışı Yönetimi'
  },
  createWorkflow: {
    en: 'Create Workflow',
    es: 'Crear Flujo de Trabajo',
    tr: 'İş Akışı Oluştur'
  },
  workflowName: {
    en: 'Workflow Name',
    es: 'Nombre del Flujo de Trabajo',
    tr: 'İş Akışı Adı'
  },
  enterWorkflowName: {
    en: 'Enter workflow name',
    es: 'Ingrese el nombre del flujo de trabajo',
    tr: 'İş akışı adını girin'
  },
  describeWorkflow: {
    en: 'Describe what this workflow accomplishes',
    es: 'Describa lo que logra este flujo de trabajo',
    tr: 'Bu iş akışının ne yaptığını açıklayın'
  },
  repeatable: {
    en: 'Repeatable',
    es: 'Repetible',
    tr: 'Tekrarlanabilir'
  },
  recurrenceType: {
    en: 'Recurrence Type',
    es: 'Tipo de Recurrencia',
    tr: 'Tekrar Tipi'
  },
  inProgress: {
    en: 'In Progress',
    es: 'En Progreso',
    tr: 'Devam Ediyor'
  },
  completedStatus: {
    en: 'Completed',
    es: 'Completado',
    tr: 'Tamamlandı'
  },
  continueWorkflow: {
    en: 'Continue',
    es: 'Continuar',
    tr: 'Devam Et'
  },
  viewDetails: {
    en: 'View Details',
    es: 'Ver Detalles',
    tr: 'Detayları Gör'
  },
  startWorkflow: {
    en: 'Start Workflow',
    es: 'Iniciar Flujo de Trabajo',
    tr: 'İş Akışını Başlat'
  },
  markComplete: {
    en: 'Mark Complete',
    es: 'Marcar como Completado',
    tr: 'Tamamlandı Olarak İşaretle'
  },
  completeWithDetails: {
    en: 'Complete with Details',
    es: 'Completar con Detalles',
    tr: 'Detaylarla Tamamla'
  },
  progress: {
    en: 'Progress',
    es: 'Progreso',
    tr: 'İlerleme'
  },
  tasksWord: {
    en: 'tasks',
    es: 'tareas',
    tr: 'görev'
  },
  tasksCompleted: {
    en: 'tasks completed',
    es: 'tareas completadas',
    tr: 'görev tamamlandı'
  },
  overallProgress: {
    en: 'Overall Progress',
    es: 'Progreso General',
    tr: 'Genel İlerleme'
  },
  nextTask: {
    en: 'Next Task:',
    es: 'Siguiente Tarea:',
    tr: 'Sonraki Görev:'
  },
  currentTask: {
    en: 'Current Task',
    es: 'Tarea Actual',
    tr: 'Mevcut Görev'
  },
  allTasks: {
    en: 'All Tasks',
    es: 'Todas las Tareas',
    tr: 'Tüm Görevler'
  },
  noWorkflowsAssigned: {
    en: 'No workflows assigned',
    es: 'No hay flujos de trabajo asignados',
    tr: 'Atanmış iş akışı yok'
  },
  noWorkflowsMessage: {
    en: 'You do not have any workflows assigned at the moment.',
    es: 'No tienes flujos de trabajo asignados en este momento.',
    tr: 'Şu anda size atanmış herhangi bir iş akışı bulunmamaktadır.'
  },
  readyToStart: {
    en: 'Ready to Start?',
    es: '¿Listo para Comenzar?',
    tr: 'Başlamaya Hazır mısın?'
  },
  readyToStartMessage: {
    en: 'Click the button below to begin this workflow.',
    es: 'Haga clic en el botón de abajo para comenzar este flujo de trabajo.',
    tr: 'Bu iş akışını başlatmak için aşağıdaki düğmeye tıklayın.'
  },
  workflowCompleted: {
    en: 'Workflow Completed!',
    es: '¡Flujo de Trabajo Completado!',
    tr: 'İş Akışı Tamamlandı!'
  },
  workflowCompletedMessage: {
    en: 'Great job! You have successfully completed all tasks in this workflow.',
    es: '¡Buen trabajo! Has completado exitosamente todas las tareas en este flujo de trabajo.',
    tr: 'Harika iş! Bu iş akışındaki tüm görevleri başarıyla tamamladınız.'
  },
  completedOn: {
    en: 'Completed on',
    es: 'Completado el',
    tr: 'Tamamlanma tarihi'
  },
  assigned: {
    en: 'Assigned',
    es: 'Asignado',
    tr: 'Atandı'
  },
  started: {
    en: 'Started',
    es: 'Iniciado', 
    tr: 'Başlatıldı'
  },
  previousTask: {
    en: 'Previous Task',
    es: 'Tarea Anterior',
    tr: 'Önceki Görev'
  },
  nextTaskNav: {
    en: 'Next Task',
    es: 'Siguiente Tarea',
    tr: 'Sonraki Görev'
  },
  backToMyTasks: {
    en: 'Back to My Tasks',
    es: 'Volver a Mis Tareas',
    tr: 'Görevlerime Dön'
  },
  workflowNotFound: {
    en: 'Workflow Not Found',
    es: 'Flujo de Trabajo No Encontrado',
    tr: 'İş Akışı Bulunamadı'
  },
  workflowNotFoundMessage: {
    en: 'The workflow you are looking for could not be found.',
    es: 'El flujo de trabajo que busca no se pudo encontrar.',
    tr: 'Aradığınız iş akışı bulunamadı.'
  },
  loadingWorkflow: {
    en: 'Loading workflow...',
    es: 'Cargando flujo de trabajo...',
    tr: 'İş akışı yükleniyor...'
  },
  failedToLoadWorkflows: {
    en: 'Failed to fetch workflows',
    es: 'Error al obtener flujos de trabajo',
    tr: 'İş akışları yüklenemedi'
  }
};

// Language flag emojis
export const languageFlags = {
  en: '🇺🇸',
  es: '🇪🇸',
  tr: '🇹🇷'
};