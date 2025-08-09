-- Optimization & trigger setup migration (safe for test data)
-- 1) Deduplicate potential duplicates to allow unique constraints
DO $$ BEGIN
  -- likes (user_id, post_id)
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='likes') THEN
    DELETE FROM public.likes l
    USING public.likes l2
    WHERE l.ctid < l2.ctid AND l.user_id = l2.user_id AND l.post_id = l2.post_id;
  END IF;
END $$;

DO $$ BEGIN
  -- followers (follower_user_id, following_user_id)
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='followers') THEN
    DELETE FROM public.followers f
    USING public.followers f2
    WHERE f.ctid < f2.ctid AND f.follower_user_id = f2.follower_user_id AND f.following_user_id = f2.following_user_id;
  END IF;
END $$;

DO $$ BEGIN
  -- user_saved_recipes (user_id, recipe_id)
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='user_saved_recipes') THEN
    DELETE FROM public.user_saved_recipes a
    USING public.user_saved_recipes b
    WHERE a.ctid < b.ctid AND a.user_id = b.user_id AND a.recipe_id = b.recipe_id;
  END IF;
END $$;

DO $$ BEGIN
  -- user_profiles (user_id) keep one per user
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='user_profiles') THEN
    DELETE FROM public.user_profiles a
    USING public.user_profiles b
    WHERE a.ctid < b.ctid AND a.user_id = b.user_id;
  END IF;
END $$;

-- 2) Unique constraints (guarded)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'likes_user_post_unique'
  ) THEN
    ALTER TABLE public.likes
    ADD CONSTRAINT likes_user_post_unique UNIQUE (user_id, post_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'followers_pair_unique'
  ) THEN
    ALTER TABLE public.followers
    ADD CONSTRAINT followers_pair_unique UNIQUE (follower_user_id, following_user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'user_saved_recipes_unique'
  ) THEN
    ALTER TABLE public.user_saved_recipes
    ADD CONSTRAINT user_saved_recipes_unique UNIQUE (user_id, recipe_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'user_profiles_user_unique'
  ) THEN
    ALTER TABLE public.user_profiles
    ADD CONSTRAINT user_profiles_user_unique UNIQUE (user_id);
  END IF;
END $$;

