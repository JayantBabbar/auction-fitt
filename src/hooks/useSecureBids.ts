
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useSecurityAudit } from '@/hooks/useSecurityAudit';
import { validateBidAmount } from '@/utils/inputValidation';

interface PlaceBidResponse {
  success: boolean;
  bid_id?: string;
  message?: string;
  error?: string;
}

export const useSecurePlaceBid = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { mutate: logSecurityEvent } = useSecurityAudit();

  return useMutation({
    mutationFn: async ({ auctionId, amount }: { auctionId: string; amount: number }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        logSecurityEvent({
          action: 'bid_attempt_unauthenticated',
          resourceType: 'auction',
          resourceId: auctionId,
          success: false,
          errorMessage: 'User not authenticated'
        });
        throw new Error('User not authenticated');
      }

      // Get auction details for validation
      const { data: auction, error: auctionError } = await supabase
        .from('auctions')
        .select('current_bid, starting_bid, bid_increment, status')
        .eq('id', auctionId)
        .single();

      if (auctionError || !auction) {
        logSecurityEvent({
          action: 'bid_attempt_invalid_auction',
          resourceType: 'auction',
          resourceId: auctionId,
          success: false,
          errorMessage: 'Auction not found'
        });
        throw new Error('Auction not found');
      }

      // Validate bid amount on client side for immediate feedback
      const minBid = (auction.current_bid || auction.starting_bid) + auction.bid_increment;
      const validation = validateBidAmount(amount, minBid);
      
      if (!validation.valid) {
        logSecurityEvent({
          action: 'bid_attempt_invalid_amount',
          resourceType: 'auction',
          resourceId: auctionId,
          success: false,
          errorMessage: validation.error
        });
        throw new Error(validation.error);
      }

      // Place bid using secure server-side function
      const { data, error } = await supabase.rpc('place_bid', {
        p_auction_id: auctionId,
        p_bidder_id: user.id,
        p_amount: amount
      });
      
      if (error) {
        logSecurityEvent({
          action: 'bid_placement_failed',
          resourceType: 'auction',
          resourceId: auctionId,
          success: false,
          errorMessage: error.message
        });
        throw error;
      }

      logSecurityEvent({
        action: 'bid_placed',
        resourceType: 'auction',
        resourceId: auctionId,
        success: true
      });

      return data as unknown as PlaceBidResponse;
    },
    onSuccess: (data, variables) => {
      if (data.success) {
        toast({
          title: "Bid Placed Successfully!",
          description: data.message,
        });
        
        // Invalidate relevant queries
        queryClient.invalidateQueries({ queryKey: ['bids', variables.auctionId] });
        queryClient.invalidateQueries({ queryKey: ['user-bids'] });
        queryClient.invalidateQueries({ queryKey: ['auctions'] });
      } else {
        toast({
          title: "Bid Failed",
          description: data.error,
          variant: "destructive"
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Bid Failed",
        description: error.message,
        variant: "destructive"
      });
    },
  });
};
