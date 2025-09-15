-- Set Demetri7@gmail.com as manager
UPDATE profiles 
SET role = 'manager' 
WHERE email = 'demetri7@gmail.com';

-- Also insert the profile if it doesn't exist (in case they haven't logged in yet)
INSERT INTO profiles (email, name, role)
VALUES ('demetri7@gmail.com', 'Demetri', 'manager')
ON CONFLICT (email) 
DO UPDATE SET 
  role = 'manager',
  name = COALESCE(profiles.name, 'Demetri');