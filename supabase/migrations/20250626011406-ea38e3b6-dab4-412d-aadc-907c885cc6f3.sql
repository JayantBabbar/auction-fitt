
-- Create storage bucket for auction images
INSERT INTO storage.buckets (id, name, public)
VALUES ('auction-images', 'auction-images', true);

-- Create storage policies for the auction-images bucket
CREATE POLICY "Anyone can view auction images" ON storage.objects
FOR SELECT USING (bucket_id = 'auction-images');

CREATE POLICY "Authenticated users can upload auction images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'auction-images' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can update their own auction images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'auction-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own auction images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'auction-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Create a function to properly delete users (including auth.users)
CREATE OR REPLACE FUNCTION public.admin_delete_user(target_user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result json;
BEGIN
  -- Check if current user is admin
  IF NOT public.is_admin(auth.uid()) THEN
    RETURN json_build_object('success', false, 'error', 'Only admins can delete users');
  END IF;

  -- Delete from related tables first (cascade should handle most, but be explicit)
  DELETE FROM public.bids WHERE bidder_id = target_user_id;
  DELETE FROM public.temp_passwords WHERE user_id = target_user_id;
  DELETE FROM public.profiles WHERE id = target_user_id;
  
  -- Delete from auth.users (this requires admin privileges)
  DELETE FROM auth.users WHERE id = target_user_id;
  
  RETURN json_build_object(
    'success', true,
    'message', 'User deleted successfully'
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false, 
      'error', SQLERRM
    );
END;
$$;
