-- Add composite indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_daily_activity_summary_user_date_range ON daily_activity_summary (user_id, date);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_active ON user_subscriptions (user_id, status, start_date, end_date);

-- Create optimized function for journey progress data
CREATE OR REPLACE FUNCTION get_journey_progress_data(p_user_id uuid, p_start_date date, p_end_date date)
RETURNS TABLE(
  daily_points json,
  total_points bigint,
  max_possible_points bigint,
  average_score numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  loop_date date;
  day_counter integer := 1;
  daily_data json[] := '{}';
  points_data integer;
  total_pts bigint := 0;
  max_pts bigint;
BEGIN
  -- Calculate daily points for each day in the program
  loop_date := p_start_date;
  
  WHILE loop_date <= LEAST(p_end_date, CURRENT_DATE) LOOP
    -- Get activity data for this specific date and calculate points
    SELECT 
      CASE WHEN COALESCE(meditation_completed, false) THEN 20 ELSE 0 END +
      CASE WHEN COALESCE(surya_namaskar_count, 0) > 0 THEN 20 ELSE 0 END +
      CASE WHEN COALESCE(meals_logged, 0) > 0 THEN 10 ELSE 0 END +
      LEAST(COALESCE(water_litres, 0) * 5, 20)::integer
    INTO points_data
    FROM daily_activity_summary
    WHERE user_id = p_user_id AND date = loop_date;
    
    -- Default to 0 if no data found
    points_data := COALESCE(points_data, 0);
    
    -- Add to running total
    total_pts := total_pts + points_data;
    
    -- Build JSON array for response
    daily_data := daily_data || json_build_object(
      'day', day_counter,
      'date', loop_date,
      'score', points_data,
      'cumulativeScore', total_pts
    );
    
    loop_date := loop_date + INTERVAL '1 day';
    day_counter := day_counter + 1;
  END LOOP;
  
  -- Calculate max possible points
  max_pts := (day_counter - 1) * 70;
  
  RETURN QUERY SELECT 
    array_to_json(daily_data)::json,
    total_pts,
    max_pts,
    CASE WHEN max_pts > 0 THEN ROUND((total_pts::numeric / max_pts) * 100, 0) ELSE 0 END;
END;
$$;

-- Create function to get optimized weekly progress
CREATE OR REPLACE FUNCTION get_optimized_weekly_data(p_user_id uuid, p_weeks_back integer DEFAULT 4)
RETURNS TABLE(
  week_data json,
  streak_data json
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  weekly_json json;
  streak_json json;
BEGIN
  -- Get weekly data
  SELECT json_agg(
    json_build_object(
      'week_start', week_start,
      'days_tracked', days_tracked,
      'days_with_meals', days_with_meals,
      'meditation_days', meditation_days,
      'yoga_days', yoga_days,
      'step_goal_days', step_goal_days,
      'avg_water', ROUND(avg_water::numeric, 1),
      'avg_steps', ROUND(avg_steps::numeric, 0),
      'total_steps', total_steps,
      'total_water', ROUND(total_water::numeric, 1),
      'weekly_score', ROUND(
        (meditation_days * 20 + yoga_days * 20 + days_with_meals * 10 + LEAST(avg_water * 5, 20))::numeric, 0
      )
    )
    ORDER BY week_start DESC
  ) INTO weekly_json
  FROM weekly_progress_summary
  WHERE user_id = p_user_id
    AND week_start >= CURRENT_DATE - INTERVAL '1 week' * p_weeks_back;
  
  -- Get streak data using existing function
  SELECT json_build_object(
    'current_streak', current_streak,
    'best_streak', best_streak,
    'active_days', active_days
  ) INTO streak_json
  FROM calculate_user_streaks(p_user_id, CURRENT_DATE - INTERVAL '8 weeks');
  
  RETURN QUERY SELECT 
    COALESCE(weekly_json, '[]'::json),
    COALESCE(streak_json, '{}'::json);
END;
$$;