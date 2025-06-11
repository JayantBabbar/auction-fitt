
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Timer, 
  DollarSign, 
  Crown, 
  Heart, 
  Eye, 
  AlertCircle,
  Loader2
} from 'lucide-react';
import { Database } from '@/integrations/supabase/types';

type Auction = Database['public']['Tables']['auctions']['Row'];

interface AuctionCardProps {
  auction: Auction;
  bidAmount: string;
  onBidChange: (value: string) => void;
  onPlaceBid: () => void;
  onToggleWatchlist: () => void;
  onQuickBid: () => void;
  isWatched?: boolean;
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
  onToggleWatchlist,
  onQuickBid,
  isWatched = false,
  isLeading = false,
  myBid,
  isPlacingBid = false,
  canBid = true
}: AuctionCardProps) => {
  const calculateMinNextBid = () => {
    return (auction.current_bid || auction.starting_bid) + auction.bid_increment;
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
    if (auction.image_urls && auction.image_urls.length > 0) {
      return auction.image_urls[0];
    }
    
    // Return placeholder image based on category
    const category = auction.category.toLowerCase();
    if (category.includes('laptop') || category.includes('computer')) {
      return 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b';
    }
    if (category.includes('tech') || category.includes('electronic')) {
      return 'https://images.unsplash.com/photo-1518770660439-4636190af475';
    }
    if (category.includes('programming') || category.includes('software')) {
      return 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6';
    }
    
    // Default placeholder
    return 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d';
  };

  const currentBid = auction.current_bid || auction.starting_bid;
  const minNextBid = calculateMinNextBid();

  return (
    <Card className="fintech-card fintech-shadow-lg bg-card/95 backdrop-blur-sm border border-border/60 overflow-hidden hover:border-border transition-all duration-300">
      <div className="lg:flex">
        <div className="lg:w-64 h-56 lg:h-64 bg-muted/30 flex items-center justify-center overflow-hidden relative">
          <img 
            src={getDisplayImage()} 
            alt={auction.image_urls && auction.image_urls.length > 0 ? auction.title : `${auction.title} placeholder`}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-3 right-3">
            <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
              auction.status === 'active' 
                ? 'bg-fintech-green/10 text-fintech-green border border-fintech-green/20' 
                : 'bg-muted text-fintech-gray border border-border'
            }`}>
              {auction.status.toUpperCase()}
            </div>
          </div>
        </div>
        
        <div className="flex-1 p-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-3">
                <h3 className="text-2xl font-bold text-foreground tracking-tight">{auction.title}</h3>
                {isLeading && (
                  <div className="px-3 py-1 bg-gradient-to-r from-fintech-green/10 to-emerald-50 text-fintech-green border border-fintech-green/20 rounded-full flex items-center gap-1.5">
                    <Crown className="h-3.5 w-3.5" />
                    <span className="text-sm font-semibold">Leading</span>
                  </div>
                )}
                {myBid && !isLeading && (
                  <div className="px-3 py-1 bg-fintech-blue/10 text-fintech-blue border border-fintech-blue/20 rounded-full">
                    <span className="text-sm font-semibold">My Bid: ${myBid.toLocaleString()}</span>
                  </div>
                )}
              </div>
              <p className="text-fintech-gray mb-6 leading-relaxed">{auction.description}</p>
              
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-6 mb-6">
                <div className="bg-muted/30 rounded-xl p-4 border border-border/50">
                  <p className="text-xs font-semibold text-fintech-gray uppercase tracking-wide mb-2">Starting Bid</p>
                  <p className="text-lg font-bold text-foreground">${auction.starting_bid.toLocaleString()}</p>
                </div>
                <div className="bg-gradient-to-br from-fintech-blue/5 to-blue-50/50 rounded-xl p-4 border border-fintech-blue/20">
                  <p className="text-xs font-semibold text-fintech-blue uppercase tracking-wide mb-2">Current Bid</p>
                  <p className="text-2xl font-bold text-fintech-blue">
                    ${currentBid.toLocaleString()}
                  </p>
                </div>
                <div className="bg-muted/30 rounded-xl p-4 border border-border/50">
                  <p className="text-xs font-semibold text-fintech-gray uppercase tracking-wide mb-2">Increment</p>
                  <p className="text-lg font-bold text-foreground">${auction.bid_increment.toLocaleString()}</p>
                </div>
                <div className="bg-muted/30 rounded-xl p-4 border border-border/50">
                  <p className="text-xs font-semibold text-fintech-gray uppercase tracking-wide mb-2">Time Left</p>
                  <p className="text-lg font-bold text-foreground flex items-center gap-2">
                    <Timer className="h-4 w-4 text-fintech-gray" />
                    {getTimeRemaining()}
                  </p>
                </div>
                {auction.status === 'active' && (
                  <div className="bg-gradient-to-br from-fintech-green/5 to-emerald-50/50 rounded-xl p-4 border border-fintech-green/20">
                    <p className="text-xs font-semibold text-fintech-green uppercase tracking-wide mb-2">Min Next Bid</p>
                    <p className="text-lg font-bold text-fintech-green">
                      ${minNextBid.toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={onToggleWatchlist}
              className={`ml-4 ${isWatched 
                ? 'border-fintech-red/20 bg-fintech-red/5 text-fintech-red hover:bg-fintech-red/10' 
                : 'border-border hover:bg-muted'
              }`}
            >
              <Heart className={`h-4 w-4 ${isWatched ? 'fill-current' : ''}`} />
            </Button>
          </div>
          
          {auction.status === 'active' && (
            <div className="flex gap-4">
              <div className="flex-1 flex gap-3">
                <Input
                  type="number"
                  placeholder={`Min: $${minNextBid.toLocaleString()}`}
                  value={bidAmount}
                  onChange={(e) => onBidChange(e.target.value)}
                  step={auction.bid_increment}
                  min={minNextBid}
                  className="max-w-xs h-12 bg-background border-border focus:border-fintech-blue transition-colors"
                  disabled={isPlacingBid || !canBid}
                />
                <Button 
                  onClick={onPlaceBid}
                  className="fintech-button h-12 px-8"
                  disabled={isPlacingBid || !canBid}
                >
                  {isPlacingBid ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <DollarSign className="h-4 w-4 mr-2" />
                  )}
                  Place Bid
                </Button>
                <Button 
                  variant="outline"
                  onClick={onQuickBid}
                  className="fintech-button-secondary h-12 px-6"
                  disabled={isPlacingBid || !canBid}
                >
                  Quick: ${minNextBid.toLocaleString()}
                </Button>
              </div>
            </div>
          )}
          
          {auction.status === 'upcoming' && (
            <div className="flex items-center gap-3 text-fintech-gray bg-muted/30 rounded-xl p-4 border border-border/50">
              <AlertCircle className="h-5 w-5" />
              <span className="font-medium">Auction hasn't started yet</span>
            </div>
          )}
          
          {!canBid && auction.status === 'active' && (
            <div className="flex items-center gap-3 text-amber-700 bg-amber-50 rounded-xl p-4 border border-amber-200/60 mt-4">
              <AlertCircle className="h-5 w-5" />
              <span className="font-medium">Bidding restricted due to recent win</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default AuctionCard;
