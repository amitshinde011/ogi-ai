-- Update get_community_feed function to include user report status
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
   report_threshold_reached boolean,
   user_has_reported boolean
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
    cfv.report_threshold_reached,
    EXISTS(SELECT 1 FROM post_reports pr WHERE pr.post_id = cfv.id AND pr.reporter_id = p_user_id) as user_has_reported
  FROM community_feed_view cfv
  ORDER BY cfv.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$function$;