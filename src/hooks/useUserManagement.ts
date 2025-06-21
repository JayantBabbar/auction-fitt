
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'bidder';
}

export const useUserManagement = () => {
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);

  const createUser = async (userData: CreateUserData): Promise<boolean> => {
    setIsCreating(true);
    
    try {
      console.log('Creating user:', { ...userData, password: '[HIDDEN]' });
      
      const response = await fetch('/functions/v1/create-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const result = await response.json();
      
      if (!response.ok) {
        console.error('Create user error:', result);
        toast({
          title: "Error Creating User",
          description: result.error || 'Failed to create user',
          variant: "destructive",
        });
        return false;
      }

      console.log('User created successfully:', result);
      toast({
        title: "User Created Successfully",
        description: `User ${userData.email} has been created with role ${userData.role}`,
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
      // Small delay to avoid overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    return successCount;
  };

  return {
    createUser,
    createBulkUsers,
    isCreating
  };
};
