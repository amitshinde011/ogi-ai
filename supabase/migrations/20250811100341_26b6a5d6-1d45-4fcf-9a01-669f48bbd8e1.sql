-- Clean up duplicate like count triggers and fix inconsistent like_count values
-- 1) Drop ALL non-internal triggers on public.likes to avoid double increments
DO $$
DECLARE r record;
BEGIN
  FOR r IN 
    SELECT tgname 
    FROM pg_trigger 
    WHERE NOT tgisinternal 
      AND tgrelid = 'public.likes'::regclass
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS %I ON public.likes;', r.tgname);
  END LOOP;
END;$$;

-- 2) Re-create a SINGLE pair of triggers to maintain posts.like_count accurately
CREATE TRIGGER likes_count_ai
AFTER INSERT ON public.likes
FOR EACH ROW
EXECUTE FUNCTION public.update_post_like_count();

CREATE TRIGGER likes_count_ad
AFTER DELETE ON public.likes
FOR EACH ROW
EXECUTE FUNCTION public.update_post_like_count();

-- Notification trigger (doesn't touch counts)
CREATE TRIGGER like_notification_ai
AFTER INSERT ON public.likes
FOR EACH ROW
EXECUTE FUNCTION public.create_like_notification();

-- 3) Recalculate like_count from source-of-truth (public.likes)
UPDATE public.posts SET like_count = 0;

UPDATE public.posts p
SET like_count = c.cnt
FROM (
  SELECT post_id, COUNT(*)::int AS cnt
  FROM public.likes
  GROUP BY post_id
) c
WHERE p.id = c.post_id;
