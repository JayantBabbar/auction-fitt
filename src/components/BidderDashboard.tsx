
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Gavel, 
  Clock, 
  TrendingUp, 
  Heart, 
  LogOut,
  Timer,
  DollarSign,
  Trophy,
  Eye
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Auction {
  id: string;
  title: string;
  description: string;
  currentBid: number;
  endTime: string;
  status: 'active' | 'upcoming' | 'ended';
  image: string;
  myBid?: number;
  isWatched?: boolean;
}

const BidderDashboard = () => {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  
  const [auctions, setAuctions] = useState<Auction[]>([
    {
      id: '1',
      title: 'Vintage Rolex Submariner',
      description: 'Classic 1960s timepiece in excellent condition',
      currentBid: 12500,
      endTime: '2024-01-15T18:00:00Z',
      status: 'active',
      image: '/placeholder.svg',
      myBid: 12000,
      isWatched: true
    },
    {
      id: '2',
      title: 'Original Picasso Sketch',
      description: 'Rare preliminary sketch from 1952',
      currentBid: 45000,
      endTime: '2024-01-20T15:30:00Z',
      status: 'active',
      image: '/placeholder.svg',
      isWatched: false
    },
    {
      id: '3',
      title: 'Antique Persian Rug',
      description: '18th century handwoven masterpiece',
      currentBid: 8000,
      endTime: '2024-01-25T12:00:00Z',
      status: 'upcoming',
      image: '/placeholder.svg',
      isWatched: true
    }
  ]);

  const [bidAmounts, setBidAmounts] = useState<{[key: string]: string}>({});

  const handleBid = (auctionId: string) => {
    const bidAmount = parseFloat(bidAmounts[auctionId] || '0');
    const auction = auctions.find(a => a.id === auctionId);
    
    if (!auction || bidAmount <= auction.currentBid) {
      toast({
        title: "Invalid Bid",
        description: "Your bid must be higher than the current bid",
        variant: "destructive"
      });
      return;
    }

    setAuctions(prev => prev.map(a => 
      a.id === auctionId 
        ? { ...a, currentBid: bidAmount, myBid: bidAmount }
        : a
    ));

    setBidAmounts(prev => ({ ...prev, [auctionId]: '' }));

    toast({
      title: "Bid Placed!",
      description: `Your bid of $${bidAmount.toLocaleString()} has been placed successfully.`,
    });
  };

  const toggleWatchlist = (auctionId: string) => {
    setAuctions(prev => prev.map(a => 
      a.id === auctionId 
        ? { ...a, isWatched: !a.isWatched }
        : a
    ));
  };

  const getTimeRemaining = (endTime: string) => {
    const now = new Date().getTime();
    const end = new Date(endTime).getTime();
    const timeLeft = end - now;

    if (timeLeft <= 0) return 'Ended';

    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const myBids = auctions.filter(a => a.myBid);
  const watchlist = auctions.filter(a => a.isWatched);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-primary rounded-lg">
                <Gavel className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-serif font-semibold">Bidder Dashboard</h1>
                <p className="text-muted-foreground">Welcome back, {user?.name}</p>
              </div>
            </div>
            <Button variant="outline" onClick={logout} className="flex items-center gap-2">
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Bids</p>
                  <p className="text-3xl font-bold">{myBids.length}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Watchlist</p>
                  <p className="text-3xl font-bold">{watchlist.length}</p>
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
                  <p className="text-3xl font-bold">3</p>
                </div>
                <Trophy className="h-8 w-8 text-auction-gold" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Live Auctions */}
        <div className="space-y-6">
          <h2 className="text-2xl font-serif font-semibold">Live Auctions</h2>
          
          <div className="grid gap-6">
            {auctions.map((auction) => (
              <Card key={auction.id} className="shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                <div className="md:flex">
                  <div className="md:w-48 h-48 bg-muted flex items-center justify-center">
                    <Eye className="h-12 w-12 text-muted-foreground" />
                  </div>
                  
                  <div className="flex-1 p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-serif font-semibold">{auction.title}</h3>
                          <Badge variant={auction.status === 'active' ? 'default' : 'secondary'}>
                            {auction.status}
                          </Badge>
                          {auction.myBid && (
                            <Badge variant="outline" className="bg-blue-50 text-blue-700">
                              My Bid
                            </Badge>
                          )}
                        </div>
                        <p className="text-muted-foreground mb-4">{auction.description}</p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                          <div>
                            <p className="text-muted-foreground">Current Bid</p>
                            <p className="text-2xl font-bold auction-gold">
                              ${auction.currentBid.toLocaleString()}
                            </p>
                          </div>
                          {auction.myBid && (
                            <div>
                              <p className="text-muted-foreground">My Last Bid</p>
                              <p className="font-semibold">${auction.myBid.toLocaleString()}</p>
                            </div>
                          )}
                          <div>
                            <p className="text-muted-foreground">Time Left</p>
                            <p className="font-semibold flex items-center gap-1">
                              <Timer className="h-3 w-3" />
                              {getTimeRemaining(auction.endTime)}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleWatchlist(auction.id)}
                        className={auction.isWatched ? 'text-red-600' : ''}
                      >
                        <Heart className={`h-4 w-4 ${auction.isWatched ? 'fill-current' : ''}`} />
                      </Button>
                    </div>
                    
                    {auction.status === 'active' && (
                      <div className="flex gap-3">
                        <div className="flex-1 flex gap-2">
                          <Input
                            type="number"
                            placeholder={`Min: $${(auction.currentBid + 100).toLocaleString()}`}
                            value={bidAmounts[auction.id] || ''}
                            onChange={(e) => setBidAmounts(prev => ({
                              ...prev,
                              [auction.id]: e.target.value
                            }))}
                            className="max-w-xs"
                          />
                          <Button 
                            onClick={() => handleBid(auction.id)}
                            className="bg-auction-gold hover:bg-auction-gold/90 text-auction-gold-foreground"
                          >
                            <DollarSign className="h-4 w-4 mr-1" />
                            Place Bid
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BidderDashboard;
