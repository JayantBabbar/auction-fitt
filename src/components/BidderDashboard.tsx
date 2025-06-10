
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useAuctions } from '@/hooks/useAuctions';
import { useToast } from '@/hooks/use-toast';
import BidderHeader from './bidder/BidderHeader';
import BidderStats from './bidder/BidderStats';
import AuctionCard from './bidder/AuctionCard';

const BidderDashboard = () => {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const { data: auctions = [], isLoading } = useAuctions();
  
  // Filter to show only active auctions
  const activeAuctions = auctions.filter(auction => auction.status === 'active');
  
  const [bidAmounts, setBidAmounts] = useState<{[key: string]: string}>({});
  const [watchlist, setWatchlist] = useState<Set<string>>(new Set());
  const [myBids, setMyBids] = useState<{[key: string]: { amount: number; isLeading: boolean }}>({});

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

  const handleBid = (auctionId: string) => {
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

    // Update local state (in real app, this would update Supabase)
    setMyBids(prev => ({
      ...prev,
      [auctionId]: { amount: bidAmount, isLeading: true }
    }));

    setBidAmounts(prev => ({ ...prev, [auctionId]: '' }));

    toast({
      title: "Bid Placed Successfully!",
      description: `Your bid of $${bidAmount.toLocaleString()} has been placed. You are now leading!`,
    });
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

  // Calculate stats
  const activeBidsCount = Object.keys(myBids).length;
  const leadingBidsCount = Object.values(myBids).filter(bid => bid.isLeading).length;
  const watchlistCount = watchlist.size;

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
      <BidderHeader userName={user?.name} onLogout={logout} />

      <div className="container mx-auto px-4 py-8">
        <BidderStats 
          activeBids={activeBidsCount}
          leadingBids={leadingBidsCount}
          watchlistCount={watchlistCount}
          wonAuctions={3}
        />

        <div className="space-y-6">
          <h2 className="text-2xl font-serif font-semibold">Active Auctions</h2>
          
          {activeAuctions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">No active auctions available at the moment.</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {activeAuctions.map((auction) => (
                <AuctionCard
                  key={auction.id}
                  auction={auction}
                  bidAmount={bidAmounts[auction.id] || ''}
                  onBidChange={(value) => setBidAmounts(prev => ({ ...prev, [auction.id]: value }))}
                  onPlaceBid={() => handleBid(auction.id)}
                  onToggleWatchlist={() => toggleWatchlist(auction.id)}
                  onQuickBid={() => handleQuickBid(auction.id)}
                  isWatched={watchlist.has(auction.id)}
                  isLeading={myBids[auction.id]?.isLeading}
                  myBid={myBids[auction.id]?.amount}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BidderDashboard;
