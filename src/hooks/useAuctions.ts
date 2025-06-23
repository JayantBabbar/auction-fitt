
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

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

// Simple in-memory storage for created auctions (in a real app, this would be a database)
let createdAuctions: Auction[] = [];

export const useAuctions = () => {
  return useQuery({
    queryKey: ['auctions'],
    queryFn: async () => {
      console.log('Fetching auctions, created auctions:', createdAuctions);
      
      // Return created auctions along with sample auctions
      const sampleAuctions: Auction[] = [
        {
          id: '1',
          title: 'Sample Auction 1',
          description: 'A sample auction item',
          category: 'Electronics',
          starting_bid: 1000,
          current_bid: 1500,
          reserve_price: 2000,
          bid_increment: 50,
          condition: 'excellent',
          start_time: new Date().toISOString(),
          end_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          auction_duration: 1,
          status: 'active',
          image_urls: ['https://images.unsplash.com/photo-1488590528505-98d2b5aba04b'],
          created_by: 'user_1',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          bid_count: 5,
          bidder_count: 3,
          dimensions: '15" x 10" x 1"',
          provenance: 'Original manufacturer',
          weight: '2.5 kg'
        }
      ];
      
      // Combine sample auctions with created auctions
      const allAuctions = [...sampleAuctions, ...createdAuctions];
      console.log('Returning all auctions:', allAuctions);
      return allAuctions;
    },
  });
};

// Function to add a newly created auction to our storage
export const addCreatedAuction = (auction: any) => {
  console.log('Adding created auction to storage:', auction);
  
  // Convert the auction to our Auction type
  const formattedAuction: Auction = {
    id: auction.id,
    title: auction.title,
    description: auction.description,
    category: auction.category,
    starting_bid: auction.starting_bid,
    current_bid: auction.current_bid || auction.starting_bid,
    reserve_price: auction.reserve_price,
    bid_increment: auction.bid_increment,
    condition: auction.condition,
    start_time: auction.start_time,
    end_time: auction.end_time,
    auction_duration: auction.auction_duration,
    status: auction.status,
    image_urls: auction.image_urls || [],
    created_by: auction.created_by,
    created_at: auction.created_at,
    updated_at: auction.updated_at || auction.created_at,
    bid_count: auction.bid_count || 0,
    bidder_count: auction.bidder_count || 0,
    dimensions: auction.dimensions || '',
    provenance: auction.provenance || '',
    weight: auction.weight || ''
  };
  
  createdAuctions.push(formattedAuction);
  console.log('Updated created auctions:', createdAuctions);
};

export const useUpdateAuction = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: AuctionUpdate }) => {
      console.log('Updating auction:', id, updates);
      
      // Mock update - in real implementation this would call your API
      const updatedAuction = {
        id,
        ...updates,
        updated_at: new Date().toISOString()
      };
      
      await new Promise(resolve => setTimeout(resolve, 500));
      return updatedAuction;
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
      
      // Mock deletion - in real implementation this would call your API
      await new Promise(resolve => setTimeout(resolve, 500));
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
