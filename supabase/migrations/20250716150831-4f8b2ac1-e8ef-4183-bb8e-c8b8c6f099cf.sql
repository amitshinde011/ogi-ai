-- Fix the materialized view refresh mechanism with proper permissions

-- Create a function to refresh the materialized view with proper permissions
CREATE OR REPLACE FUNCTION refresh_community_feed_materialized_view()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER  -- This allows the function to run with the privileges of its owner
AS $$
BEGIN
  -- Refresh the materialized view when posts are inserted, updated, or deleted
  REFRESH MATERIALIZED VIEW community_feed_view;
  RETURN COALESCE(NEW, OLD);
END;
$$;