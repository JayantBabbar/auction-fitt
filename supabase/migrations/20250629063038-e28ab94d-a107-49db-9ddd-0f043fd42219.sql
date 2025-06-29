
-- Update the email domain validation function to allow both domains
CREATE OR REPLACE FUNCTION public.is_valid_email_domain(email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN email ~* '@(fitt-iitd|aic-iitd)\.in$';
END;
$$ LANGUAGE plpgsql;
