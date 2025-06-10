
-- Create auction status enum
CREATE TYPE public.auction_status AS ENUM ('draft', 'upcoming', 'active', 'ended', 'cancelled');

-- Create auction condition enum  
CREATE TYPE public.auction_condition AS ENUM ('excellent', 'very_good', 'good', 'fair', 'poor');

-- Create auctions table
CREATE TABLE public.auctions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_by UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  starting_bid DECIMAL(12,2) NOT NULL CHECK (starting_bid >= 0),
  reserve_price DECIMAL(12,2) CHECK (reserve_price >= starting_bid),
  current_bid DECIMAL(12,2) DEFAULT 0 CHECK (current_bid >= 0),
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

-- Create auction images table for better file management
CREATE TABLE public.auction_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  auction_id UUID REFERENCES public.auctions(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.auctions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auction_images ENABLE ROW LEVEL SECURITY;

-- Create policies for auctions table
-- Anyone can view active/ended auctions
CREATE POLICY "Anyone can view published auctions" 
  ON public.auctions 
  FOR SELECT 
  USING (status IN ('active', 'ended', 'upcoming'));

-- Admins can view all auctions
CREATE POLICY "Admins can view all auctions" 
  ON public.auctions 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Only admins can create auctions
CREATE POLICY "Admins can create auctions" 
  ON public.auctions 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Only admins can update auctions
CREATE POLICY "Admins can update auctions" 
  ON public.auctions 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Only admins can delete auctions
CREATE POLICY "Admins can delete auctions" 
  ON public.auctions 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policies for auction_images table
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

-- Create function to update auction timestamps
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
  
  -- Auto-update status based on timing
  IF NEW.start_time IS NOT NULL AND NEW.end_time IS NOT NULL THEN
    IF NOW() < NEW.start_time THEN
      NEW.status = 'upcoming';
    ELSIF NOW() >= NEW.start_time AND NOW() < NEW.end_time THEN
      NEW.status = 'active';
    ELSIF NOW() >= NEW.end_time THEN
      NEW.status = 'ended';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for auction updates
CREATE TRIGGER update_auction_timestamps_trigger
  BEFORE UPDATE ON public.auctions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_auction_timestamps();

-- Create function to handle auction status updates
CREATE OR REPLACE FUNCTION public.check_auction_status()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Update upcoming auctions to active
  UPDATE public.auctions 
  SET status = 'active', updated_at = NOW()
  WHERE status = 'upcoming' 
    AND start_time <= NOW() 
    AND end_time > NOW();
    
  -- Update active auctions to ended
  UPDATE public.auctions 
  SET status = 'ended', updated_at = NOW()
  WHERE status = 'active' 
    AND end_time <= NOW();
END;
$$;
