
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
  AlertCircle 
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
  myBid
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

  const currentBid = auction.current_bid || auction.starting_bid;
  const minNextBid = calculateMinNextBid();

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      <div className="md:flex">
        <div className="md:w-48 h-48 bg-muted flex items-center justify-center">
          <Eye className="h-12 w-12 text-muted-foreground" />
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
                    My Bid: ${myBid.toLocaleString()}
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground mb-4">{auction.description}</p>
              
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm mb-4">
                <div>
                  <p className="text-muted-foreground">Starting Bid</p>
                  <p className="font-semibold">${auction.starting_bid.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Current Bid</p>
                  <p className="text-2xl font-bold text-primary">
                    ${currentBid.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Bid Increment</p>
                  <p className="font-semibold">${auction.bid_increment.toLocaleString()}</p>
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
              className={isWatched ? 'text-red-600' : ''}
            >
              <Heart className={`h-4 w-4 ${isWatched ? 'fill-current' : ''}`} />
            </Button>
          </div>
          
          {auction.status === 'active' && (
            <div className="flex gap-3">
              <div className="flex-1 flex gap-2">
                <Input
                  type="number"
                  placeholder={`Min: $${minNextBid.toLocaleString()}`}
                  value={bidAmount}
                  onChange={(e) => onBidChange(e.target.value)}
                  step={auction.bid_increment}
                  min={minNextBid}
                  className="max-w-xs"
                />
                <Button 
                  onClick={onPlaceBid}
                  className="bg-primary hover:bg-primary/90"
                >
                  <DollarSign className="h-4 w-4 mr-1" />
                  Place Bid
                </Button>
                <Button 
                  variant="outline"
                  onClick={onQuickBid}
                >
                  Quick Bid: ${minNextBid.toLocaleString()}
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
        </div>
      </div>
    </Card>
  );
};

export default AuctionCard;
