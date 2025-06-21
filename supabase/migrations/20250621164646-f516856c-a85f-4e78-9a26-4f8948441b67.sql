
-- Drop existing policies first, then create secure ones
-- Orders table policies (these were successfully created)

-- Community posts policies - drop existing and recreate
DROP POLICY IF EXISTS "Users can view all community posts" ON public.community_posts;
DROP POLICY IF EXISTS "Users can create their own posts" ON public.community_posts;
DROP POLICY IF EXISTS "Users can update their own posts" ON public.community_posts;
DROP POLICY IF EXISTS "Users can delete their own posts" ON public.community_posts;

-- Create secure policies for community posts
CREATE POLICY "Users can view all community posts" ON public.community_posts
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create their own posts" ON public.community_posts
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own posts" ON public.community_posts
  FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own posts" ON public.community_posts
  FOR DELETE
  USING (user_id = auth.uid());

-- Community post comments policies - drop existing and recreate
DROP POLICY IF EXISTS "Users can view all comments" ON public.community_post_comments;
DROP POLICY IF EXISTS "Users can create their own comments" ON public.community_post_comments;
DROP POLICY IF EXISTS "Users can update their own comments" ON public.community_post_comments;
DROP POLICY IF EXISTS "Users can delete their own comments" ON public.community_post_comments;

CREATE POLICY "Users can view all comments" ON public.community_post_comments
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create their own comments" ON public.community_post_comments
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own comments" ON public.community_post_comments
  FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own comments" ON public.community_post_comments
  FOR DELETE
  USING (user_id = auth.uid());

-- Community post likes policies - drop existing and recreate
DROP POLICY IF EXISTS "Users can view all likes" ON public.community_post_likes;
DROP POLICY IF EXISTS "Users can create their own likes" ON public.community_post_likes;
DROP POLICY IF EXISTS "Users can delete their own likes" ON public.community_post_likes;

CREATE POLICY "Users can view all likes" ON public.community_post_likes
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create their own likes" ON public.community_post_likes
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own likes" ON public.community_post_likes
  FOR DELETE
  USING (user_id = auth.uid());

-- Add RLS policies for other user-specific tables that might be missing
DROP POLICY IF EXISTS "Users can view their own profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update their own profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profiles" ON public.user_profiles;

CREATE POLICY "Users can view their own profiles" ON public.user_profiles
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their own profiles" ON public.user_profiles
  FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own profiles" ON public.user_profiles
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Add RLS policies for user onboarding
DROP POLICY IF EXISTS "Users can view their own onboarding" ON public.user_onboarding;
DROP POLICY IF EXISTS "Users can update their own onboarding" ON public.user_onboarding;

CREATE POLICY "Users can view their own onboarding" ON public.user_onboarding
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their own onboarding" ON public.user_onboarding
  FOR UPDATE
  USING (user_id = auth.uid());

-- Add RLS policies for wellness tracking tables
DROP POLICY IF EXISTS "Users can manage their own wellness data" ON public.daily_wellness;
CREATE POLICY "Users can manage their own wellness data" ON public.daily_wellness
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can manage their own steps data" ON public.steps_tracking;
CREATE POLICY "Users can manage their own steps data" ON public.steps_tracking
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can manage their own meal data" ON public.meal_tracking;
CREATE POLICY "Users can manage their own meal data" ON public.meal_tracking
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
