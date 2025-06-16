
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useSecurityAudit } from '@/hooks/useSecurityAudit';

// Use the secure version of place bid hook
export { useSecurePlaceBid as usePlaceBid } from '@/hooks/useSecureBids';

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
  const { mutate: logSecurityEvent } = useSecurityAudit();
  
  return useQuery({
    queryKey: ['can-user-bid'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        logSecurityEvent({
          action: 'bid_eligibility_check_unauthenticated',
          resourceType: 'auth',
          success: false
        });
        return false;
      }

      const { data, error } = await supabase.rpc('can_user_bid', {
        user_id: user.id
      });
      
      if (error) {
        logSecurityEvent({
          action: 'bid_eligibility_check_failed',
          resourceType: 'auth',
          success: false,
          errorMessage: error.message
        });
        throw error;
      }
      
      return data;
    },
  });
};
