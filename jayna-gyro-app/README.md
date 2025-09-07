# Jayna Gyro Employee Worksheet App

A comprehensive multilingual (English/Spanish/Turkish) employee management system for restaurant operations, featuring worksheets, inventory management, and task tracking.

## 🚀 Features

### ✅ Completed Features
- **Multilingual Support**: Full English/Spanish/Turkish translations
- **Module Dashboard**: 4 main operational modules
- **FOH (Front of House)**: Employee selection, shift management, 31-task AM opening checklist
- **BOH (Back of House)**: Kitchen operations, prep workflows, cleaning checklists  
- **Inventory & Ordering**: 70+ ingredients, stock management, missing item reports
- **Worksheets & Analytics**: Task completion tracking, employee performance
- **Mobile-First Design**: Responsive UI optimized for tablets and phones
- **Real-time Updates**: Live task completion and progress tracking

### 🔄 In Progress
- **Database Integration**: Supabase PostgreSQL backend (setup instructions below)
- **Data Persistence**: Employee records, worksheet history, inventory levels
- **Photo Upload**: Task completion verification with camera integration
- **Reporting**: Advanced analytics and export capabilities

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Deployment**: Vercel
- **Mobile**: PWA-ready responsive design

## 📖 Quick Start

### 1. Clone and Install
```bash
git clone <your-repo>
cd jayna-gyro-app
npm install
```

### 2. Environment Setup
Create `.env` file with your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 3. Database Setup (Required)
**Important**: Tables must be created manually in Supabase dashboard:

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Navigate to your project → SQL Editor
3. Copy and execute SQL from `database_schema.sql`
4. Copy and execute SQL from `database_population.sql`

This creates:
- `employees` table (10 sample employees)
- `inventory_items` table (70+ ingredients)
- `recipes` table (6 sample recipes) 
- `worksheets` table (task completion tracking)
- `orders` table (inventory ordering)
- `missing_items_reports` table (issue tracking)
- `worksheet_templates` table (checklist templates)

### 4. Run Development Server
```bash
npm run dev
```
Visit: http://localhost:3000

## 📱 App Modules

### 1. Front of House (FOH)
- **Employee Selection**: Choose from 5 FOH staff members
- **Shift Types**: AM Opening, Transition, PM/Bar shifts
- **AM Opening Checklist**: 31 comprehensive tasks
  - Setup (lights, music, POS system)
  - Cleaning (tables, napkins, restrooms)
  - Food Safety (temperature checks)
  - Technology (credit cards, WiFi)
  - Customer Prep (seating, menus)

### 2. Back of House (BOH) 
- **6 Workflow Types**: 
  - Opening Line (equipment, food prep)
  - Morning Prep (ingredients, sauces)
  - Morning Clean (sanitization)
  - Transition Line (shift handover)
  - Closing Line (end-of-day tasks)
  - Closing Prep/Dishwasher (cleanup)
- **Employee Roles**: Line Cook, Prep Cook, Lead Prep, Kitchen Manager

### 3. Inventory & Ordering
- **Categories**: Proteins, Vegetables, Dairy, Grains, Spices, Beverages
- **70+ Items**: Full restaurant inventory with par levels
- **Stock Tracking**: Current vs target levels
- **Urgent Alerts**: Low stock notifications
- **Missing Item Reports**: Employee issue reporting

### 4. Worksheets & Analytics
- **Completion Tracking**: Task-by-task progress
- **Employee Performance**: Completion rates, time tracking  
- **Issue Identification**: Problem areas, common failures
- **Export Capabilities**: PDF reports, CSV data

## 🌍 Multilingual Support

### Supported Languages
- **English (en)**: Primary language
- **Spanish (es)**: Full translation for Latino staff
- **Turkish (tr)**: Complete Turkish language support

### Translation Coverage
- ✅ All UI elements and navigation
- ✅ Task descriptions and instructions  
- ✅ Ingredient names and categories
- ✅ Error messages and notifications
- ✅ Recipe instructions and measurements

