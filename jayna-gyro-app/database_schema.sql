-- Jayna Gyro Employee Worksheet App - Database Schema
-- This script creates all tables and populates them with data from reference files

-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'super-secret-jwt-token-with-at-least-32-characters-long';

-- Create employees table
CREATE TABLE IF NOT EXISTS employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    department TEXT CHECK (department IN ('FOH', 'BOH')) NOT NULL,
    languages_spoken TEXT[] DEFAULT ARRAY['en'],
    roles TEXT[] NOT NULL,
    shifts TEXT[] NOT NULL,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create worksheets table
CREATE TABLE IF NOT EXISTS worksheets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    employee_name TEXT NOT NULL,
    shift_type TEXT NOT NULL,
    department TEXT CHECK (department IN ('FOH', 'BOH')) NOT NULL,
    language_used TEXT CHECK (language_used IN ('en', 'es', 'tr')) DEFAULT 'en',
    worksheet_data JSONB NOT NULL,
    photos TEXT[] DEFAULT ARRAY[]::TEXT[],
    completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
    time_started TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    time_completed TIMESTAMP WITH TIME ZONE,
    issues_flagged TEXT[] DEFAULT ARRAY[]::TEXT[],
    submitted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create recipes table
CREATE TABLE IF NOT EXISTS recipes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    name_es TEXT,
    name_tr TEXT,
    ingredients JSONB NOT NULL,
    instructions TEXT[] NOT NULL,
    instructions_es TEXT[],
    instructions_tr TEXT[],
    batch_size TEXT,
    prep_time INTEGER, -- in minutes
    category TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create inventory_items table  
CREATE TABLE IF NOT EXISTS inventory_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    name_es TEXT,
    name_tr TEXT,
    category TEXT NOT NULL,
    unit TEXT NOT NULL,
    par_level INTEGER DEFAULT 0,
    current_stock INTEGER DEFAULT 0,
    supplier TEXT,
    cost DECIMAL(10,2),
    recipe_usage UUID[] DEFAULT ARRAY[]::UUID[], -- Array of recipe IDs
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    items JSONB NOT NULL, -- Array of {item_id, quantity, urgency}
    requested_by UUID REFERENCES employees(id),
    requested_by_name TEXT NOT NULL,
    approved_by UUID REFERENCES employees(id),
    approved_by_name TEXT,
    status TEXT CHECK (status IN ('Pending', 'Approved', 'Ordered', 'Delivered')) DEFAULT 'Pending',
    delivery_date DATE,
    notes TEXT,
    total_cost DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create worksheet_templates table for storing checklists
CREATE TABLE IF NOT EXISTS worksheet_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    department TEXT CHECK (department IN ('FOH', 'BOH')) NOT NULL,
    shift_type TEXT NOT NULL,
    items JSONB NOT NULL, -- Array of checklist items
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create missing_items_reports table
CREATE TABLE IF NOT EXISTS missing_items_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_name TEXT NOT NULL,
    quantity_needed TEXT,
    reason TEXT,
    urgency TEXT CHECK (urgency IN ('Low', 'Medium', 'High')) NOT NULL,
    reported_by UUID REFERENCES employees(id),
    reported_by_name TEXT NOT NULL,
    reported_to TEXT DEFAULT '916-513-3192',
    status TEXT CHECK (status IN ('Open', 'In Progress', 'Fixed')) DEFAULT 'Open',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- Enable Row Level Security on all tables
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE worksheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE worksheet_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE missing_items_reports ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since this is an internal employee app)
CREATE POLICY "Enable all operations for authenticated users" ON employees FOR ALL USING (true);
CREATE POLICY "Enable all operations for authenticated users" ON worksheets FOR ALL USING (true);
CREATE POLICY "Enable all operations for authenticated users" ON recipes FOR ALL USING (true);
CREATE POLICY "Enable all operations for authenticated users" ON inventory_items FOR ALL USING (true);
CREATE POLICY "Enable all operations for authenticated users" ON orders FOR ALL USING (true);
CREATE POLICY "Enable all operations for authenticated users" ON worksheet_templates FOR ALL USING (true);
CREATE POLICY "Enable all operations for authenticated users" ON missing_items_reports FOR ALL USING (true);

