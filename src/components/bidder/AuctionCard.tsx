
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useUserBids } from '@/hooks/useBids';
import BidActions from './BidActions';
import AuctionImage from './AuctionImage';
import AuctionStats from './AuctionStats';
import AuctionStatusBadges from './AuctionStatusBadges';
import BiddingSection from './BiddingSection';

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
  const isActive = auction.status === 'active' && !auctionEnded;
  
  // Get user's bid for this auction
  const userBidForAuction = userBids.find(bid => bid.auction_id === auction.id);

  // Check if bidding is allowed
  const canPlaceBid = canBid && auction.status === 'active' && !auctionEnded;

  // Get the primary image or first available image
  const primaryImage = auction.image_urls && auction.image_urls.length > 0 ? auction.image_urls[0] : null;

  // Get bid count from auction or calculate from bidder_count
  const bidCount = auction.bid_count || auction.bidder_count || 0;

  return (
    <Card className="border-slate-200/60 shadow-sm bg-white/70 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <CardTitle className="text-xl mb-2">{auction.title}</CardTitle>
            <p className="text-sm text-slate-600 mb-3">{auction.description}</p>
            
            <AuctionStats
              startingBid={auction.starting_bid}
              currentBid={auction.current_bid || auction.starting_bid}
              bidIncrement={auction.bid_increment}
              bidCount={bidCount}
              timeRemaining={timeRemaining}
              auctionEnded={auctionEnded}
            />
          </div>
          
          <AuctionImage
            primaryImage={primaryImage}
            title={auction.title}
          />
          
          <AuctionStatusBadges
            auctionEnded={auctionEnded}
            isActive={isActive}
            isLeading={isLeading}
            myBid={myBid}
          />
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

        <BiddingSection
          auctionEnded={auctionEnded}
          minNextBid={minNextBid}
          bidAmount={bidAmount}
          onBidChange={onBidChange}
          onQuickBid={onQuickBid}
          onPlaceBid={onPlaceBid}
          canPlaceBid={canPlaceBid}
          canBid={canBid}
          isPlacingBid={isPlacingBid}
          bidIncrement={auction.bid_increment}
        />
      </CardContent>
    </Card>
  );
};

export default AuctionCard;
