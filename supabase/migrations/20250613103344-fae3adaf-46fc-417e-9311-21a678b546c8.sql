
-- Add the missing password_reset_required column to the profiles table
ALTER TABLE public.profiles 
ADD COLUMN password_reset_required BOOLEAN DEFAULT false;

-- Update existing users to set appropriate password reset requirements
UPDATE public.profiles 
SET password_reset_required = CASE 
  WHEN email = 'admin@fitt-iitd.in' THEN false
  WHEN email LIKE '%@fitt-iitd.in' THEN true
  ELSE false
END;
