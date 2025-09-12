// Translation system for The Pass - Mexican Spanish and Turkish
export interface Translation {
  [key: string]: string | Translation
}

export const translations = {
  en: {
    // Navigation
    nav: {
      home: "Home",
      schedules: "Schedules", 
      reviews: "Reviews",
      workflows: "Workflows",
      taskTransfers: "Task Transfers",
      myTasks: "My Tasks",
      signOut: "Sign Out",
      menu: "Menu",
      notifications: "Notifications"
    },

    // Common actions
    actions: {
      save: "Save",
      cancel: "Cancel", 
      submit: "Submit",
      edit: "Edit",
      delete: "Delete",
      accept: "Accept",
      deny: "Deny",
      transfer: "Transfer",
      complete: "Complete",
      pending: "Pending",
      approved: "Approved",
      rejected: "Rejected",
      loading: "Loading...",
      success: "Success",
      error: "Error",
      back: "Back",
      next: "Next",
      previous: "Previous",
      close: "Close",
      open: "Open",
      view: "View",
      add: "Add",
      remove: "Remove",
      update: "Update",
      refresh: "Refresh"
    },

    // Home page
    home: {
      title: "The Pass",
      subtitle: "Jayna Gyro Community",
      description: "Stay connected with your team updates, announcements, and achievements",
      morningShift: "Morning Shift",
      eveningShift: "Evening Shift",
      openingChecklist: "Opening Checklist",
      closingChecklist: "Closing Checklist",
      startMorningWorkflow: "Start Morning Workflow",
      startEveningWorkflow: "Start Evening Workflow",
      viewHistory: "View History",
      previousWorkflows: "Previous Workflows",
      history: "History",
      pendingRequests: "Pending Requests",
      manageTransfers: "Manage Transfers",
      accountPendingApproval: "Account Pending Approval",
      accountPendingMessage: "Your account has been created but needs to be activated by a manager before you can access the system."
    },

    // Reviews
    reviews: {
      title: "Line Reviews",
      subtitle: "Complete and view line reviews",
      passwordProtected: "Password Protected",
      enterPassword: "Enter Password",
      password: "Password",
      passwordPlaceholder: "Enter review password",
      invalidPassword: "Invalid password",
      bohMorningReview: "BOH Morning Review",
      bohPrepReview: "BOH Prep Review", 
      bohEveningReview: "BOH Evening Review",
      manualReview: "Manual Review",
      lastUpdated: "Last Updated",
      score: "Score",
      updateReview: "Update Review",
      notes: "Notes",
      notesPlaceholder: "Add any notes or comments...",
      rating: "Rating",
      excellent: "Excellent",
      good: "Good",
      average: "Average",
      needsImprovement: "Needs Improvement",
      poor: "Poor",
      addPhoto: "Add Photo",
      reviewUpdated: "Review updated successfully",
      reviewFailed: "Failed to update review",
      cannotUpdateYet: "Cannot update yet (6-hour window)",
      managerOverride: "Manager Override Available"
    },

    // Task Transfers
    taskTransfers: {
      title: "Task Transfer Center",
      description: "Transfer tasks between team members, manage incoming requests, and track transfer history. All transfers require acceptance from the recipient to ensure accountability.",
      transferTasks: "Transfer Tasks",
      transferTasksDesc: "Send tasks to other team members when you need help or when someone else is better suited for the job.",
      acceptRequests: "Accept Requests", 
      acceptRequestsDesc: "Review and respond to incoming transfer requests. Help your teammates by accepting tasks you can handle.",
      trackHistory: "Track History",
      trackHistoryDesc: "View all your transfer activity, see response statuses, and maintain accountability for task ownership.",
      transferGuidelines: "Transfer Guidelines",
      whenToTransfer: "When to Transfer:",
      whenToTransferList: [
        "You're overwhelmed with work",
        "Task requires specific expertise", 
        "You're going on break/shift end",
        "Emergency situation needs attention",
        "Training someone new"
      ],
      bestPractices: "Best Practices:",
      bestPracticesList: [
        "Always provide a clear reason",
        "Transfer to qualified team members",
        "Respect daily transfer limits",
        "Follow up if urgent",
        "Thank people who help you"
      ],
      incomingRequests: "Incoming Transfer Requests",
      transferHistory: "Transfer History",
      transferTo: "Transfer to:",
      reasonForTransfer: "Reason for transfer:",
      reasonPlaceholder: "Why are you transferring this task?",
      selectUser: "Select a user...",
      selectTeamMember: "Select a team member...",
      sendRequest: "Send Request",
      transferFrom: "Transfer from",
      transferredTo: "Transferred to",
      taskType: "Task Type",
      requested: "Requested",
      responded: "Responded",
      response: "Response",
      reason: "Reason",
      noReasonProvided: "No reason provided",
      transferPermissions: "Your Transfer Permissions",
      dailyLimit: "Daily Limit",
      approvalRequired: "Approval Required",
      departmentRestrictions: "Department Restrictions",
      none: "None",
      yes: "Yes",
      no: "No",
      transfers: "transfers",
      transferRequest: "Transfer Request",
      transferRequestSent: "Transfer request sent successfully",
      transferFailed: "Transfer failed",
      transferAccepted: "Transfer accepted successfully",
      transferDenied: "Transfer denied successfully",
      dailyLimitReached: "Daily transfer limit reached",
      targetUserNotFound: "Target user not found or inactive",
      cannotTransferToDepartment: "Cannot transfer to this department",
      transferRequestAlreadyResponded: "Transfer request has already been responded to",
      reasonForDenying: "Reason for denying (optional):",
      sending: "Sending...",
      accepting: "Accepting...",
      denying: "Denying...",
      quickReasons: {
        needHelp: "Need help",
        goingOnBreak: "Going on break", 
        emergencyPriority: "Emergency priority",
        betterSuited: "Better suited for this",
        trainingOpportunity: "Training opportunity"
      }
    },

    // Workflows & Checklists
    workflows: {
      title: "Workflows",
      subtitle: "Access checklists and procedures",
      openingChecklist: "Opening Checklist",
      closingChecklist: "Closing Checklist",
      prepWorksheet: "Prep Worksheet",
      inventorySheet: "Inventory Sheet",
      cleaningList: "Cleaning List",
      transitionChecklist: "Transition Checklist",
      barClosing: "Bar Closing",
      fohOpening: "FOH Opening",
      fohClosing: "FOH Closing", 
      fohTransition: "FOH Transition",
      bohOpening: "BOH Opening",
      bohClosing: "BOH Closing",
      amPrepDaily: "AM Prep Daily",
      dryGoodsInventory: "Dry Goods Inventory",
      lineRatings: "Line Ratings",
      missingIngredients: "Missing Ingredients",
      toGoInventory: "To Go Inventory",
      leadPrepWorksheet: "Lead Prep Worksheet",
      completed: "Completed",
      inProgress: "In Progress",
      notStarted: "Not Started",
      itemsCompleted: "items completed",
      totalItems: "total items"
    },

    // Notifications
    notifications: {
      title: "Notifications",
      markAsRead: "Mark as Read",
      markAllAsRead: "Mark All as Read",
      noNotifications: "No notifications",
      newNotification: "New notification",
      unreadNotifications: "unread notifications",
      taskTransfer: "Task Transfer",
      taskTransferResponse: "Task Transfer Response",
      taskTransferred: "Task Successfully Transferred",
      reviewUpdate: "Review Update",
      managerUpdate: "Manager Update",
      wallPost: "Wall Post",
      acknowledgmentRequired: "Acknowledgment Required",
      priority: {
        low: "Low Priority",
        normal: "Normal Priority", 
        high: "High Priority",
        urgent: "Urgent"
      }
    },

    // Wall Feed
    wallFeed: {
      title: "Community Feed",
      createPost: "Create Post",
      whatsHappening: "What's happening?",
      postUpdate: "Post Update",
      managerUpdate: "Manager Update",
      announcement: "Announcement",
      postTypes: {
        general: "General",
        announcement: "Announcement", 
        achievement: "Achievement",
        question: "Question",
        help: "Help Needed"
      },
      reactions: {
        like: "Like",
        love: "Love",
        laugh: "Laugh", 
        wow: "Wow",
        sad: "Sad",
        angry: "Angry"
      },
      comments: "Comments",
      shares: "Shares",
      timeAgo: {
        now: "now",
        minute: "1m",
        minutes: "m",
        hour: "1h", 
        hours: "h",
        day: "1d",
        days: "d",
        week: "1w",
        weeks: "w"
      }
    },

    // Manager Dashboard
    manager: {
      title: "Manager Dashboard",
      createUpdate: "Create Update",
      targetAudience: "Target Audience",
      updateTitle: "Update Title",
      updateMessage: "Update Message",
      requiresSignature: "Requires Signature",
      priorityLevel: "Priority Level", 
      sendUpdate: "Send Update",
      allEmployees: "All Employees",
      department: "Department",
      role: "Role",
      individual: "Individual",
      selectDepartment: "Select Department",
      selectRole: "Select Role",
      selectEmployee: "Select Employee",
      updateSent: "Update sent successfully",
      updateFailed: "Failed to send update"
    },

    // Departments & Roles
    departments: {
      foh: "Front of House",
      boh: "Back of House", 
      management: "Management",
      all: "All Departments"
    },

    roles: {
      employee: "Employee",
      teamLead: "Team Lead",
      shiftSupervisor: "Shift Supervisor", 
      assistantManager: "Assistant Manager",
      manager: "Manager",
      admin: "Admin"
    },

    // Authentication
    auth: {
      signIn: "Sign In",
      signUp: "Sign Up",
      signOut: "Sign Out",
      email: "Email",
      password: "Password",
      confirmPassword: "Confirm Password",
      firstName: "First Name",
      lastName: "Last Name",
      employeeId: "Employee ID",
      role: "Role",
      signInSubtitle: "Access your Jayna Gyro account",
      signUpSubtitle: "Create your Jayna Gyro account",
      emailPlaceholder: "Enter your email",
      passwordPlaceholder: "Enter your password",
      firstNamePlaceholder: "Enter your first name",
      lastNamePlaceholder: "Enter your last name",
      employeeIdPlaceholder: "Enter your employee ID",
      signInWithGoogle: "Sign in with Google",
      signUpWithGoogle: "Sign up with Google",
      noAccount: "Don't have an account?",
      haveAccount: "Already have an account?",
      signingIn: "Signing in...",
      signingUp: "Creating account...",
      or: "OR",
      forgotPassword: "Forgot your password?",
      resetPassword: "Reset Password",
      passwordRequirements: "Password must be at least 8 characters with uppercase, lowercase, number, and special character",
      invalidCredentials: "Invalid email or password",
      accountCreated: "Account created successfully",
      accountExists: "Account already exists with this email",
      passwordMismatch: "Passwords do not match",
      requiredField: "This field is required",
      invalidEmail: "Please enter a valid email address",
      weakPassword: "Password is too weak"
    },

    // Error Messages
    errors: {
      somethingWentWrong: "Something went wrong",
      pageNotFound: "Page not found",
      accessDenied: "Access denied",
      sessionExpired: "Session expired", 
      networkError: "Network error",
      tryAgain: "Please try again",
      contactSupport: "Contact support if the problem persists"
    },

    // Success Messages
    success: {
      saved: "Saved successfully",
      updated: "Updated successfully",
      deleted: "Deleted successfully",
      sent: "Sent successfully",
      completed: "Completed successfully"
    },

    // Time & Dates
    time: {
      am: "AM",
      pm: "PM",
      today: "Today",
      yesterday: "Yesterday", 
      tomorrow: "Tomorrow",
      thisWeek: "This Week",
      lastWeek: "Last Week",
      thisMonth: "This Month",
      lastMonth: "Last Month"
    },

    // Real-time features
    realtime: {
      status: {
        connected: "Connected",
        connecting: "Connecting",
        disconnected: "Disconnected",
        error: "Connection Error"
      },
      retry: "Retry",
      notifications: {
        title: "Notifications",
        empty: "No notifications",
        default_title: "Notification"
      },
      timeago: {
        now: "Just now",
        minutes: "{minutes}m ago",
        hours: "{hours}h ago"
      },
      activity: {
        title: "Live Activity", 
        task_update: "Task updated: {task}",
        workflow_update: "Workflow changed: {workflow}",
        review_update: "Review by {user}",
        notification: "New notification",
        default: "New activity",
        more: "+{count} more"
      }
    }
  },

  es: {
    // Navigation  
    nav: {
      home: "Inicio",
      schedules: "Horarios",
      reviews: "Revisiones", 
      workflows: "Flujos de Trabajo",
      taskTransfers: "Transferencias de Tareas",
      myTasks: "Mis Tareas",
      signOut: "Cerrar Sesión",
      menu: "Menú",
      notifications: "Notificaciones"
    },

    // Common actions
    actions: {
      save: "Guardar",
      cancel: "Cancelar",
      submit: "Enviar", 
      edit: "Editar",
      delete: "Eliminar",
      accept: "Aceptar",
      deny: "Rechazar",
      transfer: "Transferir",
      complete: "Completar",
      pending: "Pendiente",
      approved: "Aprobado",
      rejected: "Rechazado",
      loading: "Cargando...",
      success: "Éxito",
      error: "Error",
      back: "Atrás",
      next: "Siguiente",
      previous: "Anterior",
      close: "Cerrar",
      open: "Abrir",
      view: "Ver",
      add: "Agregar",
      remove: "Quitar",
      update: "Actualizar",
      refresh: "Actualizar"
    },

    // Home page
    home: {
      title: "The Pass",
      subtitle: "Comunidad Jayna Gyro",
      description: "Mantente conectado con las actualizaciones, anuncios y logros de tu equipo",
      morningShift: "Turno Matutino",
      eveningShift: "Turno Vespertino",
      openingChecklist: "Lista de Apertura",
      closingChecklist: "Lista de Cierre",
      startMorningWorkflow: "Iniciar Flujo Matutino",
      startEveningWorkflow: "Iniciar Flujo Vespertino",
      viewHistory: "Ver Historial",
      previousWorkflows: "Flujos Anteriores",
      history: "Historial",
      pendingRequests: "Solicitudes Pendientes",
      manageTransfers: "Administrar Transferencias",
      accountPendingApproval: "Cuenta Pendiente de Aprobación",
      accountPendingMessage: "Tu cuenta ha sido creada pero necesita ser activada por un gerente antes de que puedas acceder al sistema."
    },

    // Reviews
    reviews: {
      title: "Revisiones de Línea",
      subtitle: "Completar y ver revisiones de línea",
      passwordProtected: "Protegido por Contraseña",
      enterPassword: "Ingresar Contraseña",
      password: "Contraseña",
      passwordPlaceholder: "Ingresa la contraseña de revisión",
      invalidPassword: "Contraseña inválida",
      bohMorningReview: "Revisión Matutina BOH",
      bohPrepReview: "Revisión de Preparación BOH",
      bohEveningReview: "Revisión Vespertina BOH",
      manualReview: "Revisión Manual",
      lastUpdated: "Última Actualización",
      score: "Puntuación",
      updateReview: "Actualizar Revisión",
      notes: "Notas",
      notesPlaceholder: "Agregar notas o comentarios...",
      rating: "Calificación",
      excellent: "Excelente",
      good: "Bueno",
      average: "Promedio",
      needsImprovement: "Necesita Mejorar",
      poor: "Deficiente",
      addPhoto: "Agregar Foto",
      reviewUpdated: "Revisión actualizada exitosamente",
      reviewFailed: "Error al actualizar revisión",
      cannotUpdateYet: "No se puede actualizar aún (ventana de 6 horas)",
      managerOverride: "Anulación de Gerente Disponible"
    },

    // Task Transfers
    taskTransfers: {
      title: "Centro de Transferencia de Tareas",
      description: "Transfiere tareas entre miembros del equipo, gestiona solicitudes entrantes y rastrea el historial de transferencias. Todas las transferencias requieren aceptación del destinatario para garantizar responsabilidad.",
      transferTasks: "Transferir Tareas",
      transferTasksDesc: "Envía tareas a otros miembros del equipo cuando necesites ayuda o cuando alguien más sea más adecuado para el trabajo.",
      acceptRequests: "Aceptar Solicitudes",
      acceptRequestsDesc: "Revisa y responde a las solicitudes de transferencia entrantes. Ayuda a tus compañeros aceptando tareas que puedas manejar.",
      trackHistory: "Rastrear Historial", 
      trackHistoryDesc: "Ve toda tu actividad de transferencia, consulta los estados de respuesta y mantén la responsabilidad por la propiedad de las tareas.",
      transferGuidelines: "Pautas de Transferencia",
      whenToTransfer: "Cuándo Transferir:",
      whenToTransferList: [
        "Estás abrumado con trabajo",
        "La tarea requiere experiencia específica",
        "Te vas de descanso/fin de turno",
        "Situación de emergencia necesita atención",
        "Entrenando a alguien nuevo"
      ],
      bestPractices: "Mejores Prácticas:",
      bestPracticesList: [
        "Siempre proporciona una razón clara",
        "Transfiere a miembros calificados del equipo",
        "Respeta los límites diarios de transferencia",
        "Haz seguimiento si es urgente",
        "Agradece a las personas que te ayudan"
      ],
      incomingRequests: "Solicitudes de Transferencia Entrantes",
      transferHistory: "Historial de Transferencias",
      transferTo: "Transferir a:",
      reasonForTransfer: "Razón para transferir:",
      reasonPlaceholder: "¿Por qué estás transfiriendo esta tarea?",
      selectUser: "Seleccionar un usuario...",
      selectTeamMember: "Seleccionar un miembro del equipo...",
      sendRequest: "Enviar Solicitud",
      transferFrom: "Transferir de",
      transferredTo: "Transferido a",
      taskType: "Tipo de Tarea",
      requested: "Solicitado",
      responded: "Respondido",
      response: "Respuesta",
      reason: "Razón",
      noReasonProvided: "No se proporcionó razón",
      transferPermissions: "Tus Permisos de Transferencia",
      dailyLimit: "Límite Diario",
      approvalRequired: "Aprobación Requerida",
      departmentRestrictions: "Restricciones de Departamento",
      none: "Ninguna",
      yes: "Sí",
      no: "No",
      transfers: "transferencias",
      transferRequest: "Solicitud de Transferencia",
      transferRequestSent: "Solicitud de transferencia enviada exitosamente",
      transferFailed: "Transferencia falló",
      transferAccepted: "Transferencia aceptada exitosamente",
      transferDenied: "Transferencia rechazada exitosamente",
      dailyLimitReached: "Límite diario de transferencia alcanzado",
      targetUserNotFound: "Usuario objetivo no encontrado o inactivo",
      cannotTransferToDepartment: "No se puede transferir a este departamento",
      transferRequestAlreadyResponded: "La solicitud de transferencia ya ha sido respondida",
      reasonForDenying: "Razón para rechazar (opcional):",
      sending: "Enviando...",
      accepting: "Aceptando...",
      denying: "Rechazando...",
      quickReasons: {
        needHelp: "Necesito ayuda",
        goingOnBreak: "Me voy de descanso",
        emergencyPriority: "Prioridad de emergencia",
        betterSuited: "Mejor adecuado para esto",
        trainingOpportunity: "Oportunidad de entrenamiento"
      }
    },

    // Workflows & Checklists
    workflows: {
      title: "Flujos de Trabajo",
      subtitle: "Acceder a listas de verificación y procedimientos",
      openingChecklist: "Lista de Apertura",
      closingChecklist: "Lista de Cierre",
      prepWorksheet: "Hoja de Preparación",
      inventorySheet: "Hoja de Inventario",
      cleaningList: "Lista de Limpieza",
      transitionChecklist: "Lista de Transición",
      barClosing: "Cierre de Bar",
      fohOpening: "Apertura FOH",
      fohClosing: "Cierre FOH",
      fohTransition: "Transición FOH",
      bohOpening: "Apertura BOH",
      bohClosing: "Cierre BOH",
      amPrepDaily: "Preparación Diaria AM",
      dryGoodsInventory: "Inventario de Productos Secos",
      lineRatings: "Calificaciones de Línea",
      missingIngredients: "Ingredientes Faltantes",
      toGoInventory: "Inventario Para Llevar",
      leadPrepWorksheet: "Hoja de Preparación Principal",
      completed: "Completado",
      inProgress: "En Progreso",
      notStarted: "No Iniciado",
      itemsCompleted: "artículos completados",
      totalItems: "artículos totales"
    },

    // Notifications
    notifications: {
      title: "Notificaciones",
      markAsRead: "Marcar como Leído",
      markAllAsRead: "Marcar Todo como Leído",
      noNotifications: "Sin notificaciones",
      newNotification: "Nueva notificación",
      unreadNotifications: "notificaciones sin leer",
      taskTransfer: "Transferencia de Tarea",
      taskTransferResponse: "Respuesta de Transferencia de Tarea",
      taskTransferred: "Tarea Transferida Exitosamente",
      reviewUpdate: "Actualización de Revisión",
      managerUpdate: "Actualización de Gerente",
      wallPost: "Publicación en Muro",
      acknowledgmentRequired: "Reconocimiento Requerido",
      priority: {
        low: "Prioridad Baja",
        normal: "Prioridad Normal",
        high: "Prioridad Alta",
        urgent: "Urgente"
      }
    },

    // Wall Feed
    wallFeed: {
      title: "Feed de Comunidad",
      createPost: "Crear Publicación",
      whatsHappening: "¿Qué está pasando?",
      postUpdate: "Publicar Actualización",
      managerUpdate: "Actualización de Gerente",
      announcement: "Anuncio",
      postTypes: {
        general: "General",
        announcement: "Anuncio",
        achievement: "Logro",
        question: "Pregunta",
        help: "Ayuda Necesaria"
      },
      reactions: {
        like: "Me Gusta",
        love: "Me Encanta",
        laugh: "Risa",
        wow: "Wow",
        sad: "Triste",
        angry: "Enojado"
      },
      comments: "Comentarios",
      shares: "Compartidos",
      timeAgo: {
        now: "ahora",
        minute: "1m",
        minutes: "m",
        hour: "1h",
        hours: "h",
        day: "1d",
        days: "d",
        week: "1sem",
        weeks: "sem"
      }
    },

    // Manager Dashboard
    manager: {
      title: "Panel de Gerente",
      createUpdate: "Crear Actualización",
      targetAudience: "Audiencia Objetivo",
      updateTitle: "Título de Actualización",
      updateMessage: "Mensaje de Actualización",
      requiresSignature: "Requiere Firma",
      priorityLevel: "Nivel de Prioridad",
      sendUpdate: "Enviar Actualización",
      allEmployees: "Todos los Empleados",
      department: "Departamento",
      role: "Rol",
      individual: "Individual",
      selectDepartment: "Seleccionar Departamento",
      selectRole: "Seleccionar Rol",
      selectEmployee: "Seleccionar Empleado",
      updateSent: "Actualización enviada exitosamente",
      updateFailed: "Error al enviar actualización"
    },

    // Departments & Roles
    departments: {
      foh: "Frente de Casa",
      boh: "Fondo de Casa",
      management: "Gerencia",
      all: "Todos los Departamentos"
    },

    roles: {
      employee: "Empleado",
      teamLead: "Líder de Equipo",
      shiftSupervisor: "Supervisor de Turno",
      assistantManager: "Gerente Asistente",
      manager: "Gerente",
      admin: "Administrador"
    },

    // Authentication
    auth: {
      signIn: "Iniciar Sesión",
      signUp: "Registrarse",
      signOut: "Cerrar Sesión",
      email: "Correo Electrónico",
      password: "Contraseña",
      confirmPassword: "Confirmar Contraseña",
      firstName: "Nombre",
      lastName: "Apellido",
      employeeId: "ID de Empleado",
      role: "Rol",
      signInSubtitle: "Accede a tu cuenta de Jayna Gyro",
      signUpSubtitle: "Crea tu cuenta de Jayna Gyro",
      emailPlaceholder: "Ingresa tu correo electrónico",
      passwordPlaceholder: "Ingresa tu contraseña",
      firstNamePlaceholder: "Ingresa tu nombre",
      lastNamePlaceholder: "Ingresa tu apellido",
      employeeIdPlaceholder: "Ingresa tu ID de empleado",
      signInWithGoogle: "Iniciar sesión con Google",
      signUpWithGoogle: "Registrarse con Google",
      noAccount: "¿No tienes una cuenta?",
      haveAccount: "¿Ya tienes una cuenta?",
      signingIn: "Iniciando sesión...",
      signingUp: "Creando cuenta...",
      or: "O",
      forgotPassword: "¿Olvidaste tu contraseña?",
      resetPassword: "Restablecer Contraseña",
      passwordRequirements: "La contraseña debe tener al menos 8 caracteres con mayúsculas, minúsculas, números y caracteres especiales",
      invalidCredentials: "Correo electrónico o contraseña inválidos",
      accountCreated: "Cuenta creada exitosamente",
      accountExists: "Ya existe una cuenta con este correo electrónico",
      passwordMismatch: "Las contraseñas no coinciden",
      requiredField: "Este campo es obligatorio",
      invalidEmail: "Por favor ingresa un correo electrónico válido",
      weakPassword: "La contraseña es muy débil"
    },

    // Error Messages
    errors: {
      somethingWentWrong: "Algo salió mal",
      pageNotFound: "Página no encontrada",
      accessDenied: "Acceso denegado",
      sessionExpired: "Sesión expirada",
      networkError: "Error de red",
      tryAgain: "Por favor intenta de nuevo",
      contactSupport: "Contacta soporte si el problema persiste"
    },

    // Success Messages
    success: {
      saved: "Guardado exitosamente",
      updated: "Actualizado exitosamente",
      deleted: "Eliminado exitosamente",
      sent: "Enviado exitosamente",
      completed: "Completado exitosamente"
    },

    // Time & Dates
    time: {
      am: "AM",
      pm: "PM",
      today: "Hoy",
      yesterday: "Ayer",
      tomorrow: "Mañana",
      thisWeek: "Esta Semana",
      lastWeek: "Semana Pasada",
      thisMonth: "Este Mes",
      lastMonth: "Mes Pasado"
    }
  },

  tr: {
    // Navigation
    nav: {
      home: "Ana Sayfa",
      schedules: "Programlar",
      reviews: "İncelemeler",
      workflows: "İş Akışları",
      taskTransfers: "Görev Transferleri",
      myTasks: "Görevlerim",
      signOut: "Çıkış Yap",
      menu: "Menü",
      notifications: "Bildirimler"
    },

    // Common actions
    actions: {
      save: "Kaydet",
      cancel: "İptal",
      submit: "Gönder",
      edit: "Düzenle",
      delete: "Sil",
      accept: "Kabul Et",
      deny: "Reddet",
      transfer: "Transfer Et",
      complete: "Tamamla",
      pending: "Beklemede",
      approved: "Onaylandı",
      rejected: "Reddedildi",
      loading: "Yükleniyor...",
      success: "Başarılı",
      error: "Hata",
      back: "Geri",
      next: "İleri",
      previous: "Önceki",
      close: "Kapat",
      open: "Aç",
      view: "Görüntüle",
      add: "Ekle",
      remove: "Kaldır",
      update: "Güncelle",
      refresh: "Yenile"
    },

    // Home page
    home: {
      title: "The Pass",
      subtitle: "Jayna Gyro Topluluğu",
      description: "Ekip güncellemeleri, duyurular ve başarılarla bağlantıda kalın",
      morningShift: "Sabah Vardiyası",
      eveningShift: "Akşam Vardiyası",
      openingChecklist: "Açılış Kontrol Listesi",
      closingChecklist: "Kapanış Kontrol Listesi",
      startMorningWorkflow: "Sabah İş Akışını Başlat",
      startEveningWorkflow: "Akşam İş Akışını Başlat",
      viewHistory: "Geçmişi Görüntüle",
      previousWorkflows: "Önceki İş Akışları",
      history: "Geçmiş",
      pendingRequests: "Bekleyen İstekler",
      manageTransfers: "Transferleri Yönet",
      accountPendingApproval: "Hesap Onay Bekliyor",
      accountPendingMessage: "Hesabınız oluşturuldu ancak sisteme erişebilmeniz için bir yönetici tarafından aktifleştirilmesi gerekiyor."
    },

    // Reviews
    reviews: {
      title: "Hat İncelemeleri",
      subtitle: "Hat incelemelerini tamamla ve görüntüle",
      passwordProtected: "Şifre Korumalı",
      enterPassword: "Şifre Gir",
      password: "Şifre",
      passwordPlaceholder: "İnceleme şifresini girin",
      invalidPassword: "Geçersiz şifre",
      bohMorningReview: "BOH Sabah İncelemesi",
      bohPrepReview: "BOH Hazırlık İncelemesi",
      bohEveningReview: "BOH Akşam İncelemesi",
      manualReview: "Manuel İnceleme",
      lastUpdated: "Son Güncelleme",
      score: "Puan",
      updateReview: "İncelemeyi Güncelle",
      notes: "Notlar",
      notesPlaceholder: "Not veya yorum ekle...",
      rating: "Değerlendirme",
      excellent: "Mükemmel",
      good: "İyi",
      average: "Ortalama",
      needsImprovement: "İyileştirilmeli",
      poor: "Zayıf",
      addPhoto: "Fotoğraf Ekle",
      reviewUpdated: "İnceleme başarıyla güncellendi",
      reviewFailed: "İnceleme güncellenemedi",
      cannotUpdateYet: "Henüz güncellenemiyor (6 saatlik pencere)",
      managerOverride: "Yönetici Geçersiz Kılma Mevcut"
    },

    // Task Transfers
    taskTransfers: {
      title: "Görev Transfer Merkezi",
      description: "Ekip üyeleri arasında görev transferi yapın, gelen istekleri yönetin ve transfer geçmişini takip edin. Tüm transferler sorumluluk sağlamak için alıcının kabulünü gerektirir.",
      transferTasks: "Görevleri Transfer Et",
      transferTasksDesc: "Yardıma ihtiyacınız olduğunda veya başka biri işe daha uygun olduğunda görevleri diğer ekip üyelerine gönderin.",
      acceptRequests: "İstekleri Kabul Et",
      acceptRequestsDesc: "Gelen transfer isteklerini inceleyin ve yanıtlayın. Üstesinden gelebileceğiniz görevleri kabul ederek takım arkadaşlarınıza yardım edin.",
      trackHistory: "Geçmişi Takip Et",
      trackHistoryDesc: "Tüm transfer etkinliğinizi görüntüleyin, yanıt durumlarını kontrol edin ve görev sahipliği için hesap verebilirliği koruyun.",
      transferGuidelines: "Transfer Kuralları",
      whenToTransfer: "Ne Zaman Transfer Edilir:",
      whenToTransferList: [
        "İşle bunalmış durumdasınız",
        "Görev özel uzmanlık gerektiriyor",
        "Molaya çıkıyor/vardiya bitiyor",
        "Acil durum dikkat gerektiriyor",
        "Yeni birini eğitiyorsunuz"
      ],
      bestPractices: "En İyi Uygulamalar:",
      bestPracticesList: [
        "Her zaman net bir sebep belirtin",
        "Nitelikli ekip üyelerine transfer edin",
        "Günlük transfer limitlerini sayın",
        "Acilse takip edin",
        "Size yardım eden kişilere teşekkür edin"
      ],
      incomingRequests: "Gelen Transfer İstekleri",
      transferHistory: "Transfer Geçmişi",
      transferTo: "Transfer et:",
      reasonForTransfer: "Transfer sebebi:",
      reasonPlaceholder: "Bu görevi neden transfer ediyorsunuz?",
      selectUser: "Bir kullanıcı seçin...",
      selectTeamMember: "Bir ekip üyesi seçin...",
      sendRequest: "İstek Gönder",
      transferFrom: "Transfer eden",
      transferredTo: "Transfer edilen",
      taskType: "Görev Türü",
      requested: "İstenilen",
      responded: "Yanıtlanan",
      response: "Yanıt",
      reason: "Sebep",
      noReasonProvided: "Sebep belirtilmedi",
      transferPermissions: "Transfer İzinleriniz",
      dailyLimit: "Günlük Limit",
      approvalRequired: "Onay Gerekli",
      departmentRestrictions: "Departman Kısıtlamaları",
      none: "Hiçbiri",
      yes: "Evet",
      no: "Hayır",
      transfers: "transfer",
      transferRequest: "Transfer İsteği",
      transferRequestSent: "Transfer isteği başarıyla gönderildi",
      transferFailed: "Transfer başarısız",
      transferAccepted: "Transfer başarıyla kabul edildi",
      transferDenied: "Transfer başarıyla reddedildi",
      dailyLimitReached: "Günlük transfer limitine ulaşıldı",
      targetUserNotFound: "Hedef kullanıcı bulunamadı veya aktif değil",
      cannotTransferToDepartment: "Bu departmana transfer edilemiyor",
      transferRequestAlreadyResponded: "Transfer isteği zaten yanıtlandı",
      reasonForDenying: "Reddetme sebebi (isteğe bağlı):",
      sending: "Gönderiliyor...",
      accepting: "Kabul ediliyor...",
      denying: "Reddediliyor...",
      quickReasons: {
        needHelp: "Yardıma ihtiyacım var",
        goingOnBreak: "Molaya çıkıyorum",
        emergencyPriority: "Acil öncelik",
        betterSuited: "Bunun için daha uygun",
        trainingOpportunity: "Eğitim fırsatı"
      }
    },

    // Workflows & Checklists
    workflows: {
      title: "İş Akışları",
      subtitle: "Kontrol listelerine ve prosedürlere erişin",
      openingChecklist: "Açılış Kontrol Listesi",
      closingChecklist: "Kapanış Kontrol Listesi",
      prepWorksheet: "Hazırlık Çalışma Sayfası",
      inventorySheet: "Envanter Sayfası",
      cleaningList: "Temizlik Listesi",
      transitionChecklist: "Geçiş Kontrol Listesi",
      barClosing: "Bar Kapanış",
      fohOpening: "FOH Açılış",
      fohClosing: "FOH Kapanış",
      fohTransition: "FOH Geçiş",
      bohOpening: "BOH Açılış",
      bohClosing: "BOH Kapanış",
      amPrepDaily: "AM Günlük Hazırlık",
      dryGoodsInventory: "Kuru Malzeme Envanteri",
      lineRatings: "Hat Değerlendirmeleri",
      missingIngredients: "Eksik Malzemeler",
      toGoInventory: "Paket Servisi Envanteri",
      leadPrepWorksheet: "Ana Hazırlık Çalışma Sayfası",
      completed: "Tamamlandı",
      inProgress: "Devam Ediyor",
      notStarted: "Başlamadı",
      itemsCompleted: "öğe tamamlandı",
      totalItems: "toplam öğe"
    },

    // Notifications
    notifications: {
      title: "Bildirimler",
      markAsRead: "Okundu Olarak İşaretle",
      markAllAsRead: "Tümünü Okundu Olarak İşaretle",
      noNotifications: "Bildirim yok",
      newNotification: "Yeni bildirim",
      unreadNotifications: "okunmamış bildirim",
      taskTransfer: "Görev Transferi",
      taskTransferResponse: "Görev Transfer Yanıtı",
      taskTransferred: "Görev Başarıyla Transfer Edildi",
      reviewUpdate: "İnceleme Güncellemesi",
      managerUpdate: "Yönetici Güncellemesi",
      wallPost: "Duvar Gönderisi",
      acknowledgmentRequired: "Onay Gerekli",
      priority: {
        low: "Düşük Öncelik",
        normal: "Normal Öncelik",
        high: "Yüksek Öncelik",
        urgent: "Acil"
      }
    },

    // Wall Feed
    wallFeed: {
      title: "Topluluk Akışı",
      createPost: "Gönderi Oluştur",
      whatsHappening: "Neler oluyor?",
      postUpdate: "Güncelleme Gönder",
      managerUpdate: "Yönetici Güncellemesi",
      announcement: "Duyuru",
      postTypes: {
        general: "Genel",
        announcement: "Duyuru",
        achievement: "Başarı",
        question: "Soru",
        help: "Yardım Gerekli"
      },
      reactions: {
        like: "Beğen",
        love: "Sev",
        laugh: "Gül",
        wow: "Vay",
        sad: "Üzgün",
        angry: "Kızgın"
      },
      comments: "Yorumlar",
      shares: "Paylaşımlar",
      timeAgo: {
        now: "şimdi",
        minute: "1dk",
        minutes: "dk",
        hour: "1s",
        hours: "s",
        day: "1g",
        days: "g",
        week: "1h",
        weeks: "h"
      }
    },

    // Manager Dashboard
    manager: {
      title: "Yönetici Paneli",
      createUpdate: "Güncelleme Oluştur",
      targetAudience: "Hedef Kitle",
      updateTitle: "Güncelleme Başlığı",
      updateMessage: "Güncelleme Mesajı",
      requiresSignature: "İmza Gerekli",
      priorityLevel: "Öncelik Seviyesi",
      sendUpdate: "Güncelleme Gönder",
      allEmployees: "Tüm Çalışanlar",
      department: "Departman",
      role: "Rol",
      individual: "Bireysel",
      selectDepartment: "Departman Seç",
      selectRole: "Rol Seç",
      selectEmployee: "Çalışan Seç",
      updateSent: "Güncelleme başarıyla gönderildi",
      updateFailed: "Güncelleme gönderilemedi"
    },

    // Departments & Roles
    departments: {
      foh: "Ön Bölge",
      boh: "Arka Bölge",
      management: "Yönetim",
      all: "Tüm Departmanlar"
    },

    roles: {
      employee: "Çalışan",
      teamLead: "Takım Lideri",
      shiftSupervisor: "Vardiya Süpervizörü",
      assistantManager: "Müdür Yardımcısı",
      manager: "Müdür",
      admin: "Yönetici"
    },

    // Authentication
    auth: {
      signIn: "Giriş Yap",
      signUp: "Kayıt Ol",
      signOut: "Çıkış Yap",
      email: "E-posta",
      password: "Şifre",
      confirmPassword: "Şifreyi Onayla",
      firstName: "Ad",
      lastName: "Soyad",
      employeeId: "Çalışan Kimliği",
      role: "Rol",
      signInSubtitle: "Jayna Gyro hesabınıza erişin",
      signUpSubtitle: "Jayna Gyro hesabınızı oluşturun",
      emailPlaceholder: "E-postanızı girin",
      passwordPlaceholder: "Şifrenizi girin",
      firstNamePlaceholder: "Adınızı girin",
      lastNamePlaceholder: "Soyadınızı girin",
      employeeIdPlaceholder: "Çalışan kimliğinizi girin",
      signInWithGoogle: "Google ile giriş yap",
      signUpWithGoogle: "Google ile kayıt ol",
      noAccount: "Hesabınız yok mu?",
      haveAccount: "Zaten hesabınız var mı?",
      signingIn: "Giriş yapılıyor...",
      signingUp: "Hesap oluşturuluyor...",
      or: "VEYA",
      forgotPassword: "Şifrenizi mi unuttunuz?",
      resetPassword: "Şifreyi Sıfırla",
      passwordRequirements: "Şifre en az 8 karakter olmalı ve büyük harf, küçük harf, sayı ve özel karakter içermelidir",
      invalidCredentials: "Geçersiz e-posta veya şifre",
      accountCreated: "Hesap başarıyla oluşturuldu",
      accountExists: "Bu e-posta ile zaten bir hesap var",
      passwordMismatch: "Şifreler eşleşmiyor",
      requiredField: "Bu alan zorunludur",
      invalidEmail: "Lütfen geçerli bir e-posta adresi girin",
      weakPassword: "Şifre çok zayıf"
    },

    // Error Messages
    errors: {
      somethingWentWrong: "Bir şeyler yanlış gitti",
      pageNotFound: "Sayfa bulunamadı",
      accessDenied: "Erişim reddedildi",
      sessionExpired: "Oturum süresi doldu",
      networkError: "Ağ hatası",
      tryAgain: "Lütfen tekrar deneyin",
      contactSupport: "Sorun devam ederse destek ile iletişime geçin"
    },

    // Success Messages
    success: {
      saved: "Başarıyla kaydedildi",
      updated: "Başarıyla güncellendi",
      deleted: "Başarıyla silindi",
      sent: "Başarıyla gönderildi",
      completed: "Başarıyla tamamlandı"
    },

    // Time & Dates
    time: {
      am: "ÖÖ",
      pm: "ÖS",
      today: "Bugün",
      yesterday: "Dün",
      tomorrow: "Yarın",
      thisWeek: "Bu Hafta",
      lastWeek: "Geçen Hafta",
      thisMonth: "Bu Ay",
      lastMonth: "Geçen Ay"
    }
  }
}

export default translations