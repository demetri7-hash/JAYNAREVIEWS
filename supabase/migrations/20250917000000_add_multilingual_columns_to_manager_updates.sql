-- Add multilingual columns to manager_updates table
-- File: supabase/migrations/20250917000000_add_multilingual_columns_to_manager_updates.sql

-- Add multilingual columns for title and message
ALTER TABLE manager_updates 
ADD COLUMN title_en TEXT,
ADD COLUMN title_es TEXT,
ADD COLUMN title_tr TEXT,
ADD COLUMN message_en TEXT,
ADD COLUMN message_es TEXT,
ADD COLUMN message_tr TEXT;

-- Update existing records to populate English columns with current title/message
UPDATE manager_updates 
SET title_en = title, message_en = message 
WHERE title_en IS NULL OR message_en IS NULL;