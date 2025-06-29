
import React from 'react';
import { Button } from '@/components/ui/button';
import { Gavel, Lock } from 'lucide-react';

interface BiddingSectionProps {
  auctionEnded: boolean;
  minNextBid: number;
  bidAmount: string;
  onBidChange: (value: string) => void;
  onQuickBid: () => void;
  onPlaceBid: () => void;
  canPlaceBid: boolean;
  canBid: boolean;
  isPlacingBid: boolean;
  bidIncrement: number;
}

const BiddingSection = ({
  auctionEnded,
  minNextBid,
  onQuickBid,
  canPlaceBid,
  canBid,
  isPlacingBid,
  bidIncrement
}: BiddingSectionProps) => {
  if (auctionEnded) {
    return (
      <div className="mb-4 p-3 bg-red-50 rounded-lg border border-red-200">
        <p className="text-sm font-medium text-red-900">
          🔒 This auction has ended. No more bids can be placed.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Gavel className="h-4 w-4 text-slate-500" />
        <span className="text-sm text-slate-600">
          Next bid: ₹{minNextBid.toLocaleString()}
        </span>
      </div>
      
      <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-center gap-2 mb-2">
          <Lock className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-900">Quick Bid Only</span>
        </div>
        <p className="text-xs text-blue-600 mb-3">
          Bidding is locked to increment amounts only (₹{bidIncrement.toLocaleString()} increments)
        </p>
        
        <Button
          onClick={onQuickBid}
          disabled={!canPlaceBid || isPlacingBid}
          className="w-full"
        >
          {isPlacingBid ? 'Placing Bid...' : `Place Bid ₹${minNextBid.toLocaleString()}`}
        </Button>
      </div>
      
      {!canBid && !auctionEnded && (
        <p className="text-xs text-amber-600 text-center">
          You cannot bid for 24 hours after winning an auction
        </p>
      )}
    </div>
  );
};

export default BiddingSection;
