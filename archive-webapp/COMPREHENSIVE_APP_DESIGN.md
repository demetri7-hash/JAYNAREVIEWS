# Jayna Gyro Employee Worksheet App - Comprehensive Design & Functionality

## Executive Summary

After thoroughly analyzing all 35+ reference files including recipes, job descriptions, workflows, inventories, and multilingual content, I've designed a comprehensive mobile-first web application that will revolutionize Jayna Gyro's operations. The app features 4 main modules with full trilingual support (English, Spanish, Turkish) and seamless integration of all existing workflows.

## Core Application Architecture

### 1. Home Screen - Main Navigation
**4 Primary Modules:**
- **FOH** (Front of House) - Customer service workflows
- **BOH** (Back of House) - Kitchen operations
- **ORDERING** - Intelligent inventory management & ordering
- **View Past Worksheets** - Historical data & analytics

**Always-Present Features:**
- **Language Toggle** (🇺🇸 EN | 🇪🇸 ES | 🇹🇷 TR) - Available on every screen
- **Emergency Contact** - Quick access to management (916-513-3192)
- **Current Date/Time Display**
- **Employee Name Display** (once logged in)

---

## 2. FRONT OF HOUSE (FOH) MODULE

### 2.1 FOH Employee Selection
**Predefined Employee List with Roles:**
- **Morning Shift Staff**
- **Evening Shift Staff**  
- **Managers**
- **Cross-trained Staff** (FOH/BOH)

### 2.2 FOH Dashboard - 5 Workflow Options
1. **AM Opening** - Morning setup procedures
2. **Transition** - Mid-day transition tasks
3. **PM Closing** - Evening closing procedures
4. **Bar Operations** - Specialized bar tasks
5. **View My Past Worksheets**

### 2.3 FOH Workflows Detail

#### A. AM Opening Workflow
**Step 1: Previous Night Review**
- Review PM closing checklist from previous day
- Verify all closing tasks were completed
- Flag any issues requiring attention

**Step 2: Opening Checklist** (174 items from reference files)
- **Dining Room & Patio Setup** (15 items)
- **Cleanliness & Walkthrough** (8 items)
- **Bathroom Checks** (12 critical items)
- **Expo Station & Sauce Prep** (25 items)
- **Register & POS Setup** (20 items)
- **Bar Setup** (18 items)
- **Final Walkthrough** (12 items)

Each item includes:
- ✓ Checkbox completion
- 📝 Notes field (optional/required based on item)
- 📸 Photo upload capability
- ⏰ Timestamp tracking
- ❗ Priority indicators for critical items

#### B. Transition Workflow
**Step 1: Morning Review**
- Verify AM opening completed properly
- Review any morning shift notes
- Check inventory levels

**Step 2: Transition Tasks** (45 items)
- **Shift Communication** (8 items)
- **Inventory Checks** (15 items) 
- **Cleaning Maintenance** (12 items)
- **Equipment Status** (10 items)

#### C. PM Closing Workflow
**Step 1: Day Review**
- Review opening and transition logs
- Address any outstanding issues

**Step 2: Closing Checklist** (80+ items)
- **Customer Area Shutdown** (20 items)
- **Register & Money Handling** (15 items)
- **Bar Closing Procedures** (25 items)
- **Equipment Shutdown** (12 items)
- **Security & Final Checks** (10 items)

---

## 3. BACK OF HOUSE (BOH) MODULE

### 3.1 BOH Employee Selection
**Role-Based Categories:**
- **Line Cooks** 
- **Prep Cooks**
- **Lead Prep Cooks**
- **Dishwashers/Cleaners**
- **Kitchen Managers**

### 3.2 BOH Dashboard - 6 Workflow Options
1. **Opening Line** - Morning line preparation
2. **Morning Prep** - Food preparation tasks
3. **Morning Clean** - Cleaning & sanitation
4. **Transition Line** - Mid-day line tasks
5. **Closing Line** - Evening line closing
6. **Closing Prep/Dishwasher** - End of day tasks
7. **View My Past Worksheets**

### 3.3 BOH Workflows Detail

#### A. Opening Line Workflow (65 items)
- **Equipment Startup** (15 items)
- **Temperature Checks** (12 items)
- **Food Safety Prep** (20 items)
- **Line Organization** (18 items)

#### B. Morning Prep Workflow (120+ items from recipes)
**Integrated Recipe System:**
- **Daily Prep List** based on par levels
- **Recipe Integration** with exact measurements
- **Batch Tracking** for consistency
- **Temperature Logging** for food safety

**Key Prep Items:**
- Iskender Sauce (2-2.5L batches)
- Rice with Chickpeas (6-7qt batches)
- Avgolemono Soup (2+ gallons)
- Hummus (1.5-2 gal)
- Baba Ghanoush (2 gal)
- Falafel preparation
- Fresh produce prep

