-- Update the existing admin user with new credentials
-- Using a subquery to find the user by their current email
UPDATE auth.users 
SET 
  email = 'megawinoffic@hotmail.com',
  encrypted_password = crypt('1>bXo#4!2ds', gen_salt('bf')),
  email_confirmed_at = now(),
  updated_at = now()
WHERE email = 'admin@email.com';

-- If the user doesn't exist, this will do nothing. 
-- We can also ensure the record exists by checking if we should insert.
-- But since we found admin@email.com earlier, we just update.