-- Insert sample employees (based on reference files)
INSERT INTO employees (name, department, languages_spoken, roles, shifts) VALUES
    ('Maria Garcia', 'FOH', ARRAY['es', 'en'], ARRAY['Server', 'Cashier'], ARRAY['AM', 'Transition', 'PM']),
    ('John Smith', 'FOH', ARRAY['en'], ARRAY['Server', 'Bar Staff'], ARRAY['AM', 'PM', 'Bar']),
    ('Sofia Hernandez', 'FOH', ARRAY['es', 'en'], ARRAY['Server'], ARRAY['Transition', 'PM']),
    ('Mike Johnson', 'FOH', ARRAY['en'], ARRAY['Server', 'Manager'], ARRAY['AM', 'Transition']),
    ('Ana Rodriguez', 'FOH', ARRAY['es'], ARRAY['Server', 'Bar Staff'], ARRAY['PM', 'Bar']),
    ('Ahmed Yilmaz', 'BOH', ARRAY['tr', 'en'], ARRAY['Line Cook', 'Prep Cook'], ARRAY['Opening Line', 'Morning Prep', 'Transition Line']),
    ('Carlos Martinez', 'BOH', ARRAY['es', 'en'], ARRAY['Lead Prep Cook'], ARRAY['Morning Prep', 'Closing Prep/Dishwasher']),
    ('Fatima Kaya', 'BOH', ARRAY['tr', 'en'], ARRAY['Prep Cook', 'Dishwasher'], ARRAY['Morning Clean', 'Closing Prep/Dishwasher']),
    ('Jose Rivera', 'BOH', ARRAY['es'], ARRAY['Line Cook'], ARRAY['Opening Line', 'Transition Line', 'Closing Line']),
    ('David Kim', 'BOH', ARRAY['en'], ARRAY['Kitchen Manager'], ARRAY['Opening Line', 'Morning Prep', 'Morning Clean', 'Transition Line', 'Closing Line', 'Closing Prep/Dishwasher']);

