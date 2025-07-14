-- Check the current materialized view definition
DROP MATERIALIZED VIEW IF EXISTS daily_activity_summary;

-- Recreate the materialized view with correct walk score calculation
CREATE MATERIALIZED VIEW daily_activity_summary AS
SELECT 
  COALESCE(dw.user_id, mt.user_id, st.user_id) as user_id,
  COALESCE(dw.date, mt.date, st.date) as date,
  COALESCE(
    (SELECT COUNT(DISTINCT meal_type) 
     FROM meal_tracking mt2 
     WHERE mt2.user_id = COALESCE(dw.user_id, mt.user_id, st.user_id)
       AND mt2.date = COALESCE(dw.date, mt.date, st.date)
    ), 0
  ) as meals_logged,
  COALESCE(dw.water_litres, 0) as water_litres,
  COALESCE(dw.surya_namaskar_count, 0) as surya_namaskar_count,
  COALESCE(dw.meditation_completed, false) as meditation_completed,
  COALESCE(st.steps_count, 0) as steps_count,
  -- Fixed walk score calculation: should be based on 5000 steps = 5 stars
  CASE 
    WHEN COALESCE(st.steps_count, 0) > 0 THEN 
      LEAST(FLOOR((COALESCE(st.steps_count, 0)::numeric / 5000) * 5), 5)::integer
    ELSE 0 
  END as walk_score,
  EXISTS(
    SELECT 1 FROM meal_tracking mt3 
    WHERE mt3.user_id = COALESCE(dw.user_id, mt.user_id, st.user_id)
      AND mt3.date = COALESCE(dw.date, mt.date, st.date)
      AND mt3.meal_type = 'breakfast'
  ) as has_breakfast,
  EXISTS(
    SELECT 1 FROM meal_tracking mt4 
    WHERE mt4.user_id = COALESCE(dw.user_id, mt.user_id, st.user_id)
      AND mt4.date = COALESCE(dw.date, mt.date, st.date)
      AND mt4.meal_type = 'lunch'
  ) as has_lunch,
  EXISTS(
    SELECT 1 FROM meal_tracking mt5 
    WHERE mt5.user_id = COALESCE(dw.user_id, mt.user_id, st.user_id)
      AND mt5.date = COALESCE(dw.date, mt.date, st.date)
      AND mt5.meal_type = 'dinner'
  ) as has_dinner,
  EXISTS(
    SELECT 1 FROM meal_tracking mt6 
    WHERE mt6.user_id = COALESCE(dw.user_id, mt.user_id, st.user_id)
      AND mt6.date = COALESCE(dw.date, mt.date, st.date)
      AND LOWER(mt6.food_item) LIKE '%salad%' 
      AND LOWER(mt6.food_item) LIKE '%bowl%'
  ) as has_salad_bowl,
  EXISTS(
    SELECT 1 FROM meal_tracking mt7 
    WHERE mt7.user_id = COALESCE(dw.user_id, mt.user_id, st.user_id)
      AND mt7.date = COALESCE(dw.date, mt.date, st.date)
      AND (LOWER(mt7.food_item) LIKE '%kanji%' 
           OR LOWER(mt7.food_item) LIKE '%millet%' 
           OR LOWER(mt7.food_item) LIKE '%porridge%')
  ) as has_kanji,
  GREATEST(
    COALESCE(dw.updated_at, dw.created_at),
    COALESCE(mt.updated_at, mt.created_at),
    COALESCE(st.updated_at, st.created_at)
  ) as last_updated
FROM daily_wellness dw
FULL OUTER JOIN (
  SELECT user_id, date, MAX(updated_at) as updated_at, MAX(created_at) as created_at
  FROM meal_tracking 
  GROUP BY user_id, date
) mt ON dw.user_id = mt.user_id AND dw.date = mt.date
FULL OUTER JOIN steps_tracking st ON COALESCE(dw.user_id, mt.user_id) = st.user_id 
  AND COALESCE(dw.date, mt.date) = st.date;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_daily_activity_summary_user_date ON daily_activity_summary(user_id, date);
CREATE INDEX IF NOT EXISTS idx_daily_activity_summary_date ON daily_activity_summary(date);

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
    
    -- If no data in materialized view, try direct tables
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