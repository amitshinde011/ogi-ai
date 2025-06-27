
-- Fix the comments table foreign key to reference auth.users instead of user_profiles
-- This will align with the RLS policies that use auth.uid()

-- First, drop the existing foreign key constraint
ALTER TABLE public.comments DROP CONSTRAINT IF EXISTS comments_user_id_fkey;

-- Add the correct foreign key constraint to reference auth.users
ALTER TABLE public.comments ADD CONSTRAINT comments_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Update the comments table to be NOT NULL for user_id since RLS depends on it
ALTER TABLE public.comments ALTER COLUMN user_id SET NOT NULL;
