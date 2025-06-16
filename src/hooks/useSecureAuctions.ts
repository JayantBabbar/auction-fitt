
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useSecurityAudit } from '@/hooks/useSecurityAudit';
import { validateAuctionTitle, validateAuctionDescription } from '@/utils/inputValidation';
import { Database } from '@/integrations/supabase/types';

type AuctionInsert = Database['public']['Tables']['auctions']['Insert'];

export const useSecureCreateAuction = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { mutate: logSecurityEvent } = useSecurityAudit();
  
  return useMutation({
    mutationFn: async (auction: AuctionInsert) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        logSecurityEvent({
          action: 'auction_creation_unauthenticated',
          resourceType: 'auction',
          success: false,
          errorMessage: 'User not authenticated'
        });
        throw new Error('User not authenticated');
      }

      // Validate and sanitize inputs
      const titleValidation = validateAuctionTitle(auction.title || '');
      if (!titleValidation.valid) {
        logSecurityEvent({
          action: 'auction_creation_invalid_title',
          resourceType: 'auction',
          success: false,
          errorMessage: titleValidation.error
        });
        throw new Error(titleValidation.error);
      }

      const descriptionValidation = validateAuctionDescription(auction.description || '');
      if (!descriptionValidation.valid) {
        logSecurityEvent({
          action: 'auction_creation_invalid_description',
          resourceType: 'auction',
          success: false,
          errorMessage: descriptionValidation.error
        });
        throw new Error(descriptionValidation.error);
      }

      // Create sanitized auction object
      const sanitizedAuction = {
        ...auction,
        title: titleValidation.sanitized || auction.title,
        description: descriptionValidation.sanitized || auction.description,
        created_by: user.id
      };

      console.log('Creating auction with data:', sanitizedAuction);
      
      const { data, error } = await supabase
        .from('auctions')
        .insert(sanitizedAuction)
        .select()
        .single();
      
      if (error) {
        console.error('Auction creation error:', error);
        logSecurityEvent({
          action: 'auction_creation_failed',
          resourceType: 'auction',
          success: false,
          errorMessage: error.message
        });
        throw error;
      }
      
      console.log('Auction created successfully:', data);
      logSecurityEvent({
        action: 'auction_created',
        resourceType: 'auction',
        resourceId: data.id,
        success: true
      });
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auctions'] });
      toast({
        title: "Auction Created",
        description: "Your auction has been created successfully.",
      });
    },
    onError: (error: Error) => {
      console.error('Mutation error:', error);
      toast({
        title: "Creation Failed",
        description: error.message,
        variant: "destructive"
      });
    },
  });
};
