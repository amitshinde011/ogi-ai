-- Update the get_journey_progress_data function to include today's data properly
CREATE OR REPLACE FUNCTION public.get_journey_progress_data(p_user_id uuid, p_start_date date, p_end_date date)
RETURNS TABLE(daily_points json, total_points bigint, max_possible_points bigint, average_score numeric)
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
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
      LEAST(COALESCE(water_litres, 0) * 5, 20)::integer +
      CASE WHEN COALESCE(steps_count, 0) >= 5000 THEN 10 ELSE 0 END
    INTO points_data
    FROM daily_activity_summary
    WHERE user_id = p_user_id AND date = loop_date;
    
    -- If no data in materialized view, try direct tables for today's data
    IF points_data IS NULL THEN
      SELECT 
        CASE WHEN EXISTS(
          SELECT 1 FROM daily_wellness dw2 
          WHERE dw2.user_id = p_user_id 
            AND dw2.date = loop_date 
            AND dw2.meditation_completed = true
        ) THEN 20 ELSE 0 END +
        CASE WHEN COALESCE((
          SELECT surya_namaskar_count FROM daily_wellness dw3 
          WHERE dw3.user_id = p_user_id AND dw3.date = loop_date
        ), 0) > 0 THEN 20 ELSE 0 END +
        CASE WHEN EXISTS(
          SELECT 1 FROM meal_tracking mt 
          WHERE mt.user_id = p_user_id AND mt.date = loop_date
        ) THEN 10 ELSE 0 END +
        LEAST(COALESCE((
          SELECT water_litres FROM daily_wellness dw4 
          WHERE dw4.user_id = p_user_id AND dw4.date = loop_date
        ), 0) * 5, 20)::integer +
        CASE WHEN COALESCE((
          SELECT steps_count FROM steps_tracking st 
          WHERE st.user_id = p_user_id AND st.date = loop_date
        ), 0) >= 5000 THEN 10 ELSE 0 END
      INTO points_data;
    END IF;
    
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
  
  -- Calculate max possible points (increased to 80 per day with steps bonus)
  max_pts := (day_counter - 1) * 80;
  
  RETURN QUERY SELECT 
    array_to_json(daily_data)::json,
    total_pts,
    max_pts,
    CASE WHEN max_pts > 0 THEN ROUND((total_pts::numeric / max_pts) * 100, 0) ELSE 0 END;
END;
$function$;