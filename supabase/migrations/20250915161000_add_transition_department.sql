-- Add TRANSITION to the valid departments list
ALTER TABLE tasks 
DROP CONSTRAINT valid_departments;

ALTER TABLE tasks 
ADD CONSTRAINT valid_departments 
CHECK (
  departments <@ ARRAY['BOH', 'FOH', 'AM', 'PM', 'PREP', 'CLEAN', 'CATERING', 'SPECIAL', 'TRANSITION']
);

-- Update the comment for documentation
COMMENT ON COLUMN tasks.departments IS 'Array of department tags: BOH (Back of House), FOH (Front of House), AM (Morning), PM (Evening), PREP (Prep Kitchen), CLEAN (Cleaning), CATERING (Catering Orders), SPECIAL (Special Tasks), TRANSITION (Shift Transitions)';