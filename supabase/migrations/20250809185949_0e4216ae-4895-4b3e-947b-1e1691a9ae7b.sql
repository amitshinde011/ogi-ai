-- Phase 2: Remove materialized views and migrate functions to base-table logic
-- All functions set search_path and avoid MV dependencies

-- 1) Replace refresh functions with safe no-ops
CREATE OR REPLACE FUNCTION public.refresh_activity_views()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public','pg_temp'
AS $$
BEGIN
  RAISE NOTICE 'refresh_activity_views: no-op at %', now();
END;$$;

CREATE OR REPLACE FUNCTION public.refresh_activity_views_batch()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public','pg_temp'
AS $$
BEGIN
  RAISE NOTICE 'refresh_activity_views_batch: no-op at %', now();
END;$$;

CREATE OR REPLACE FUNCTION public.refresh_materialized_views()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public','pg_temp'
AS $$
BEGIN
  RAISE NOTICE 'refresh_materialized_views: no-op at %', now();
END;$$;

CREATE OR REPLACE FUNCTION public.refresh_notifications_view()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public','pg_temp'
AS $$
BEGIN
  RAISE NOTICE 'refresh_notifications_view: no-op at %', now();
END;$$;

CREATE OR REPLACE FUNCTION public.refresh_posts_view()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public','pg_temp'
AS $$
BEGIN
  RAISE NOTICE 'refresh_posts_view: no-op at %', now();
END;$$;

CREATE OR REPLACE FUNCTION public.refresh_community_feed_materialized_view()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public','pg_temp'
AS $$
BEGIN
  RAISE NOTICE 'refresh_community_feed_materialized_view: no-op at %', now();
  RETURN COALESCE(NEW, OLD);
END;$$;

CREATE OR REPLACE FUNCTION public.scheduled_view_refresh()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public','pg_temp'
AS $$
BEGIN
  RAISE NOTICE 'scheduled_view_refresh: no-op at %', now();
END;$$;

