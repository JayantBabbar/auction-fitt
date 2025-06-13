
-- Create a view to get bid details with user information for admins
CREATE OR REPLACE VIEW public.bid_details_admin AS
SELECT 
    b.id,
    b.auction_id,
    b.bidder_id,
    b.amount,
    b.created_at,
    b.updated_at,
    p.name as bidder_name,
    p.email as bidder_email,
    a.title as auction_title
FROM public.bids b
JOIN public.profiles p ON b.bidder_id = p.id
JOIN public.auctions a ON b.auction_id = a.id
ORDER BY b.auction_id, b.amount DESC, b.created_at ASC;

-- Create a function to get the highest bidder for an auction
CREATE OR REPLACE FUNCTION public.get_highest_bidder(p_auction_id uuid)
RETURNS TABLE (
    bidder_id uuid,
    bidder_name text,
    bidder_email text,
    highest_bid numeric,
    bid_time timestamp with time zone
)
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
    SELECT 
        b.bidder_id,
        p.name as bidder_name,
        p.email as bidder_email,
        b.amount as highest_bid,
        b.created_at as bid_time
    FROM public.bids b
    JOIN public.profiles p ON b.bidder_id = p.id
    WHERE b.auction_id = p_auction_id
    ORDER BY b.amount DESC, b.created_at ASC
    LIMIT 1;
$$;

-- Create a function to get all bids for an auction (for CSV download)
CREATE OR REPLACE FUNCTION public.get_auction_bids_admin(p_auction_id uuid)
RETURNS TABLE (
    bid_id uuid,
    bidder_name text,
    bidder_email text,
    bid_amount numeric,
    bid_timestamp timestamp with time zone
)
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
    SELECT 
        b.id as bid_id,
        p.name as bidder_name,
        p.email as bidder_email,
        b.amount as bid_amount,
        b.created_at as bid_timestamp
    FROM public.bids b
    JOIN public.profiles p ON b.bidder_id = p.id
    WHERE b.auction_id = p_auction_id
    ORDER BY b.created_at DESC;
$$;
