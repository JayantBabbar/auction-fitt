
import React, { useState } from 'react';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useAuctions } from '@/hooks/useAuctions';
import { useUserBids, useCanUserBid, usePlaceBid } from '@/hooks/useBids';
import { useToast } from '@/hooks/use-toast';
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
  
  // Helper function to check if auction should be active
  const shouldAuctionBeActive = (auction: any) => {
    const now = new Date();
    const startTime = auction.start_time ? new Date(auction.start_time) : null;
    const endTime = auction.end_time ? new Date(auction.end_time) : null;
    
    console.log(`Auction ${auction.id} (${auction.title}):`, {
      status: auction.status,
      startTime: startTime?.toISOString(),
      endTime: endTime?.toISOString(),
      now: now.toISOString(),
      hasStarted: startTime ? startTime <= now : true,
      hasEnded: endTime ? endTime <= now : false
    });
    
    // If no start time, consider it started
    if (!startTime) return auction.status === 'active';
    
    // If has start time, check if it's passed and auction hasn't ended
    const hasStarted = startTime <= now;
    const hasEnded = endTime ? endTime <= now : false;
    
    return hasStarted && !hasEnded && auction.status !== 'cancelled';
  };

  // Filter to show only auctions that should be active and visible to bidders
  const activeAuctions = auctions.filter(auction => {
    console.log(`Filtering auction ${auction.id}:`, {
      title: auction.title,
      status: auction.status,
      shouldBeActive: shouldAuctionBeActive(auction)
    });
    
    return shouldAuctionBeActive(auction);
  });
  
  console.log('Active auctions for display:', activeAuctions.map(a => ({
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
    const auction = activeAuctions.find(a => a.id === auctionId);
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
          wonAuctions={3}
        />

        <div className="space-y-6">
          <h2 className="text-2xl font-serif font-semibold">Active Auctions</h2>
          
          {activeAuctions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">No active auctions available at the moment.</p>
              <p className="text-sm text-muted-foreground mt-2">
                Auctions will appear here once they start and are active.
              </p>
            </div>
          ) : (
            <div className="grid gap-6">
              {activeAuctions.map((auction) => {
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
