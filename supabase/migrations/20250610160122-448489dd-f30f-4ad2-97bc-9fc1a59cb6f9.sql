
-- Add bid_increment column to auctions table
ALTER TABLE public.auctions 
ADD COLUMN bid_increment DECIMAL(12,2) NOT NULL DEFAULT 50.00 CHECK (bid_increment > 0);

-- Add comment to explain the column
COMMENT ON COLUMN public.auctions.bid_increment IS 'Minimum amount by which bids must be increased';
