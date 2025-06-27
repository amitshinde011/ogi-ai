
-- Fix the posts table foreign key to reference auth.users instead of user_profiles
-- This will align with the RLS policies that use auth.uid()

-- First, drop the existing foreign key constraint
ALTER TABLE public.posts DROP CONSTRAINT IF EXISTS posts_user_id_fkey;

-- Add the correct foreign key constraint to reference auth.users
ALTER TABLE public.posts ADD CONSTRAINT posts_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Update the posts table to be NOT NULL for user_id since RLS depends on it
ALTER TABLE public.posts ALTER COLUMN user_id SET NOT NULL;
