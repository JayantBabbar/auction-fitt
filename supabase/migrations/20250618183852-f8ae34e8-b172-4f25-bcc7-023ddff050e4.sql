
-- First, let's handle the foreign key constraint issue by updating the security_audit_log table
-- to allow CASCADE deletion or set user_id to NULL when users are deleted
ALTER TABLE public.security_audit_log 
DROP CONSTRAINT IF EXISTS security_audit_log_user_id_fkey;

-- Add the foreign key constraint back with CASCADE behavior
ALTER TABLE public.security_audit_log 
ADD CONSTRAINT security_audit_log_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;

-- Clean up existing audit logs to prevent issues
DELETE FROM public.security_audit_log;

-- Clean up existing profiles (this will cascade properly)
DELETE FROM public.profiles WHERE email LIKE '%@fitt-iitd.in';

-- Now we can safely delete users from auth.users
-- Note: This will be done via the admin API, not SQL, but we're preparing the constraints
