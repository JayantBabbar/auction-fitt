
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuctions } from '@/hooks/useAuctions';
import { useHighestBidder, useAuctionBidsAdmin } from '@/hooks/useAdminBids';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Download, User, Clock, DollarSign, Calendar, Tag } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import BidderInfo from '@/components/admin/BidderInfo';

const AdminAuctionView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: auctions = [], isLoading: loadingAuctions } = useAuctions();
  const { data: highestBidder, isLoading: loadingBidder } = useHighestBidder(id);
  const { data: allBids = [], isLoading: loadingBids } = useAuctionBidsAdmin(id);

  const auction = auctions.find(a => a.id === id);

  if (loadingAuctions || loadingBidder || loadingBids) {
    return (
      <div className="min-h-screen bg-slate-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading auction details...</p>
        </div>
      </div>
    );
  }

  if (!auction) {
    return (
      <div className="min-h-screen bg-slate-50/30 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Auction Not Found</h2>
          <p className="text-slate-600 mb-4">The auction you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'ended': return 'bg-red-100 text-red-800';
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const downloadBidsCSV = () => {
    if (!allBids || allBids.length === 0) {
      toast({
        title: "No Bids Available",
        description: "There are no bids to download for this auction.",
        variant: "destructive"
      });
      return;
    }

    const headers = ['Bid ID', 'Bidder Name', 'Bidder Email', 'Bid Amount (₹)', 'Bid Time', 'Rank'];
    const csvContent = [
      headers.join(','),
      ...allBids.map((bid, index) => [
        bid.bid_id,
        `"${bid.bidder_name}"`,
        bid.bidder_email,
        bid.bid_amount,
        formatDateTime(bid.bid_timestamp),
        index + 1
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${auction.title}-bids-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Download Started",
      description: `Downloading bids for "${auction.title}"`,
    });
  };

  return (
    <div className="min-h-screen bg-slate-50/30">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => navigate('/')}
              className="border-slate-200 hover:bg-slate-50"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-2xl font-serif font-bold text-slate-900">{auction.title}</h1>
              <p className="text-slate-600">Auction Details & Bid Management</p>
            </div>
          </div>
          <Badge className={`px-3 py-1 ${getStatusColor(auction.status)}`}>
            {auction.status.toUpperCase()}
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Auction Details */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-slate-200/60 shadow-sm bg-white/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg text-slate-900">Auction Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-sm text-slate-500">
                      <DollarSign className="h-3 w-3" />
                      Starting Bid
                    </div>
                    <p className="font-semibold text-slate-900">₹{auction.starting_bid?.toLocaleString()}</p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-sm text-slate-500">
                      <DollarSign className="h-3 w-3" />
                      Current Bid
                    </div>
                    <p className="font-semibold text-slate-900">₹{auction.current_bid?.toLocaleString() || '0'}</p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-sm text-slate-500">
                      <Tag className="h-3 w-3" />
                      Category
                    </div>
                    <p className="font-semibold text-slate-900">{auction.category}</p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-sm text-slate-500">
                      <User className="h-3 w-3" />
                      Total Bidders
                    </div>
                    <p className="font-semibold text-slate-900">{auction.bidder_count}</p>
                  </div>
                </div>
                <div className="pt-2">
                  <div className="flex items-center gap-1 text-sm text-slate-500 mb-1">
                    <Calendar className="h-3 w-3" />
                    Auction Period
                  </div>
                  <div className="text-sm text-slate-900">
                    <p><strong>Start:</strong> {auction.start_time ? formatDateTime(auction.start_time) : 'Not set'}</p>
                    <p><strong>End:</strong> {auction.end_time ? formatDateTime(auction.end_time) : 'Not set'}</p>
                  </div>
                </div>
                {auction.description && (
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Description</p>
                    <p className="text-sm text-slate-900">{auction.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Bids Table */}
            <Card className="border-slate-200/60 shadow-sm bg-white/70 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg text-slate-900">All Bids ({allBids.length})</CardTitle>
                  {allBids.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={downloadBidsCSV}
                      className="border-slate-200 hover:bg-slate-50"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export CSV
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {allBids.length === 0 ? (
                  <div className="text-center py-8">
                    <DollarSign className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500 font-medium">No bids placed yet</p>
                    <p className="text-sm text-slate-400">Bids will appear here once bidders start participating</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12">#</TableHead>
                          <TableHead>Bidder</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Time</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {allBids.map((bid, index) => (
                          <TableRow key={bid.bid_id} className={index === 0 ? 'bg-green-50' : ''}>
                            <TableCell className="font-medium">
                              {index === 0 ? (
                                <Badge className="bg-green-100 text-green-800">1st</Badge>
                              ) : (
                                <span className="text-slate-500">{index + 1}</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-slate-400" />
                                <span className="font-medium">{bid.bidder_name}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-slate-600">{bid.bidder_email}</TableCell>
                            <TableCell>
                              <span className="font-semibold text-slate-900">
                                ₹{Number(bid.bid_amount).toLocaleString()}
                              </span>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1 text-sm text-slate-600">
                                <Clock className="h-3 w-3" />
                                {formatDateTime(bid.bid_timestamp)}
                              </div>
                            </TableCell>
                            <TableCell>
                              {index === 0 ? (
                                <Badge className="bg-green-100 text-green-800">
                                  {auction.status === 'ended' ? 'Winner' : 'Leading'}
                                </Badge>
                              ) : (
                                <Badge variant="outline">Outbid</Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Bidder Info Sidebar */}
          <div>
            <BidderInfo
              auctionId={auction.id}
              auctionTitle={auction.title}
              auctionStatus={auction.status}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAuctionView;
