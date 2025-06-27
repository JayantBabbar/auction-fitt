
import React from 'react';
import { Clock, DollarSign, Users, TrendingUp, Target } from 'lucide-react';

interface AuctionStatsProps {
  startingBid: number;
  currentBid: number;
  bidIncrement: number;
  bidCount: number;
  timeRemaining: string;
  auctionEnded: boolean;
}

const AuctionStats = ({ 
  startingBid, 
  currentBid, 
  bidIncrement, 
  bidCount, 
  timeRemaining, 
  auctionEnded 
}: AuctionStatsProps) => {
  return (
    <div className="grid grid-cols-2 gap-3 text-sm">
      <div className="flex items-center gap-1 text-slate-600">
        <Target className="h-3 w-3" />
        <span>Starting: ₹{startingBid?.toLocaleString() || '0'}</span>
      </div>
      <div className="flex items-center gap-1 text-slate-600">
        <DollarSign className="h-3 w-3" />
        <span>Current: ₹{currentBid?.toLocaleString() || '0'}</span>
      </div>
      <div className="flex items-center gap-1 text-slate-600">
        <TrendingUp className="h-3 w-3" />
        <span>Increment: ₹{bidIncrement?.toLocaleString() || '0'}</span>
      </div>
      <div className="flex items-center gap-1 text-slate-600">
        <Users className="h-3 w-3" />
        <span>{bidCount || 0} bids</span>
      </div>
      <div className="flex items-center gap-1 text-slate-600 col-span-2">
        <Clock className="h-3 w-3" />
        <span className={auctionEnded ? 'text-red-600 font-semibold' : ''}>
          {timeRemaining}
        </span>
      </div>
    </div>
  );
};

export default AuctionStats;
