-- Create materialized view for community feed optimization
CREATE MATERIALIZED VIEW public.community_feed_view AS
SELECT 
  p.id,
  p.image_url,
  p.caption,
  p.category,
  p.created_at,
  p.like_count,
  p.comment_count,
  p.author_id,
  COALESCE(up.name, 'Unknown User') as author_name,
  COALESCE(up.profile_photo_url, 'https://api.dicebear.com/7.x/avataaars/svg?seed=' || p.author_id::text) as author_avatar
FROM posts p
LEFT JOIN user_profiles up ON up.user_id = p.author_id
ORDER BY p.created_at DESC;

-- Create unique index on the materialized view for better performance
CREATE UNIQUE INDEX idx_community_feed_view_id ON community_feed_view (id);
CREATE INDEX idx_community_feed_view_created_at ON community_feed_view (created_at DESC);
CREATE INDEX idx_community_feed_view_author_id ON community_feed_view (author_id);

-- Function to refresh community feed materialized view
CREATE OR REPLACE FUNCTION public.refresh_community_feed_view()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.community_feed_view;
  
  -- Log refresh completion
  RAISE NOTICE 'Community feed materialized view refreshed at %', now();
END;
$function$;

-- Optimized get_community_feed function using materialized view
CREATE OR REPLACE FUNCTION public.get_community_feed(p_user_id uuid, p_limit integer DEFAULT 10, p_offset integer DEFAULT 0)
 RETURNS TABLE(id bigint, image_url text, caption text, category character varying, created_at timestamp with time zone, like_count integer, comment_count integer, author_id uuid, author_name text, author_avatar text, user_has_liked boolean)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    cfv.id,
    cfv.image_url,
    cfv.caption,
    cfv.category,
    cfv.created_at,
    cfv.like_count,
    cfv.comment_count,
    cfv.author_id,
    cfv.author_name,
    cfv.author_avatar,
    EXISTS(SELECT 1 FROM likes l WHERE l.post_id = cfv.id AND l.user_id = p_user_id) as user_has_liked
  FROM community_feed_view cfv
  ORDER BY cfv.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$function$;

-- Function to trigger materialized view refresh on data changes
CREATE OR REPLACE FUNCTION public.trigger_community_feed_refresh()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  -- Use pg_notify to refresh in background to avoid blocking transactions
  PERFORM pg_notify('refresh_community_feed', 'refresh_needed');
  
  RETURN COALESCE(NEW, OLD);
END;
$function$;

-- Create triggers to refresh materialized view when data changes
CREATE OR REPLACE TRIGGER trigger_refresh_community_feed_on_posts
  AFTER INSERT OR UPDATE OR DELETE ON public.posts
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_community_feed_refresh();

CREATE OR REPLACE TRIGGER trigger_refresh_community_feed_on_user_profiles
  AFTER INSERT OR UPDATE OR DELETE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_community_feed_refresh();

-- Create a scheduled refresh function for periodic updates
CREATE OR REPLACE FUNCTION public.scheduled_community_feed_refresh()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  -- Only refresh if there have been recent changes
  IF EXISTS (
    SELECT 1 FROM posts 
    WHERE created_at > now() - INTERVAL '5 minutes'
    LIMIT 1
  ) OR EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE updated_at > now() - INTERVAL '5 minutes'
    LIMIT 1
  ) THEN
    PERFORM public.refresh_community_feed_view();
  END IF;
END;
$function$;