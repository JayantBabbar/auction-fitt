
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type Auction = Database['public']['Tables']['auctions']['Row'];
type AuctionUpdate = Database['public']['Tables']['auctions']['Update'];

// Use the secure version of create auction hook
export { useSecureCreateAuction as useCreateAuction } from '@/hooks/useSecureAuctions';

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

        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `auction-images/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('auction-images')
          .upload(filePath, file);

        if (uploadError) {
          console.error('Upload error:', uploadError);
          throw uploadError;
        }

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

          if (dbError) {
            console.error('Database error:', dbError);
            throw dbError;
          }
        }

        return { url: publicUrl, path: filePath };
      } catch (error) {
        console.error('Image upload failed:', error);
        throw error;
      }
    },
  });
};
