BEGIN;

-- Followers v2 (auth user IDs)
DROP TABLE IF EXISTS public.followers_v2 CASCADE;
CREATE TABLE public.followers_v2 (
  follower_user_id uuid NOT NULL,
  following_user_id uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (follower_user_id, following_user_id)
);

ALTER TABLE public.followers_v2 ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "v2 Users can view all followers" ON public.followers_v2;
CREATE POLICY "v2 Users can view all followers" ON public.followers_v2
  FOR SELECT USING (true);
DROP POLICY IF EXISTS "v2 Users can follow" ON public.followers_v2;
CREATE POLICY "v2 Users can follow" ON public.followers_v2
  FOR INSERT WITH CHECK (auth.uid() = follower_user_id);
DROP POLICY IF EXISTS "v2 Users can unfollow" ON public.followers_v2;
CREATE POLICY "v2 Users can unfollow" ON public.followers_v2
  FOR DELETE USING (auth.uid() = follower_user_id);

CREATE INDEX IF NOT EXISTS idx_followers_v2_following_user ON public.followers_v2(following_user_id);
CREATE INDEX IF NOT EXISTS idx_followers_v2_follower_user ON public.followers_v2(follower_user_id);

-- Notifications v2 (auth user IDs)
DROP TABLE IF EXISTS public.notifications_v2 CASCADE;
CREATE TABLE public.notifications_v2 (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_user_id uuid NOT NULL,
  sender_user_id uuid NOT NULL,
  type text NOT NULL,
  post_id bigint,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.notifications_v2 ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "v2 Users can view their notifications" ON public.notifications_v2;
CREATE POLICY "v2 Users can view their notifications" ON public.notifications_v2
  FOR SELECT USING (recipient_user_id = auth.uid());
DROP POLICY IF EXISTS "v2 Users can mark read" ON public.notifications_v2;
CREATE POLICY "v2 Users can mark read" ON public.notifications_v2
  FOR UPDATE USING (recipient_user_id = auth.uid());
DROP POLICY IF EXISTS "v2 Allow insert notifications" ON public.notifications_v2;
CREATE POLICY "v2 Allow insert notifications" ON public.notifications_v2
  FOR INSERT WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_notifications_v2_recipient ON public.notifications_v2(recipient_user_id, is_read, created_at DESC);

-- Conversations v2
DROP TABLE IF EXISTS public.conversations_v2 CASCADE;
CREATE TABLE public.conversations_v2 (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.conversations_v2 ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "v2 Anyone can create conversations" ON public.conversations_v2;
CREATE POLICY "v2 Anyone can create conversations" ON public.conversations_v2
  FOR INSERT WITH CHECK (true);

DROP TABLE IF EXISTS public.conversation_participants_v2 CASCADE;
CREATE TABLE public.conversation_participants_v2 (
  conversation_id uuid NOT NULL REFERENCES public.conversations_v2(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  joined_at timestamptz DEFAULT now(),
  PRIMARY KEY (conversation_id, user_id)
);
ALTER TABLE public.conversation_participants_v2 ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "v2 View conversation participants" ON public.conversation_participants_v2;
CREATE POLICY "v2 View conversation participants" ON public.conversation_participants_v2
  FOR SELECT USING (
    user_id = auth.uid() OR conversation_id IN (
      SELECT conversation_id FROM public.conversation_participants_v2 WHERE user_id = auth.uid()
    )
  );
DROP POLICY IF EXISTS "v2 Join conversations" ON public.conversation_participants_v2;
CREATE POLICY "v2 Join conversations" ON public.conversation_participants_v2
  FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "v2 Users can view their conversations" ON public.conversations_v2;
CREATE POLICY "v2 Users can view their conversations" ON public.conversations_v2
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.conversation_participants_v2 cp
      WHERE cp.conversation_id = conversations_v2.id AND cp.user_id = auth.uid()
    )
  );

DROP TABLE IF EXISTS public.messages_v2 CASCADE;
CREATE TABLE public.messages_v2 (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.conversations_v2(id) ON DELETE CASCADE,
  sender_user_id uuid NOT NULL,
  message_text text NOT NULL,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.messages_v2 ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "v2 View messages" ON public.messages_v2;
CREATE POLICY "v2 View messages" ON public.messages_v2
  FOR SELECT USING (
    conversation_id IN (
      SELECT conversation_id FROM public.conversation_participants_v2 WHERE user_id = auth.uid()
    )
  );
DROP POLICY IF EXISTS "v2 Post messages" ON public.messages_v2;
CREATE POLICY "v2 Post messages" ON public.messages_v2
  FOR INSERT WITH CHECK (
    sender_user_id = auth.uid() AND conversation_id IN (
      SELECT conversation_id FROM public.conversation_participants_v2 WHERE user_id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS idx_messages_v2_conv_created ON public.messages_v2(conversation_id, created_at DESC);

-- Robustness: Unique constraints
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'likes_unique_user_post') THEN
    ALTER TABLE public.likes ADD CONSTRAINT likes_unique_user_post UNIQUE (post_id, user_id);
  END IF;
END $$;
CREATE INDEX IF NOT EXISTS idx_likes_post ON public.likes(post_id);
CREATE INDEX IF NOT EXISTS idx_likes_user ON public.likes(user_id);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'user_saved_recipes_unique') THEN
    ALTER TABLE public.user_saved_recipes ADD CONSTRAINT user_saved_recipes_unique UNIQUE (user_id, recipe_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'daily_wellness_unique_user_date') THEN
    ALTER TABLE public.daily_wellness ADD CONSTRAINT daily_wellness_unique_user_date UNIQUE (user_id, date);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'steps_tracking_unique_user_date') THEN
    ALTER TABLE public.steps_tracking ADD CONSTRAINT steps_tracking_unique_user_date UNIQUE (user_id, date);
  END IF;
END $$;

-- Post counters via triggers
DROP TRIGGER IF EXISTS trg_handle_like_change ON public.likes;
CREATE TRIGGER trg_handle_like_change
AFTER INSERT OR DELETE ON public.likes
FOR EACH ROW EXECUTE FUNCTION public.handle_like_change();

DROP TRIGGER IF EXISTS trg_update_comment_count ON public.comments;
CREATE TRIGGER trg_update_comment_count
AFTER INSERT OR DELETE ON public.comments
FOR EACH ROW EXECUTE FUNCTION public.update_comment_count();

-- Materialized view refresh triggers
DROP TRIGGER IF EXISTS trg_refresh_views_meals ON public.meal_tracking;
CREATE TRIGGER trg_refresh_views_meals
AFTER INSERT OR UPDATE OR DELETE ON public.meal_tracking
FOR EACH ROW EXECUTE FUNCTION public.trigger_refresh_views();

DROP TRIGGER IF EXISTS trg_refresh_views_wellness ON public.daily_wellness;
CREATE TRIGGER trg_refresh_views_wellness
AFTER INSERT OR UPDATE OR DELETE ON public.daily_wellness
FOR EACH ROW EXECUTE FUNCTION public.trigger_refresh_views();

DROP TRIGGER IF EXISTS trg_refresh_views_steps ON public.steps_tracking;
CREATE TRIGGER trg_refresh_views_steps
AFTER INSERT OR UPDATE OR DELETE ON public.steps_tracking
FOR EACH ROW EXECUTE FUNCTION public.trigger_refresh_views();

DROP TRIGGER IF EXISTS trg_posts_refresh ON public.posts;
CREATE TRIGGER trg_posts_refresh
AFTER INSERT OR UPDATE OR DELETE ON public.posts
FOR EACH ROW EXECUTE FUNCTION public.trigger_posts_refresh();

DROP TRIGGER IF EXISTS trg_notifications_refresh ON public.notifications;
CREATE TRIGGER trg_notifications_refresh
AFTER INSERT OR UPDATE OR DELETE ON public.notifications
FOR EACH ROW EXECUTE FUNCTION public.trigger_notifications_refresh();

-- Harden SECURITY DEFINER functions with search_path
ALTER FUNCTION public.refresh_activity_views() SECURITY DEFINER;
ALTER FUNCTION public.refresh_activity_views() SET search_path = public, pg_temp;

ALTER FUNCTION public.refresh_activity_views_batch() SECURITY DEFINER;
ALTER FUNCTION public.refresh_activity_views_batch() SET search_path = public, pg_temp;

ALTER FUNCTION public.get_community_feed(uuid, integer, integer) SECURITY DEFINER;
ALTER FUNCTION public.get_community_feed(uuid, integer, integer) SET search_path = public, pg_temp;

ALTER FUNCTION public.refresh_notifications_view() SECURITY DEFINER;
ALTER FUNCTION public.refresh_notifications_view() SET search_path = public, pg_temp;

ALTER FUNCTION public.refresh_posts_view() SECURITY DEFINER;
ALTER FUNCTION public.refresh_posts_view() SET search_path = public, pg_temp;

ALTER FUNCTION public.trigger_notifications_refresh() SECURITY DEFINER;
ALTER FUNCTION public.trigger_notifications_refresh() SET search_path = public, pg_temp;

ALTER FUNCTION public.trigger_posts_refresh() SECURITY DEFINER;
ALTER FUNCTION public.trigger_posts_refresh() SET search_path = public, pg_temp;

ALTER FUNCTION public.refresh_community_feed_view() SECURITY DEFINER;
ALTER FUNCTION public.refresh_community_feed_view() SET search_path = public, pg_temp;

ALTER FUNCTION public.trigger_community_feed_refresh() SECURITY DEFINER;
ALTER FUNCTION public.trigger_community_feed_refresh() SET search_path = public, pg_temp;

ALTER FUNCTION public.trigger_refresh_views() SECURITY DEFINER;
ALTER FUNCTION public.trigger_refresh_views() SET search_path = public, pg_temp;

-- updated_at trigger for user_profiles
DROP TRIGGER IF EXISTS trg_user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER trg_user_profiles_updated_at
BEFORE UPDATE ON public.user_profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

COMMIT;