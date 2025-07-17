-- Update get_community_feed function to include automation posts
DROP FUNCTION IF EXISTS public.get_community_feed(uuid, integer, integer);

CREATE OR REPLACE FUNCTION public.get_community_feed(
  p_user_id uuid,
  p_limit integer DEFAULT 10,
  p_offset integer DEFAULT 0
)
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
  report_threshold_reached boolean,
  user_has_reported boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.image_url,
    p.caption,
    p.category,
    p.created_at,
    p.like_count,
    p.comment_count,
    p.author_id,
    COALESCE(up.name, au.name, 'Anonymous User') as author_name,
    COALESCE(up.profile_photo_url, au.profile_photo_url, 'https://api.dicebear.com/7.x/avataaars/svg?seed=' || p.author_id::text) as author_avatar,
    EXISTS(SELECT 1 FROM likes l WHERE l.post_id = p.id AND l.user_id = p_user_id) as user_has_liked,
    p.report_count,
    p.is_reported,
    p.report_threshold_reached,
    EXISTS(SELECT 1 FROM post_reports pr WHERE pr.post_id = p.id AND pr.reporter_id = p_user_id) as user_has_reported
  FROM posts p
  LEFT JOIN user_profiles up ON p.author_id = up.user_id
  LEFT JOIN automation_users au ON p.author_id = au.user_id
  WHERE p.report_threshold_reached = false
  ORDER BY p.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$function$;