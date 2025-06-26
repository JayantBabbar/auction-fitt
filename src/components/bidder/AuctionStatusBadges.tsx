
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface AuctionStatusBadgesProps {
  auctionEnded: boolean;
  isLeading: boolean;
  myBid?: number;
}

const AuctionStatusBadges = ({ auctionEnded, isLeading, myBid }: AuctionStatusBadgesProps) => {
  return (
    <div className="flex flex-col gap-2 items-end">
      {auctionEnded && (
        <Badge variant="destructive">
          Ended
        </Badge>
      )}
      {isLeading && !auctionEnded && (
        <Badge className="bg-green-100 text-green-800">
          Leading
        </Badge>
      )}
      {myBid && !isLeading && !auctionEnded && (
        <Badge variant="outline">
          Your bid: ₹{myBid.toLocaleString()}
        </Badge>
      )}
    </div>
  );
};

export default AuctionStatusBadges;
