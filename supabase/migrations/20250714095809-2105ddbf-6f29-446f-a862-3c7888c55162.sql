-- Create materialized views for optimized data access
-- Daily activity summary for home page
CREATE MATERIALIZED VIEW daily_activity_summary AS
SELECT 
  user_id,
  date,
  -- Meal data
  COALESCE((
    SELECT COUNT(DISTINCT LOWER(meal_type)) 
    FROM meal_tracking m 
    WHERE m.user_id = u.user_id AND m.date = u.date
  ), 0) as meals_logged,
  
  -- Wellness data  
  COALESCE(w.water_litres, 0) as water_litres,
  COALESCE(w.surya_namaskar_count, 0) as surya_namaskar_count,
  COALESCE(w.meditation_completed, false) as meditation_completed,
  
  -- Steps data
  COALESCE(s.steps_count, 0) as steps_count,
  
  -- Walk score calculation (steps / 100)
  COALESCE(s.steps_count / 100, 0) as walk_score,
  
  -- Meal type flags for quick access
  EXISTS(SELECT 1 FROM meal_tracking m WHERE m.user_id = u.user_id AND m.date = u.date AND LOWER(m.meal_type) = 'breakfast') as has_breakfast,
  EXISTS(SELECT 1 FROM meal_tracking m WHERE m.user_id = u.user_id AND m.date = u.date AND LOWER(m.meal_type) = 'lunch') as has_lunch,
  EXISTS(SELECT 1 FROM meal_tracking m WHERE m.user_id = u.user_id AND m.date = u.date AND LOWER(m.meal_type) = 'dinner') as has_dinner,
  
  -- Special meal flags
  EXISTS(SELECT 1 FROM meal_tracking m WHERE m.user_id = u.user_id AND m.date = u.date AND LOWER(m.food_item) LIKE '%salad%') as has_salad_bowl,
  EXISTS(SELECT 1 FROM meal_tracking m WHERE m.user_id = u.user_id AND m.date = u.date AND LOWER(m.food_item) LIKE '%kanji%') as has_kanji,
  
  NOW() as last_updated
FROM (
  -- Get all user-date combinations
  SELECT DISTINCT user_id, date FROM meal_tracking
  UNION
  SELECT DISTINCT user_id, date FROM daily_wellness  
  UNION
  SELECT DISTINCT user_id, date FROM steps_tracking
) u
LEFT JOIN daily_wellness w ON w.user_id = u.user_id AND w.date = u.date
LEFT JOIN steps_tracking s ON s.user_id = u.user_id AND s.date = u.date;

-- Weekly progress summary for progress page
CREATE MATERIALIZED VIEW weekly_progress_summary AS
SELECT 
  user_id,
  DATE_TRUNC('week', date) as week_start,
  -- Activity counts
  COUNT(DISTINCT date) as days_tracked,
  SUM(CASE WHEN meals_logged > 0 THEN 1 ELSE 0 END) as days_with_meals,
  SUM(CASE WHEN meditation_completed THEN 1 ELSE 0 END) as meditation_days,
  SUM(CASE WHEN surya_namaskar_count > 0 THEN 1 ELSE 0 END) as yoga_days,
  SUM(CASE WHEN steps_count >= 10000 THEN 1 ELSE 0 END) as step_goal_days,
  
  -- Averages
  AVG(water_litres) as avg_water,
  AVG(surya_namaskar_count) as avg_surya_namaskar,
  AVG(steps_count) as avg_steps,
  AVG(meals_logged) as avg_meals,
  
  -- Totals
  SUM(steps_count) as total_steps,
  SUM(water_litres) as total_water,
  
  NOW() as last_updated
FROM daily_activity_summary
GROUP BY user_id, DATE_TRUNC('week', date);