-- Insert recipes (extracted from reference files)
INSERT INTO recipes (name, name_es, name_tr, ingredients, instructions, batch_size, prep_time, category) VALUES
    ('Iskender Sauce', 'Salsa Iskender', 'İskender Sosu', 
     '[{"ingredient": "neutral oil", "amount": "1", "unit": "tbsp"}, {"ingredient": "minced garlic", "amount": "1", "unit": "tbsp"}, {"ingredient": "tomato paste", "amount": "1", "unit": "can (6 oz)"}, {"ingredient": "kosher salt", "amount": "1", "unit": "tbsp"}, {"ingredient": "sugar", "amount": "0.5", "unit": "tbsp"}, {"ingredient": "water", "amount": "15", "unit": "liters"}, {"ingredient": "ripe tomatoes", "amount": "6", "unit": "whole"}]',
     ARRAY['Heat oil in a rondeau over medium. Add garlic; cook 30-45 sec until fragrant (no color).', 'Toast tomato paste in the oil 2 min, stirring, until brick red and shiny.', 'Add the blended/strained tomatoes, then whisk in water, salt, and sugar.', 'Simmer 12-15 min on low; sauce should coat a spoon.', 'Taste & adjust salt. Hold hot for service or cool to ≤ 41°F/5°C within 2 hr.'],
     '2-2.5L yield', 20, 'Sauces'),
     
    ('Rice with Chickpeas', 'Arroz con Garbanzos', 'Nohutlu Pilav',
     '[{"ingredient": "long-grain rice", "amount": "3", "unit": "qt"}, {"ingredient": "hot water", "amount": "3", "unit": "qt"}, {"ingredient": "neutral oil", "amount": "0.5", "unit": "cup"}, {"ingredient": "kosher salt", "amount": "0.5", "unit": "cup"}, {"ingredient": "cooked chickpeas", "amount": "1", "unit": "qt"}]',
     ARRAY['Rinse rice in cold water until it runs mostly clear; drain well.', 'Toast: In a pot over medium, heat oil; add rice and stir constantly 3-4 min until slightly opaque and nutty.', 'Transfer rice to rice cooker. Add hot water and salt; stir to dissolve completely.', 'Cook on standard white-rice cycle.', 'Fold in chickpeas; cover 5 min to steam. Fluff before pan-holding.'],
     '6-7 qt cooked rice', 25, 'Sides'),

    ('Avgolemono Soup', 'Sopa Avgolemono', 'Avgolemono Çorbası',
     '[{"ingredient": "oil", "amount": "1", "unit": "cup"}, {"ingredient": "yellow onions", "amount": "2", "unit": "whole"}, {"ingredient": "garlic", "amount": "3", "unit": "cloves"}, {"ingredient": "AP flour", "amount": "7", "unit": "tbsp"}, {"ingredient": "chicken broth", "amount": "5", "unit": "qt"}, {"ingredient": "orzo pasta", "amount": "2", "unit": "cups"}, {"ingredient": "egg yolks", "amount": "9", "unit": "whole"}, {"ingredient": "lemon juice", "amount": "1.5", "unit": "cups"}, {"ingredient": "whole chicken meat", "amount": "1", "unit": "whole"}, {"ingredient": "kosher salt", "amount": "3", "unit": "tbsp"}]',
     ARRAY['Sweat onion + garlic in oil over medium until translucent/light pink (no browning).', 'Sprinkle in flour; stir 2-3 min to a pale blond roux.', 'Whisk in broth gradually to avoid lumps; bring to gentle simmer.', 'Add orzo; boil 5 min (still al dente).', 'Temper: Whisk lemon juice into yolks. Slowly ladle in 3-4 cups hot soup while whisking, then stir tempered yolks back into pot off heat.', 'Add pulled chicken, salt, pepper. Warm gently 3-4 min.', 'Hold 165°F/74°C+ for service; avoid boiling (will curdle).'],
     '2+ gallons', 45, 'Soups'),

    ('Hummus', 'Hummus', 'Humus',
     '[{"ingredient": "chickpeas", "amount": "3", "unit": "cans (15 oz each)"}, {"ingredient": "minced garlic", "amount": "0.5", "unit": "cup"}, {"ingredient": "lemon juice", "amount": "1.5", "unit": "cups"}, {"ingredient": "kosher salt", "amount": "3", "unit": "tbsp"}, {"ingredient": "ground cumin", "amount": "2", "unit": "tbsp"}, {"ingredient": "tahini", "amount": "2", "unit": "cups"}, {"ingredient": "olive oil", "amount": "2", "unit": "cups"}, {"ingredient": "ice-cold water", "amount": "2", "unit": "qt"}]',
     ARRAY['Blend chickpeas + lemon + garlic + salt + cumin with immersion blender until smooth.', 'Whisk in tahini until fully emulsified.', 'Stream in olive oil while blending.', 'Loosen with ice water to silky, spoon-hold texture.', 'Taste salt; chill.'],
     '1.5-2 gal', 15, 'Dips'),

    ('Falafel', 'Falafel', 'Falafel',
     '[{"ingredient": "dry garbanzo beans", "amount": "3", "unit": "yogurt tub"}, {"ingredient": "parsley", "amount": "12", "unit": "bunches"}, {"ingredient": "dill", "amount": "1", "unit": "bunch"}, {"ingredient": "scallions", "amount": "13", "unit": "whole"}, {"ingredient": "garlic cloves", "amount": "2", "unit": "handfuls"}, {"ingredient": "cumin", "amount": "1", "unit": "cup"}, {"ingredient": "salt", "amount": "1", "unit": "cup"}, {"ingredient": "ground black pepper", "amount": "0.25", "unit": "cup"}, {"ingredient": "sambal olek", "amount": "0.75", "unit": "cup"}, {"ingredient": "olive oil", "amount": "4", "unit": "cups"}]',
     ARRAY['Soak dry garbanzo beans overnight.', 'Drain and process with herbs and spices.', 'Form into balls and fry until golden.'],
     'Daily batch', 180, 'Proteins'),

    ('Baba Ghanoush', 'Baba Ghanoush', 'Baba Ganuş',
     '[{"ingredient": "eggplants", "amount": "16", "unit": "whole (1 case)"}, {"ingredient": "tahini", "amount": "2", "unit": "cups"}, {"ingredient": "kefir cheese", "amount": "2", "unit": "cups"}, {"ingredient": "ground cumin", "amount": "2", "unit": "tbsp"}, {"ingredient": "lemon juice", "amount": "1", "unit": "cup"}, {"ingredient": "chopped garlic", "amount": "4", "unit": "tbsp"}, {"ingredient": "extra-virgin olive oil", "amount": "2", "unit": "cups"}, {"ingredient": "kosher salt", "amount": "0.5", "unit": "cup"}]',
     ARRAY['Char whole eggplants over open flame or broiler until skins blacken and flesh collapses.', 'Cool, peel, and drain in a perforated pan 20-30 min.', 'Chop flesh very fine (rustic, not purée).', 'Fold with remaining ingredients. Salt to taste.', 'Rest 30 min; adjust lemon/salt.'],
     '2 gal', 60, 'Dips');
