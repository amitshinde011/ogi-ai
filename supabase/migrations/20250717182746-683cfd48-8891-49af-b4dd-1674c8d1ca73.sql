-- Check if materialized view exists and refresh it
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM information_schema.tables 
    WHERE table_name = 'community_feed_view' 
    AND table_type = 'MATERIALIZED VIEW'
  ) THEN
    REFRESH MATERIALIZED VIEW community_feed_view;
  END IF;
END $$;