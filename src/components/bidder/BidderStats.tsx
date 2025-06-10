
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, Crown, Heart, Trophy } from 'lucide-react';

interface BidderStatsProps {
  activeBids: number;
  leadingBids: number;
  watchlistCount: number;
  wonAuctions: number;
}

const BidderStats = ({ activeBids, leadingBids, watchlistCount, wonAuctions }: BidderStatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <Card className="shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Bids</p>
              <p className="text-3xl font-bold">{activeBids}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-600" />
          </div>
        </CardContent>
      </Card>
      
      <Card className="shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Leading Bids</p>
              <p className="text-3xl font-bold text-green-600">{leadingBids}</p>
            </div>
            <Crown className="h-8 w-8 text-yellow-500" />
          </div>
        </CardContent>
      </Card>
      
      <Card className="shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Watchlist</p>
              <p className="text-3xl font-bold">{watchlistCount}</p>
            </div>
            <Heart className="h-8 w-8 text-red-500" />
          </div>
        </CardContent>
      </Card>
      
      <Card className="shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Won Auctions</p>
              <p className="text-3xl font-bold">{wonAuctions}</p>
            </div>
            <Trophy className="h-8 w-8 text-auction-gold" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BidderStats;
