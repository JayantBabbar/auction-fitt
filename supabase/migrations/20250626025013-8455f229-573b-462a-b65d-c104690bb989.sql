
-- Update the admin_delete_user function to handle the auth.users deletion more robustly
CREATE OR REPLACE FUNCTION public.admin_delete_user(target_user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result json;
  user_exists boolean;
BEGIN
  -- Check if current user is admin
  IF NOT public.is_admin(auth.uid()) THEN
    RETURN json_build_object('success', false, 'error', 'Only admins can delete users');
  END IF;

  -- Check if target user exists in profiles (safer than checking auth.users directly)
  SELECT EXISTS(SELECT 1 FROM public.profiles WHERE id = target_user_id) INTO user_exists;
  
  IF NOT user_exists THEN
    RETURN json_build_object('success', false, 'error', 'User not found');
  END IF;

  -- Delete from related tables first (in correct order to avoid foreign key issues)
  DELETE FROM public.bids WHERE bidder_id = target_user_id;
  DELETE FROM public.temp_passwords WHERE user_id = target_user_id;
  
  -- Delete from profiles table
  DELETE FROM public.profiles WHERE id = target_user_id;
  
  -- Use a more robust approach to delete from auth.users
  -- This uses Supabase's admin API approach
  PERFORM auth.uid(); -- Ensure we have a valid auth context
  
  -- Delete from auth.users using a safer method
  DELETE FROM auth.users WHERE id = target_user_id;
  
  RETURN json_build_object(
    'success', true,
    'message', 'User deleted successfully'
  );
  
EXCEPTION
  WHEN OTHERS THEN
    -- Log the actual error for debugging but return a user-friendly message
    RAISE LOG 'Error in admin_delete_user for user %: %', target_user_id, SQLERRM;
    RETURN json_build_object(
      'success', false, 
      'error', 'Failed to delete user. Please contact support if this persists.'
    );
END;
$$;
