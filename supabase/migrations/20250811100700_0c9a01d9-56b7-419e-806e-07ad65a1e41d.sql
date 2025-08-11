-- Normalize comment_count and ensure a single correct trigger set on comments
-- 1) Drop any existing non-internal triggers on public.comments (safety)
DO $$
DECLARE r record;
BEGIN
  FOR r IN 
    SELECT tgname 
    FROM pg_trigger 
    WHERE NOT tgisinternal 
      AND tgrelid = 'public.comments'::regclass
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS %I ON public.comments;', r.tgname);
  END LOOP;
END;$$;

-- 2) Create only the required triggers
CREATE TRIGGER comments_count_ai
AFTER INSERT ON public.comments
FOR EACH ROW
EXECUTE FUNCTION public.update_post_comment_count();

CREATE TRIGGER comments_count_ad
AFTER DELETE ON public.comments
FOR EACH ROW
EXECUTE FUNCTION public.update_post_comment_count();

CREATE TRIGGER comment_notification_ai
AFTER INSERT ON public.comments
FOR EACH ROW
EXECUTE FUNCTION public.create_comment_notification();

-- 3) Recalculate posts.comment_count from source table
UPDATE public.posts SET comment_count = 0;

UPDATE public.posts p
SET comment_count = c.cnt
FROM (
  SELECT post_id, COUNT(*)::int AS cnt
  FROM public.comments
  GROUP BY post_id
) c
WHERE p.id = c.post_id;