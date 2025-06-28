
-- First, let's clean up any orphaned posts that don't have valid user references
DELETE FROM public.posts 
WHERE user_id NOT IN (SELECT id FROM auth.users);

-- Clean up orphaned likes as well
DELETE FROM public.likes 
WHERE user_id NOT IN (SELECT id FROM auth.users);

-- Clean up orphaned meal tracking records
DELETE FROM public.meal_tracking 
WHERE user_id NOT IN (SELECT id FROM auth.users);

-- Now fix the posts table foreign key to reference auth.users instead of user_profiles
ALTER TABLE public.posts DROP CONSTRAINT IF EXISTS posts_user_id_fkey;
ALTER TABLE public.posts ADD CONSTRAINT posts_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Fix the likes table to reference auth.users
ALTER TABLE public.likes DROP CONSTRAINT IF EXISTS likes_user_id_fkey;
ALTER TABLE public.likes ADD CONSTRAINT likes_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Fix the meal_tracking table as well
ALTER TABLE public.meal_tracking DROP CONSTRAINT IF EXISTS meal_tracking_user_id_fkey;
ALTER TABLE public.meal_tracking ADD CONSTRAINT meal_tracking_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
