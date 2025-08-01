-- Add RLS policies for posts table to allow automation posting
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Allow service role to insert automation posts
CREATE POLICY "Service role can insert automation posts" ON public.posts
  FOR INSERT
  WITH CHECK (true);

-- Allow service role to update posts
CREATE POLICY "Service role can update posts" ON public.posts
  FOR UPDATE
  USING (true);

-- Allow anyone to view posts
CREATE POLICY "Anyone can view posts" ON public.posts
  FOR SELECT
  USING (true);

-- Allow authenticated users to insert their own posts
CREATE POLICY "Users can insert their own posts" ON public.posts
  FOR INSERT
  WITH CHECK (auth.uid() = author_id);

-- Allow users to update their own posts
CREATE POLICY "Users can update their own posts" ON public.posts
  FOR UPDATE
  USING (auth.uid() = author_id);

-- Allow users to delete their own posts
CREATE POLICY "Users can delete their own posts" ON public.posts
  FOR DELETE
  USING (auth.uid() = author_id);