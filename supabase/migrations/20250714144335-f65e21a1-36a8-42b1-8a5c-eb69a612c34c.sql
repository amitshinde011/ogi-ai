-- Fix the get_home_data function to handle nullable values correctly
CREATE OR REPLACE FUNCTION public.get_home_data(p_user_id uuid, p_date date)
RETURNS TABLE(
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
  WHERE das.user_id = p_user_id AND das.date = p_date
  LIMIT 1;
  
  -- If no data found, return default values
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
END;
$$;