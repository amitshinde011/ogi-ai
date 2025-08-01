-- Drop the existing update policy and create a more permissive one
DROP POLICY IF EXISTS "Allow all updates on posts" ON public.posts;

-- Create completely permissive policy for updates
CREATE POLICY "Allow all authenticated updates on posts" ON public.posts
FOR UPDATE TO authenticated
USING (true)
WITH CHECK (true);