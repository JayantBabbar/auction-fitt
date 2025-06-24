
-- Complete database setup migration
-- This combines all necessary migrations in the correct order

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create user role enum
DO $$ BEGIN
    CREATE TYPE public.user_role AS ENUM ('admin', 'bidder');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create auction status enum
DO $$ BEGIN
    CREATE TYPE public.auction_status AS ENUM ('draft', 'upcoming', 'active', 'ended', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create auction condition enum  
DO $$ BEGIN
    CREATE TYPE public.auction_condition AS ENUM ('excellent', 'very_good', 'good', 'fair', 'poor');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role user_role NOT NULL DEFAULT 'bidder',
  password_reset_required BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create auctions table
CREATE TABLE IF NOT EXISTS public.auctions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  starting_bid DECIMAL(12,2) NOT NULL CHECK (starting_bid >= 0),
  reserve_price DECIMAL(12,2) CHECK (reserve_price >= starting_bid),
  current_bid DECIMAL(12,2) DEFAULT 0 CHECK (current_bid >= 0),
  bid_increment DECIMAL(10,2) NOT NULL DEFAULT 100.00 CHECK (bid_increment > 0),
  condition auction_condition NOT NULL,
  provenance TEXT,
  dimensions TEXT,
  weight TEXT,
  auction_duration INTEGER NOT NULL DEFAULT 7 CHECK (auction_duration > 0),
  start_time TIMESTAMP WITH TIME ZONE,
  end_time TIMESTAMP WITH TIME ZONE,
  status auction_status NOT NULL DEFAULT 'draft',
  bidder_count INTEGER NOT NULL DEFAULT 0,
  image_urls TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create bids table
CREATE TABLE IF NOT EXISTS public.bids (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  auction_id UUID REFERENCES public.auctions(id) ON DELETE CASCADE NOT NULL,
  bidder_id UUID REFERENCES auth.users(id) NOT NULL,
  amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create auction images table
CREATE TABLE IF NOT EXISTS public.auction_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  auction_id UUID REFERENCES public.auctions(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create auction winners table
CREATE TABLE IF NOT EXISTS public.auction_winners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  auction_id UUID REFERENCES public.auctions(id) ON DELETE CASCADE NOT NULL,
  winner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  winning_bid DECIMAL(12,2) NOT NULL,
  won_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  bidding_restricted_until TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (NOW() + INTERVAL '24 hours'),
  UNIQUE(auction_id, winner_id)
);

-- Create security audit log table
CREATE TABLE IF NOT EXISTS public.security_audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  ip_address INET,
  user_agent TEXT,
  success BOOLEAN NOT NULL DEFAULT true,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auctions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auction_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auction_winners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

-- Email domain validation function
CREATE OR REPLACE FUNCTION public.is_valid_email_domain(email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN email ~* '@fitt-iitd\.in$';
END;
$$ LANGUAGE plpgsql;

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  -- Check if email domain is allowed
  IF NOT public.is_valid_email_domain(NEW.email) THEN
    RAISE EXCEPTION 'Only @fitt-iitd.in email addresses are allowed';
  END IF;

  -- Create profile for new user
  INSERT INTO public.profiles (id, name, email, role, password_reset_required)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'name', 'User'),
    NEW.email,
    CASE 
      WHEN NEW.email = 'admin@fitt-iitd.in' THEN 'admin'::public.user_role
      ELSE 'bidder'::public.user_role
    END,
    CASE 
      WHEN NEW.email LIKE '%@fitt-iitd.in' AND NEW.email != 'admin@fitt-iitd.in' THEN true
      ELSE false
    END
  );
  
  RETURN NEW;
END;
$$;

-- Create trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Security definer function to get user role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT role::text FROM public.profiles WHERE id = auth.uid();
$$;

-- Helper functions
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

-- Function to update auction timestamps
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
DROP TRIGGER IF EXISTS update_auction_timestamps_trigger ON public.auctions;
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

-- RLS Policies
-- Profiles table policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Profiles can only be created by authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

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
DROP POLICY IF EXISTS "Anyone can view published auctions" ON public.auctions;
DROP POLICY IF EXISTS "Admins can view all auctions" ON public.auctions;
DROP POLICY IF EXISTS "Only admins can create auctions" ON public.auctions;
DROP POLICY IF EXISTS "Only admins can update auctions" ON public.auctions;
DROP POLICY IF EXISTS "Only admins can delete auctions" ON public.auctions;

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

-- Bids table policies
DROP POLICY IF EXISTS "Anyone can view bids for published auctions" ON public.bids;
DROP POLICY IF EXISTS "Authenticated users can create bids" ON public.bids;
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

-- Auction images policies
DROP POLICY IF EXISTS "Anyone can view images for published auctions" ON public.auction_images;
DROP POLICY IF EXISTS "Admins can view all auction images" ON public.auction_images;
DROP POLICY IF EXISTS "Only admins can manage auction images" ON public.auction_images;

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

-- Auction winners policies
DROP POLICY IF EXISTS "Anyone can view winners for ended auctions" ON public.auction_winners;
DROP POLICY IF EXISTS "Users can view their own restrictions" ON public.auction_winners;
DROP POLICY IF EXISTS "Only admins can manage auction winners" ON public.auction_winners;

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

-- Security audit log policies
DROP POLICY IF EXISTS "Only admins can view audit logs" ON public.security_audit_log;

CREATE POLICY "Only admins can view audit logs"
  ON public.security_audit_log
  FOR SELECT
  USING (public.get_current_user_role() = 'admin');

-- Create the initial admin user
DO $$
DECLARE
  admin_user_id UUID;
BEGIN
  -- Check if admin user already exists
  SELECT id INTO admin_user_id FROM auth.users WHERE email = 'admin@fitt-iitd.in';
  
  IF admin_user_id IS NULL THEN
    -- Create admin user
    admin_user_id := gen_random_uuid();
    
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
      admin_user_id,
      'authenticated',
      'authenticated',
      'admin@fitt-iitd.in',
      crypt('Admin@123', gen_salt('bf')),
      NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "System Admin"}',
      NOW(),
      NOW()
    );

    -- Create admin profile
    INSERT INTO public.profiles (id, name, email, role, password_reset_required)
    VALUES (
      admin_user_id,
      'System Admin',
      'admin@fitt-iitd.in',
      'admin'::user_role,
      TRUE
    );
  END IF;
END $$;
