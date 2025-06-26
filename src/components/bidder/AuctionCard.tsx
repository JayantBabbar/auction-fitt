import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Timer, 
  DollarSign, 
  Crown, 
  AlertCircle,
  Loader2,
  Image as ImageIcon
} from 'lucide-react';
import { Database } from '@/integrations/supabase/types';
import BidIncrementWarning from './BidIncrementWarning';

type Auction = Database['public']['Tables']['auctions']['Row'];

interface AuctionCardProps {
  auction: Auction;
  bidAmount: string;
  onBidChange: (value: string) => void;
  onPlaceBid: () => void;
  onQuickBid: () => void;
  isLeading?: boolean;
  myBid?: number;
  isPlacingBid?: boolean;
  canBid?: boolean;
}

const AuctionCard = ({
  auction,
  bidAmount,
  onBidChange,
  onPlaceBid,
  onQuickBid,
  isLeading = false,
  myBid,
  isPlacingBid = false,
  canBid = true
}: AuctionCardProps) => {
  const [showWarning, setShowWarning] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const calculateMinNextBid = () => {
    return (auction.current_bid || auction.starting_bid) + auction.bid_increment;
  };

  const validateBidAmount = (bidAmount: number) => {
    const minNextBid = calculateMinNextBid();
    
    if (bidAmount < minNextBid) {
      return {
        isValid: false,
        message: `Minimum bid is ₹${minNextBid.toLocaleString()} (current bid + ₹${auction.bid_increment} increment)`
      };
    }

    const bidDifference = bidAmount - (auction.current_bid || auction.starting_bid);
    if (bidDifference % auction.bid_increment !== 0) {
      return {
        isValid: false,
        message: `Bid must be in increments of ₹${auction.bid_increment}`
      };
    }

    return { isValid: true, message: '' };
  };

  const handlePlaceBid = () => {
    const enteredAmount = parseFloat(bidAmount || '0');
    const validation = validateBidAmount(enteredAmount);
    
    if (!validation.isValid) {
      setShowWarning(true);
      return;
    }
    
    onPlaceBid();
  };

  const getTimeRemaining = () => {
    if (!auction.end_time) return 'No end time set';
    
    const now = new Date().getTime();
    const end = new Date(auction.end_time).getTime();
    const timeLeft = end - now;

    if (timeLeft <= 0) return 'Ended';

    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const getDisplayImage = () => {
    // First, try to use uploaded images
    if (auction.image_urls && auction.image_urls.length > 0) {
      return auction.image_urls[0];
    }
    
    // Fallback to placeholder image based on category
    const category = auction.category.toLowerCase();
    if (category.includes('laptop') || category.includes('computer')) {
      return 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=400&h=300&fit=crop';
    }
    if (category.includes('tech') || category.includes('electronic')) {
      return 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=300&fit=crop';
    }
    if (category.includes('programming') || category.includes('software')) {
      return 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=300&fit=crop';
    }
    
    // Default placeholder
    return 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=400&h=300&fit=crop';
  };

  const handleImageError = () => {
    console.error('Image failed to load:', getDisplayImage());
    setImageError(true);
    setImageLoading(false);
  };

  const handleImageLoad = () => {
    console.log('Image loaded successfully:', getDisplayImage());
    setImageLoading(false);
    setImageError(false);
  };

  const currentBid = auction.current_bid || auction.starting_bid;
  const minNextBid = calculateMinNextBid();
  const displayImage = getDisplayImage();

  return (
    <>
      <Card className="shadow-sm hover:shadow-md transition-shadow overflow-hidden">
        <div className="md:flex">
          <div className="md:w-48 h-48 bg-muted flex items-center justify-center overflow-hidden relative">
            {imageLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-muted">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            )}
            {imageError ? (
              <div className="flex flex-col items-center justify-center text-muted-foreground">
                <ImageIcon className="h-8 w-8 mb-2" />
                <span className="text-xs">Image unavailable</span>
              </div>
            ) : (
              <img 
                src={displayImage}
                alt={auction.title}
                className="w-full h-full object-cover"
                onError={handleImageError}
                onLoad={handleImageLoad}
                style={{ display: imageLoading ? 'none' : 'block' }}
              />
            )}
          </div>
          
          <div className="flex-1 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-serif font-semibold">{auction.title}</h3>
                  <Badge variant={auction.status === 'active' ? 'default' : 'secondary'}>
                    {auction.status}
                  </Badge>
                  {isLeading && (
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      <Crown className="h-3 w-3 mr-1" />
                      Leading
                    </Badge>
                  )}
                  {myBid && !isLeading && (
                    <Badge variant="outline" className="bg-blue-50 text-blue-700">
                      My Bid: ₹{myBid.toLocaleString()}
                    </Badge>
                  )}
                </div>
                <p className="text-muted-foreground mb-4">{auction.description}</p>
                
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm mb-4">
                  <div>
                    <p className="text-muted-foreground">Base Price</p>
                    <p className="font-semibold">₹{auction.starting_bid.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Current Bid</p>
                    <p className="text-2xl font-bold text-primary">
                      ₹{currentBid.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Incremental Bid</p>
                    <p className="font-semibold">₹{auction.bid_increment.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Time Left</p>
                    <p className="font-semibold flex items-center gap-1">
                      <Timer className="h-3 w-3" />
                      {getTimeRemaining()}
                    </p>
                  </div>
                  {auction.status === 'active' && (
                    <div>
                      <p className="text-muted-foreground">Min Next Bid</p>
                      <p className="font-semibold text-green-600">
                        ₹{minNextBid.toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {auction.status === 'active' && (
              <div className="flex gap-3">
                <div className="flex-1 flex gap-2">
                  <Input
                    type="number"
                    placeholder={`Min: ₹${minNextBid.toLocaleString()}`}
                    value={bidAmount}
                    onChange={(e) => onBidChange(e.target.value)}
                    step={auction.bid_increment}
                    min={minNextBid}
                    className="max-w-xs"
                    disabled={isPlacingBid || !canBid}
                  />
                  <Button 
                    onClick={handlePlaceBid}
                    className="bg-primary hover:bg-primary/90"
                    disabled={isPlacingBid || !canBid}
                  >
                    {isPlacingBid ? (
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    ) : (
                      <DollarSign className="h-4 w-4 mr-1" />
                    )}
                    Place Bid
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={onQuickBid}
                    disabled={isPlacingBid || !canBid}
                  >
                    Quick Bid: ₹{minNextBid.toLocaleString()}
                  </Button>
                </div>
              </div>
            )}
            
            {auction.status === 'upcoming' && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <AlertCircle className="h-4 w-4" />
                <span>Auction hasn't started yet</span>
              </div>
            )}
            
            {!canBid && auction.status === 'active' && (
              <div className="flex items-center gap-2 text-yellow-600 mt-2">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">Bidding restricted due to recent win</span>
              </div>
            )}
          </div>
        </div>
      </Card>

      <BidIncrementWarning
        isOpen={showWarning}
        onClose={() => setShowWarning(false)}
        currentBid={currentBid}
        bidIncrement={auction.bid_increment}
        enteredAmount={parseFloat(bidAmount || '0')}
      />
    </>
  );
};

export default AuctionCard;
