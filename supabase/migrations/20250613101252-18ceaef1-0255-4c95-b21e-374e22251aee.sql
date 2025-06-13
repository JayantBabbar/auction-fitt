
-- Update the handle_new_user function to use the correct admin email
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
      WHEN NEW.email = 'admin@fitt-iitd.in' THEN 'admin'::user_role
      ELSE 'bidder'::user_role
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
