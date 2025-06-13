
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useHighestBidder = (auctionId?: string) => {
  return useQuery({
    queryKey: ['highest-bidder', auctionId],
    queryFn: async () => {
      if (!auctionId) return null;
      
      const { data, error } = await supabase.rpc('get_highest_bidder', {
        p_auction_id: auctionId
      });
      
      if (error) throw error;
      return data?.[0] || null;
    },
    enabled: !!auctionId,
  });
};

export const useAuctionBidsAdmin = (auctionId?: string) => {
  return useQuery({
    queryKey: ['auction-bids-admin', auctionId],
    queryFn: async () => {
      if (!auctionId) return [];
      
      const { data, error } = await supabase.rpc('get_auction_bids_admin', {
        p_auction_id: auctionId
      });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!auctionId,
  });
};
