
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useAuctions, useDeleteAuction, useUpdateAuction } from '@/hooks/useAuctions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import BidderInfo from './admin/BidderInfo';
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
  Trash2,
  BarChart3,
  Activity,
  Loader2
} from 'lucide-react';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: auctions, isLoading, error } = useAuctions();
  const deleteAuctionMutation = useDeleteAuction();
  const updateAuctionMutation = useUpdateAuction();

  const handleDeleteAuction = async (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      try {
        await deleteAuctionMutation.mutateAsync(id);
        toast({
          title: "Auction deleted",
          description: `"${title}" has been successfully deleted.`,
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete auction. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleStartAuction = async (id: string, title: string) => {
    try {
      await updateAuctionMutation.mutateAsync({
        id,
        updates: {
          status: 'active',
          start_time: new Date().toISOString(),
        }
      });
      toast({
        title: "Auction started",
        description: `"${title}" is now live.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start auction. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'upcoming': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'ended': return 'bg-slate-50 text-slate-700 border-slate-200';
      case 'draft': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'cancelled': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const stats = [
    {
      title: 'Active Auctions',
      value: auctions?.filter(a => a.status === 'active').length || 0,
      icon: Gavel,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      change: '+12.5%',
      changeType: 'positive'
    },
    {
      title: 'Total Auctions',
      value: auctions?.length || 0,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      change: '+8.2%',
      changeType: 'positive'
    },
    {
      title: 'Revenue Today',
      value: '₹67,500',
      icon: DollarSign,
      color: 'text-auction-gold',
      bgColor: 'bg-yellow-50',
      change: '+23.1%',
      changeType: 'positive'
    },
    {
      title: 'Success Rate',
      value: '94%',
      icon: TrendingUp,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      change: '+2.3%',
      changeType: 'positive'
    }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50/30 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading dashboard...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50/30 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Error loading dashboard</h2>
          <p className="text-slate-600">Please try refreshing the page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/30">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-gradient-to-br from-primary to-primary/80 rounded-xl shadow-sm">
                  <Gavel className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-serif font-semibold text-slate-900">Admin Portal</h1>
                  <p className="text-sm text-slate-500">Welcome back, {user?.name}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" className="border-slate-200 text-slate-600 hover:bg-slate-50">
                <BarChart3 className="h-4 w-4 mr-2" />
                Analytics
              </Button>
              <Button variant="outline" onClick={logout} className="border-slate-200 text-slate-600 hover:bg-slate-50">
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-200 bg-white/70 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <div className="flex items-center gap-1 text-xs">
                    <Activity className="h-3 w-3 text-emerald-500" />
                    <span className="text-emerald-600 font-medium">{stat.change}</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-1">{stat.title}</p>
                  <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content */}
        <Tabs defaultValue="auctions" className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList className="grid grid-cols-3 lg:w-[400px] bg-white border border-slate-200">
              <TabsTrigger value="auctions" className="data-[state=active]:bg-slate-100">Auctions</TabsTrigger>
              <TabsTrigger value="bidders" className="data-[state=active]:bg-slate-100">Bidders</TabsTrigger>
              <TabsTrigger value="reports" className="data-[state=active]:bg-slate-100">Reports</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="auctions" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-serif font-semibold text-slate-900">Auction Management</h2>
                <p className="text-slate-600 mt-1">Create, manage, and monitor your auctions</p>
              </div>
              <Button 
                onClick={() => navigate('/create-auction')}
                className="bg-primary hover:bg-primary/90 shadow-sm px-6"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Auction
              </Button>
            </div>

            <div className="grid gap-6">
              {auctions && auctions.length === 0 ? (
                <Card className="border-slate-200/60 shadow-sm bg-white/70 backdrop-blur-sm">
                  <CardContent className="p-8 text-center">
                    <Gavel className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-500 font-medium">No auctions created yet</p>
                    <p className="text-sm text-slate-400 mt-1">Create your first auction to get started</p>
                    <Button 
                      onClick={() => navigate('/create-auction')}
                      className="mt-4"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create First Auction
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                auctions?.map((auction) => (
                  <div key={auction.id} className="space-y-4">
                    <Card className="border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-200 bg-white/70 backdrop-blur-sm">
                      <CardHeader className="pb-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <CardTitle className="text-xl text-slate-900">{auction.title}</CardTitle>
                              <Badge className={`${getStatusColor(auction.status)} font-medium`}>
                                {auction.status}
                              </Badge>
                            </div>
                            <CardDescription className="text-base text-slate-600">
                              {auction.description}
                            </CardDescription>
                            
                            {/* Display auction images */}
                            {auction.image_urls && auction.image_urls.length > 0 && (
                              <div className="mt-4">
                                <div className="flex gap-2 overflow-x-auto pb-2">
                                  {auction.image_urls.slice(0, 4).map((url, index) => (
                                    <div key={index} className="flex-shrink-0">
                                      <img
                                        src={url}
                                        alt={`${auction.title} ${index + 1}`}
                                        className="w-16 h-16 object-cover rounded-md border border-slate-200"
                                      />
                                    </div>
                                  ))}
                                  {auction.image_urls.length > 4 && (
                                    <div className="flex-shrink-0 w-16 h-16 bg-slate-100 rounded-md border border-slate-200 flex items-center justify-center">
                                      <span className="text-xs text-slate-600">
                                        +{auction.image_urls.length - 4}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="border-slate-200 hover:bg-slate-50">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" className="border-slate-200 hover:bg-slate-50">
                              <Edit className="h-4 w-4" />
                            </Button>
                            {auction.status === 'draft' && (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="border-emerald-200 hover:bg-emerald-50 hover:text-emerald-600"
                                onClick={() => handleStartAuction(auction.id, auction.title)}
                                disabled={updateAuctionMutation.isPending}
                              >
                                Start
                              </Button>
                            )}
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                              onClick={() => handleDeleteAuction(auction.id, auction.title)}
                              disabled={deleteAuctionMutation.isPending}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="bg-slate-50/50 rounded-lg p-3">
                            <p className="text-xs font-medium text-slate-500 mb-1">Starting Bid</p>
                            <p className="font-semibold text-slate-900">₹{Number(auction.starting_bid).toLocaleString()}</p>
                          </div>
                          <div className="bg-gradient-to-br from-auction-gold/10 to-amber-50 rounded-lg p-3">
                            <p className="text-xs font-medium text-slate-500 mb-1">Current Bid</p>
                            <p className="font-semibold text-auction-gold">₹{Number(auction.current_bid || 0).toLocaleString()}</p>
                          </div>
                          <div className="bg-blue-50/50 rounded-lg p-3">
                            <p className="text-xs font-medium text-slate-500 mb-1">Bidders</p>
                            <p className="font-semibold text-slate-900">{auction.bidder_count}</p>
                          </div>
                          <div className="bg-slate-50/50 rounded-lg p-3">
                            <p className="text-xs font-medium text-slate-500 mb-1">Duration</p>
                            <p className="font-semibold text-slate-900 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {auction.auction_duration} days
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Add BidderInfo component for auctions with bids */}
                    {(auction.status === 'active' || auction.status === 'ended') && auction.bidder_count > 0 && (
                      <BidderInfo 
                        auctionId={auction.id}
                        auctionTitle={auction.title}
                        auctionStatus={auction.status}
                      />
                    )}
                  </div>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="bidders" className="space-y-6">
            <div>
              <h2 className="text-2xl font-serif font-semibold text-slate-900">Bidder Management</h2>
              <p className="text-slate-600 mt-1">Monitor and manage bidder activities</p>
            </div>
            <Card className="border-slate-200/60 bg-white/70">
              <CardContent className="p-8 text-center">
                <Users className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-500 font-medium">Bidder management features coming soon...</p>
                <p className="text-sm text-slate-400 mt-1">Advanced user analytics and management tools</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <div>
              <h2 className="text-2xl font-serif font-semibold text-slate-900">Analytics & Reports</h2>
              <p className="text-slate-600 mt-1">Comprehensive insights and performance metrics</p>
            </div>
            <Card className="border-slate-200/60 bg-white/70">
              <CardContent className="p-8 text-center">
                <BarChart3 className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-500 font-medium">Advanced reporting features coming soon...</p>
                <p className="text-sm text-slate-400 mt-1">Real-time analytics and detailed performance reports</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
