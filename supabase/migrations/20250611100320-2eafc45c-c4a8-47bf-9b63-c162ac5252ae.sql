
-- Create a table to track auction bids
CREATE TABLE public.bids (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  auction_id UUID REFERENCES public.auctions(id) ON DELETE CASCADE NOT NULL,
  bidder_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create a table to track auction winners and their bidding restrictions
CREATE TABLE public.auction_winners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  auction_id UUID REFERENCES public.auctions(id) ON DELETE CASCADE NOT NULL,
  winner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  winning_bid DECIMAL(12,2) NOT NULL,
  won_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  bidding_restricted_until TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (NOW() + INTERVAL '24 hours'),
  UNIQUE(auction_id, winner_id)
);

-- Enable RLS on bids table
ALTER TABLE public.bids ENABLE ROW LEVEL SECURITY;

-- Enable RLS on auction_winners table
ALTER TABLE public.auction_winners ENABLE ROW LEVEL SECURITY;

-- Policies for bids table
-- Anyone can view bids for active/ended auctions
CREATE POLICY "Anyone can view bids for published auctions" 
  ON public.bids 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.auctions 
      WHERE id = auction_id AND status IN ('active', 'ended', 'upcoming')
    )
  );

-- Authenticated users can insert their own bids
CREATE POLICY "Users can create their own bids" 
  ON public.bids 
  FOR INSERT 
  WITH CHECK (auth.uid() = bidder_id);

-- Admins can view all bids
CREATE POLICY "Admins can view all bids" 
  ON public.bids 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policies for auction_winners table
-- Anyone can view winners for ended auctions
CREATE POLICY "Anyone can view winners for ended auctions" 
  ON public.auction_winners 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.auctions 
      WHERE id = auction_id AND status = 'ended'
    )
  );

-- Admins can manage auction winners
CREATE POLICY "Admins can manage auction winners" 
  ON public.auction_winners 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Users can view their own bidding restrictions
CREATE POLICY "Users can view their own restrictions" 
  ON public.auction_winners 
  FOR SELECT 
  USING (auth.uid() = winner_id);

-- Function to check if a user can bid (not restricted)
CREATE OR REPLACE FUNCTION public.can_user_bid(user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT NOT EXISTS (
    SELECT 1 FROM public.auction_winners 
    WHERE winner_id = user_id 
    AND bidding_restricted_until > NOW()
  );
$$;

-- Function to place a bid with validation
CREATE OR REPLACE FUNCTION public.place_bid(
  p_auction_id UUID,
  p_bidder_id UUID,
  p_amount DECIMAL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  auction_record public.auctions%ROWTYPE;
  min_bid DECIMAL;
  bid_record public.bids%ROWTYPE;
BEGIN
  -- Check if user can bid (not restricted)
  IF NOT public.can_user_bid(p_bidder_id) THEN
    RETURN json_build_object(
      'success', false,
      'error', 'You cannot bid for 24 hours after winning an auction'
    );
  END IF;

  -- Get auction details
  SELECT * INTO auction_record 
  FROM public.auctions 
  WHERE id = p_auction_id AND status = 'active';

  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Auction not found or not active'
    );
  END IF;

  -- Calculate minimum bid
  min_bid := COALESCE(auction_record.current_bid, auction_record.starting_bid) + auction_record.bid_increment;

  -- Validate bid amount
  IF p_amount < min_bid THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Bid amount must be at least $' || min_bid
    );
  END IF;

  -- Check bid increment
  IF (p_amount - COALESCE(auction_record.current_bid, auction_record.starting_bid)) % auction_record.bid_increment != 0 THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Bid must be in increments of $' || auction_record.bid_increment
    );
  END IF;

  -- Insert the bid
  INSERT INTO public.bids (auction_id, bidder_id, amount)
  VALUES (p_auction_id, p_bidder_id, p_amount)
  RETURNING * INTO bid_record;

  -- Update auction current bid and bidder count
  UPDATE public.auctions 
  SET 
    current_bid = p_amount,
    bidder_count = (
      SELECT COUNT(DISTINCT bidder_id) 
      FROM public.bids 
      WHERE auction_id = p_auction_id
    ),
    updated_at = NOW()
  WHERE id = p_auction_id;

  RETURN json_build_object(
    'success', true,
    'bid_id', bid_record.id,
    'message', 'Bid placed successfully'
  );
END;
$$;

-- Function to end auction and declare winner
CREATE OR REPLACE FUNCTION public.end_auction(p_auction_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  auction_record public.auctions%ROWTYPE;
  winning_bid public.bids%ROWTYPE;
BEGIN
  -- Get auction details
  SELECT * INTO auction_record 
  FROM public.auctions 
  WHERE id = p_auction_id AND status = 'active';

  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Auction not found or not active'
    );
  END IF;

  -- Get the highest bid
  SELECT * INTO winning_bid
  FROM public.bids
  WHERE auction_id = p_auction_id
  ORDER BY amount DESC, created_at ASC
  LIMIT 1;

  -- Update auction status
  UPDATE public.auctions 
  SET status = 'ended', updated_at = NOW()
  WHERE id = p_auction_id;

  -- If there's a winning bid, record the winner
  IF FOUND AND winning_bid.bidder_id IS NOT NULL THEN
    INSERT INTO public.auction_winners (auction_id, winner_id, winning_bid)
    VALUES (p_auction_id, winning_bid.bidder_id, winning_bid.amount)
    ON CONFLICT (auction_id, winner_id) DO UPDATE SET
      winning_bid = EXCLUDED.winning_bid,
      won_at = NOW(),
      bidding_restricted_until = NOW() + INTERVAL '24 hours';

    RETURN json_build_object(
      'success', true,
      'winner_id', winning_bid.bidder_id,
      'winning_bid', winning_bid.amount,
      'message', 'Auction ended with winner'
    );
  ELSE
    RETURN json_build_object(
      'success', true,
      'winner_id', null,
      'winning_bid', null,
      'message', 'Auction ended with no bids'
    );
  END IF;
END;
$$;

-- Add bid_increment column to auctions table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'auctions' AND column_name = 'bid_increment'
  ) THEN
    ALTER TABLE public.auctions ADD COLUMN bid_increment DECIMAL(12,2) NOT NULL DEFAULT 50.00;
  END IF;
END $$;
