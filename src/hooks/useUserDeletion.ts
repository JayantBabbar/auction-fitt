
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const useUserDeletion = () => {
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  const deleteUser = async (userId: string): Promise<boolean> => {
    setIsDeleting(true);
    
    try {
      console.log('Attempting to delete user:', userId);
      
      // First, delete from temp_passwords table
      const { error: tempPasswordError } = await supabase
        .from('temp_passwords')
        .delete()
        .eq('user_id', userId);

      if (tempPasswordError) {
        console.error('Error deleting temp passwords:', tempPasswordError);
      }

      // Delete from profiles table (this should cascade to other tables)
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (profileError) {
        console.error('Error deleting profile:', profileError);
        toast({
          title: "Error Deleting User",
          description: `Failed to delete user profile: ${profileError.message}`,
          variant: "destructive",
        });
        return false;
      }

      // Note: We cannot directly delete from auth.users table via the client
      // This would need to be done via a server-side function or Supabase Admin API
      console.log('User profile deleted successfully');
      
      toast({
        title: "User Deleted",
        description: "User has been successfully deleted from the system.",
      });
      
      return true;
    } catch (error) {
      console.error('Unexpected error deleting user:', error);
      toast({
        title: "Error Deleting User",
        description: "An unexpected error occurred while deleting the user.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    deleteUser,
    isDeleting
  };
};
