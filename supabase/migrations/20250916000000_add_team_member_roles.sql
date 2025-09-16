-- Add new FOH and BOH team member roles to the profiles table
-- Update the role constraint to include the new roles

-- First, update the role constraint to include new team member roles
ALTER TABLE profiles 
DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE profiles 
ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('staff', 'manager', 'kitchen_manager', 'ordering_manager', 'lead_prep_cook', 'assistant_foh_manager', 'foh_team_member', 'boh_team_member'));

-- Update comment for documentation
COMMENT ON COLUMN profiles.role IS 'User role: staff, manager (full access), kitchen_manager, ordering_manager, lead_prep_cook, assistant_foh_manager, foh_team_member, boh_team_member';