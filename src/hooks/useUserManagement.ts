
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface CreateUserData {
  name: string;
  email: string;
  role: 'admin' | 'bidder';
}

interface CreateUserResponse {
  success?: boolean;
  user_id?: string;
  email?: string;
  temporary_password?: string;
  error?: string;
}

export const useUserManagement = () => {
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);

  const validateEmailDomain = (email: string): boolean => {
    return email.toLowerCase().endsWith('@fitt-iitd.in') || email.toLowerCase().endsWith('@aic-iitd.in');
  };

  const createUser = async (userData: CreateUserData): Promise<boolean> => {
    // Client-side email validation
    if (!validateEmailDomain(userData.email)) {
      toast({
        title: "Invalid Email Domain",
        description: "Only @fitt-iitd.in and @aic-iitd.in email addresses are allowed",
        variant: "destructive",
      });
      return false;
    }

    setIsCreating(true);
    
    try {
      console.log('Creating user via Supabase function:', { ...userData });
      
      const { data, error } = await supabase.rpc('admin_create_user', {
        user_email: userData.email.toLowerCase().trim(),
        user_name: userData.name,
        user_role: userData.role
      });

      if (error) {
        console.error('Supabase function error:', error);
        toast({
          title: "Error Creating User",
          description: error.message || 'Failed to create user',
          variant: "destructive",
        });
        return false;
      }

      const response = data as CreateUserResponse;
      
      if (response?.error) {
        console.error('User creation error:', response.error);
        toast({
          title: "Error Creating User",
          description: response.error,
          variant: "destructive",
        });
        return false;
      }

      console.log('User created successfully:', response);
      toast({
        title: "User Created Successfully",
        description: `User ${userData.email} created. Temporary password: ${response?.temporary_password}`,
        duration: 10000,
      });
      
      return true;
    } catch (error) {
      console.error('Unexpected error creating user:', error);
      toast({
        title: "Error Creating User",
        description: "An unexpected error occurred. Check the console for details.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsCreating(false);
    }
  };

  const createBulkUsers = async (users: CreateUserData[]): Promise<number> => {
    // Filter out invalid email domains before processing
    const validUsers = users.filter(user => {
      if (!validateEmailDomain(user.email)) {
        console.warn(`Skipping user with invalid email domain: ${user.email}`);
        return false;
      }
      return true;
    });

    if (validUsers.length === 0) {
      toast({
        title: "No Valid Users",
        description: "All users have invalid email domains. Only @fitt-iitd.in and @aic-iitd.in emails are allowed.",
        variant: "destructive",
      });
      return 0;
    }

    if (validUsers.length < users.length) {
      toast({
        title: "Invalid Emails Filtered",
        description: `${users.length - validUsers.length} users with invalid email domains were skipped.`,
        variant: "destructive",
      });
    }

    let successCount = 0;
    
    for (const user of validUsers) {
      const success = await createUser(user);
      if (success) {
        successCount++;
      }
      // Small delay between users to avoid overwhelming the system
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    return successCount;
  };

  return {
    createUser,
    createBulkUsers,
    isCreating,
    validateEmailDomain
  };
};
