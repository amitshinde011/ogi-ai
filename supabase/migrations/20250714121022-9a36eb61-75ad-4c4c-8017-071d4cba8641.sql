-- Fix the type mismatch in get_user_weekly_progress function
DROP FUNCTION IF EXISTS public.get_user_weekly_progress(uuid, integer);

CREATE OR REPLACE FUNCTION public.get_user_weekly_progress(p_user_id uuid, p_weeks_back integer DEFAULT 8)
 RETURNS TABLE(week_start date, days_tracked integer, days_with_meals integer, meditation_days integer, yoga_days integer, step_goal_days integer, avg_water numeric, avg_steps numeric, total_steps bigint, total_water numeric)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    wps.week_start::date,
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
$function$;