
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

  const createUser = async (userData: CreateUserData): Promise<boolean> => {
    setIsCreating(true);
    
    try {
      console.log('Creating user via Supabase function:', { ...userData });
      
      const { data, error } = await supabase.rpc('admin_create_user', {
        user_email: userData.email,
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
      
      if (response.error) {
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
        description: `User ${userData.email} created. Temporary password: ${response.temporary_password}`,
        duration: 10000, // Show longer so they can copy the password
      });
      
      return true;
    } catch (error) {
      console.error('Unexpected error creating user:', error);
      toast({
        title: "Error Creating User",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsCreating(false);
    }
  };

  const createBulkUsers = async (users: CreateUserData[]): Promise<number> => {
    let successCount = 0;
    
    for (const user of users) {
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
    isCreating
  };
};
