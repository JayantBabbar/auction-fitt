
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useSimpleAuth } from '@/contexts/SimpleAuthContext';
import { validateAuctionTitle, validateAuctionDescription } from '@/utils/inputValidation';
import { supabase } from '@/integrations/supabase/client';

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
      
      // Actually save to Supabase instead of mock
      const { data, error } = await supabase
        .from('auctions')
        .insert([sanitizedAuction])
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw new Error(error.message);
      }

      console.log('Auction created successfully in Supabase:', data);
      return data;
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
