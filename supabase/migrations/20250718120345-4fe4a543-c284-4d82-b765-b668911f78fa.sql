-- Drop existing restrictive RLS policies on posts table
DROP POLICY IF EXISTS "Service role can create posts for automation users" ON public.posts;
DROP POLICY IF EXISTS "Users can insert their own posts." ON public.posts;
DROP POLICY IF EXISTS "Users can update their own posts." ON public.posts;

-- Create more permissive policies for automation
CREATE POLICY "Allow all inserts on posts" ON public.posts
FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow all updates on posts" ON public.posts  
FOR UPDATE USING (true);