-- 2) Rewrite data RPCs to use base tables only
-- 2a) Home data from base tables
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
SET search_path TO 'public','pg_temp'
AS $$
BEGIN
  RETURN QUERY
  WITH meal_data AS (
    SELECT 
      COUNT(DISTINCT mt.id) FILTER (WHERE mt.meal_type IS NOT NULL) AS meals_logged,
      BOOL_OR(mt.meal_type = 'breakfast') AS has_breakfast,
      BOOL_OR(mt.meal_type = 'lunch') AS has_lunch,
      BOOL_OR(mt.meal_type = 'dinner') AS has_dinner,
      BOOL_OR(mt.meal_type = 'salad_bowl') AS has_salad_bowl,
      BOOL_OR(mt.meal_type = 'kanji') AS has_kanji
    FROM meal_tracking mt
    WHERE mt.user_id = p_user_id AND mt.date = p_date
  ),
  wellness_data AS (
    SELECT 
      COALESCE(dw.water_litres, 0.0) AS water_litres,
      COALESCE(dw.surya_namaskar_count, 0) AS surya_namaskar_count,
      COALESCE(dw.meditation_completed, false) AS meditation_completed
    FROM daily_wellness dw
    WHERE dw.user_id = p_user_id AND dw.date = p_date
  ),
  steps_data AS (
    SELECT 
      COALESCE(st.steps_count, 0) AS steps_count,
      CASE 
        WHEN COALESCE(st.steps_count, 0) >= 5000 THEN 5
        ELSE LEAST(5, (COALESCE(st.steps_count, 0)::numeric / 5000.0 * 5.0)::integer)
      END AS walk_score
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
  LEFT JOIN meal_data md ON TRUE
  LEFT JOIN wellness_data wd ON TRUE
  LEFT JOIN steps_data sd ON TRUE
  LIMIT 1;
END;$$;

-- 2b) Weekly progress from base tables
CREATE OR REPLACE FUNCTION public.get_user_weekly_progress(p_user_id uuid, p_weeks_back integer DEFAULT 8)
RETURNS TABLE(
  week_start date,
  days_tracked bigint,
  days_with_meals bigint,
  meditation_days bigint,
  yoga_days bigint,
  step_goal_days bigint,
  avg_water numeric,
  avg_steps numeric,
  total_steps bigint,
  total_water numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public','pg_temp'
AS $$
BEGIN
  RETURN QUERY
  WITH dw AS (
    SELECT date, 
      SUM(COALESCE(water_litres,0)) AS water,
      MAX(CASE WHEN COALESCE(meditation_completed,false) THEN 1 ELSE 0 END) AS meditation,
      MAX(CASE WHEN COALESCE(surya_namaskar_count,0) > 0 THEN 1 ELSE 0 END) AS yoga
    FROM daily_wellness
    WHERE user_id = p_user_id
    GROUP BY date
  ),
  meals AS (
    SELECT date, 1 AS has_meal
    FROM meal_tracking
    WHERE user_id = p_user_id
    GROUP BY date
  ),
  steps AS (
    SELECT date, SUM(COALESCE(steps_count,0)) AS steps
    FROM steps_tracking
    WHERE user_id = p_user_id
    GROUP BY date
  ),
  per_day AS (
    SELECT 
      COALESCE(dw.date, meals.date, steps.date) AS date,
      COALESCE(dw.water,0) AS water,
      COALESCE(dw.meditation,0) AS meditation,
      COALESCE(dw.yoga,0) AS yoga,
      COALESCE(meals.has_meal,0) AS has_meal,
      COALESCE(steps.steps,0) AS steps,
      CASE WHEN COALESCE(dw.meditation,0)=1 OR COALESCE(dw.yoga,0)=1 OR COALESCE(meals.has_meal,0)=1 OR COALESCE(dw.water,0)>0 OR COALESCE(steps.steps,0)>0 THEN 1 ELSE 0 END AS active
    FROM dw
    FULL OUTER JOIN meals USING (date)
    FULL OUTER JOIN steps USING (date)
    WHERE COALESCE(dw.date, meals.date, steps.date) >= CURRENT_DATE - INTERVAL '1 week' * p_weeks_back
  )
  SELECT 
    date_trunc('week', date)::date AS week_start,
    SUM(active)::bigint AS days_tracked,
    SUM(CASE WHEN has_meal=1 THEN 1 ELSE 0 END)::bigint AS days_with_meals,
    SUM(meditation)::bigint AS meditation_days,
    SUM(yoga)::bigint AS yoga_days,
    SUM(CASE WHEN steps >= 5000 THEN 1 ELSE 0 END)::bigint AS step_goal_days,
    ROUND(AVG(water)::numeric,1) AS avg_water,
    ROUND(AVG(steps)::numeric,0) AS avg_steps,
    SUM(steps)::bigint AS total_steps,
    ROUND(SUM(water)::numeric,1) AS total_water
  FROM per_day
  GROUP BY 1
  ORDER BY 1 DESC;
END;$$;

-- 2c) Optimized weekly data JSON
CREATE OR REPLACE FUNCTION public.get_optimized_weekly_data(p_user_id uuid, p_weeks_back integer DEFAULT 4)
RETURNS TABLE(week_data json, streak_data json)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public','pg_temp'
AS $$
DECLARE
  weekly_json json;
  streak_json json;
BEGIN
  SELECT json_agg(
    json_build_object(
      'week_start', w.week_start,
      'days_tracked', w.days_tracked,
      'days_with_meals', w.days_with_meals,
      'meditation_days', w.meditation_days,
      'yoga_days', w.yoga_days,
      'step_goal_days', w.step_goal_days,
      'avg_water', w.avg_water,
      'avg_steps', w.avg_steps,
      'total_steps', w.total_steps,
      'total_water', w.total_water,
      'weekly_score', ROUND((w.meditation_days*20 + w.yoga_days*20 + w.days_with_meals*10 + LEAST(w.avg_water*5,20))::numeric,0)
    ) ORDER BY w.week_start DESC
  ) INTO weekly_json
  FROM get_user_weekly_progress(p_user_id, p_weeks_back) w;

  SELECT json_build_object(
    'current_streak', s.current_streak,
    'best_streak', s.best_streak,
    'active_days', s.active_days
  ) INTO streak_json
  FROM calculate_user_streaks(p_user_id) s;

  RETURN QUERY SELECT COALESCE(weekly_json, '[]'::json), COALESCE(streak_json, '{}'::json);
END;$$;

