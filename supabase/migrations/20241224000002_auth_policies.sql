
-- Restrict email domain for new signups
CREATE OR REPLACE FUNCTION public.is_valid_email_domain(email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN email ~* '@fitt-iitd\.in$';
END;
$$ LANGUAGE plpgsql;

-- Function to handle new user registration with domain restriction
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
  INSERT INTO public.profiles (id, name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'name', 'User'),
    NEW.email,
    'bidder'::user_role
  );
  
  RETURN NEW;
END;
$$;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" 
  ON public.profiles 
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" 
  ON public.profiles 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for auctions
CREATE POLICY "Anyone can view active auctions" 
  ON public.auctions 
  FOR SELECT 
  USING (status IN ('active', 'ended', 'upcoming'));

CREATE POLICY "Admins can manage all auctions" 
  ON public.auctions 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for bids
CREATE POLICY "Users can view bids on active auctions" 
  ON public.bids 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.auctions 
      WHERE id = auction_id AND status = 'active'
    )
  );

CREATE POLICY "Authenticated users can place bids" 
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
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for auction images
CREATE POLICY "Anyone can view auction images" 
  ON public.auction_images 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.auctions 
      WHERE id = auction_id AND status IN ('active', 'ended', 'upcoming')
    )
  );

CREATE POLICY "Admins can manage auction images" 
  ON public.auction_images 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
