-- Add department tags to tasks table
-- Allow multiple departments per task (BOH, FOH, AM, PM, PREP, CLEAN, CATERING, SPECIAL)

ALTER TABLE tasks 
ADD COLUMN departments TEXT[] DEFAULT '{}';

-- Add a check constraint to ensure only valid department values
ALTER TABLE tasks 
ADD CONSTRAINT valid_departments 
CHECK (
  departments <@ ARRAY['BOH', 'FOH', 'AM', 'PM', 'PREP', 'CLEAN', 'CATERING', 'SPECIAL']
);

-- Create an index for efficient filtering by departments
CREATE INDEX idx_tasks_departments ON tasks USING GIN (departments);

-- Add comment for documentation
COMMENT ON COLUMN tasks.departments IS 'Array of department tags: BOH (Back of House), FOH (Front of House), AM (Morning), PM (Evening), PREP (Prep Kitchen), CLEAN (Cleaning), CATERING (Catering Orders), SPECIAL (Special Tasks)';