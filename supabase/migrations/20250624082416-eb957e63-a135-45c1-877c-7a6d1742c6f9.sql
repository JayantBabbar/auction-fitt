
-- Create missing database functions and tables

-- First, create the auction_winners table
CREATE TABLE public.auction_winners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  auction_id UUID REFERENCES public.auctions(id) NOT NULL,
  winner_id UUID REFERENCES public.profiles(id) NOT NULL,
  winning_bid NUMERIC NOT NULL,
  won_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for better performance
CREATE INDEX idx_auction_winners_auction_id ON public.auction_winners(auction_id);
CREATE INDEX idx_auction_winners_winner_id ON public.auction_winners(winner_id);

-- Function to get highest bidder for an auction
CREATE OR REPLACE FUNCTION public.get_highest_bidder(p_auction_id UUID)
RETURNS TABLE (
  bidder_name TEXT,
  bidder_email TEXT,
  highest_bid NUMERIC,
  bid_time TIMESTAMP WITH TIME ZONE
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.name as bidder_name,
    p.email as bidder_email,
    b.amount as highest_bid,
    b.created_at as bid_time
  FROM public.bids b
  JOIN public.profiles p ON b.bidder_id = p.id
  WHERE b.auction_id = p_auction_id
  ORDER BY b.amount DESC
  LIMIT 1;
END;
$$;

-- Function to get all bids for admin view
CREATE OR REPLACE FUNCTION public.get_auction_bids_admin(p_auction_id UUID)
RETURNS TABLE (
  bid_id UUID,
  bidder_name TEXT,
  bidder_email TEXT,
  bid_amount NUMERIC,
  bid_timestamp TIMESTAMP WITH TIME ZONE
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    b.id as bid_id,
    p.name as bidder_name,
    p.email as bidder_email,
    b.amount as bid_amount,
    b.created_at as bid_timestamp
  FROM public.bids b
  JOIN public.profiles p ON b.bidder_id = p.id
  WHERE b.auction_id = p_auction_id
  ORDER BY b.amount DESC;
END;
$$;

-- Function to check if user can bid
CREATE OR REPLACE FUNCTION public.can_user_bid(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if user exists and has bidder role
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = user_id AND role = 'bidder'
  );
END;
$$;

-- Function to place a bid securely
CREATE OR REPLACE FUNCTION public.place_bid(
  p_auction_id UUID,
  p_bidder_id UUID,
  p_amount NUMERIC
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  auction_record RECORD;
  min_bid NUMERIC;
  result JSON;
BEGIN
  -- Get auction details
  SELECT * INTO auction_record 
  FROM public.auctions 
  WHERE id = p_auction_id AND status = 'active';
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Auction not found or not active');
  END IF;
  
  -- Calculate minimum bid
  min_bid := COALESCE(auction_record.current_bid, auction_record.starting_bid) + auction_record.bid_increment;
  
  -- Validate bid amount
  IF p_amount < min_bid THEN
    RETURN json_build_object(
      'success', false, 
      'error', 'Bid must be at least ' || min_bid::text
    );
  END IF;
  
  -- Check if user can bid
  IF NOT public.can_user_bid(p_bidder_id) THEN
    RETURN json_build_object('success', false, 'error', 'User not authorized to bid');
  END IF;
  
  -- Insert bid
  INSERT INTO public.bids (auction_id, bidder_id, amount)
  VALUES (p_auction_id, p_bidder_id, p_amount);
  
  -- Update auction current bid and bidder count
  UPDATE public.auctions 
  SET 
    current_bid = p_amount,
    bidder_count = bidder_count + 1,
    updated_at = now()
  WHERE id = p_auction_id;
  
  RETURN json_build_object(
    'success', true, 
    'message', 'Bid placed successfully',
    'bid_id', (SELECT id FROM public.bids WHERE auction_id = p_auction_id AND bidder_id = p_bidder_id AND amount = p_amount ORDER BY created_at DESC LIMIT 1)
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;
