-- First drop the existing function
DROP FUNCTION IF EXISTS public.get_community_feed(uuid, integer, integer);

-- Optimize community feed materialized view to include all necessary data in one call
DROP MATERIALIZED VIEW IF EXISTS public.community_feed_view;

-- Create enhanced materialized view with all post data including reports
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
  p.report_count,
  p.is_reported,
  p.report_threshold_reached,
  COALESCE(up.name, 'Unknown User') as author_name,
  COALESCE(up.profile_photo_url, 'https://api.dicebear.com/7.x/avataaars/svg?seed=' || p.author_id::text) as author_avatar
FROM posts p
LEFT JOIN user_profiles up ON up.user_id = p.author_id
WHERE p.report_threshold_reached = false  -- Only show posts that haven't reached report threshold
ORDER BY p.created_at DESC;

-- Create unique index on the materialized view for better performance
CREATE UNIQUE INDEX idx_community_feed_view_id ON community_feed_view (id);
CREATE INDEX idx_community_feed_view_created_at ON community_feed_view (created_at DESC);
CREATE INDEX idx_community_feed_view_author_id ON community_feed_view (author_id);

-- Create the updated get_community_feed function with all data in one call
CREATE OR REPLACE FUNCTION public.get_community_feed(p_user_id uuid, p_limit integer DEFAULT 10, p_offset integer DEFAULT 0)
 RETURNS TABLE(
   id bigint, 
   image_url text, 
   caption text, 
   category character varying, 
   created_at timestamp with time zone, 
   like_count integer, 
   comment_count integer, 
   author_id uuid, 
   author_name text, 
   author_avatar text, 
   user_has_liked boolean,
   report_count integer,
   is_reported boolean,
   report_threshold_reached boolean
 )
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
    EXISTS(SELECT 1 FROM likes l WHERE l.post_id = cfv.id AND l.user_id = p_user_id) as user_has_liked,
    cfv.report_count,
    cfv.is_reported,
    cfv.report_threshold_reached
  FROM community_feed_view cfv
  ORDER BY cfv.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$function$;