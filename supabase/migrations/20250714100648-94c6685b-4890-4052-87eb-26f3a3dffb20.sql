-- Create RPC functions for optimized data access
-- Function to get home data for a specific user and date
CREATE OR REPLACE FUNCTION get_home_data(p_user_id uuid, p_date date)
RETURNS TABLE (
  meals_logged integer,
  water_litres numeric,
  surya_namaskar_count integer,
  meditation_completed boolean,
  steps_count integer,
  walk_score integer,
  has_breakfast boolean,
  has_lunch boolean,
  has_dinner boolean,
  has_salad_bowl boolean,
  has_kanji boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    das.meals_logged,
    das.water_litres,
    das.surya_namaskar_count,
    das.meditation_completed,
    das.steps_count,
    das.walk_score,
    das.has_breakfast,
    das.has_lunch,
    das.has_dinner,
    das.has_salad_bowl,
    das.has_kanji
  FROM daily_activity_summary das
  WHERE das.user_id = p_user_id AND das.date = p_date
  LIMIT 1;
END;
$$;

-- Function to get progress data for a specific user
CREATE OR REPLACE FUNCTION get_progress_data(p_user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  weekly_data json;
  journey_data json;
  result json;
BEGIN
  -- Get weekly data (last 8 weeks)
  SELECT json_agg(
    json_build_object(
      'week', to_char(week_start, 'YYYY-"W"IW'),
      'daysTracked', days_tracked,
      'daysWithMeals', days_with_meals,
      'meditationDays', meditation_days,
      'yogaDays', yoga_days,
      'stepGoalDays', step_goal_days,
      'avgWater', ROUND(avg_water::numeric, 1),
      'avgSteps', ROUND(avg_steps::numeric, 0),
      'totalSteps', total_steps
    )
  ) INTO weekly_data
  FROM weekly_progress_summary wps
  WHERE wps.user_id = p_user_id
    AND wps.week_start >= CURRENT_DATE - INTERVAL '8 weeks'
  ORDER BY wps.week_start DESC;

  -- Get journey data (aggregated totals)
  SELECT json_build_object(
    'totalDays', COALESCE(SUM(days_tracked), 0),
    'activeDays', COALESCE(SUM(CASE WHEN days_tracked > 0 THEN days_tracked ELSE 0 END), 0),
    'totalMeals', COALESCE(SUM(days_with_meals), 0),
    'totalWater', COALESCE(SUM(total_water), 0),
    'totalSteps', COALESCE(SUM(total_steps), 0),
    'meditationSessions', COALESCE(SUM(meditation_days), 0),
    'yogaSessions', COALESCE(SUM(yoga_days), 0),
    'progressPercentage', CASE 
      WHEN SUM(days_tracked) > 0 THEN ROUND((SUM(days_with_meals)::numeric / SUM(days_tracked)) * 100, 0)
      ELSE 0
    END
  ) INTO journey_data
  FROM weekly_progress_summary wps
  WHERE wps.user_id = p_user_id;

  -- Combine results
  SELECT json_build_object(
    'weekly_data', COALESCE(weekly_data, '[]'::json),
    'journey_data', COALESCE(journey_data, '{}'::json)
  ) INTO result;

  RETURN result;
END;
$$;