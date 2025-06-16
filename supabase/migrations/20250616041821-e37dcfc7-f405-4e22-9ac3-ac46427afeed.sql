
-- Fix the handle_new_user function to properly reference the user_role enum
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Create function to handle new user registration with proper schema references
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role, password_reset_required)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'name', 'User'),
    NEW.email,
    CASE 
      WHEN NEW.email = 'admin@fitt-iitd.in' THEN 'admin'::public.user_role
      ELSE 'bidder'::public.user_role
    END,
    -- Set password reset required for bulk created users (those with @fitt-iitd.in emails)
    -- but not for the admin
    CASE 
      WHEN NEW.email LIKE '%@fitt-iitd.in' AND NEW.email != 'admin@fitt-iitd.in' THEN true
      ELSE false
    END
  );
  RETURN NEW;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