#### C. Morning Clean Workflow (Trilingual Support)
**Comprehensive Cleaning System:**
- **Floor Care** (barrer, trapeé - Spanish terms integrated)
- **Equipment Sanitation**
- **Food Prep Area Deep Clean**
- **Restroom Maintenance**

#### D. Transition Line & Closing Workflows
- **Inventory Updates**
- **Equipment Maintenance** 
- **End of Day Procedures**
- **Deep Cleaning Tasks**

---

## 4. ORDERING MODULE - INTELLIGENT INVENTORY SYSTEM

### 4.1 Master Ingredient Database
**Extracted from Recipe Analysis (200+ ingredients):**

#### Proteins & Main Items
- Ground Lamb, Beef & Lamb Gyro, Chicken Gyro
- Whole Chicken, Chickpeas (canned & dried)
- Eggs (quantities: 9 whole for brioche)

#### Vegetables & Produce  
- Yellow Onions (20 for caramelized), Red Onions
- Red Bell Peppers (15 for caramelized)
- Tomatoes (whole, diced, paste - 6 oz cans)
- Cucumbers, Romaine, Celery, Carrots
- Eggplants (16 per case), Garlic, Shallots
- Parsley (12 bunches for falafel), Dill (1 bunch)
- Scallions (13 for falafel)

#### Spices & Seasonings
- Kosher Salt, Black Pepper, White Pepper
- Ground Cumin (1 cup for falafel), Smoked Paprika
- Granulated Onion/Garlic, Bay Leaves (15)
- Sambal Olek (¾ cup)

#### Oils & Liquids
- Neutral Oil, Olive Oil (2 cups + 4 cups for falafel)
- Extra Virgin Olive Oil, Lemon Juice (1 gal for dressing)
- Tahini (2 cups), Water quantities by recipe

#### Dairy & Specialty Items
- Butter (453g for brioche), Kefir Cheese
- Whole-Grain Mustard, Chicken/Beef Base
- Active Dry Yeast (30g), Sugar (203g for brioche)

#### Packaging & Supplies (From Inventory Files)
- Gyro Bowl Lids, Pita Boxes, Fry Boxes
- Chicken Boxes, White Soup Cups (12 oz)
- Soup Cup Lids, Ramekins (1.5oz, 2oz, 3oz)
- Interfold Napkins, To Go Utensil Kits
- Carry Bags (Small/Large), Drink Holders

### 4.2 Smart Ordering Interface

#### Category-Based Organization
1. **Fresh Produce** (daily/weekly ordering)
2. **Proteins & Dairy** (weekly ordering) 
3. **Dry Goods & Spices** (bi-weekly/monthly)
4. **Packaging & Supplies** (weekly counts)
5. **Cleaning Supplies** (monthly)

#### Custom List Builder Features
- **Quick Add from Recipes** - Select recipe, auto-add ingredients
- **Par Level Tracking** - Set minimum quantities
- **Usage Pattern Analysis** - AI-suggested reorder quantities
- **Urgent Alert System** - Red flags for critical shortages
- **Supplier Integration** - Direct ordering to preferred vendors

#### Multi-Language Ordering
- **English:** Standard ordering interface
- **Spanish:** "ORDENAR - Inventario de productos secos"
- **Turkish:** Complete translation of all ordering terms

### 4.3 Missing Ingredients Integration
**Real-Time Alert System:**
- **Immediate Reporting** via form (text to 916-513-3192)
- **Priority Levels:** Low/Medium/High urgency
- **Auto-Addition** to next order list
- **Manager Notification** system
- **Resolution Tracking** (Fixed Y/N)

---

## 5. VIEW PAST WORKSHEETS MODULE

### 5.1 Advanced Filtering System
**Multi-Dimensional Filters:**
- **Department:** FOH/BOH/Ordering
- **Shift Type:** All 9 shift types
- **Employee Name:** Individual or team view
- **Date Range:** Last 7 days, custom ranges
- **Completion Status:** Complete/Incomplete/Issues
- **Language Used:** Filter by input language

### 5.2 Analytics Dashboard
**Key Metrics:**
- **Completion Rates** by shift/employee
- **Average Completion Times**
- **Recurring Issues** tracking
- **Photo Documentation** count
- **Critical Item** compliance rates

### 5.3 Export & Reporting
- **PDF Generation** for management
- **Excel Export** for analysis
- **Print-Friendly** formats
- **Email Summaries** to management

---

## 6. MULTILINGUAL IMPLEMENTATION

