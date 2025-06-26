
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useSecurityAudit } from '@/hooks/useSecurityAudit';

export const useCancelBid = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { mutate: logSecurityEvent } = useSecurityAudit();

  return useMutation({
    mutationFn: async ({ bidId, auctionId }: { bidId: string; auctionId: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        logSecurityEvent({
          action: 'bid_cancel_attempt_unauthenticated',
          resourceType: 'auction',
          resourceId: auctionId,
          success: false,
          errorMessage: 'User not authenticated'
        });
        throw new Error('User not authenticated');
      }

      // Get the bid to ensure it belongs to the current user
      const { data: bid, error: bidError } = await supabase
        .from('bids')
        .select('*')
        .eq('id', bidId)
        .eq('bidder_id', user.id)
        .single();

      if (bidError || !bid) {
        logSecurityEvent({
          action: 'bid_cancel_attempt_unauthorized',
          resourceType: 'auction',
          resourceId: auctionId,
          success: false,
          errorMessage: 'Bid not found or unauthorized'
        });
        throw new Error('Bid not found or you are not authorized to cancel this bid');
      }

      // Get auction details to check if it's still active
      const { data: auction, error: auctionError } = await supabase
        .from('auctions')
        .select('status, current_bid')
        .eq('id', auctionId)
        .single();

      if (auctionError || !auction) {
        throw new Error('Auction not found');
      }

      if (auction.status !== 'active') {
        throw new Error('Cannot cancel bid on inactive auction');
      }

      // Check if this is the highest bid
      if (auction.current_bid === bid.amount) {
        throw new Error('Cannot cancel the highest bid. Please wait for another bidder or contact admin.');
      }

      // Delete the bid
      const { error: deleteError } = await supabase
        .from('bids')
        .delete()
        .eq('id', bidId)
        .eq('bidder_id', user.id);

      if (deleteError) {
        logSecurityEvent({
          action: 'bid_cancel_failed',
          resourceType: 'auction',
          resourceId: auctionId,
          success: false,
          errorMessage: deleteError.message
        });
        throw deleteError;
      }

      logSecurityEvent({
        action: 'bid_cancelled',
        resourceType: 'auction',
        resourceId: auctionId,
        success: true
      });

      return { success: true };
    },
    onSuccess: (_, variables) => {
      toast({
        title: "Bid Cancelled",
        description: "Your bid has been successfully cancelled.",
      });
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['bids', variables.auctionId] });
      queryClient.invalidateQueries({ queryKey: ['user-bids'] });
      queryClient.invalidateQueries({ queryKey: ['auctions'] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Cancel Bid",
        description: error.message,
        variant: "destructive"
      });
    },
  });
};
