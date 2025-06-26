
-- Fix the trigger function for populating comment user info
CREATE OR REPLACE FUNCTION public.populate_comment_user_info()
RETURNS TRIGGER AS $$
BEGIN
  -- Fetch user profile information and populate the user fields
  SELECT 
    COALESCE(up.name, au.email, 'Unknown User') as user_name,
    COALESCE(up.profile_photo_url, 'https://api.dicebear.com/7.x/avataaars/svg?seed=' || NEW.user_id::text) as user_avatar
  INTO 
    NEW.user_name,
    NEW.user_avatar
  FROM auth.users au
  LEFT JOIN public.user_profiles up ON au.id = up.user_id
  WHERE au.id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger for comments
DROP TRIGGER IF EXISTS populate_comment_user_info_trigger ON public.community_post_comments;
CREATE TRIGGER populate_comment_user_info_trigger
  BEFORE INSERT ON public.community_post_comments
  FOR EACH ROW EXECUTE FUNCTION public.populate_comment_user_info();
