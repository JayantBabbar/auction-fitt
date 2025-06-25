
-- Drop ALL existing RLS policies that might depend on the role column
-- First, let's drop policies on profiles table
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Profiles can only be created by authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Drop policies on auctions table
DROP POLICY IF EXISTS "Anyone can view published auctions" ON public.auctions;
DROP POLICY IF EXISTS "Admins can view all auctions" ON public.auctions;
DROP POLICY IF EXISTS "Only admins can create auctions" ON public.auctions;
DROP POLICY IF EXISTS "Only admins can update auctions" ON public.auctions;
DROP POLICY IF EXISTS "Only admins can delete auctions" ON public.auctions;
DROP POLICY IF EXISTS "Admins can manage all auctions" ON public.auctions;

-- Drop policies on bids table
DROP POLICY IF EXISTS "Anyone can view bids for published auctions" ON public.bids;
DROP POLICY IF EXISTS "Authenticated users can create bids" ON public.bids;
DROP POLICY IF EXISTS "Admins can view all bids" ON public.bids;

-- Drop policies on auction_images table
DROP POLICY IF EXISTS "Anyone can view images for published auctions" ON public.auction_images;
DROP POLICY IF EXISTS "Admins can view all auction images" ON public.auction_images;
DROP POLICY IF EXISTS "Only admins can manage auction images" ON public.auction_images;
DROP POLICY IF EXISTS "Admins can manage auction images" ON public.auction_images;

-- Drop policies on auction_winners table
DROP POLICY IF EXISTS "Anyone can view winners for ended auctions" ON public.auction_winners;
DROP POLICY IF EXISTS "Users can view their own restrictions" ON public.auction_winners;
DROP POLICY IF EXISTS "Only admins can manage auction winners" ON public.auction_winners;

-- Create user role enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE public.user_role AS ENUM ('admin', 'bidder');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create security definer function to avoid infinite recursion
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT role::text FROM public.profiles WHERE id = auth.uid();
$$;

-- Now we can safely alter the column type
ALTER TABLE public.profiles 
ALTER COLUMN role TYPE user_role USING role::text::user_role;

-- Recreate all the RLS policies using the security definer function
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

-- Bids table policies
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

-- Update the handle_new_user function
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

-- Create trigger for new user handling
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
