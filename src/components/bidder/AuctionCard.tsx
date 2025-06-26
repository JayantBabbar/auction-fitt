
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Clock, DollarSign, Users, Gavel, Image as ImageIcon } from 'lucide-react';
import { useUserBids } from '@/hooks/useBids';
import BidActions from './BidActions';

interface AuctionCardProps {
  auction: any;
  bidAmount: string;
  onBidChange: (value: string) => void;
  onPlaceBid: () => void;
  onQuickBid: () => void;
  isLeading: boolean;
  myBid?: number;
  isPlacingBid: boolean;
  canBid: boolean;
}

const AuctionCard = ({ 
  auction, 
  bidAmount, 
  onBidChange, 
  onPlaceBid, 
  onQuickBid,
  isLeading,
  myBid,
  isPlacingBid,
  canBid
}: AuctionCardProps) => {
  const { data: userBids = [] } = useUserBids();
  
  const formatTimeRemaining = (endTime: string) => {
    const now = new Date();
    const end = new Date(endTime);
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return 'Ended';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h`;
    }
    
    return `${hours}h ${minutes}m`;
  };

  const calculateMinNextBid = () => {
    return (auction.current_bid || auction.starting_bid) + auction.bid_increment;
  };

  const isAuctionEnded = () => {
    if (!auction.end_time) return false;
    return new Date(auction.end_time) < new Date();
  };

  const minNextBid = calculateMinNextBid();
  const timeRemaining = formatTimeRemaining(auction.end_time);
  const auctionEnded = isAuctionEnded();
  
  // Get user's bid for this auction
  const userBidForAuction = userBids.find(bid => bid.auction_id === auction.id);

  // Check if bidding is allowed
  const canPlaceBid = canBid && auction.status === 'active' && !auctionEnded;

  // Get the primary image or first available image
  const primaryImage = auction.image_urls && auction.image_urls.length > 0 ? auction.image_urls[0] : null;

  return (
    <Card className="border-slate-200/60 shadow-sm bg-white/70 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <CardTitle className="text-xl mb-2">{auction.title}</CardTitle>
            <p className="text-sm text-slate-600 mb-3">{auction.description}</p>
            
            {/* Auction Stats */}
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-1 text-slate-500">
                <DollarSign className="h-3 w-3" />
                <span>Current: ₹{auction.current_bid?.toLocaleString() || '0'}</span>
              </div>
              <div className="flex items-center gap-1 text-slate-500">
                <Users className="h-3 w-3" />
                <span>{auction.bidder_count} bidders</span>
              </div>
              <div className="flex items-center gap-1 text-slate-500">
                <Clock className="h-3 w-3" />
                <span className={auctionEnded ? 'text-red-600 font-semibold' : ''}>
                  {timeRemaining}
                </span>
              </div>
            </div>
          </div>
          
          {/* Auction Image */}
          <div className="flex-shrink-0">
            {primaryImage ? (
              <div className="w-24 h-24 rounded-lg overflow-hidden border border-slate-200">
                <img
                  src={primaryImage}
                  alt={auction.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200&h=200&fit=crop';
                  }}
                />
              </div>
            ) : (
              <div className="w-24 h-24 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center">
                <ImageIcon className="h-8 w-8 text-slate-400" />
              </div>
            )}
          </div>
          
          {/* Status Badges */}
          <div className="flex flex-col gap-2 items-end">
            {auctionEnded && (
              <Badge variant="destructive">
                Ended
              </Badge>
            )}
            {isLeading && !auctionEnded && (
              <Badge className="bg-green-100 text-green-800">
                Leading
              </Badge>
            )}
            {myBid && !isLeading && !auctionEnded && (
              <Badge variant="outline">
                Your bid: ₹{myBid.toLocaleString()}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {/* User's Current Bid Info and Actions */}
        {userBidForAuction && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-900">
                  Your current bid: ₹{userBidForAuction.amount.toLocaleString()}
                </p>
                <p className="text-xs text-blue-600">
                  {isLeading ? 'You are currently leading!' : 'You have been outbid'}
                </p>
              </div>
              <BidActions
                bidId={userBidForAuction.id}
                auctionId={auction.id}
                bidAmount={userBidForAuction.amount}
                isHighestBid={isLeading}
                auctionStatus={auction.status}
              />
            </div>
          </div>
        )}

        {/* Auction Ended Message */}
        {auctionEnded && (
          <div className="mb-4 p-3 bg-red-50 rounded-lg border border-red-200">
            <p className="text-sm font-medium text-red-900">
              🔒 This auction has ended. No more bids can be placed.
            </p>
          </div>
        )}

        {/* Bidding Section */}
        {!auctionEnded && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Gavel className="h-4 w-4 text-slate-500" />
              <span className="text-sm text-slate-600">
                Minimum bid: ₹{minNextBid.toLocaleString()}
              </span>
            </div>
            
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder={`Min ₹${minNextBid.toLocaleString()}`}
                value={bidAmount}
                onChange={(e) => onBidChange(e.target.value)}
                min={minNextBid}
                step={auction.bid_increment}
                className="flex-1"
                disabled={!canPlaceBid}
              />
              <Button
                variant="outline"
                onClick={onQuickBid}
                disabled={!canPlaceBid}
              >
                Quick Bid
              </Button>
            </div>
            
            <Button 
              onClick={onPlaceBid}
              disabled={
                !canPlaceBid || 
                !bidAmount || 
                parseFloat(bidAmount) < minNextBid || 
                isPlacingBid
              }
              className="w-full"
            >
              {isPlacingBid ? 'Placing Bid...' : `Place Bid ₹${bidAmount ? parseFloat(bidAmount).toLocaleString() : '0'}`}
            </Button>
            
            {!canBid && !auctionEnded && (
              <p className="text-xs text-amber-600 text-center">
                You cannot bid for 24 hours after winning an auction
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AuctionCard;
