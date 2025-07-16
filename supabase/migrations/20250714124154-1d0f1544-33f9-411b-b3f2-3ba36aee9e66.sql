-- Fix the get_optimized_weekly_data function to use correct calculate_user_streaks signature
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
  
  -- Get streak data using existing function with correct signature
  SELECT json_build_object(
    'current_streak', current_streak,
    'best_streak', best_streak,
    'active_days', active_days
  ) INTO streak_json
  FROM calculate_user_streaks(p_user_id);
  
  RETURN QUERY SELECT 
    COALESCE(weekly_json, '[]'::json),
    COALESCE(streak_json, '{}'::json);
END;
$$;