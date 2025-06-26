
-- Update community posts policies to allow public viewing
DROP POLICY IF EXISTS "Users can view all community posts" ON public.community_posts;
CREATE POLICY "Anyone can view community posts" ON public.community_posts
  FOR SELECT
  USING (true);

-- Update community post likes policies to allow public viewing and authenticated interactions
DROP POLICY IF EXISTS "Users can view all likes" ON public.community_post_likes;
CREATE POLICY "Anyone can view likes" ON public.community_post_likes
  FOR SELECT
  USING (true);

-- Update community post comments policies to allow public viewing
DROP POLICY IF EXISTS "Users can view all comments" ON public.community_post_comments;
CREATE POLICY "Anyone can view comments" ON public.community_post_comments
  FOR SELECT
  USING (true);

-- Enable realtime for immediate updates
ALTER TABLE public.community_posts REPLICA IDENTITY FULL;
ALTER TABLE public.community_post_likes REPLICA IDENTITY FULL;
ALTER TABLE public.community_post_comments REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.community_posts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.community_post_likes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.community_post_comments;
