-- Add trigger to refresh materialized views when data changes
CREATE OR REPLACE FUNCTION refresh_activity_views_trigger()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Refresh views in background to avoid blocking the transaction
  PERFORM pg_notify('refresh_views', 'daily_activity_summary');
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create triggers on source tables to refresh materialized views
CREATE TRIGGER trigger_refresh_views_meal_tracking
  AFTER INSERT OR UPDATE OR DELETE ON meal_tracking
  FOR EACH STATEMENT
  EXECUTE FUNCTION refresh_activity_views_trigger();

CREATE TRIGGER trigger_refresh_views_daily_wellness
  AFTER INSERT OR UPDATE OR DELETE ON daily_wellness
  FOR EACH STATEMENT
  EXECUTE FUNCTION refresh_activity_views_trigger();

CREATE TRIGGER trigger_refresh_views_steps_tracking
  AFTER INSERT OR UPDATE OR DELETE ON steps_tracking
  FOR EACH STATEMENT
  EXECUTE FUNCTION refresh_activity_views_trigger();

CREATE TRIGGER trigger_refresh_views_user_subscriptions
  AFTER INSERT OR UPDATE OR DELETE ON user_subscriptions
  FOR EACH STATEMENT
  EXECUTE FUNCTION refresh_activity_views_trigger();