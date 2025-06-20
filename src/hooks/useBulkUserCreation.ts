
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface User {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'bidder';
}

export const useBulkUserCreation = () => {
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);

  const createUserWithSupabase = async (user: User): Promise<boolean> => {
    try {
      // Create user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: user.email.trim().toLowerCase(),
        password: user.password,
        email_confirm: true,
        user_metadata: {
          name: user.name
        }
      });

      if (authError) {
        console.error('Auth error:', authError);
        return false;
      }

      // The profile will be created automatically by the trigger
      console.log(`✅ Created ${user.email} with ID: ${authData.user?.id}`);
      return true;
    } catch (error) {
      console.error('Error creating user:', error);
      return false;
    }
  };

  const handleBulkUserCreation = async (users: User[]) => {
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
      const success = await createUserWithSupabase(user);
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
    isCreating,
    handleBulkUserCreation
  };
};
