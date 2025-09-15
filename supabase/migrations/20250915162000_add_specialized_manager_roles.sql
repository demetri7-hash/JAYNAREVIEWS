-- Expand role system to support specialized manager roles
-- Update the profiles table to support new role types and department permissions

-- First, update the role constraint to include new manager types
ALTER TABLE profiles 
DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE profiles 
ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('staff', 'manager', 'kitchen_manager', 'ordering_manager', 'lead_prep_cook', 'assistant_foh_manager'));

-- Add department permissions column to store which departments each role can access
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS department_permissions TEXT[] DEFAULT '{}';

-- Add a constraint to ensure only valid department permissions
ALTER TABLE profiles 
ADD CONSTRAINT valid_department_permissions 
CHECK (
  department_permissions <@ ARRAY['BOH', 'FOH', 'AM', 'PM', 'PREP', 'CLEAN', 'CATERING', 'SPECIAL', 'TRANSITION']
);

-- Create an index for efficient filtering by department permissions
CREATE INDEX IF NOT EXISTS idx_profiles_department_permissions ON profiles USING GIN (department_permissions);

-- Set default department permissions for existing managers (they can see everything)
UPDATE profiles 
SET department_permissions = ARRAY['BOH', 'FOH', 'AM', 'PM', 'PREP', 'CLEAN', 'CATERING', 'SPECIAL', 'TRANSITION']
WHERE role = 'manager';

-- Add comments for documentation
COMMENT ON COLUMN profiles.role IS 'User role: staff, manager (full access), kitchen_manager, ordering_manager, lead_prep_cook, assistant_foh_manager';
COMMENT ON COLUMN profiles.department_permissions IS 'Array of department tags this user can access based on their role';