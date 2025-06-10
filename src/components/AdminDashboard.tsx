
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Gavel, 
  Users, 
  TrendingUp, 
  Clock, 
  DollarSign, 
  LogOut,
  Plus,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';

interface Auction {
  id: string;
  title: string;
  description: string;
  startingBid: number;
  currentBid: number;
  endTime: string;
  status: 'active' | 'upcoming' | 'ended';
  bidders: number;
  image: string;
}

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  
  const [auctions] = useState<Auction[]>([
    {
      id: '1',
      title: 'Vintage Rolex Submariner',
      description: 'Classic 1960s timepiece in excellent condition',
      startingBid: 5000,
      currentBid: 12500,
      endTime: '2024-01-15T18:00:00Z',
      status: 'active',
      bidders: 8,
      image: '/placeholder.svg'
    },
    {
      id: '2',
      title: 'Original Picasso Sketch',
      description: 'Rare preliminary sketch from 1952',
      startingBid: 25000,
      currentBid: 45000,
      endTime: '2024-01-20T15:30:00Z',
      status: 'active',
      bidders: 15,
      image: '/placeholder.svg'
    },
    {
      id: '3',
      title: 'Antique Persian Rug',
      description: '18th century handwoven masterpiece',
      startingBid: 8000,
      currentBid: 8000,
      endTime: '2024-01-25T12:00:00Z',
      status: 'upcoming',
      bidders: 0,
      image: '/placeholder.svg'
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      case 'ended': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const stats = [
    {
      title: 'Active Auctions',
      value: auctions.filter(a => a.status === 'active').length,
      icon: Gavel,
      color: 'text-green-600'
    },
    {
      title: 'Total Bidders',
      value: auctions.reduce((sum, a) => sum + a.bidders, 0),
      icon: Users,
      color: 'text-blue-600'
    },
    {
      title: 'Revenue Today',
      value: '$67,500',
      icon: DollarSign,
      color: 'text-auction-gold'
    },
    {
      title: 'Success Rate',
      value: '94%',
      icon: TrendingUp,
      color: 'text-emerald-600'
    }
  ];

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
                <h1 className="text-2xl font-serif font-semibold">Admin Dashboard</h1>
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
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <p className="text-3xl font-bold">{stat.value}</p>
                  </div>
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content */}
        <Tabs defaultValue="auctions" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
            <TabsTrigger value="auctions">Auctions</TabsTrigger>
            <TabsTrigger value="bidders">Bidders</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="auctions" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-serif font-semibold">Manage Auctions</h2>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                New Auction
              </Button>
            </div>

            <div className="grid gap-6">
              {auctions.map((auction) => (
                <Card key={auction.id} className="shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <CardTitle className="text-xl">{auction.title}</CardTitle>
                          <Badge className={getStatusColor(auction.status)}>
                            {auction.status}
                          </Badge>
                        </div>
                        <CardDescription className="text-base">
                          {auction.description}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Starting Bid</p>
                        <p className="font-semibold">${auction.startingBid.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Current Bid</p>
                        <p className="font-semibold auction-gold">${auction.currentBid.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Bidders</p>
                        <p className="font-semibold">{auction.bidders}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Ends</p>
                        <p className="font-semibold flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(auction.endTime).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="bidders" className="space-y-6">
            <h2 className="text-2xl font-serif font-semibold">Bidder Management</h2>
            <Card>
              <CardContent className="p-6">
                <p className="text-muted-foreground">Bidder management features coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <h2 className="text-2xl font-serif font-semibold">Analytics & Reports</h2>
            <Card>
              <CardContent className="p-6">
                <p className="text-muted-foreground">Advanced reporting features coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
