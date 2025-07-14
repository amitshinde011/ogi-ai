-- Create a function to refresh materialized views after data changes
CREATE OR REPLACE FUNCTION refresh_materialized_views()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Refresh all materialized views
  REFRESH MATERIALIZED VIEW daily_activity_summary;
  REFRESH MATERIALIZED VIEW weekly_progress_summary;
  REFRESH MATERIALIZED VIEW user_program_summary;
END;
$$;

-- Create triggers to auto-refresh materialized views when data changes
CREATE OR REPLACE FUNCTION trigger_refresh_views()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Perform the refresh in the background to avoid blocking
  PERFORM pg_notify('refresh_materialized_views', 'refresh_needed');
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS refresh_views_on_meal_change ON meal_tracking;
DROP TRIGGER IF EXISTS refresh_views_on_wellness_change ON daily_wellness;
DROP TRIGGER IF EXISTS refresh_views_on_steps_change ON steps_tracking;

-- Create triggers for all relevant tables
CREATE TRIGGER refresh_views_on_meal_change
    AFTER INSERT OR UPDATE OR DELETE ON meal_tracking
    FOR EACH ROW EXECUTE FUNCTION trigger_refresh_views();

CREATE TRIGGER refresh_views_on_wellness_change
    AFTER INSERT OR UPDATE OR DELETE ON daily_wellness
    FOR EACH ROW EXECUTE FUNCTION trigger_refresh_views();

CREATE TRIGGER refresh_views_on_steps_change
    AFTER INSERT OR UPDATE OR DELETE ON steps_tracking
    FOR EACH ROW EXECUTE FUNCTION trigger_refresh_views();

-- Refresh materialized views now to get latest data
SELECT refresh_materialized_views();