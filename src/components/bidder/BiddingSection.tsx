
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Gavel } from 'lucide-react';

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
  bidAmount,
  onBidChange,
  onQuickBid,
  onPlaceBid,
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
          step={bidIncrement}
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
  );
};

export default BiddingSection;
