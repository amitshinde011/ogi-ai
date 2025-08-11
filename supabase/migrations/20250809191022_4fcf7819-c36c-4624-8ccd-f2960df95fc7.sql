-- Final security hardening pass: add SET search_path to remaining functions

-- upsert_wellness_data
CREATE OR REPLACE FUNCTION public.upsert_wellness_data(
  p_user_id uuid,
  p_date date,
  p_water_litres numeric DEFAULT NULL::numeric,
  p_surya_namaskar_count integer DEFAULT NULL::integer,
  p_meditation_completed boolean DEFAULT NULL::boolean,
  p_meditation_minutes integer DEFAULT NULL::integer
)
RETURNS TABLE(
  id uuid,
  water_litres numeric,
  surya_namaskar_count integer,
  meditation_completed boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public','pg_temp'
AS $$
BEGIN
  RETURN QUERY
  WITH upserted AS (
    INSERT INTO daily_wellness (
      user_id, 
      date, 
      water_litres, 
      surya_namaskar_count, 
      meditation_completed,
      meditation_minutes
    )
    VALUES (
      p_user_id, 
      p_date, 
      COALESCE(p_water_litres, 0),
      COALESCE(p_surya_namaskar_count, 0),
      COALESCE(p_meditation_completed, false),
      COALESCE(p_meditation_minutes, 0)
    )
    ON CONFLICT (user_id, date) 
    DO UPDATE SET
      water_litres = CASE 
        WHEN p_water_litres IS NOT NULL THEN p_water_litres 
        ELSE daily_wellness.water_litres 
      END,
      surya_namaskar_count = CASE 
        WHEN p_surya_namaskar_count IS NOT NULL THEN p_surya_namaskar_count 
        ELSE daily_wellness.surya_namaskar_count 
      END,
      meditation_completed = CASE 
        WHEN p_meditation_completed IS NOT NULL THEN p_meditation_completed 
        ELSE daily_wellness.meditation_completed 
      END,
      meditation_minutes = CASE 
        WHEN p_meditation_minutes IS NOT NULL THEN p_meditation_minutes 
        ELSE daily_wellness.meditation_minutes 
      END,
      updated_at = now()
    RETURNING 
      daily_wellness.id,
      daily_wellness.water_litres,
      daily_wellness.surya_namaskar_count,
      daily_wellness.meditation_completed
  )
  SELECT * FROM upserted;
END;
$$;

-- refresh_activity_views_trigger
CREATE OR REPLACE FUNCTION public.refresh_activity_views_trigger()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public','pg_temp'
AS $$
BEGIN
  PERFORM pg_notify('refresh_views', 'daily_activity_summary');
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- trigger_notifications_refresh
CREATE OR REPLACE FUNCTION public.trigger_notifications_refresh()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public','pg_temp'
AS $$
BEGIN
  PERFORM pg_notify('refresh_notifications_view', 'refresh_needed');
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- trigger_posts_refresh
CREATE OR REPLACE FUNCTION public.trigger_posts_refresh()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public','pg_temp'
AS $$
BEGIN
  PERFORM pg_notify('refresh_posts_view', 'refresh_needed');
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- trigger_community_feed_refresh
CREATE OR REPLACE FUNCTION public.trigger_community_feed_refresh()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public','pg_temp'
AS $$
BEGIN
  PERFORM pg_notify('refresh_community_feed', 'refresh_needed');
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- trigger_refresh_views
CREATE OR REPLACE FUNCTION public.trigger_refresh_views()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public','pg_temp'
AS $$
BEGIN
  PERFORM pg_notify('refresh_materialized_views', 'refresh_needed');
  RETURN COALESCE(NEW, OLD);
END;
$$;