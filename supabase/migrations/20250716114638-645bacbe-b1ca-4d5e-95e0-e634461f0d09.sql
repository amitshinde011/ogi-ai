-- Fix the get_home_data function to resolve GROUP BY clause error
CREATE OR REPLACE FUNCTION public.get_home_data(p_user_id uuid, p_date date)
 RETURNS TABLE(meals_logged integer, water_litres numeric, surya_namaskar_count integer, meditation_completed boolean, steps_count integer, walk_score integer, has_breakfast boolean, has_lunch boolean, has_dinner boolean, has_salad_bowl boolean, has_kanji boolean)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  -- Try to get data from materialized view first
  RETURN QUERY
  SELECT 
    COALESCE(das.meals_logged, 0)::integer,
    COALESCE(das.water_litres, 0.0)::numeric,
    COALESCE(das.surya_namaskar_count, 0)::integer,
    COALESCE(das.meditation_completed, false)::boolean,
    COALESCE(das.steps_count, 0)::integer,
    COALESCE(das.walk_score, 0)::integer,
    COALESCE(das.has_breakfast, false)::boolean,
    COALESCE(das.has_lunch, false)::boolean,
    COALESCE(das.has_dinner, false)::boolean,
    COALESCE(das.has_salad_bowl, false)::boolean,
    COALESCE(das.has_kanji, false)::boolean
  FROM daily_activity_summary das
  WHERE das.user_id = p_user_id AND das.date = p_date;
  
  -- If no data found in materialized view, query live data with proper aggregation
  IF NOT FOUND THEN
    RETURN QUERY
    WITH meal_data AS (
      SELECT 
        COUNT(DISTINCT mt.id) FILTER (WHERE mt.meal_type IS NOT NULL) as meals_logged,
        bool_or(mt.meal_type = 'breakfast') as has_breakfast,
        bool_or(mt.meal_type = 'lunch') as has_lunch,
        bool_or(mt.meal_type = 'dinner') as has_dinner,
        bool_or(mt.meal_type = 'salad_bowl') as has_salad_bowl,
        bool_or(mt.meal_type = 'kanji') as has_kanji
      FROM meal_tracking mt
      WHERE mt.user_id = p_user_id AND mt.date = p_date
    ),
    wellness_data AS (
      SELECT 
        COALESCE(dw.water_litres, 0.0) as water_litres,
        COALESCE(dw.surya_namaskar_count, 0) as surya_namaskar_count,
        COALESCE(dw.meditation_completed, false) as meditation_completed
      FROM daily_wellness dw
      WHERE dw.user_id = p_user_id AND dw.date = p_date
    ),
    steps_data AS (
      SELECT 
        COALESCE(st.steps_count, 0) as steps_count,
        CASE 
          WHEN COALESCE(st.steps_count, 0) >= 5000 THEN 5
          ELSE LEAST(5, (COALESCE(st.steps_count, 0)::numeric / 5000.0 * 5.0)::integer)
        END as walk_score
      FROM steps_tracking st
      WHERE st.user_id = p_user_id AND st.date = p_date
    )
    SELECT 
      COALESCE(md.meals_logged, 0)::integer,
      COALESCE(wd.water_litres, 0.0)::numeric,
      COALESCE(wd.surya_namaskar_count, 0)::integer,
      COALESCE(wd.meditation_completed, false)::boolean,
      COALESCE(sd.steps_count, 0)::integer,
      COALESCE(sd.walk_score, 0)::integer,
      COALESCE(md.has_breakfast, false)::boolean,
      COALESCE(md.has_lunch, false)::boolean,
      COALESCE(md.has_dinner, false)::boolean,
      COALESCE(md.has_salad_bowl, false)::boolean,
      COALESCE(md.has_kanji, false)::boolean
    FROM (SELECT 1) dummy
    LEFT JOIN meal_data md ON true
    LEFT JOIN wellness_data wd ON true  
    LEFT JOIN steps_data sd ON true
    LIMIT 1;
    
    -- If still no data, return defaults
    IF NOT FOUND THEN
      RETURN QUERY
      SELECT 
        0::integer,  -- meals_logged
        0.0::numeric,  -- water_litres  
        0::integer,  -- surya_namaskar_count
        false::boolean,  -- meditation_completed
        0::integer,  -- steps_count
        0::integer,  -- walk_score
        false::boolean,  -- has_breakfast
        false::boolean,  -- has_lunch
        false::boolean,  -- has_dinner
        false::boolean,  -- has_salad_bowl
        false::boolean;  -- has_kanji
    END IF;
  END IF;
END;
$function$;