
-- Create the missing admin_create_user function
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
BEGIN
  -- Check if current user is admin
  IF NOT public.is_admin(auth.uid()) THEN
    RETURN json_build_object('error', 'Only admins can create users');
  END IF;

  -- Validate email domain
  IF NOT public.is_valid_email_domain(user_email) THEN
    RETURN json_build_object('error', 'Only @fitt-iitd.in email addresses are allowed');
  END IF;

  -- Generate temporary password
  temp_password := 'Temp' || floor(random() * 9000 + 1000)::text || '!';
  new_user_id := gen_random_uuid();

  -- Insert into auth.users
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

  -- Create profile (will be handled by trigger, but we ensure it exists)
  INSERT INTO public.profiles (id, name, email, role, password_reset_required)
  VALUES (new_user_id, user_name, user_email, user_role, TRUE)
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    email = EXCLUDED.email,
    role = EXCLUDED.role,
    password_reset_required = EXCLUDED.password_reset_required;

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

-- Also create the missing helper functions if they don't exist
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS user_role
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT role FROM public.profiles WHERE id = user_id;
$$;

CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.profiles 
    WHERE id = user_id AND role = 'admin'
  );
$$;