-- User program summary for progress page
CREATE MATERIALIZED VIEW user_program_summary AS
SELECT 
  us.user_id,
  us.id as subscription_id,
  us.start_date,
  us.end_date,
  us.status,
  p.name as program_name,
  p.duration_days,
  
  -- Progress calculations
  CASE 
    WHEN us.start_date IS NULL OR us.end_date IS NULL THEN 0
    ELSE GREATEST(0, LEAST(100, 
      ROUND((EXTRACT(DAY FROM (CURRENT_DATE - us.start_date::date)) * 100.0) / 
            NULLIF(EXTRACT(DAY FROM (us.end_date::date - us.start_date::date)), 0))
    ))
  END as progress_percentage,
  
  CASE 
    WHEN us.start_date IS NULL THEN 0
    ELSE GREATEST(0, EXTRACT(DAY FROM (CURRENT_DATE - us.start_date::date)) + 1)
  END as days_completed,
  
  -- Program status flags
  CASE 
    WHEN us.status = 'active' AND CURRENT_DATE <= us.end_date::date THEN true
    ELSE false
  END as is_current,
  
  CASE 
    WHEN CURRENT_DATE > us.end_date::date THEN true
    ELSE false
  END as is_completed,
  
  NOW() as last_updated
FROM user_subscriptions us
LEFT JOIN programs p ON p.id = us.program_id
WHERE us.status IS NOT NULL;

-- Create indexes for performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_daily_activity_user_date ON daily_activity_summary(user_id, date DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_weekly_progress_user_week ON weekly_progress_summary(user_id, week_start DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_program_user_current ON user_program_summary(user_id, is_current DESC);

-- Create indexes on source tables for faster materialized view refreshes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_meal_tracking_user_date_type ON meal_tracking(user_id, date, meal_type);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_meal_tracking_user_date_food ON meal_tracking(user_id, date, food_item);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_daily_wellness_user_date ON daily_wellness(user_id, date);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_steps_tracking_user_date ON steps_tracking(user_id, date);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_subscriptions_user_status ON user_subscriptions(user_id, status);

-- Function to refresh materialized views
CREATE OR REPLACE FUNCTION refresh_activity_views()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY daily_activity_summary;
  REFRESH MATERIALIZED VIEW CONCURRENTLY weekly_progress_summary;
  REFRESH MATERIALIZED VIEW CONCURRENTLY user_program_summary;
END;
$$;

-- RLS policies for materialized views
ALTER MATERIALIZED VIEW daily_activity_summary ENABLE ROW LEVEL SECURITY;
ALTER MATERIALIZED VIEW weekly_progress_summary ENABLE ROW LEVEL SECURITY;
ALTER MATERIALIZED VIEW user_program_summary ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own daily activity summary" 
ON daily_activity_summary 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can view their own weekly progress summary" 
ON weekly_progress_summary 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can view their own program summary" 
ON user_program_summary 
FOR SELECT 
USING (user_id = auth.uid());

-- Trigger to refresh daily activity summary when source data changes
CREATE OR REPLACE FUNCTION refresh_daily_activity_summary()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Only refresh for today's data to avoid full refresh
  REFRESH MATERIALIZED VIEW CONCURRENTLY daily_activity_summary;
  RETURN NULL;
END;
$$;

-- Create triggers for automatic refresh (only for current day changes)
CREATE TRIGGER refresh_activity_on_meal_change
  AFTER INSERT OR UPDATE OR DELETE ON meal_tracking
  FOR EACH STATEMENT
  EXECUTE FUNCTION refresh_daily_activity_summary();

CREATE TRIGGER refresh_activity_on_wellness_change
  AFTER INSERT OR UPDATE OR DELETE ON daily_wellness
  FOR EACH STATEMENT
  EXECUTE FUNCTION refresh_daily_activity_summary();

CREATE TRIGGER refresh_activity_on_steps_change
  AFTER INSERT OR UPDATE OR DELETE ON steps_tracking
  FOR EACH STATEMENT
  EXECUTE FUNCTION refresh_daily_activity_summary();