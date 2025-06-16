
-- Phase 1: Implement missing Row Level Security (RLS) policies

-- First, ensure all critical tables have RLS enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auctions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auction_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auction_winners ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate them properly
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can view published auctions" ON public.auctions;
DROP POLICY IF EXISTS "Admins can view all auctions" ON public.auctions;
DROP POLICY IF EXISTS "Admins can create auctions" ON public.auctions;
DROP POLICY IF EXISTS "Admins can update auctions" ON public.auctions;
DROP POLICY IF EXISTS "Admins can delete auctions" ON public.auctions;
DROP POLICY IF EXISTS "Anyone can view auction images" ON public.auction_images;
DROP POLICY IF EXISTS "Admins can manage auction images" ON public.auction_images;

-- Create security definer function to get user role (prevents recursive RLS)
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT role::text FROM public.profiles WHERE id = auth.uid();
$$;

-- Profiles table policies
CREATE POLICY "Users can view their own profile" 
  ON public.profiles 
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Profiles can only be created by authenticated users"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles
  FOR SELECT
  USING (public.get_current_user_role() = 'admin');

-- Auctions table policies  
CREATE POLICY "Anyone can view published auctions" 
  ON public.auctions 
  FOR SELECT 
  USING (status IN ('active', 'ended', 'upcoming'));

CREATE POLICY "Admins can view all auctions" 
  ON public.auctions 
  FOR SELECT 
  USING (public.get_current_user_role() = 'admin');

CREATE POLICY "Only admins can create auctions" 
  ON public.auctions 
  FOR INSERT 
  WITH CHECK (public.get_current_user_role() = 'admin');

CREATE POLICY "Only admins can update auctions" 
  ON public.auctions 
  FOR UPDATE 
  USING (public.get_current_user_role() = 'admin');

CREATE POLICY "Only admins can delete auctions" 
  ON public.auctions 
  FOR DELETE 
  USING (public.get_current_user_role() = 'admin');

-- Auction images policies
CREATE POLICY "Anyone can view images for published auctions" 
  ON public.auction_images 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.auctions 
      WHERE id = auction_id AND status IN ('active', 'ended', 'upcoming')
    )
  );

CREATE POLICY "Admins can view all auction images" 
  ON public.auction_images 
  FOR SELECT 
  USING (public.get_current_user_role() = 'admin');

CREATE POLICY "Only admins can manage auction images" 
  ON public.auction_images 
  FOR ALL 
  USING (public.get_current_user_role() = 'admin')
  WITH CHECK (public.get_current_user_role() = 'admin');

-- Bids table policies (strengthen existing ones)
DROP POLICY IF EXISTS "Anyone can view bids for published auctions" ON public.bids;
DROP POLICY IF EXISTS "Users can create their own bids" ON public.bids;
DROP POLICY IF EXISTS "Admins can view all bids" ON public.bids;

CREATE POLICY "Anyone can view bids for published auctions" 
  ON public.bids 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.auctions 
      WHERE id = auction_id AND status IN ('active', 'ended', 'upcoming')
    )
  );

CREATE POLICY "Authenticated users can create bids" 
  ON public.bids 
  FOR INSERT 
  WITH CHECK (
    auth.uid() = bidder_id AND
    EXISTS (
      SELECT 1 FROM public.auctions 
      WHERE id = auction_id AND status = 'active'
    )
  );

CREATE POLICY "Admins can view all bids" 
  ON public.bids 
  FOR SELECT 
  USING (public.get_current_user_role() = 'admin');

-- Auction winners policies (strengthen existing ones)
DROP POLICY IF EXISTS "Anyone can view winners for ended auctions" ON public.auction_winners;
DROP POLICY IF EXISTS "Admins can manage auction winners" ON public.auction_winners;
DROP POLICY IF EXISTS "Users can view their own restrictions" ON public.auction_winners;

CREATE POLICY "Anyone can view winners for ended auctions" 
  ON public.auction_winners 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.auctions 
      WHERE id = auction_id AND status = 'ended'
    )
  );

CREATE POLICY "Users can view their own restrictions" 
  ON public.auction_winners 
  FOR SELECT 
  USING (auth.uid() = winner_id);

CREATE POLICY "Only admins can manage auction winners" 
  ON public.auction_winners 
  FOR ALL 
  USING (public.get_current_user_role() = 'admin')
  WITH CHECK (public.get_current_user_role() = 'admin');

-- Add audit logging table for security monitoring
CREATE TABLE public.security_audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  ip_address INET,
  user_agent TEXT,
  success BOOLEAN NOT NULL DEFAULT true,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Enable RLS on audit log
ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Only admins can view audit logs"
  ON public.security_audit_log
  FOR SELECT
  USING (public.get_current_user_role() = 'admin');

-- Function to log security events
CREATE OR REPLACE FUNCTION public.log_security_event(
  p_user_id UUID,
  p_action TEXT,
  p_resource_type TEXT,
  p_resource_id TEXT DEFAULT NULL,
  p_success BOOLEAN DEFAULT true,
  p_error_message TEXT DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.security_audit_log (
    user_id, action, resource_type, resource_id, success, error_message
  ) VALUES (
    p_user_id, p_action, p_resource_type, p_resource_id, p_success, p_error_message
  );
END;
$$;
