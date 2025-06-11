
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Type definition for the place_bid function response
interface PlaceBidResponse {
  success: boolean;
  bid_id?: string;
  message?: string;
  error?: string;
}

export const useBids = (auctionId?: string) => {
  return useQuery({
    queryKey: ['bids', auctionId],
    queryFn: async () => {
      if (!auctionId) return [];
      
      const { data, error } = await supabase
        .from('bids')
        .select('*')
        .eq('auction_id', auctionId)
        .order('amount', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!auctionId,
  });
};

export const useUserBids = () => {
  return useQuery({
    queryKey: ['user-bids'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('bids')
        .select(`
          *,
          auctions:auction_id (*)
        `)
        .eq('bidder_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });
};

export const useAuctionWinners = () => {
  return useQuery({
    queryKey: ['auction-winners'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('auction_winners')
        .select('*')
        .order('won_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });
};

export const useCanUserBid = () => {
  return useQuery({
    queryKey: ['can-user-bid'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data, error } = await supabase.rpc('can_user_bid', {
        user_id: user.id
      });
      
      if (error) throw error;
      return data;
    },
  });
};

export const usePlaceBid = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ auctionId, amount }: { auctionId: string; amount: number }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase.rpc('place_bid', {
        p_auction_id: auctionId,
        p_bidder_id: user.id,
        p_amount: amount
      });
      
      if (error) throw error;
      return data as PlaceBidResponse;
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
