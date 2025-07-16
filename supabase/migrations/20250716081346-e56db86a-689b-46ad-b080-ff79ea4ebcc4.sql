-- Optimize get_community_feed function for better performance
CREATE OR REPLACE FUNCTION public.get_community_feed(p_user_id uuid, p_limit integer DEFAULT 10, p_offset integer DEFAULT 0)
 RETURNS TABLE(id bigint, image_url text, caption text, category character varying, created_at timestamp with time zone, like_count integer, comment_count integer, author_id uuid, author_name text, author_avatar text, user_has_liked boolean)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  RETURN QUERY
  WITH post_likes AS (
    -- Pre-compute user likes for better performance
    SELECT l.post_id, true as user_liked
    FROM likes l 
    WHERE l.user_id = p_user_id
  ),
  post_data AS (
    -- Main query with optimized joins
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
      COALESCE(up.profile_photo_url, 'https://api.dicebear.com/7.x/avataaars/svg?seed=' || p.author_id::text) as author_avatar,
      COALESCE(pl.user_liked, false) as user_has_liked
    FROM posts p
    LEFT JOIN user_profiles up ON up.user_id = p.author_id
    LEFT JOIN post_likes pl ON pl.post_id = p.id
    ORDER BY p.created_at DESC
    LIMIT p_limit
    OFFSET p_offset
  )
  SELECT pd.* FROM post_data pd;
END;
$function$;