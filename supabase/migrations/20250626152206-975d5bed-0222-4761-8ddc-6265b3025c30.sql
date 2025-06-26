
-- Add columns to store user name and profile picture URL directly on community posts
ALTER TABLE public.community_posts 
ADD COLUMN user_name TEXT,
ADD COLUMN user_profile_picture_url TEXT;

-- Update existing posts to populate the new fields from user profiles
UPDATE public.community_posts 
SET 
  user_name = COALESCE(up.name, 'Anonymous User'),
  user_profile_picture_url = up.profile_photo_url
FROM public.user_profiles up 
WHERE public.community_posts.user_id = up.user_id;
