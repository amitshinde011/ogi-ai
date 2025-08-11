-- Make refresh_community_feed_materialized_view safe if any legacy triggers still call it
CREATE OR REPLACE FUNCTION public.refresh_community_feed_materialized_view()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
BEGIN
  BEGIN
    REFRESH MATERIALIZED VIEW public.community_feed_view;
  EXCEPTION WHEN undefined_table THEN
    RAISE NOTICE 'refresh_community_feed_materialized_view: MV missing; skipping';
  END;
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Ensure refresh_community_feed_view() is a safe no-op when MV is absent
CREATE OR REPLACE FUNCTION public.refresh_community_feed_view()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
BEGIN
  BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY public.community_feed_view;
  EXCEPTION WHEN undefined_table THEN
    RAISE NOTICE 'refresh_community_feed_view: no-op (MV not present) at %', now();
  END;
END;
$$;

-- Recreate triggers for like counts and notifications (idempotent drops)
DROP TRIGGER IF EXISTS trg_likes_count_on_insert ON public.likes;
DROP TRIGGER IF EXISTS trg_likes_count_on_delete ON public.likes;
DROP TRIGGER IF EXISTS trg_like_notification ON public.likes;

CREATE TRIGGER trg_likes_count_on_insert
AFTER INSERT ON public.likes
FOR EACH ROW
EXECUTE FUNCTION public.handle_like_change();

CREATE TRIGGER trg_likes_count_on_delete
AFTER DELETE ON public.likes
FOR EACH ROW
EXECUTE FUNCTION public.handle_like_change();

CREATE TRIGGER trg_like_notification
AFTER INSERT ON public.likes
FOR EACH ROW
EXECUTE FUNCTION public.create_like_notification();

-- Recreate triggers for comment counts and notifications
DROP TRIGGER IF EXISTS trg_comments_count_on_insert ON public.comments;
DROP TRIGGER IF EXISTS trg_comments_count_on_delete ON public.comments;
DROP TRIGGER IF EXISTS trg_comment_notification ON public.comments;

CREATE TRIGGER trg_comments_count_on_insert
AFTER INSERT ON public.comments
FOR EACH ROW
EXECUTE FUNCTION public.handle_comment_change();

CREATE TRIGGER trg_comments_count_on_delete
AFTER DELETE ON public.comments
FOR EACH ROW
EXECUTE FUNCTION public.handle_comment_change();

CREATE TRIGGER trg_comment_notification
AFTER INSERT ON public.comments
FOR EACH ROW
EXECUTE FUNCTION public.create_comment_notification();