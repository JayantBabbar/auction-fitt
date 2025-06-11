
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useAuctions } from '@/hooks/useAuctions';
import { useUserBids, useCanUserBid, usePlaceBid } from '@/hooks/useBids';
import { useToast } from '@/hooks/use-toast';
import BidderHeader from './bidder/BidderHeader';
import BidderStats from './bidder/BidderStats';
import AuctionCard from './bidder/AuctionCard';

const BidderDashboard = () => {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const { data: auctions = [], isLoading } = useAuctions();
  const { data: userBids = [] } = useUserBids();
  const { data: canBid = true } = useCanUserBid();
  const placeBidMutation = usePlaceBid();
  
  // Filter to show only active auctions
  const activeAuctions = auctions.filter(auction => auction.status === 'active');
  
  const [bidAmounts, setBidAmounts] = useState<{[key: string]: string}>({});
  const [watchlist, setWatchlist] = useState<Set<string>>(new Set());

  const calculateMinNextBid = (auction: any) => {
    return (auction.current_bid || auction.starting_bid) + auction.bid_increment;
  };

  const validateBidAmount = (auction: any, bidAmount: number) => {
    const minNextBid = calculateMinNextBid(auction);
    
    if (bidAmount < minNextBid) {
      return {
        isValid: false,
        message: `Minimum bid is $${minNextBid.toLocaleString()} (current bid + $${auction.bid_increment} increment)`
      };
    }

    const bidDifference = bidAmount - (auction.current_bid || auction.starting_bid);
    if (bidDifference % auction.bid_increment !== 0) {
      return {
        isValid: false,
        message: `Bid must be in increments of $${auction.bid_increment}`
      };
    }

    return { isValid: true, message: '' };
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
    const auction = activeAuctions.find(a => a.id === auctionId);
    
    if (!auction) return;

    const validation = validateBidAmount(auction, bidAmount);
    
    if (!validation.isValid) {
      toast({
        title: "Invalid Bid",
        description: validation.message,
        variant: "destructive"
      });
      return;
    }

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

  const toggleWatchlist = (auctionId: string) => {
    setWatchlist(prev => {
      const newWatchlist = new Set(prev);
      if (newWatchlist.has(auctionId)) {
        newWatchlist.delete(auctionId);
      } else {
        newWatchlist.add(auctionId);
      }
      return newWatchlist;
    });
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
  const watchlistCount = watchlist.size;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-fintech-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-fintech-gray font-medium">Loading auction data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <BidderHeader userName={user?.name} onLogout={logout} />

      <div className="container mx-auto px-6 py-8">
        {!canBid && (
          <div className="mb-8 p-5 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/60 rounded-xl fintech-shadow">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
              <p className="text-amber-800 font-medium">
                🏆 Bidding Restricted: You cannot bid for 24 hours after winning an auction.
              </p>
            </div>
          </div>
        )}

        <BidderStats 
          activeBids={activeBidsCount}
          leadingBids={leadingBidsCount}
          watchlistCount={watchlistCount}
          wonAuctions={3}
        />

        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-foreground tracking-tight">Active Auctions</h2>
              <p className="text-fintech-gray mt-1 font-medium">Live bidding opportunities</p>
            </div>
            <div className="text-sm text-fintech-gray bg-muted/50 px-4 py-2 rounded-lg border border-border/50">
              {activeAuctions.length} active auctions
            </div>
          </div>
          
          {activeAuctions.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
                <div className="w-8 h-8 bg-fintech-gray/20 rounded-lg"></div>
              </div>
              <p className="text-fintech-gray text-lg font-medium">No active auctions available</p>
              <p className="text-fintech-gray-light text-sm mt-1">Check back later for new opportunities</p>
            </div>
          ) : (
            <div className="grid gap-8">
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
                    onToggleWatchlist={() => toggleWatchlist(auction.id)}
                    onQuickBid={() => handleQuickBid(auction.id)}
                    isWatched={watchlist.has(auction.id)}
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
