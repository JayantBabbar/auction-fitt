
-- Function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS user_role
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT role FROM public.profiles WHERE id = user_id;
$$;

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.profiles 
    WHERE id = user_id AND role = 'admin'
  );
$$;

-- Function to update auction end time based on start time and duration
CREATE OR REPLACE FUNCTION public.update_auction_timestamps()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  
  -- Auto-calculate end_time based on start_time and duration
  IF NEW.start_time IS NOT NULL AND NEW.auction_duration IS NOT NULL THEN
    NEW.end_time = NEW.start_time + (NEW.auction_duration || ' days')::INTERVAL;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for auction updates
CREATE TRIGGER update_auction_timestamps_trigger
  BEFORE INSERT OR UPDATE ON public.auctions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_auction_timestamps();

-- Function for admins to create new users
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

  -- Create profile
  INSERT INTO public.profiles (id, name, email, role, password_reset_required)
  VALUES (new_user_id, user_name, user_email, user_role, TRUE);

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
