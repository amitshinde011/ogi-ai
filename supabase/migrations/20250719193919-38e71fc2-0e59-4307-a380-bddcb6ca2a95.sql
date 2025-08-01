-- Create table for tracking user video watch status
CREATE TABLE public.user_video_watch_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  video_index INTEGER NOT NULL,
  watched BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Ensure one record per user per video
  UNIQUE(user_id, video_index)
);

-- Enable RLS
ALTER TABLE public.user_video_watch_status ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own watch status" 
ON public.user_video_watch_status 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own watch status" 
ON public.user_video_watch_status 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own watch status" 
ON public.user_video_watch_status 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own watch status" 
ON public.user_video_watch_status 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_user_video_watch_status_updated_at
BEFORE UPDATE ON public.user_video_watch_status
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();