### 6.1 Complete Translation System
**Language Coverage:**
- **English:** Base language, complete coverage
- **Spanish:** Full translation including technical terms
- **Turkish:** Complete professional translation

### 6.2 Language-Specific Features
**Context-Aware Translations:**
- **Job Descriptions:** Role-specific language
- **Food Safety Terms:** Precise culinary translations  
- **Equipment Names:** Industry-standard terms
- **Time References:** Cultural time formatting

### 6.3 Dynamic Language Switching
- **Persistent Settings:** Remember user language preference
- **Mid-Task Switching:** Change language without losing progress
- **Mixed Team Support:** Different employees using different languages
- **Help Text:** Language-specific help and instructions

---

## 7. TECHNICAL IMPLEMENTATION DETAILS

### 7.1 Database Schema Enhancement
```sql
-- Enhanced Tables
employees (
  id, name, type, languages_spoken[], roles[], active, shifts[], created_at
)

worksheets (
  id, employee_id, shift_type, department, language_used,
  worksheet_data (jsonb), photos[], completion_percentage,
  time_started, time_completed, issues_flagged, submitted_at
)

recipes (
  id, name, ingredients (jsonb), instructions[], 
  batch_size, prep_time, translations[], category
)

inventory_items (
  id, name, category, unit, par_level, current_stock, 
  supplier, cost, translations[], recipe_usage[]
)

orders (
  id, items[], quantities[], urgency, supplier,
  requested_by, approved_by, status, delivery_date
)
```

### 7.2 Advanced Features
**Smart Notifications:**
- **Shift Reminders:** Automated SMS/push notifications
- **Critical Alerts:** Food safety temperature failures
- **Manager Dashboard:** Real-time completion monitoring
- **Inventory Alerts:** Auto-reorder suggestions

**Offline Capability:**
- **Progressive Web App** (PWA) functionality
- **Local Storage** for offline completion
- **Sync on Connection** restoration
- **Conflict Resolution** for simultaneous edits

---

## 8. USER EXPERIENCE FLOW

### 8.1 Optimized Mobile Interface
**Design Principles:**
- **Thumb-Friendly Navigation:** Bottom navigation bar
- **Large Touch Targets:** Minimum 44px buttons
- **Progressive Forms:** Save progress automatically
- **Visual Progress Indicators:** Clear completion status
- **Quick Photo Capture:** One-tap camera integration

### 8.2 Workflow Efficiency
**Time-Saving Features:**
- **Smart Defaults:** Pre-fill common responses
- **Voice-to-Text:** Hands-free note taking
- **Barcode Scanning:** Quick inventory updates
- **Bulk Actions:** Complete similar items together
- **Templates:** Save custom checklists

### 8.3 Error Prevention
**Built-in Validation:**
- **Required Field Highlighting:** Visual indicators
- **Logic Checks:** Flag impossible values
- **Photo Requirements:** Enforce critical documentation
- **Confirmation Dialogs:** Prevent accidental submissions
- **Auto-Save:** Never lose progress

---

## 9. IMPLEMENTATION ROADMAP

### Phase 1: Core Foundation (Week 1-2)
- Set up Next.js project with TypeScript
- Configure Supabase database
- Implement basic authentication
- Create multilingual framework
- Build home navigation

### Phase 2: FOH Module (Week 3-4) 
- Employee selection system
- AM Opening workflow
- Photo upload functionality
- Basic reporting

### Phase 3: BOH Module (Week 4-5)
- BOH workflow implementation
- Recipe integration system
- Inventory tracking
- Advanced forms

### Phase 4: Ordering System (Week 5-6)
- Master ingredient database
- Smart ordering interface
- Alert system integration
- Supplier management

### Phase 5: Advanced Features (Week 6-7)
- Past worksheets analytics
- Advanced filtering
- Export functionality
- Performance optimization

### Phase 6: Testing & Launch (Week 7-8)
- Comprehensive testing
- User training materials
- Production deployment
- Monitoring setup

---

## 10. SUCCESS METRICS

### Operational Efficiency
- **50% Reduction** in checklist completion time
- **90% Elimination** of paper waste
- **Real-time Visibility** into all operations
- **Automated Inventory** management

### Quality Assurance  
- **100% Digital Documentation** with photos
- **Consistent Execution** across all shifts
- **Immediate Issue** identification
- **Trend Analysis** for continuous improvement

### Employee Satisfaction
- **Multilingual Support** for all team members  
- **Mobile-First Design** for easy use
- **Clear Instructions** reduce confusion
- **Recognition System** for consistent performance

This comprehensive design creates a robust, scalable, and user-friendly application that digitizes and enhances every aspect of Jayna Gyro's operations while respecting the multilingual nature of the team and the detailed operational requirements discovered in the reference files.
