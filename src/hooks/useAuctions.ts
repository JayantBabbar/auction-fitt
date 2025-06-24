
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Mock auction type
type Auction = {
  id: string;
  title: string;
  description: string;
  category: string;
  starting_bid: number;
  current_bid: number;
  reserve_price: number | null;
  bid_increment: number;
  condition: 'excellent' | 'very_good' | 'good' | 'fair' | 'poor';
  start_time: string;
  end_time: string;
  auction_duration: number;
  status: 'active' | 'draft' | 'upcoming' | 'ended' | 'cancelled';
  image_urls: string[];
  created_by: string;
  created_at: string;
  updated_at: string;
  bid_count: number;
  bidder_count: number;
  dimensions: string;
  provenance: string;
  weight: string;
};

type AuctionUpdate = Partial<Auction>;

// Use the secure version of create auction hook
export { useSecureCreateAuction as useCreateAuction } from '@/hooks/useSecureAuctions';

export const useAuctions = () => {
  return useQuery({
    queryKey: ['auctions'],
    queryFn: async () => {
      console.log('Fetching auctions from Supabase');
      
      const { data, error } = await supabase
        .from('auctions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching auctions:', error);
        throw error;
      }

      console.log('Auctions fetched from Supabase:', data);
      return data || [];
    },
  });
};

export const useUpdateAuction = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: AuctionUpdate }) => {
      console.log('Updating auction:', id, updates);
      
      const { data, error } = await supabase
        .from('auctions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating auction:', error);
        throw error;
      }

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
      console.log('Deleting auction:', id);
      
      const { error } = await supabase
        .from('auctions')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting auction:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auctions'] });
    },
  });
};

export const useUploadAuctionImage = () => {
  return useMutation({
    mutationFn: async ({ file, auctionId }: { file: File; auctionId?: string }) => {
      try {
        // Validate file type and size
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
          throw new Error('Invalid file type. Only JPEG, PNG, and WebP images are allowed.');
        }
        
        // Limit file size to 5MB
        if (file.size > 5 * 1024 * 1024) {
          throw new Error('File size must be less than 5MB.');
        }

        console.log('Mock image upload for file:', file.name);
        
        // Mock image upload - return a placeholder URL
        const mockUrl = `https://images.unsplash.com/photo-${Date.now()}`;
        
        await new Promise(resolve => setTimeout(resolve, 1000));

        return { url: mockUrl, path: `mock/${file.name}` };
      } catch (error) {
        console.error('Image upload failed:', error);
        throw error;
      }
    },
  });
};
