
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
      console.log('Creating auction with data:', auction);
      
      const { data, error } = await supabase
        .from('auctions')
        .insert(auction)
        .select()
        .single();
      
      if (error) {
        console.error('Auction creation error:', error);
        throw error;
      }
      
      console.log('Auction created successfully:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auctions'] });
    },
    onError: (error) => {
      console.error('Mutation error:', error);
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

export const useUploadAuctionImage = () => {
  return useMutation({
    mutationFn: async ({ file, auctionId }: { file: File; auctionId?: string }) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `auction-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('auction-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('auction-images')
        .getPublicUrl(filePath);

      if (auctionId) {
        const { error: dbError } = await supabase
          .from('auction_images')
          .insert({
            auction_id: auctionId,
            image_url: publicUrl,
            is_primary: false
          });

        if (dbError) throw dbError;
      }

      return { url: publicUrl, path: filePath };
    },
  });
};
