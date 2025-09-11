# Jayna Gyro Employee Worksheet App - Development Outline

## Project Overview
A mobile-friendly web application for Jayna Gyro employees to complete daily worksheets and workflows, with the ability to view past submissions.

## Tech Stack
- **Frontend**: Next.js (React) - deployed on Vercel
- **Database**: Supabase (PostgreSQL)
- **Repository**: GitHub
- **Hosting**: Vercel
- **Cost**: 100% free resources

## Application Structure

### 1. Home Page (/)
**Layout**: Three main buttons centered on screen
- **FOH** (Front of House)
- **BOH** (Back of House)  
- **View Past Worksheets** (global access)

### 2. Front of House Flow (/foh)

#### 2.1 Name Selection Page (/foh/name-select)
- Dropdown menu with predefined FOH employee names
- **Note**: Employee names are stored in reference files folder
- **AI Instruction**: Prompt user to specify which employees are FOH, BOH, or both
- "Select Your Name" prompt
- Submit button to proceed

#### 2.2 FOH Dashboard (/foh/dashboard)
**Four main options displayed as cards/buttons:**
- **AM** - Morning shift
- **Transition** - Mid-day transition
- **PM** - Evening/closing shift
- **View Past Worksheets** - Historical data

#### 2.3 AM Workflow (/foh/am)
**Step 1: PM Closing Review**
- Load PM closing review checklist from reference files
- Required completion before proceeding
- Reference file: `/reference-files/foh-pm-closing-review.md`

**Step 2: Opening Checklist**
- Load opening checklist from reference files
- Reference file: `/reference-files/foh-opening-checklist.md`
- Convert to mobile-friendly interface with:
  - Checkboxes for completion items
  - Text input fields for notes
  - Photo upload capability
  - All fields required

#### 2.4 Transition Workflow (/foh/transition)
**Step 1: Opening Review**
- Load opening review checklist from reference files
- Required completion before proceeding
- Reference file: `/reference-files/foh-opening-review.md`

**Step 2: Transition Checklist**
- Load transition checklist from reference files
- Reference file: `/reference-files/foh-transition-checklist.md`
- Same interface elements as opening checklist

#### 2.5 PM Workflow (/foh/pm)
**Step 1: Opening & Transition Review**
- Load combined review for opening and transition
- Required completion before proceeding
- Reference files: `/reference-files/foh-opening-review.md` and `/reference-files/foh-transition-review.md`

**Step 2: Closing Checklist**
- Load closing checklist from reference files
- Reference file: `/reference-files/foh-closing-checklist.md`
- Same interface elements as other checklists

### 3. Back of House Flow (/boh)

#### 3.1 Name Selection Page (/boh/name-select)
- Dropdown menu with predefined BOH employee names
- "Select Your Name" prompt
- Submit button to proceed

#### 3.2 BOH Dashboard (/boh/dashboard)
**Six main options displayed as cards/buttons:**
- **Opening Line** - Morning line preparation
- **Morning Prep** - Morning food preparation
- **Morning Clean** - Morning cleaning duties
- **Transition Line** - Mid-day line transition
- **Closing Line** - Evening line closing
- **Closing Prep/Dishwasher** - End of day prep and dishwashing
- **View Past Worksheets** - Historical data

#### 3.3 Opening Line Workflow (/boh/opening-line)
- Load opening line checklist from reference files
- Reference file: `/reference-files/boh-opening-line-checklist.md`
- Convert to mobile-friendly interface

#### 3.4 Morning Prep Workflow (/boh/morning-prep)
- Load morning prep checklist from reference files
- Reference file: `/reference-files/boh-morning-prep-checklist.md`
- Convert to mobile-friendly interface

#### 3.5 Morning Clean Workflow (/boh/morning-clean)
- Load morning cleaning checklist from reference files
- Reference file: `/reference-files/boh-morning-clean-checklist.md`
- Convert to mobile-friendly interface

#### 3.6 Transition Line Workflow (/boh/transition-line)
- Load transition line checklist from reference files
- Reference file: `/reference-files/boh-transition-line-checklist.md`
- Convert to mobile-friendly interface

#### 3.7 Closing Line Workflow (/boh/closing-line)
- Load closing line checklist from reference files
- Reference file: `/reference-files/boh-closing-line-checklist.md`
- Convert to mobile-friendly interface

#### 3.8 Closing Prep/Dishwasher Workflow (/boh/closing-prep-dish)
- Load closing prep and dishwasher checklist from reference files
- Reference file: `/reference-files/boh-closing-prep-dish-checklist.md`
- Convert to mobile-friendly interface

