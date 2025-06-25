
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

  const validateEmailDomain = (email: string): boolean => {
    return email.toLowerCase().endsWith('@fitt-iitd.in');
  };

  const createUserWithSupabase = async (user: User): Promise<boolean> => {
    // Client-side email validation
    if (!validateEmailDomain(user.email)) {
      console.error(`Invalid email domain for ${user.email}. Only @fitt-iitd.in emails are allowed.`);
      return false;
    }

    try {
      console.log(`Attempting to create user: ${user.email}`);
      
      // Create user in Supabase Auth using the service role key
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: user.email.trim().toLowerCase(),
        password: user.password,
        email_confirm: true,
        user_metadata: {
          name: user.name,
          role: user.role
        }
      });

      if (authError) {
        console.error(`Auth error for ${user.email}:`, authError);
        
        // Check for specific error types
        if (authError.message?.includes('User already registered')) {
          console.log(`User ${user.email} already exists, skipping...`);
          return true; // Consider existing users as success
        }
        
        return false;
      }

      if (!authData.user) {
        console.error(`No user data returned for ${user.email}`);
        return false;
      }

      console.log(`✅ Successfully created ${user.email} with ID: ${authData.user.id}`);
      return true;
    } catch (error) {
      console.error(`Unexpected error creating user ${user.email}:`, error);
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
      return false;
    }

    // Filter out users with invalid email domains
    const validUsers = users.filter(user => {
      if (!validateEmailDomain(user.email)) {
        console.warn(`Filtering out user with invalid email domain: ${user.email}`);
        return false;
      }
      return true;
    });

    if (validUsers.length === 0) {
      toast({
        title: "No Valid Users",
        description: "All users have invalid email domains. Only @fitt-iitd.in emails are allowed.",
        variant: "destructive",
      });
      return false;
    }

    if (validUsers.length < users.length) {
      toast({
        title: "Invalid Emails Filtered",
        description: `${users.length - validUsers.length} users with invalid email domains were filtered out.`,
        variant: "destructive",
      });
    }

    console.log(`Starting bulk creation of ${validUsers.length} valid users...`);
    setIsCreating(true);
    
    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    try {
      for (let i = 0; i < validUsers.length; i++) {
        const user = validUsers[i];
        console.log(`Processing user ${i + 1}/${validUsers.length}: ${user.email}`);
        
        const success = await createUserWithSupabase(user);
        if (success) {
          successCount++;
        } else {
          errorCount++;
          errors.push(`Failed to create: ${user.email}`);
        }
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 300));
      }

      console.log(`Bulk creation completed. Success: ${successCount}, Errors: ${errorCount}`);

      // Show detailed results
      if (errorCount > 0) {
        console.error('Failed users:', errors.slice(0, 5)); // Log first 5 errors
        toast({
          title: "Bulk Creation Completed with Errors",
          description: `Created ${successCount} users successfully. ${errorCount} failed. Check console for details.`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Bulk Creation Successful",
          description: `Successfully created all ${successCount} users!`,
        });
      }

      return successCount > 0;
    } catch (error) {
      console.error('Bulk creation process failed:', error);
      toast({
        title: "Bulk Creation Failed",
        description: "An unexpected error occurred during bulk creation. Check console for details.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsCreating(false);
    }
  };

  return {
    isCreating,
    handleBulkUserCreation,
    validateEmailDomain
  };
};
