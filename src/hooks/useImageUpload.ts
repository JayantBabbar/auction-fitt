
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export const useImageUpload = () => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      setUploading(true);
      
      // Validate file type and size
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Invalid file type. Only JPEG, PNG, and WebP images are allowed.');
      }
      
      // Limit file size to 5MB
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('File size must be less than 5MB.');
      }

      // For now, create a local URL for the image
      // In a real implementation, you would upload to Supabase Storage
      const imageUrl = URL.createObjectURL(file);
      
      console.log('Image uploaded successfully:', imageUrl);
      return imageUrl;
      
    } catch (error) {
      console.error('Image upload failed:', error);
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Failed to upload image",
        variant: "destructive",
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  return {
    uploadImage,
    uploading
  };
};
