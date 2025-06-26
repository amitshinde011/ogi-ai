
-- Remove the title column from community_posts table as it's no longer needed
ALTER TABLE public.community_posts DROP COLUMN IF EXISTS title;

-- Add user_name and user_avatar columns to community_post_comments if they don't exist
-- (checking the schema, these columns already exist)

-- Ensure the community_posts table has the necessary columns for user info
-- (checking the schema, user_name and user_profile_picture_url already exist)

-- Add a trigger to ensure user info is always populated when creating posts
CREATE OR REPLACE FUNCTION public.populate_post_user_info()
RETURNS TRIGGER AS $$
BEGIN
  -- Fetch user profile information and populate the user fields
  SELECT 
    COALESCE(up.name, au.email, 'Unknown User') as user_name,
    up.profile_photo_url
  INTO 
    NEW.user_name,
    NEW.user_profile_picture_url
  FROM auth.users au
  LEFT JOIN public.user_profiles up ON au.id = up.user_id
  WHERE au.id = NEW.user_id;
  
  -- Generate fallback avatar if no profile photo exists
  IF NEW.user_profile_picture_url IS NULL THEN
    NEW.user_profile_picture_url := 'https://api.dicebear.com/7.x/avataaars/svg?seed=' || NEW.user_id::text;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for posts
DROP TRIGGER IF EXISTS populate_post_user_info_trigger ON public.community_posts;
CREATE TRIGGER populate_post_user_info_trigger
  BEFORE INSERT ON public.community_posts
  FOR EACH ROW EXECUTE FUNCTION public.populate_post_user_info();

-- Create similar function for comments
CREATE OR REPLACE FUNCTION public.populate_comment_user_info()
RETURNS TRIGGER AS $$
BEGIN
  -- Fetch user profile information and populate the user fields
  SELECT 
    COALESCE(up.name, au.email, 'Unknown User') as user_name,
    COALESCE(up.profile_photo_url, 'https://api.dicebear.com/7.x/avataaars/svg?seed=' || NEW.user_id::text)
  INTO 
    NEW.user_name,
    NEW.user_avatar
  FROM auth.users au
  LEFT JOIN public.user_profiles up ON au.id = up.user_id
  WHERE au.id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for comments
DROP TRIGGER IF EXISTS populate_comment_user_info_trigger ON public.community_post_comments;
CREATE TRIGGER populate_comment_user_info_trigger
  BEFORE INSERT ON public.community_post_comments
  FOR EACH ROW EXECUTE FUNCTION public.populate_comment_user_info();
