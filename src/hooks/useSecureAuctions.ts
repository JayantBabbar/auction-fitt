
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useSimpleAuth } from '@/contexts/SimpleAuthContext';
import { validateAuctionTitle, validateAuctionDescription } from '@/utils/inputValidation';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type AuctionInsert = Database['public']['Tables']['auctions']['Insert'];

export const useSecureCreateAuction = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useSimpleAuth();
  
  return useMutation({
    mutationFn: async (auction: AuctionInsert) => {
      if (!user) {
        console.log('No user found in SimpleAuth context');
        throw new Error('User not authenticated. Please log in to create an auction.');
      }

      console.log('Authenticated user from SimpleAuth:', user);

      // Validate and sanitize inputs
      const titleValidation = validateAuctionTitle(auction.title || '');
      if (!titleValidation.valid) {
        console.log('Title validation failed:', titleValidation.error);
        throw new Error(`Title validation failed: ${titleValidation.error}`);
      }

      const descriptionValidation = validateAuctionDescription(auction.description || '');
      if (!descriptionValidation.valid) {
        console.log('Description validation failed:', descriptionValidation.error);
        throw new Error(`Description validation failed: ${descriptionValidation.error}`);
      }

      // Convert string user ID to a proper UUID format for Supabase
      // For SimpleAuth, we'll generate a UUID-like string from the user ID
      const userUuid = user.id.length < 36 ? 
        `00000000-0000-0000-0000-${user.id.padStart(12, '0')}` : 
        user.id;

      // Create sanitized auction object with proper types
      const sanitizedAuction: AuctionInsert = {
        ...auction,
        title: titleValidation.sanitized || auction.title,
        description: descriptionValidation.sanitized || auction.description,
        created_by: userUuid,
        condition: auction.condition as Database['public']['Enums']['auction_condition'],
        status: auction.status as Database['public']['Enums']['auction_status']
      };

      console.log('Creating auction with sanitized data:', sanitizedAuction);
      
      // Save to Supabase - insert single object, not array
      const { data, error } = await supabase
        .from('auctions')
        .insert(sanitizedAuction)
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        
        // Provide more descriptive error messages
        let userFriendlyMessage = 'Failed to create auction. ';
        
        if (error.code === '23505') {
          userFriendlyMessage += 'An auction with this title already exists.';
        } else if (error.code === '23502') {
          userFriendlyMessage += 'Missing required information. Please fill in all required fields.';
        } else if (error.code === '23514') {
          userFriendlyMessage += 'Invalid data provided. Please check your inputs.';
        } else if (error.code === '22P02') {
          userFriendlyMessage += 'Invalid data format. Please contact support.';
        } else {
          userFriendlyMessage += `Database error: ${error.message}`;
        }
        
        throw new Error(userFriendlyMessage);
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
        description: error.message || "Failed to create auction. Please try again.",
        variant: "destructive"
      });
    },
  });
};
