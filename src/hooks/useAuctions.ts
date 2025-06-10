
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type Auction = Database['public']['Tables']['auctions']['Row'];
type AuctionInsert = Database['public']['Tables']['auctions']['Insert'];
type AuctionUpdate = Database['public']['Tables']['auctions']['Update'];

export const useAuctions = () => {
  return useQuery({
    queryKey: ['auctions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('auctions')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });
};

export const useCreateAuction = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (auction: AuctionInsert) => {
      const { data, error } = await supabase
        .from('auctions')
        .insert(auction)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auctions'] });
    },
  });
};

export const useUpdateAuction = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: AuctionUpdate }) => {
      const { data, error } = await supabase
        .from('auctions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auctions'] });
    },
  });
};

export const useDeleteAuction = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('auctions')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auctions'] });
    },
  });
};
