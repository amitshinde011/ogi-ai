-- Refresh the community feed materialized view to apply the new filtering
REFRESH MATERIALIZED VIEW IF EXISTS community_feed_view;