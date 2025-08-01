-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Service role can insert automation posts" ON public.posts;
DROP POLICY IF EXISTS "Users can insert their own posts" ON public.posts;
DROP POLICY IF EXISTS "Service role can update posts" ON public.posts;
DROP POLICY IF EXISTS "Users can update their own posts" ON public.posts;

-- Create simplified policies that work for both service role and authenticated users
CREATE POLICY "Allow inserts for posts" ON public.posts
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow updates for post owners or service role" ON public.posts
  FOR UPDATE
  USING (auth.uid() = author_id OR auth.role() = 'service_role');

-- Refresh the materialized view to ensure new posts appear
REFRESH MATERIALIZED VIEW community_feed_view;