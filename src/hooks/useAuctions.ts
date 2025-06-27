import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toZonedTime } from 'date-fns-tz';

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

// IST timezone constant
const IST_TIMEZONE = 'Asia/Kolkata';

// Helper function to determine auction status based on IST time
const determineAuctionStatus = (auction: any) => {
  const nowUTC = new Date();
  const nowIST = toZonedTime(nowUTC, IST_TIMEZONE);
  
  if (!auction.start_time || !auction.end_time) {
    return auction.status; // Keep original status if times are not set
  }
  
  const startTimeUTC = new Date(auction.start_time);
  const endTimeUTC = new Date(auction.end_time);
  const startTimeIST = toZonedTime(startTimeUTC, IST_TIMEZONE);
  const endTimeIST = toZonedTime(endTimeUTC, IST_TIMEZONE);
  
  // Check if auction should be ended
  if (endTimeIST <= nowIST) {
    return 'ended';
  }
  
  // Check if auction should be active
  if (startTimeIST <= nowIST && endTimeIST > nowIST && auction.status !== 'cancelled') {
    return 'active';
  }
  
  // Check if auction should be upcoming
  if (startTimeIST > nowIST && auction.status !== 'cancelled') {
    return 'upcoming';
  }
  
  return auction.status;
};

export const useAuctions = () => {
  const queryClient = useQueryClient();
  
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

      const nowUTC = new Date();
      const nowIST = toZonedTime(nowUTC, IST_TIMEZONE);
      
      console.log('Current time UTC:', nowUTC.toISOString());
      console.log('Current time IST:', nowIST.toISOString());
      
      // Process each auction to determine correct status and update if needed
      const processedAuctions = await Promise.all((data || []).map(async (auction) => {
        const expectedStatus = determineAuctionStatus(auction);
        
        // Log auction analysis
        const startTime = auction.start_time ? new Date(auction.start_time) : null;
        const endTime = auction.end_time ? new Date(auction.end_time) : null;
        const startTimeIST = startTime ? toZonedTime(startTime, IST_TIMEZONE) : null;
        const endTimeIST = endTime ? toZonedTime(endTime, IST_TIMEZONE) : null;
        
        console.log(`Auction Analysis - ${auction.title} (${auction.id}):`, {
          currentStatus: auction.status,
          expectedStatus,
          start_time_UTC: auction.start_time,
          end_time_UTC: auction.end_time,
          startTime_IST: startTimeIST?.toISOString(),
          endTime_IST: endTimeIST?.toISOString(),
          now_IST: nowIST.toISOString(),
          hasStarted: startTimeIST ? startTimeIST <= nowIST : false,
          hasEnded: endTimeIST ? endTimeIST <= nowIST : false,
          shouldUpdate: auction.status !== expectedStatus
        });
        
        // Update auction status if it has changed based on time
        if (auction.status !== expectedStatus && expectedStatus !== auction.status) {
          try {
            console.log(`Updating auction ${auction.id} status from ${auction.status} to ${expectedStatus}`);
            
            const { data: updatedAuction, error: updateError } = await supabase
              .from('auctions')
              .update({ status: expectedStatus, updated_at: new Date().toISOString() })
              .eq('id', auction.id)
              .select()
              .single();
            
            if (updateError) {
              console.error('Error updating auction status:', updateError);
              return auction; // Return original if update fails
            }
            
            return updatedAuction;
          } catch (updateError) {
            console.error('Error updating auction status:', updateError);
            return auction; // Return original if update fails
          }
        }
        
        return auction;
      }));

      console.log('Processed auctions with updated statuses:', processedAuctions.map(a => ({
        id: a.id,
        title: a.title,
        status: a.status,
        start_time: a.start_time,
        end_time: a.end_time
      })));
      
      // Invalidate the query after a short delay to reflect any status updates
      if (processedAuctions.some(auction => {
        const expectedStatus = determineAuctionStatus(auction);
        return auction.status !== expectedStatus;
      })) {
        setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: ['auctions'] });
        }, 1000);
      }
      
      return processedAuctions;
    },
    refetchInterval: 60000, // Refetch every minute to check for status changes
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

        console.log('Uploading image to Supabase storage:', file.name);
        
        // Generate unique filename
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `auction-images/${fileName}`;

        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
          .from('auction-images')
          .upload(filePath, file);

        if (error) {
          console.error('Storage upload error:', error);
          throw new Error(`Upload failed: ${error.message}`);
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('auction-images')
          .getPublicUrl(filePath);

        return { url: publicUrl, path: filePath };
      } catch (error) {
        console.error('Image upload failed:', error);
        throw error;
      }
    },
  });
};