### 4. View Past Worksheets (/worksheets)

#### 4.1 Global View (/worksheets/all)
- Display last 7 days of all submitted worksheets
- Sort by newest first (descending date order)
- Filter options:
  - FOH/BOH
  - Shift type (AM/Transition/PM/Opening Line/Morning Prep/Morning Clean/Transition Line/Closing Line/Closing Prep-Dishwasher)
  - Employee name
  - Date range

#### 4.2 Individual Worksheet View (/worksheets/[id])
- Display complete submitted worksheet
- Show all checked items, notes, and uploaded photos
- Timestamp and employee information
- Print-friendly format

## Database Schema (Supabase)

### Tables Required:

#### employees
```sql
- id (uuid, primary key)
- name (text)
- type (text) -- 'FOH' or 'BOH'
- active (boolean)
- created_at (timestamp)
```

#### worksheets
```sql
- id (uuid, primary key)
- employee_id (uuid, foreign key)
- employee_name (text)
- shift_type (text) -- 'AM', 'Transition', 'PM', 'Opening Line', 'Morning Prep', 'Morning Clean', 'Transition Line', 'Closing Line', 'Closing Prep/Dishwasher'
- department (text) -- 'FOH' or 'BOH'
- worksheet_data (jsonb) -- All checklist responses
- photos (text[]) -- Array of photo URLs
- submitted_at (timestamp)
- created_at (timestamp)
```

#### reviews
```sql
- id (uuid, primary key)
- employee_id (uuid, foreign key)
- employee_name (text)
- review_type (text) -- What shift they're reviewing
- review_data (jsonb) -- Review responses
- submitted_at (timestamp)
- created_at (timestamp)
```

## Reference Files Structure
Create a `/reference-files/` directory with:

- `foh-opening-checklist.md`
- `foh-transition-checklist.md`
- `foh-closing-checklist.md`
- `foh-opening-review.md`
- `foh-pm-closing-review.md`
- `foh-transition-review.md`
- `boh-opening-line-checklist.md`
- `boh-morning-prep-checklist.md`
- `boh-morning-clean-checklist.md`
- `boh-transition-line-checklist.md`
- `boh-closing-line-checklist.md`
- `boh-closing-prep-dish-checklist.md`

**Note**: AI should reference these files when building out specific worksheets and reviews.

## UI/UX Requirements

### Mobile-First Design
- Responsive design optimized for mobile devices
- Large, touch-friendly buttons
- Easy navigation between steps
- Progress indicators for multi-step processes

### Form Interface
- Clean, intuitive checkboxes
- Text areas for notes (expandable)
- Photo upload with preview
- Clear required field indicators
- Validation before submission

### User Experience Flow
1. **Selection**: Easy department/name selection
2. **Workflow**: Clear step-by-step progression
3. **Completion**: Required field validation
4. **Submission**: Success confirmation ("Thank you!")
5. **History**: Easy access to past submissions

## Technical Implementation Notes

### Frontend Components Needed
- `HomePage` - Main selection screen
- `NameSelector` - Employee name dropdown
- `Dashboard` - Shift/task selection
- `WorksheetForm` - Dynamic form generator
- `ReviewForm` - Review step component
- `PhotoUpload` - Camera/file upload
- `WorksheetHistory` - Past submissions view
- `WorksheetDetail` - Individual worksheet display

### API Routes Required
- `/api/employees` - GET employee lists
- `/api/worksheets` - POST new submissions, GET history
- `/api/reviews` - POST review submissions
- `/api/upload` - POST photo uploads

### Data Processing
- Parse reference files into structured form data
- Handle photo uploads to Supabase Storage
- Validate all required fields before submission
- Store timestamps in user's timezone

## Deployment Configuration

### Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

### Vercel Deployment
- Connect GitHub repository
- Configure build commands
- Set environment variables
- Enable automatic deployments on push

## Security Considerations
- Input validation and sanitization
- File upload size limits and type restrictions
- Rate limiting on form submissions
- Data encryption at rest (Supabase default)

## Future Enhancements (Phase 2)
- Manager portal for analytics
- Employee performance tracking
- Automated reminders
- Offline capability with sync
- Push notifications

---

**Development Priority**: 
1. Set up basic project structure
2. Create database schema
3. Build home page and navigation
4. Implement FOH workflow first
5. Add BOH workflow
6. Implement worksheet history
7. Testing and refinement
8. Deployment to Vercel