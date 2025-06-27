
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface AuctionStatusBadgesProps {
  auctionEnded: boolean;
  isActive: boolean;
  isLeading: boolean;
  myBid?: number;
}

const AuctionStatusBadges = ({ auctionEnded, isActive, isLeading, myBid }: AuctionStatusBadgesProps) => {
  return (
    <div className="flex flex-col gap-2 items-end">
      {auctionEnded ? (
        <Badge variant="destructive" className="text-xs">
          Ended
        </Badge>
      ) : isActive ? (
        <Badge className="bg-green-500 text-white text-xs">
          Active
        </Badge>
      ) : null}
      
      {isLeading && !auctionEnded && (
        <Badge className="bg-blue-500 text-white text-xs">
          Currently Leading
        </Badge>
      )}
      
      {myBid && !isLeading && !auctionEnded && (
        <Badge variant="outline" className="text-xs">
          Your bid: ₹{myBid.toLocaleString()}
        </Badge>
      )}
    </div>
  );
};

export default AuctionStatusBadges;
