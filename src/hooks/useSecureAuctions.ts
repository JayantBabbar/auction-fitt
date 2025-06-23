import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useSimpleAuth } from '@/contexts/SimpleAuthContext';
import { validateAuctionTitle, validateAuctionDescription } from '@/utils/inputValidation';
import { addCreatedAuction } from '@/hooks/useAuctions';

type AuctionInsert = {
  created_by: string;
  title: string;
  description: string;
  category: string;
  starting_bid: number;
  reserve_price?: number | null;
  bid_increment: number;
  condition: string;
  start_time: string;
  end_time: string;
  auction_duration: number;
  status: string;
  image_urls: string[];
};

export const useSecureCreateAuction = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useSimpleAuth();
  
  return useMutation({
    mutationFn: async (auction: AuctionInsert) => {
      if (!user) {
        console.log('No user found in SimpleAuth context');
        throw new Error('User not authenticated');
      }

      console.log('Authenticated user from SimpleAuth:', user);

      // Validate and sanitize inputs
      const titleValidation = validateAuctionTitle(auction.title || '');
      if (!titleValidation.valid) {
        console.log('Title validation failed:', titleValidation.error);
        throw new Error(titleValidation.error);
      }

      const descriptionValidation = validateAuctionDescription(auction.description || '');
      if (!descriptionValidation.valid) {
        console.log('Description validation failed:', descriptionValidation.error);
        throw new Error(descriptionValidation.error);
      }

      // Create sanitized auction object
      const sanitizedAuction = {
        ...auction,
        title: titleValidation.sanitized || auction.title,
        description: descriptionValidation.sanitized || auction.description,
        created_by: user.id
      };

      console.log('Creating auction with sanitized data:', sanitizedAuction);
      
      // Since we're not using Supabase, we'll simulate a successful creation
      // In a real implementation, this would call your actual backend API
      const mockCreatedAuction = {
        id: `auction_${Date.now()}`,
        ...sanitizedAuction,
        created_at: new Date().toISOString(),
        current_bid: sanitizedAuction.starting_bid,
        bid_count: 0
      };
      
      console.log('Mock auction created successfully:', mockCreatedAuction);
      
      // Add the created auction to our storage so it appears in the list
      addCreatedAuction(mockCreatedAuction);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return mockCreatedAuction;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auctions'] });
      toast({
        title: "Auction Created",
        description: "Your auction has been created successfully.",
      });
    },
    onError: (error: any) => {
      console.error('Auction creation error:', error);
      toast({
        title: "Creation Failed",
        description: error.message,
        variant: "destructive"
      });
    },
  });
};
