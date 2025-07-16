-- Create post_reports table
CREATE TABLE public.post_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id BIGINT NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL DEFAULT 'other',
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(post_id, reporter_id)
);

-- Add report tracking columns to posts table
ALTER TABLE public.posts 
ADD COLUMN report_count INTEGER NOT NULL DEFAULT 0,
ADD COLUMN is_reported BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN report_threshold_reached BOOLEAN NOT NULL DEFAULT false;

-- Enable RLS on post_reports
ALTER TABLE public.post_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies for post_reports
CREATE POLICY "Users can insert their own reports" 
ON public.post_reports FOR INSERT 
WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Users can view all reports" 
ON public.post_reports FOR SELECT 
USING (true);

-- Function to update report count
CREATE OR REPLACE FUNCTION public.update_post_report_count()
RETURNS TRIGGER AS $$
DECLARE
  report_threshold INTEGER := 3; -- Configurable threshold
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.posts 
    SET 
      report_count = report_count + 1,
      is_reported = true,
      report_threshold_reached = (report_count + 1) >= report_threshold
    WHERE id = NEW.post_id;
    
    -- Hide post if threshold reached
    IF (SELECT report_count FROM public.posts WHERE id = NEW.post_id) >= report_threshold THEN
      -- Mark post as hidden instead of deleting
      UPDATE public.posts 
      SET report_threshold_reached = true 
      WHERE id = NEW.post_id;
    END IF;
    
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.posts 
    SET 
      report_count = GREATEST(0, report_count - 1),
      is_reported = (report_count - 1) > 0,
      report_threshold_reached = (report_count - 1) >= report_threshold
    WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for report count updates
CREATE TRIGGER trigger_update_post_report_count
  AFTER INSERT OR DELETE ON public.post_reports
  FOR EACH ROW
  EXECUTE FUNCTION public.update_post_report_count();

-- Update community feed view to exclude reported posts
DROP MATERIALIZED VIEW IF EXISTS public.community_feed_view;
CREATE MATERIALIZED VIEW public.community_feed_view AS
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
  COALESCE(up.profile_photo_url, 'https://api.dicebear.com/7.x/avataaars/svg?seed=' || p.author_id::text) as author_avatar
FROM public.posts p
LEFT JOIN public.user_profiles up ON p.author_id = up.user_id
WHERE p.report_threshold_reached = false  -- Exclude heavily reported posts
ORDER BY p.created_at DESC;

-- Create index on report_threshold_reached for performance
CREATE INDEX idx_posts_report_threshold ON public.posts(report_threshold_reached);
CREATE INDEX idx_post_reports_post_id ON public.post_reports(post_id);
CREATE INDEX idx_post_reports_reporter_id ON public.post_reports(reporter_id);