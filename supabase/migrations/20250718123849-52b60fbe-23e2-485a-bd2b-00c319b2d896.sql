-- Remove all RLS policies from posts table
DROP POLICY IF EXISTS "Public posts are viewable by everyone." ON public.posts;
DROP POLICY IF EXISTS "Service role can create posts for automation users" ON public.posts;
DROP POLICY IF EXISTS "Service role can read all posts" ON public.posts;
DROP POLICY IF EXISTS "Users can delete their own posts." ON public.posts;
DROP POLICY IF EXISTS "Users can insert their own posts." ON public.posts;
DROP POLICY IF EXISTS "Users can update their own posts." ON public.posts;
DROP POLICY IF EXISTS "Allow all inserts on posts" ON public.posts;
DROP POLICY IF EXISTS "Allow all updates on posts" ON public.posts;
DROP POLICY IF EXISTS "Allow all authenticated updates on posts" ON public.posts;

-- Disable RLS entirely on posts table
ALTER TABLE public.posts DISABLE ROW LEVEL SECURITY;