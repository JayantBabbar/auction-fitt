
import React, { useState } from 'react';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useAuctions } from '@/hooks/useAuctions';
import { useUserBids, useCanUserBid, usePlaceBid } from '@/hooks/useBids';
import { useToast } from '@/hooks/use-toast';
import { toZonedTime } from 'date-fns-tz';
import BidderHeader from './bidder/BidderHeader';
import BidderStats from './bidder/BidderStats';
import AuctionCard from './bidder/AuctionCard';

const BidderDashboard = () => {
  const { profile, signOut } = useSupabaseAuth();
  const { toast } = useToast();
  const { data: auctions = [], isLoading } = useAuctions();
  const { data: userBids = [] } = useUserBids();
  const { data: canBid = true } = useCanUserBid();
  const placeBidMutation = usePlaceBid();
  
  // IST timezone
  const IST_TIMEZONE = 'Asia/Kolkata';
  
  // Helper function to check if auction should be visible to bidders (active or ended)
  const isAuctionVisibleToBidders = (auction: any) => {
    const nowUTC = new Date();
    const nowIST = toZonedTime(nowUTC, IST_TIMEZONE);
    
    if (!auction.start_time) {
      return auction.status === 'active';
    }
    
    const startTime = new Date(auction.start_time);
    const startTimeIST = toZonedTime(startTime, IST_TIMEZONE);
    
    // Show auction if:
    // 1. It has started (start time passed in IST)
    // 2. Status is active or ended
    // 3. Not cancelled
    const hasStarted = startTimeIST <= nowIST;
    const isActiveOrEnded = auction.status === 'active' || auction.status === 'ended';
    const isNotCancelled = auction.status !== 'cancelled';
    
    console.log(`Auction visibility check - ${auction.title}:`, {
      hasStarted,
      isActiveOrEnded,
      isNotCancelled,
      visible: hasStarted && isActiveOrEnded && isNotCancelled,
      status: auction.status,
      startTimeIST: startTimeIST.toISOString(),
      nowIST: nowIST.toISOString()
    });
    
    return hasStarted && isActiveOrEnded && isNotCancelled;
  };

  // Filter auctions that should be visible to bidders
  const visibleAuctions = auctions.filter(auction => {
    const isVisible = isAuctionVisibleToBidders(auction);
    console.log(`Filtering auction ${auction.id} (${auction.title}):`, {
      status: auction.status,
      visible: isVisible
    });
    return isVisible;
  });
  
  console.log('Visible auctions for bidders:', visibleAuctions.map(a => ({
    id: a.id,
    title: a.title,
    status: a.status,
    start_time: a.start_time,
    end_time: a.end_time
  })));
  
  const [bidAmounts, setBidAmounts] = useState<{[key: string]: string}>({});

  const calculateMinNextBid = (auction: any) => {
    return (auction.current_bid || auction.starting_bid) + auction.bid_increment;
  };

  const handleBid = async (auctionId: string) => {
    if (!canBid) {
      toast({
        title: "Bidding Restricted",
        description: "You cannot bid for 24 hours after winning an auction",
        variant: "destructive"
      });
      return;
    }

    const bidAmount = parseFloat(bidAmounts[auctionId] || '0');

    try {
      await placeBidMutation.mutateAsync({
        auctionId,
        amount: bidAmount
      });
      
      // Clear the bid amount input
      setBidAmounts(prev => ({ ...prev, [auctionId]: '' }));
    } catch (error) {
      console.error('Bid placement error:', error);
    }
  };

  const handleQuickBid = (auctionId: string) => {
    const auction = visibleAuctions.find(a => a.id === auctionId);
    if (!auction) return;
    
    const minNextBid = calculateMinNextBid(auction);
    setBidAmounts(prev => ({
      ...prev,
      [auctionId]: minNextBid.toString()
    }));
  };

  // Calculate stats from real data
  const getUserBidForAuction = (auctionId: string) => {
    const auctionBids = userBids.filter(bid => bid.auction_id === auctionId);
    if (auctionBids.length === 0) return null;
    
    // Return the highest bid for this auction
    return auctionBids.reduce((highest, current) => 
      current.amount > highest.amount ? current : highest
    );
  };

  const getLeadingBids = () => {
    return userBids.filter(bid => {
      const auction = auctions.find(a => a.id === bid.auction_id);
      return auction && auction.current_bid === bid.amount;
    });
  };

  const activeBidsCount = [...new Set(userBids.map(bid => bid.auction_id))].length;
  const leadingBidsCount = getLeadingBids().length;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading auctions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <BidderHeader userName={profile?.name} />

      <div className="container mx-auto px-4 py-8">
        {!canBid && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800 font-medium">
              🏆 Bidding Restricted: You cannot bid for 24 hours after winning an auction.
            </p>
          </div>
        )}

        <BidderStats 
          activeBids={activeBidsCount}
          leadingBids={leadingBidsCount}
          wonAuctions={0}
        />

        <div className="space-y-6">
          <h2 className="text-2xl font-serif font-semibold">Available Auctions</h2>
          
          {visibleAuctions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">No auctions available at the moment.</p>
              <p className="text-sm text-muted-foreground mt-2">
                Auctions will appear here once they start.
              </p>
            </div>
          ) : (
            <div className="grid gap-6">
              {visibleAuctions.map((auction) => {
                const userBid = getUserBidForAuction(auction.id);
                const isLeading = userBid && auction.current_bid === userBid.amount;
                
                return (
                  <AuctionCard
                    key={auction.id}
                    auction={auction}
                    bidAmount={bidAmounts[auction.id] || ''}
                    onBidChange={(value) => setBidAmounts(prev => ({ ...prev, [auction.id]: value }))}
                    onPlaceBid={() => handleBid(auction.id)}
                    onQuickBid={() => handleQuickBid(auction.id)}
                    isLeading={isLeading}
                    myBid={userBid?.amount}
                    isPlacingBid={placeBidMutation.isPending}
                    canBid={canBid}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BidderDashboard;
