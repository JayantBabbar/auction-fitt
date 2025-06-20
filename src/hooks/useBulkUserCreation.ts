
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface User {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'bidder';
}

export const useBulkUserCreation = () => {
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);
  const [secretKey, setSecretKey] = useState('');

  const createUserWithClerk = async (user: User): Promise<boolean> => {
    try {
      const response = await fetch('/api/create-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          secretKey,
          user: {
            emailAddress: [user.email],
            password: user.password,
            firstName: user.name.split(' ')[0] || user.name,
            lastName: user.name.split(' ').slice(1).join(' ') || '',
            unsafeMetadata: {
              role: user.role
            }
          }
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('API error:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error creating user:', error);
      return false;
    }
  };

  const handleBulkUserCreation = async (users: User[]) => {
    if (!secretKey.startsWith('sk_')) {
      toast({
        title: "Invalid Secret Key",
        description: "Please enter a valid Clerk secret key (starts with 'sk_')",
        variant: "destructive",
      });
      return;
    }

    if (users.length === 0) {
      toast({
        title: "No Users to Create",
        description: "Please parse the CSV data first",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    let successCount = 0;
    let errorCount = 0;

    for (const user of users) {
      const success = await createUserWithClerk(user);
      if (success) {
        successCount++;
      } else {
        errorCount++;
      }
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    toast({
      title: "Bulk Creation Complete",
      description: `Created ${successCount} users successfully. ${errorCount} failed.`,
      variant: errorCount > 0 ? "destructive" : "default",
    });

    setIsCreating(false);
    return successCount > 0;
  };

  return {
    secretKey,
    setSecretKey,
    isCreating,
    handleBulkUserCreation
  };
};