### Language Switching
- Persistent storage (localStorage)
- Header language selector
- Context-aware technical terms
- Maintains user preference across sessions

## 📊 Database Schema

### Core Tables
```sql
employees (id, name, department, languages_spoken, roles, shifts, active)
worksheets (id, employee_id, shift_type, worksheet_data, completion_percentage, time_started)  
inventory_items (id, name, category, unit, par_level, current_stock)
recipes (id, name, ingredients, instructions, batch_size, prep_time)
orders (id, items, requested_by, status, delivery_date)
missing_items_reports (id, item_name, urgency, reported_by, status)
```

### Sample Data Included
- **10 Employees**: 5 FOH + 5 BOH with roles and language preferences
- **70+ Inventory Items**: Complete restaurant stock with multilingual names
- **6 Recipes**: Iskender Sauce, Rice with Chickpeas, Avgolemono Soup, Hummus, Falafel, Baba Ghanoush
- **Worksheet Templates**: FOH AM Opening (31 tasks), BOH Opening Line (8 tasks)

## 🔧 Development

### File Structure
```
src/
  app/                    # Next.js 15 App Router
    foh/                 # Front of house module
    boh/                 # Back of house module  
    ordering/            # Inventory management
    worksheets/          # Analytics dashboard
  components/            # Reusable UI components
  contexts/             # React context providers
    LanguageContext.tsx  # Multilingual state management
  lib/
    supabase.ts         # Database connection and types
    translations.ts     # Translation utilities
```

### Key Components
- **LanguageContext**: Global language state management
- **Layout**: Universal header with language switcher
- **Button**: Consistent UI component across modules
- **Database Service**: Typed Supabase client with helper functions

## 🚀 Deployment

### Vercel Deployment
```bash
npm run build
vercel --prod
```

### Environment Variables (Production)
Set in Vercel dashboard:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` 
- `SUPABASE_SERVICE_ROLE_KEY`

## 📋 Operational Context

### Restaurant Workflows Digitized
- **Daily Opening Procedures**: 31-step FOH checklist
- **Kitchen Operations**: Equipment checks, food safety, prep workflows
- **Inventory Management**: Par levels, ordering, stock tracking
- **Employee Task Tracking**: Completion rates, performance metrics
- **Issue Reporting**: Missing items, equipment problems, urgent needs

### Extracted from Reference Files
- **AM_Prep_Daily_Inventory.docx** → Inventory management system
- **FOH OPENING CHECKLIST.docx** → 31-task comprehensive workflow
- **CLEANING_OPENING_LIST.docx** → Sanitization and safety procedures
- **LINE RATINGS AM AND PM.docx** → Employee performance tracking
- **MISSING INGREDIENTS.docx** → Issue reporting system

### Multilingual Implementation
- **Spanish translations** from CLEANING_OPENING_LIST_SPANISH.docx
- **Turkish translations** from CLEANING_OPENING_LIST_TR.docx  
- **Recipe instructions** in all three languages
- **Ingredient names** with regional variations

## 🐛 Known Issues & Roadmap

### Current Limitations
- Database tables require manual Supabase setup
- Photo upload not yet implemented
- Advanced reporting features in development
- Offline functionality pending PWA implementation

### Upcoming Features
- 📸 Photo upload for task verification
- 📊 Advanced analytics dashboard
- 📱 PWA offline capabilities  
- 🔔 Push notifications for urgent items
- 📧 Email reporting and summaries
- 🎯 Performance gamification

## 📞 Support

- **Emergency Contact**: 916-513-3192 (integrated in app)
- **Technical Issues**: Built-in error handling and user feedback
- **Language Support**: Full trilingual customer service

## 📄 License

Internal restaurant operations system - All rights reserved.

---

**🎉 Ready to streamline your restaurant operations with multilingual support!**
