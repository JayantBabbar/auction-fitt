
-- Create RPC function to get temporary passwords
CREATE OR REPLACE FUNCTION public.get_temp_passwords()
RETURNS TABLE (
  id UUID,
  user_id UUID,
  user_email TEXT,
  user_name TEXT,
  temporary_password TEXT,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  password_used BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if current user is admin
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Only admins can view temporary passwords';
  END IF;

  RETURN QUERY
  SELECT 
    tp.id,
    tp.user_id,
    tp.user_email,
    tp.user_name,
    tp.temporary_password,
    tp.created_by,
    tp.created_at,
    tp.expires_at,
    tp.password_used
  FROM public.temp_passwords tp
  ORDER BY tp.created_at DESC;
END;
$$;
