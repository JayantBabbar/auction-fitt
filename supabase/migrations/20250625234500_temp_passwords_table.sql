
-- Create table to store temporary passwords for admin-created users
CREATE TABLE IF NOT EXISTS public.temp_passwords (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  user_email TEXT NOT NULL,
  user_name TEXT NOT NULL,
  temporary_password TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  password_used BOOLEAN DEFAULT FALSE,
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.temp_passwords ENABLE ROW LEVEL SECURITY;

-- Only admins can view temp passwords
CREATE POLICY "Only admins can view temp passwords"
  ON public.temp_passwords
  FOR SELECT
  USING (public.is_admin(auth.uid()));

-- Only admins can insert temp passwords  
CREATE POLICY "Only admins can create temp passwords"
  ON public.temp_passwords
  FOR INSERT
  WITH CHECK (public.is_admin(auth.uid()));

-- Update the admin_create_user function to store temp passwords and set proper provider
CREATE OR REPLACE FUNCTION public.admin_create_user(
  user_email TEXT,
  user_name TEXT,
  user_role user_role DEFAULT 'bidder'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_user_id UUID;
  temp_password TEXT;
  current_admin_id UUID;
BEGIN
  -- Get current admin user
  current_admin_id := auth.uid();
  
  -- Check if current user is admin
  IF NOT public.is_admin(current_admin_id) THEN
    RETURN json_build_object('error', 'Only admins can create users');
  END IF;

  -- Validate email domain
  IF NOT public.is_valid_email_domain(user_email) THEN
    RETURN json_build_object('error', 'Only @fitt-iitd.in email addresses are allowed');
  END IF;

  -- Generate temporary password
  temp_password := 'Temp' || floor(random() * 9000 + 1000)::text || '!';
  new_user_id := gen_random_uuid();

  -- Insert into auth.users with proper email provider metadata
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    new_user_id,
    'authenticated',
    'authenticated',
    user_email,
    crypt(temp_password, gen_salt('bf')),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    json_build_object('name', user_name),
    NOW(),
    NOW()
  );

  -- Create profile
  INSERT INTO public.profiles (id, name, email, role, password_reset_required)
  VALUES (new_user_id, user_name, user_email, user_role, TRUE)
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    email = EXCLUDED.email,
    role = EXCLUDED.role,
    password_reset_required = EXCLUDED.password_reset_required;

  -- Store temporary password for admin reference
  INSERT INTO public.temp_passwords (
    user_id, 
    user_email, 
    user_name, 
    temporary_password, 
    created_by
  ) VALUES (
    new_user_id, 
    user_email, 
    user_name, 
    temp_password, 
    current_admin_id
  );

  RETURN json_build_object(
    'success', true, 
    'user_id', new_user_id,
    'email', user_email,
    'temporary_password', temp_password
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('error', SQLERRM);
END;
$$;
