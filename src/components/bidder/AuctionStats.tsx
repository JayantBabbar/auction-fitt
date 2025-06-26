
import React from 'react';
import { Clock, DollarSign, Users } from 'lucide-react';

interface AuctionStatsProps {
  currentBid: number;
  bidderCount: number;
  timeRemaining: string;
  auctionEnded: boolean;
}

const AuctionStats = ({ currentBid, bidderCount, timeRemaining, auctionEnded }: AuctionStatsProps) => {
  return (
    <div className="grid grid-cols-3 gap-4 text-sm">
      <div className="flex items-center gap-1 text-slate-500">
        <DollarSign className="h-3 w-3" />
        <span>Current: ₹{currentBid?.toLocaleString() || '0'}</span>
      </div>
      <div className="flex items-center gap-1 text-slate-500">
        <Users className="h-3 w-3" />
        <span>{bidderCount} bidders</span>
      </div>
      <div className="flex items-center gap-1 text-slate-500">
        <Clock className="h-3 w-3" />
        <span className={auctionEnded ? 'text-red-600 font-semibold' : ''}>
          {timeRemaining}
        </span>
      </div>
    </div>
  );
};

export default AuctionStats;
