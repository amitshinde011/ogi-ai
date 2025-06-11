
-- Create a table for recipes
CREATE TABLE public.recipes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  package TEXT,
  category TEXT NOT NULL,
  details TEXT,
  image_url TEXT,
  cook_time TEXT,
  servings INTEGER DEFAULT 2,
  difficulty TEXT DEFAULT 'Easy',
  rating DECIMAL(2,1) DEFAULT 4.5,
  ingredients TEXT[],
  instructions TEXT[],
  nutrition JSONB,
  tips TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS)
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;

-- Create policy that allows everyone to read recipes (public access)
CREATE POLICY "Anyone can view recipes" 
  ON public.recipes 
  FOR SELECT 
  TO PUBLIC
  USING (true);

-- Create policy that allows authenticated users to insert recipes
CREATE POLICY "Authenticated users can create recipes" 
  ON public.recipes 
  FOR INSERT 
  TO authenticated
  WITH CHECK (true);

-- Create policy that allows authenticated users to update recipes
CREATE POLICY "Authenticated users can update recipes" 
  ON public.recipes 
  FOR UPDATE 
  TO authenticated
  USING (true);

-- Create policy that allows authenticated users to delete recipes
CREATE POLICY "Authenticated users can delete recipes" 
  ON public.recipes 
  FOR DELETE 
  TO authenticated
  USING (true);
