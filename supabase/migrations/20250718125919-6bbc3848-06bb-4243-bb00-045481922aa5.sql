-- Fix storage policies to allow admin access

-- Drop existing restrictive policies if they exist
DROP POLICY IF EXISTS "Service role can manage bot posts" ON storage.objects;
DROP POLICY IF EXISTS "Service role can access bot posts" ON storage.objects;

-- Create comprehensive admin access policies for bot-posts bucket
CREATE POLICY "Admins can manage all bot-posts storage" 
ON storage.objects 
FOR ALL 
USING (bucket_id = 'bot-posts' AND public.has_role(auth.uid(), 'admin'))
WITH CHECK (bucket_id = 'bot-posts' AND public.has_role(auth.uid(), 'admin'));

-- Allow service role full access (for automation functions)
CREATE POLICY "Service role can manage bot-posts" 
ON storage.objects 
FOR ALL 
USING (bucket_id = 'bot-posts');

-- Also ensure the bucket allows public access for reading converted images
UPDATE storage.buckets 
SET public = true 
WHERE id = 'bot-posts';