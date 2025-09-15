# 🗄️ Database Setup Instructions

## Quick Setup (Required)

Your Jayna Gyro app needs database tables created in Supabase. Follow these steps:

### 1. Access Supabase Dashboard
1. Go to https://supabase.com/dashboard
2. Select your project: `xedpssqxgmnwufatyoje`
3. Navigate to **SQL Editor** in the left sidebar

### 2. Create Tables
Copy and paste the entire contents of `database_schema.sql` into the SQL Editor and click **Run**.

This creates 7 tables:
- ✅ `employees` - Staff records with departments and roles
- ✅ `worksheets` - Task completion tracking  
- ✅ `inventory_items` - Stock management
- ✅ `recipes` - Recipe instructions and ingredients
- ✅ `orders` - Inventory ordering system
- ✅ `missing_items_reports` - Issue tracking
- ✅ `worksheet_templates` - Checklist templates

### 3. Populate Data
Copy and paste the entire contents of `database_population.sql` into the SQL Editor and click **Run**.

This adds:
- 👥 **10 employees** (5 FOH + 5 BOH) with multilingual preferences
- 📦 **70+ inventory items** with Spanish/Turkish names
- 🍳 **6 recipes** with full instructions in 3 languages
- 📋 **2 worksheet templates** (FOH AM Opening, BOH Opening Line)
- 📝 **Sample completed worksheets** and missing item reports

### 4. Verify Setup
Run this query in SQL Editor to confirm:
```sql
SELECT 
  (SELECT COUNT(*) FROM employees) as employees,
  (SELECT COUNT(*) FROM inventory_items) as inventory_items,
  (SELECT COUNT(*) FROM recipes) as recipes,
  (SELECT COUNT(*) FROM worksheet_templates) as templates;
```

Expected results:
- employees: 10
- inventory_items: 70+
- recipes: 6
- templates: 2

## 🎉 That's it!

Your app at http://localhost:3000 is now fully functional with:
- ✅ Real employee data
- ✅ Complete inventory system  
- ✅ Multilingual recipe database
- ✅ Working task templates
- ✅ Sample performance data

## 🔧 Troubleshooting

**Tables already exist error?** ✅ This is normal, just continue.

**Permission errors?** Make sure you're using your Service Role Key in the .env file.

**Data not showing in app?** Refresh the page - the app will now load real data from Supabase.

---

**Need help?** Check the main README.md for full documentation.