-- 2d) Progress data JSON (weekly + journey)
CREATE OR REPLACE FUNCTION public.get_progress_data(p_user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public','pg_temp'
AS $$
DECLARE
  weekly_data json;
  journey_data json;
  result json;
BEGIN
  -- Weekly (last 8 weeks)
  SELECT json_agg(
    json_build_object(
      'week', to_char(w.week_start, 'YYYY-"W"IW'),
      'daysTracked', w.days_tracked,
      'daysWithMeals', w.days_with_meals,
      'meditationDays', w.meditation_days,
      'yogaDays', w.yoga_days,
      'stepGoalDays', w.step_goal_days,
      'avgWater', w.avg_water,
      'avgSteps', w.avg_steps,
      'totalSteps', w.total_steps
    )
  ) INTO weekly_data
  FROM get_user_weekly_progress(p_user_id, 8) w;

  -- Journey totals from all time aggregates
  WITH dw AS (
    SELECT date, 
      SUM(COALESCE(water_litres,0)) AS water,
      MAX(CASE WHEN COALESCE(meditation_completed,false) THEN 1 ELSE 0 END) AS meditation,
      MAX(CASE WHEN COALESCE(surya_namaskar_count,0) > 0 THEN 1 ELSE 0 END) AS yoga
    FROM daily_wellness
    WHERE user_id = p_user_id
    GROUP BY date
  ),
  meals AS (
    SELECT date, 1 AS has_meal
    FROM meal_tracking
    WHERE user_id = p_user_id
    GROUP BY date
  ),
  steps AS (
    SELECT date, SUM(COALESCE(steps_count,0)) AS steps
    FROM steps_tracking
    WHERE user_id = p_user_id
    GROUP BY date
  ),
  per_day AS (
    SELECT 
      COALESCE(dw.date, meals.date, steps.date) AS date,
      COALESCE(dw.water,0) AS water,
      COALESCE(dw.meditation,0) AS meditation,
      COALESCE(dw.yoga,0) AS yoga,
      COALESCE(meals.has_meal,0) AS has_meal,
      COALESCE(steps.steps,0) AS steps
    FROM dw
    FULL OUTER JOIN meals USING (date)
    FULL OUTER JOIN steps USING (date)
  )
  SELECT json_build_object(
    'totalDays', COALESCE(COUNT(*),0),
    'activeDays', COALESCE(COUNT(*) FILTER (WHERE (water>0 OR meditation=1 OR yoga=1 OR has_meal=1 OR steps>0)),0),
    'totalMeals', COALESCE(COUNT(*) FILTER (WHERE has_meal=1),0),
    'totalWater', COALESCE(ROUND(SUM(water)::numeric,1),0),
    'totalSteps', COALESCE(SUM(steps),0),
    'meditationSessions', COALESCE(SUM(meditation),0),
    'yogaSessions', COALESCE(SUM(yoga),0),
    'progressPercentage', CASE WHEN COUNT(*) > 0 THEN ROUND((COUNT(*) FILTER (WHERE has_meal=1))::numeric / COUNT(*) * 100, 0) ELSE 0 END
  ) INTO journey_data
  FROM per_day;

  SELECT json_build_object(
    'weekly_data', COALESCE(weekly_data, '[]'::json),
    'journey_data', COALESCE(journey_data, '{}'::json)
  ) INTO result;

  RETURN result;
END;$$;

-- 2e) Journey progress per-day points without MV
CREATE OR REPLACE FUNCTION public.get_journey_progress_data(p_user_id uuid, p_start_date date, p_end_date date)
RETURNS TABLE(daily_points json, total_points bigint, max_possible_points bigint, average_score numeric)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public','pg_temp'
AS $$
DECLARE
  loop_date date;
  day_counter integer := 1;
  daily_data json[] := '{}';
  points_data integer;
  total_pts bigint := 0;
  max_pts bigint;
BEGIN
  loop_date := p_start_date;
  WHILE loop_date <= LEAST(p_end_date, CURRENT_DATE) LOOP
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

    points_data := COALESCE(points_data, 0);
    total_pts := total_pts + points_data;

    daily_data := daily_data || json_build_object(
      'day', day_counter,
      'date', loop_date,
      'score', points_data,
      'cumulativeScore', total_pts
    );

    loop_date := loop_date + INTERVAL '1 day';
    day_counter := day_counter + 1;
  END LOOP;

  max_pts := (day_counter - 1) * 80;

  RETURN QUERY SELECT 
    array_to_json(daily_data)::json,
    total_pts,
    max_pts,
    CASE WHEN max_pts > 0 THEN ROUND((total_pts::numeric / max_pts) * 100, 0) ELSE 0 END;
END;$$;

-- 3) Drop materialized views (no longer needed)
DROP MATERIALIZED VIEW IF EXISTS public.daily_activity_summary;
DROP MATERIALIZED VIEW IF EXISTS public.weekly_progress_summary;
DROP MATERIALIZED VIEW IF EXISTS public.user_program_summary;
DROP MATERIALIZED VIEW IF EXISTS public.notifications_with_sender;
DROP MATERIALIZED VIEW IF EXISTS public.posts_with_author;
DROP MATERIALIZED VIEW IF EXISTS public.community_feed_view;