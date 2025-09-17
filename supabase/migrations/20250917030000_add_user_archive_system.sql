-- Add archived column to profiles table for user management
-- This allows managers to temporarily disable user access without deleting data

ALTER TABLE profiles 
ADD COLUMN archived BOOLEAN DEFAULT FALSE;

-- Add index for better performance when filtering active users
CREATE INDEX idx_profiles_archived ON profiles(archived);

-- Add a comment to document the feature
COMMENT ON COLUMN profiles.archived IS 'When true, user cannot sign in but data is preserved for potential reactivation';