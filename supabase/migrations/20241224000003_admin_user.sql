
-- Create the initial admin user
-- This will create a user in auth.users and corresponding profile
-- Password: Admin@123 (change this after first login)

INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@fitt-iitd.in',
  crypt('Admin@123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"name": "System Admin"}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
);

-- Get the admin user ID and create profile
DO $$
DECLARE
  admin_user_id UUID;
BEGIN
  SELECT id INTO admin_user_id FROM auth.users WHERE email = 'admin@fitt-iitd.in';
  
  INSERT INTO public.profiles (id, name, email, role, password_reset_required)
  VALUES (
    admin_user_id,
    'System Admin',
    'admin@fitt-iitd.in',
    'admin'::user_role,
    TRUE
  );
END $$;
