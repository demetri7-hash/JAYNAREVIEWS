-- Just update the default for new users, skip constraint for now
ALTER TABLE profiles ALTER COLUMN role SET DEFAULT 'staff';