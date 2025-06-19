
-- Create a table for user-specific saved recipes
CREATE TABLE public.user_saved_recipes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipe_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, recipe_id)
);

-- Add Row Level Security (RLS)
ALTER TABLE public.user_saved_recipes ENABLE ROW LEVEL SECURITY;

-- Create policy that allows users to view their own saved recipes
CREATE POLICY "Users can view their own saved recipes" 
  ON public.user_saved_recipes 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Create policy that allows users to insert their own saved recipes
CREATE POLICY "Users can save their own recipes" 
  ON public.user_saved_recipes 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create policy that allows users to delete their own saved recipes
CREATE POLICY "Users can delete their own saved recipes" 
  ON public.user_saved_recipes 
  FOR DELETE 
  USING (auth.uid() = user_id);
