
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface AdminDeleteUserResponse {
  success: boolean;
  error?: string;
  message?: string;
}

export const useUserDeletion = () => {
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  const deleteUser = async (userId: string): Promise<boolean> => {
    setIsDeleting(true);
    
    try {
      console.log('Attempting to delete user via admin function:', userId);
      
      // Use the new admin delete function
      const { data, error } = await supabase.rpc('admin_delete_user', {
        target_user_id: userId
      });

      if (error) {
        console.error('Error calling admin_delete_user:', error);
        toast({
          title: "Error Deleting User",
          description: `Failed to delete user: ${error.message}`,
          variant: "destructive",
        });
        return false;
      }

      // Type assertion and validation for the response
      const response = data as AdminDeleteUserResponse;
      
      // Check the response from the function
      if (response && !response.success) {
        console.error('Admin delete function returned error:', response.error);
        toast({
          title: "Error Deleting User",
          description: `Failed to delete user: ${response.error}`,
          variant: "destructive",
        });
        return false;
      }

      console.log('User deleted successfully via admin function');
      
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
