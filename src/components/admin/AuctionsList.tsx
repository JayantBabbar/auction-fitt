
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Gavel, Clock, DollarSign, Eye } from 'lucide-react';

interface AuctionsListProps {
  auctions?: any[];
}

const AuctionsList = ({ auctions = [] }: AuctionsListProps) => {
  const navigate = useNavigate();

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'completed':
        return 'secondary';
      case 'pending':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const formatTimeRemaining = (endTime: string) => {
    const now = new Date();
    const end = new Date(endTime);
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return 'Ended';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h`;
    }
    
    return `${hours}h ${minutes}m`;
  };

  const handleViewAuction = (auctionId: string) => {
    navigate(`/admin/auction/${auctionId}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-serif font-semibold text-slate-900">Auction Management</h2>
        <p className="text-slate-600 mt-1">Monitor and manage all auction activities</p>
      </div>

      <div className="grid gap-4">
        {auctions.length === 0 ? (
          <Card className="border-slate-200/60 bg-white/70">
            <CardContent className="p-8 text-center">
              <Gavel className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-500 font-medium">No auctions found</p>
              <p className="text-sm text-slate-400 mt-1">Create your first auction to get started</p>
              <Button className="mt-4" onClick={() => navigate('/create-auction')}>
                Create Auction
              </Button>
            </CardContent>
          </Card>
        ) : (
          auctions.map((auction) => (
            <Card key={auction.id} className="border-slate-200/60 bg-white/70 hover:shadow-md transition-all duration-200">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-lg">{auction.title}</CardTitle>
                      <Badge variant={getStatusBadgeVariant(auction.status)}>
                        {auction.status}
                      </Badge>
                    </div>
                    <CardDescription className="text-sm">
                      Auction ID: {auction.id}
                    </CardDescription>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleViewAuction(auction.id)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-sm text-slate-500">
                      <DollarSign className="h-3 w-3" />
                      Current Bid
                    </div>
                    <p className="font-semibold text-slate-900">
                      ₹{auction.current_bid?.toLocaleString() || '0'}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-sm text-slate-500">
                      <DollarSign className="h-3 w-3" />
                      Starting Bid
                    </div>
                    <p className="font-semibold text-slate-900">
                      ₹{auction.starting_bid?.toLocaleString() || '0'}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-sm text-slate-500">
                      <Clock className="h-3 w-3" />
                      {auction.status === 'active' ? 'Time Left' : 'End Time'}
                    </div>
                    <p className="font-semibold text-slate-900">
                      {formatTimeRemaining(auction.end_time)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default AuctionsList;
