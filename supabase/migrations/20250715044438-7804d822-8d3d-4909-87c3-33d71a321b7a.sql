-- Update database functions to work with local dates properly
-- The frontend sends local dates as strings, so we need to ensure our functions handle them correctly

-- Update get_home_data function to be more explicit about date handling
CREATE OR REPLACE FUNCTION public.get_home_data(p_user_id uuid, p_date date)
 RETURNS TABLE(meals_logged integer, water_litres numeric, surya_namaskar_count integer, meditation_completed boolean, steps_count integer, walk_score integer, has_breakfast boolean, has_lunch boolean, has_dinner boolean, has_salad_bowl boolean, has_kanji boolean)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  -- Refresh materialized views first to ensure we have latest data
  BEGIN
    REFRESH MATERIALIZED VIEW daily_activity_summary;
  EXCEPTION WHEN OTHERS THEN
    -- Continue if refresh fails
    NULL;
  END;

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
  
  -- If no data found in materialized view, query live data
  IF NOT FOUND THEN
    RETURN QUERY
    WITH live_data AS (
      SELECT 
        COUNT(DISTINCT mt.id) FILTER (WHERE mt.meal_type IS NOT NULL)::integer as meals_logged,
        COALESCE(dw.water_litres, 0.0)::numeric as water_litres,
        COALESCE(dw.surya_namaskar_count, 0)::integer as surya_namaskar_count,
        COALESCE(dw.meditation_completed, false)::boolean as meditation_completed,
        COALESCE(st.steps_count, 0)::integer as steps_count,
        CASE 
          WHEN COALESCE(st.steps_count, 0) >= 5000 THEN 5
          ELSE LEAST(5, (COALESCE(st.steps_count, 0)::numeric / 5000.0 * 5.0)::integer)
        END as walk_score,
        EXISTS(SELECT 1 FROM meal_tracking mt2 WHERE mt2.user_id = p_user_id AND mt2.date = p_date AND mt2.meal_type = 'breakfast') as has_breakfast,
        EXISTS(SELECT 1 FROM meal_tracking mt2 WHERE mt2.user_id = p_user_id AND mt2.date = p_date AND mt2.meal_type = 'lunch') as has_lunch,
        EXISTS(SELECT 1 FROM meal_tracking mt2 WHERE mt2.user_id = p_user_id AND mt2.date = p_date AND mt2.meal_type = 'dinner') as has_dinner,
        EXISTS(SELECT 1 FROM meal_tracking mt2 WHERE mt2.user_id = p_user_id AND mt2.date = p_date AND mt2.meal_type = 'salad_bowl') as has_salad_bowl,
        EXISTS(SELECT 1 FROM meal_tracking mt2 WHERE mt2.user_id = p_user_id AND mt2.date = p_date AND mt2.meal_type = 'kanji') as has_kanji
      FROM daily_wellness dw
      FULL OUTER JOIN meal_tracking mt ON mt.user_id = p_user_id AND mt.date = p_date
      FULL OUTER JOIN steps_tracking st ON st.user_id = p_user_id AND st.date = p_date
      WHERE dw.user_id = p_user_id AND dw.date = p_date
    )
    SELECT 
      COALESCE(ld.meals_logged, 0),
      COALESCE(ld.water_litres, 0.0),
      COALESCE(ld.surya_namaskar_count, 0),
      COALESCE(ld.meditation_completed, false),
      COALESCE(ld.steps_count, 0),
      COALESCE(ld.walk_score, 0),
      COALESCE(ld.has_breakfast, false),
      COALESCE(ld.has_lunch, false),
      COALESCE(ld.has_dinner, false),
      COALESCE(ld.has_salad_bowl, false),
      COALESCE(ld.has_kanji, false)
    FROM live_data ld
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