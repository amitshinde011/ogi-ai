-- Database Performance Optimization Migration (Fixed)

-- 1. Add missing indexes for frequently queried columns
CREATE INDEX IF NOT EXISTS idx_meal_tracking_user_date 
ON meal_tracking(user_id, date);

CREATE INDEX IF NOT EXISTS idx_meal_tracking_date_meal_type 
ON meal_tracking(date, meal_type);

CREATE INDEX IF NOT EXISTS idx_daily_wellness_user_date 
ON daily_wellness(user_id, date);

CREATE INDEX IF NOT EXISTS idx_steps_tracking_user_date 
ON steps_tracking(user_id, date);

CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_status 
ON user_subscriptions(user_id, status);

CREATE INDEX IF NOT EXISTS idx_user_subscriptions_start_end 
ON user_subscriptions(start_date, end_date);

CREATE INDEX IF NOT EXISTS idx_posts_created_at 
ON posts(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_likes_post_user 
ON likes(post_id, user_id);

CREATE INDEX IF NOT EXISTS idx_comments_post_created 
ON comments(post_id, created_at DESC);

-- 2. Optimize materialized view refresh strategy
-- Drop existing trigger that refreshes on every change
DROP TRIGGER IF EXISTS trigger_refresh_views_meal_tracking ON meal_tracking;
DROP TRIGGER IF EXISTS trigger_refresh_views_daily_wellness ON daily_wellness;
DROP TRIGGER IF EXISTS trigger_refresh_views_steps_tracking ON steps_tracking;
DROP TRIGGER IF EXISTS trigger_refresh_views_user_subscriptions ON user_subscriptions;

-- Create more efficient batch refresh function
CREATE OR REPLACE FUNCTION public.refresh_activity_views_batch()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Refresh materialized views
  REFRESH MATERIALIZED VIEW daily_activity_summary;
  REFRESH MATERIALIZED VIEW weekly_progress_summary;
  REFRESH MATERIALIZED VIEW user_program_summary;
  
  -- Log refresh completion
  RAISE NOTICE 'Materialized views refreshed at %', now();
END;
$$;

-- 3. Create optimized functions for complex queries
CREATE OR REPLACE FUNCTION public.get_user_weekly_progress(p_user_id uuid, p_weeks_back integer DEFAULT 8)
RETURNS TABLE(
  week_start date,
  days_tracked integer,
  days_with_meals integer,
  meditation_days integer,
  yoga_days integer,
  step_goal_days integer,
  avg_water numeric,
  avg_steps numeric,
  total_steps bigint,
  total_water numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    wps.week_start,
    wps.days_tracked,
    wps.days_with_meals,
    wps.meditation_days,
    wps.yoga_days,
    wps.step_goal_days,
    wps.avg_water,
    wps.avg_steps,
    wps.total_steps,
    wps.total_water
  FROM weekly_progress_summary wps
  WHERE wps.user_id = p_user_id
    AND wps.week_start >= CURRENT_DATE - INTERVAL '1 week' * p_weeks_back
  ORDER BY wps.week_start DESC;
END;
$$;

-- 4. Optimized community feed function with pagination
CREATE OR REPLACE FUNCTION public.get_community_feed(
  p_user_id uuid,
  p_limit integer DEFAULT 10,
  p_offset integer DEFAULT 0
)
RETURNS TABLE(
  id bigint,
  image_url text,
  caption text,
  category varchar,
  created_at timestamptz,
  like_count integer,
  comment_count integer,
  author_id uuid,
  author_name text,
  author_avatar text,
  user_has_liked boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
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
    COALESCE(up.profile_photo_url, 'https://api.dicebear.com/7.x/avataaars/svg?seed=' || p.author_id::text) as author_avatar,
    EXISTS(SELECT 1 FROM likes l WHERE l.post_id = p.id AND l.user_id = p_user_id) as user_has_liked
  FROM posts p
  LEFT JOIN user_profiles up ON up.user_id = p.author_id
  ORDER BY p.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

-- 5. Optimized streak calculation function
CREATE OR REPLACE FUNCTION public.calculate_user_streaks(p_user_id uuid, p_start_date date DEFAULT NULL)
RETURNS TABLE(
  current_streak integer,
  best_streak integer,
  active_days integer
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  start_date date;
  activity_dates date[];
  current_streak_count integer := 0;
  best_streak_count integer := 0;
  temp_streak integer := 0;
  check_date date;
  active_days_count integer := 0;
BEGIN
  -- Use subscription start date or default to 8 weeks ago
  IF p_start_date IS NULL THEN
    SELECT us.start_date INTO start_date
    FROM user_subscriptions us
    WHERE us.user_id = p_user_id
      AND us.status = 'active'
    ORDER BY us.created_at DESC
    LIMIT 1;
    
    -- Fallback to 8 weeks ago if no subscription
    start_date := COALESCE(start_date, CURRENT_DATE - INTERVAL '8 weeks');
  ELSE
    start_date := p_start_date;
  END IF;

  -- Get all unique activity dates using improved query
  SELECT ARRAY(
    SELECT DISTINCT activity_date
    FROM (
      SELECT dw.date as activity_date
      FROM daily_wellness dw
      WHERE dw.user_id = p_user_id 
        AND dw.date >= start_date
        AND (dw.meditation_completed OR dw.water_litres > 0 OR dw.surya_namaskar_count > 0)
      
      UNION
      
      SELECT DISTINCT mt.date as activity_date
      FROM meal_tracking mt
      WHERE mt.user_id = p_user_id 
        AND mt.date >= start_date
      
      UNION
      
      SELECT st.date as activity_date
      FROM steps_tracking st
      WHERE st.user_id = p_user_id 
        AND st.date >= start_date
        AND st.steps_count > 1000
    ) activities
    ORDER BY activity_date DESC
  ) INTO activity_dates;

  active_days_count := array_length(activity_dates, 1);

  -- Calculate current streak (from today backwards)
  check_date := CURRENT_DATE;
  
  WHILE check_date >= start_date LOOP
    IF check_date = ANY(activity_dates) THEN
      current_streak_count := current_streak_count + 1;
      temp_streak := temp_streak + 1;
      best_streak_count := GREATEST(best_streak_count, temp_streak);
    ELSE
      -- Break current streak if we haven't found today's activity yet
      IF current_streak_count > 0 THEN
        EXIT;
      END IF;
      temp_streak := 0;
    END IF;
    
    check_date := check_date - INTERVAL '1 day';
  END LOOP;

  -- Calculate best streak from all activity periods
  temp_streak := 0;
  FOR i IN 1..array_length(activity_dates, 1) LOOP
    IF i = 1 OR activity_dates[i-1] - activity_dates[i] = 1 THEN
      temp_streak := temp_streak + 1;
      best_streak_count := GREATEST(best_streak_count, temp_streak);
    ELSE
      temp_streak := 1;
    END IF;
  END LOOP;

  RETURN QUERY SELECT current_streak_count, best_streak_count, COALESCE(active_days_count, 0);
END;
$$;

-- 6. Batch upsert function for wellness data
CREATE OR REPLACE FUNCTION public.upsert_wellness_data(
  p_user_id uuid,
  p_date date,
  p_water_litres numeric DEFAULT NULL,
  p_surya_namaskar_count integer DEFAULT NULL,
  p_meditation_completed boolean DEFAULT NULL,
  p_meditation_minutes integer DEFAULT NULL
)
RETURNS TABLE(
  id uuid,
  water_litres numeric,
  surya_namaskar_count integer,
  meditation_completed boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO daily_wellness (
    user_id, 
    date, 
    water_litres, 
    surya_namaskar_count, 
    meditation_completed,
    meditation_minutes
  )
  VALUES (
    p_user_id, 
    p_date, 
    COALESCE(p_water_litres, 0),
    COALESCE(p_surya_namaskar_count, 0),
    COALESCE(p_meditation_completed, false),
    COALESCE(p_meditation_minutes, 0)
  )
  ON CONFLICT (user_id, date) 
  DO UPDATE SET
    water_litres = CASE 
      WHEN p_water_litres IS NOT NULL THEN p_water_litres 
      ELSE daily_wellness.water_litres 
    END,
    surya_namaskar_count = CASE 
      WHEN p_surya_namaskar_count IS NOT NULL THEN p_surya_namaskar_count 
      ELSE daily_wellness.surya_namaskar_count 
    END,
    meditation_completed = CASE 
      WHEN p_meditation_completed IS NOT NULL THEN p_meditation_completed 
      ELSE daily_wellness.meditation_completed 
    END,
    meditation_minutes = CASE 
      WHEN p_meditation_minutes IS NOT NULL THEN p_meditation_minutes 
      ELSE daily_wellness.meditation_minutes 
    END,
    updated_at = now()
  RETURNING 
    daily_wellness.id,
    daily_wellness.water_litres,
    daily_wellness.surya_namaskar_count,
    daily_wellness.meditation_completed;
END;
$$;

-- 7. Add partial indexes for better performance
CREATE INDEX IF NOT EXISTS idx_daily_wellness_active_users 
ON daily_wellness(user_id, date) 
WHERE meditation_completed = true OR water_litres > 0 OR surya_namaskar_count > 0;

CREATE INDEX IF NOT EXISTS idx_user_subscriptions_active 
ON user_subscriptions(user_id, start_date, end_date) 
WHERE status = 'active';

-- 8. Create function to batch refresh views (for scheduled execution)
CREATE OR REPLACE FUNCTION public.scheduled_view_refresh()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only refresh if there have been recent changes
  IF EXISTS (
    SELECT 1 FROM daily_wellness 
    WHERE updated_at > now() - INTERVAL '1 hour'
    LIMIT 1
  ) OR EXISTS (
    SELECT 1 FROM meal_tracking 
    WHERE updated_at > now() - INTERVAL '1 hour'
    LIMIT 1
  ) THEN
    PERFORM public.refresh_activity_views_batch();
  END IF;
END;
$$;

-- 9. Update table statistics for better query planning
ANALYZE meal_tracking;
ANALYZE daily_wellness;
ANALYZE steps_tracking;
ANALYZE user_subscriptions;
ANALYZE posts;
ANALYZE likes;
ANALYZE comments;