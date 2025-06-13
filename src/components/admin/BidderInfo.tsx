
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useHighestBidder, useAuctionBidsAdmin } from '@/hooks/useAdminBids';
import { Download, User, Mail, Clock, DollarSign } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BidderInfoProps {
  auctionId: string;
  auctionTitle: string;
  auctionStatus: string;
}

const BidderInfo = ({ auctionId, auctionTitle, auctionStatus }: BidderInfoProps) => {
  const { toast } = useToast();
  const { data: highestBidder, isLoading: loadingBidder } = useHighestBidder(auctionId);
  const { data: allBids, isLoading: loadingBids } = useAuctionBidsAdmin(auctionId);

  const downloadBidsCSV = () => {
    if (!allBids || allBids.length === 0) {
      toast({
        title: "No Bids Available",
        description: "There are no bids to download for this auction.",
        variant: "destructive"
      });
      return;
    }

    // Create CSV content
    const headers = ['Bid ID', 'Bidder Name', 'Bidder Email', 'Bid Amount', 'Bid Timestamp'];
    const csvContent = [
      headers.join(','),
      ...allBids.map(bid => [
        bid.bid_id,
        `"${bid.bidder_name}"`,
        bid.bidder_email,
        bid.bid_amount,
        new Date(bid.bid_timestamp).toISOString()
      ].join(','))
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `auction-${auctionId}-bids.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Download Started",
      description: `Downloading bids for "${auctionTitle}"`,
    });
  };

  if (loadingBidder || loadingBids) {
    return (
      <Card className="border-slate-200/60 shadow-sm bg-white/70 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-4">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            <span className="ml-2 text-sm text-muted-foreground">Loading bidder information...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-slate-200/60 shadow-sm bg-white/70 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg text-slate-900">Bidder Information</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {allBids?.length || 0} total bids
            </Badge>
            {allBids && allBids.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={downloadBidsCSV}
                className="border-slate-200 hover:bg-slate-50"
              >
                <Download className="h-4 w-4 mr-2" />
                Download CSV
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {highestBidder ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gradient-to-br from-auction-gold/10 to-amber-50 rounded-lg border border-auction-gold/20">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-auction-gold" />
                  <span className="font-medium text-slate-900">Highest Bidder</span>
                  {auctionStatus === 'ended' && (
                    <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">
                      Winner
                    </Badge>
                  )}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-3 w-3 text-slate-500" />
                    <span className="font-medium">{highestBidder.bidder_name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Mail className="h-3 w-3 text-slate-500" />
                    <span>{highestBidder.bidder_email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Clock className="h-3 w-3 text-slate-500" />
                    <span>{new Date(highestBidder.bid_time).toLocaleString()}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 text-2xl font-bold text-auction-gold">
                  <span className="text-lg">₹</span>
                  {Number(highestBidder.highest_bid).toLocaleString()}
                </div>
                <p className="text-xs text-slate-500">Highest Bid</p>
              </div>
            </div>

            {auctionStatus === 'ended' && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                <p className="text-sm text-emerald-800 font-medium">
                  🏆 Auction Complete - Contact winner for payment and delivery arrangements
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <User className="h-6 w-6 text-slate-400" />
            </div>
            <p className="text-slate-500 font-medium">No bids yet</p>
            <p className="text-sm text-slate-400 mt-1">
              Bidder information will appear once the first bid is placed
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BidderInfo;
