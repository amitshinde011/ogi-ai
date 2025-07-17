-- Phase 1: Database Infrastructure for Automation System

-- Automation users table
CREATE TABLE public.automation_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  profile_photo_url TEXT,
  timezone TEXT NOT NULL DEFAULT 'UTC',
  cuisine_specialty TEXT[] DEFAULT '{}',
  persona_type TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Meal content library
CREATE TABLE public.automation_meal_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  cuisine_type TEXT NOT NULL,
  image_url TEXT NOT NULL,
  dietary_tags TEXT[] DEFAULT '{}',
  ingredients TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Caption templates
CREATE TABLE public.automation_captions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_text TEXT NOT NULL,
  meal_type TEXT NOT NULL,
  persona_type TEXT NOT NULL,
  variables TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comment templates
CREATE TABLE public.automation_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_text TEXT NOT NULL,
  comment_type TEXT NOT NULL CHECK (comment_type IN ('meal_identification', 'encouragement', 'nutritional_tip', 'cooking_tip')),
  context_tags TEXT[] DEFAULT '{}',
  persona_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bot activity tracking
CREATE TABLE public.automation_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  automation_user_id UUID REFERENCES public.automation_users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('post', 'like', 'comment')),
  target_post_id BIGINT REFERENCES public.posts(id) ON DELETE SET NULL,
  target_comment_id BIGINT REFERENCES public.comments(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on automation tables
ALTER TABLE public.automation_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_meal_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_captions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_activity_log ENABLE ROW LEVEL SECURITY;

-- RLS policies for automation tables (admin access only)
CREATE POLICY "Service role can manage automation users" ON public.automation_users FOR ALL USING (true);
CREATE POLICY "Service role can manage meal content" ON public.automation_meal_content FOR ALL USING (true);
CREATE POLICY "Service role can manage captions" ON public.automation_captions FOR ALL USING (true);
CREATE POLICY "Service role can manage comments" ON public.automation_comments FOR ALL USING (true);
CREATE POLICY "Service role can manage activity log" ON public.automation_activity_log FOR ALL USING (true);

-- Create indexes for performance
CREATE INDEX idx_automation_users_persona ON public.automation_users(persona_type);
CREATE INDEX idx_automation_users_timezone ON public.automation_users(timezone);
CREATE INDEX idx_meal_content_type ON public.automation_meal_content(meal_type, cuisine_type);
CREATE INDEX idx_captions_persona_meal ON public.automation_captions(persona_type, meal_type);
CREATE INDEX idx_comments_type_persona ON public.automation_comments(comment_type, persona_type);
CREATE INDEX idx_activity_log_user_date ON public.automation_activity_log(automation_user_id, created_at);

-- Create updated_at trigger for automation_users
CREATE TRIGGER update_automation_users_updated_at
  BEFORE UPDATE ON public.automation_users
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();