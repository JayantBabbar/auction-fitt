
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

      // For SimpleAuth, we'll use the user ID directly without UUID conversion
      // since we're bypassing Supabase auth
      console.log('Using SimpleAuth user ID:', user.id);

      // Check if profile exists, if not create it
      const { data: existingProfile, error: profileCheckError } = await supabase
        .from('profiles')
        .select('id, role')
        .eq('id', user.id)
        .single();

      if (profileCheckError && profileCheckError.code === 'PGRST116') {
        // Profile doesn't exist, create it using direct insert (bypassing RLS)
        console.log('Creating profile for SimpleAuth user:', user.id);
        
        // Use the service role or disable RLS temporarily for this operation
        const { error: profileCreateError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role === 'admin' ? 'admin' : 'bidder'
          });

        if (profileCreateError) {
          console.error('Failed to create user profile:', profileCreateError);
          // If we can't create the profile, we'll proceed without it for SimpleAuth
          console.log('Proceeding without profile creation for SimpleAuth user');
        }
      } else if (profileCheckError) {
        console.error('Profile check error:', profileCheckError);
        // For SimpleAuth, we'll continue even if profile check fails
        console.log('Continuing with SimpleAuth despite profile check error');
      }

      // Verify user has admin role
      const userRole = existingProfile?.role || user.role;
      if (userRole !== 'admin') {
        throw new Error('Only administrators can create auctions. Please ensure you have admin privileges.');
      }

      // Create sanitized auction object with proper types
      const sanitizedAuction: AuctionInsert = {
        ...auction,
        title: titleValidation.sanitized || auction.title,
        description: descriptionValidation.sanitized || auction.description,
        created_by: user.id, // Use SimpleAuth user ID directly
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
          userFriendlyMessage += 'An auction with this title already exists. Please choose a different title.';
        } else if (error.code === '23502') {
          userFriendlyMessage += 'Missing required information. Please fill in all required fields including title, description, starting bid, and dates.';
        } else if (error.code === '23514') {
          userFriendlyMessage += 'Invalid data provided. Please check that your bid increment is positive and dates are valid.';
        } else if (error.code === '22P02') {
          userFriendlyMessage += 'Invalid data format. Please ensure dates are properly formatted and numeric values are valid.';
        } else if (error.code === '42501') {
          userFriendlyMessage += 'Permission denied. Please ensure you have admin privileges. Try logging out and back in.';
        } else if (error.message.includes('row-level security')) {
          userFriendlyMessage += 'Authentication error. This may be due to SimpleAuth bypass mode. The auction creation failed due to security policies.';
        } else if (error.message.includes('invalid input syntax for type uuid')) {
          userFriendlyMessage += 'User authentication format error. Please try logging out and back in.';
        } else {
          userFriendlyMessage += `Database error: ${error.message}. Please check your input data and try again.`;
        }
        
        throw new Error(userFriendlyMessage);
      }

      console.log('Auction created successfully in Supabase:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auctions'] });
      toast({
        title: "Auction Created Successfully",
        description: "Your auction has been created and is now available.",
      });
    },
    onError: (error: any) => {
      console.error('Auction creation error:', error);
      toast({
        title: "Failed to Create Auction",
        description: error.message || "An unexpected error occurred while creating the auction. Please try again.",
        variant: "destructive"
      });
    },
  });
};
