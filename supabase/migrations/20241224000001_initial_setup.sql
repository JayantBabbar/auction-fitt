
-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create user role enum
CREATE TYPE public.user_role AS ENUM ('admin', 'bidder');

-- Create auction status enum
CREATE TYPE public.auction_status AS ENUM ('draft', 'upcoming', 'active', 'ended', 'cancelled');

-- Create auction condition enum  
CREATE TYPE public.auction_condition AS ENUM ('excellent', 'very_good', 'good', 'fair', 'poor');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role user_role NOT NULL DEFAULT 'bidder',
  password_reset_required BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create auctions table
CREATE TABLE public.auctions (
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
CREATE TABLE public.bids (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  auction_id UUID REFERENCES public.auctions(id) ON DELETE CASCADE NOT NULL,
  bidder_id UUID REFERENCES auth.users(id) NOT NULL,
  amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create auction images table
CREATE TABLE public.auction_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  auction_id UUID REFERENCES public.auctions(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auctions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auction_images ENABLE ROW LEVEL SECURITY;
