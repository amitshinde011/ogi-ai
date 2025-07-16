-- Fix the materialized view refresh mechanism

-- First, let's refresh the materialized view to show current posts
REFRESH MATERIALIZED VIEW community_feed_view;

-- Create a function to refresh the materialized view
CREATE OR REPLACE FUNCTION refresh_community_feed_materialized_view()
RETURNS TRIGGER AS $$
BEGIN
  -- Refresh the materialized view when posts are inserted, updated, or deleted
  REFRESH MATERIALIZED VIEW community_feed_view;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically refresh the materialized view
DROP TRIGGER IF EXISTS refresh_community_feed_on_post_insert ON posts;
CREATE TRIGGER refresh_community_feed_on_post_insert
    AFTER INSERT ON posts
    FOR EACH ROW
    EXECUTE FUNCTION refresh_community_feed_materialized_view();

DROP TRIGGER IF EXISTS refresh_community_feed_on_post_update ON posts;
CREATE TRIGGER refresh_community_feed_on_post_update
    AFTER UPDATE ON posts
    FOR EACH ROW
    EXECUTE FUNCTION refresh_community_feed_materialized_view();

DROP TRIGGER IF EXISTS refresh_community_feed_on_post_delete ON posts;
CREATE TRIGGER refresh_community_feed_on_post_delete
    AFTER DELETE ON posts
    FOR EACH ROW
    EXECUTE FUNCTION refresh_community_feed_materialized_view();

-- Also refresh when user profiles are updated (since they affect author info)
DROP TRIGGER IF EXISTS refresh_community_feed_on_profile_update ON user_profiles;
CREATE TRIGGER refresh_community_feed_on_profile_update
    AFTER UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION refresh_community_feed_materialized_view();