-- 3) Performance indexes (IF NOT EXISTS)
-- posts
CREATE INDEX IF NOT EXISTS idx_posts_created_at_desc ON public.posts (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_author_id ON public.posts (author_id);
CREATE INDEX IF NOT EXISTS idx_posts_visible_created_at ON public.posts (created_at DESC) WHERE report_threshold_reached = false;

-- comments
CREATE INDEX IF NOT EXISTS idx_comments_post_created_at ON public.comments (post_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_author_created_at ON public.comments (author_id, created_at DESC);

-- likes
CREATE INDEX IF NOT EXISTS idx_likes_post_id ON public.likes (post_id);
CREATE INDEX IF NOT EXISTS idx_likes_user_id ON public.likes (user_id);

-- notifications
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_created ON public.notifications (recipient_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON public.notifications (recipient_user_id, is_read, created_at DESC) WHERE is_read = false;

-- activity tables
CREATE INDEX IF NOT EXISTS idx_meal_user_date ON public.meal_tracking (user_id, date);
CREATE INDEX IF NOT EXISTS idx_meal_user_date_type ON public.meal_tracking (user_id, date, meal_type);
CREATE INDEX IF NOT EXISTS idx_dw_user_date ON public.daily_wellness (user_id, date);
CREATE INDEX IF NOT EXISTS idx_steps_user_date ON public.steps_tracking (user_id, date);

-- social graph
CREATE INDEX IF NOT EXISTS idx_followers_following ON public.followers (following_user_id);
CREATE INDEX IF NOT EXISTS idx_followers_follower ON public.followers (follower_user_id);

-- 4) Realtime safety: ensure FULL replica identity on hot tables (helps stable realtime payloads)
ALTER TABLE public.posts REPLICA IDENTITY FULL;
ALTER TABLE public.comments REPLICA IDENTITY FULL;
ALTER TABLE public.likes REPLICA IDENTITY FULL;
ALTER TABLE public.notifications REPLICA IDENTITY FULL;

-- 5) Counter & refresh triggers (drop-if-exists then create)
-- likes -> posts.like_count
DROP TRIGGER IF EXISTS trg_likes_after_insert ON public.likes;
DROP TRIGGER IF EXISTS trg_likes_after_delete ON public.likes;
CREATE TRIGGER trg_likes_after_insert
AFTER INSERT ON public.likes
FOR EACH ROW EXECUTE FUNCTION public.handle_like_change();
CREATE TRIGGER trg_likes_after_delete
AFTER DELETE ON public.likes
FOR EACH ROW EXECUTE FUNCTION public.handle_like_change();

-- comments -> posts.comment_count
DROP TRIGGER IF EXISTS trg_comments_after_insert ON public.comments;
DROP TRIGGER IF EXISTS trg_comments_after_delete ON public.comments;
CREATE TRIGGER trg_comments_after_insert
AFTER INSERT ON public.comments
FOR EACH ROW EXECUTE FUNCTION public.update_comment_count();
CREATE TRIGGER trg_comments_after_delete
AFTER DELETE ON public.comments
FOR EACH ROW EXECUTE FUNCTION public.update_comment_count();

-- refresh/notify routines (lightweight NOTIFY-based)
-- posts -> community feed refresh notifier
DROP TRIGGER IF EXISTS trg_posts_refresh_feed ON public.posts;
CREATE TRIGGER trg_posts_refresh_feed
AFTER INSERT OR UPDATE OR DELETE ON public.posts
FOR EACH ROW EXECUTE FUNCTION public.trigger_community_feed_refresh();

-- posts -> posts_with_author view refresh notifier
DROP TRIGGER IF EXISTS trg_posts_refresh_view ON public.posts;
CREATE TRIGGER trg_posts_refresh_view
AFTER INSERT OR UPDATE OR DELETE ON public.posts
FOR EACH ROW EXECUTE FUNCTION public.trigger_posts_refresh();

-- notifications -> notifications_with_sender view refresh notifier
DROP TRIGGER IF EXISTS trg_notifications_refresh_view ON public.notifications;
CREATE TRIGGER trg_notifications_refresh_view
AFTER INSERT OR UPDATE OR DELETE ON public.notifications
FOR EACH ROW EXECUTE FUNCTION public.trigger_notifications_refresh();

-- 6) updated_at automation for key tables (idempotent)
-- function exists: public.update_updated_at_column()
DROP TRIGGER IF EXISTS trg_meal_updated_at ON public.meal_tracking;
CREATE TRIGGER trg_meal_updated_at
BEFORE UPDATE ON public.meal_tracking
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_dw_updated_at ON public.daily_wellness;
CREATE TRIGGER trg_dw_updated_at
BEFORE UPDATE ON public.daily_wellness
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_steps_updated_at ON public.steps_tracking;
CREATE TRIGGER trg_steps_updated_at
BEFORE UPDATE ON public.steps_tracking
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER trg_profiles_updated_at
BEFORE UPDATE ON public.user_profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 7) Keep compatibility for edge function: ensure refresh_community_feed_view() exists and is safe
-- If the materialized view does not exist in this environment, redefine function to no-op rather than error
DO $$ BEGIN
  -- Try to refresh; if view is missing, replace the function with a no-op that just logs a NOTICE
  PERFORM 1 FROM pg_matviews WHERE schemaname = 'public' AND matviewname = 'community_feed_view';
  IF NOT FOUND THEN
    CREATE OR REPLACE FUNCTION public.refresh_community_feed_view()
    RETURNS void
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path TO 'public', 'pg_temp'
    AS $$
    BEGIN
      RAISE NOTICE 'refresh_community_feed_view: no-op (community_feed_view MV not present) at %', now();
    END;
    $$;
  END IF;
END $$;
