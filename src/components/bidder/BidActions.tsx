
import React, { useState } from 'react';
import { useCancelBid } from '@/hooks/useBidCancellation';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { X } from 'lucide-react';

interface BidActionsProps {
  bidId: string;
  auctionId: string;
  bidAmount: number;
  isHighestBid: boolean;
  auctionStatus: string;
}

const BidActions = ({ bidId, auctionId, bidAmount, isHighestBid, auctionStatus }: BidActionsProps) => {
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const cancelBidMutation = useCancelBid();

  const handleCancelBid = async () => {
    try {
      await cancelBidMutation.mutateAsync({ bidId, auctionId });
      setShowCancelDialog(false);
    } catch (error) {
      // Error is handled by the mutation's onError callback
    }
  };

  // Don't show cancel option if auction is not active or if it's the highest bid
  if (auctionStatus !== 'active' || isHighestBid) {
    return null;
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowCancelDialog(true)}
        disabled={cancelBidMutation.isPending}
        className="text-red-600 border-red-200 hover:bg-red-50"
      >
        <X className="h-3 w-3 mr-1" />
        Cancel Bid
      </Button>

      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Bid</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel your bid of ₹{bidAmount.toLocaleString()}? 
              This action cannot be undone and you'll need to place a new bid if you want to participate again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Bid</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleCancelBid}
              className="bg-red-600 hover:bg-red-700"
              disabled={cancelBidMutation.isPending}
            >
              {cancelBidMutation.isPending ? 'Cancelling...' : 'Cancel Bid'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default BidActions;
