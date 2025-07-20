-- Create materialized view for notifications with sender info
CREATE MATERIALIZED VIEW notifications_with_sender AS
SELECT 
  n.id,
  n.recipient_id,
  n.sender_id,
  n.type,
  n.post_id,
  n.is_read,
  n.created_at,
  COALESCE(up.name, au.name, 'Unknown User') as sender_name,
  COALESCE(up.profile_photo_url, au.profile_photo_url, 'https://api.dicebear.com/7.x/avataaars/svg?seed=' || n.sender_id::text) as sender_profile_photo_url
FROM notifications n
LEFT JOIN user_profiles up ON n.sender_id = up.id
LEFT JOIN automation_users au ON n.sender_id = (SELECT au2.id FROM automation_users au2 WHERE au2.user_id = up.user_id);

-- Create unique index for concurrent refresh
CREATE UNIQUE INDEX idx_notifications_with_sender_id ON notifications_with_sender(id);

-- Create materialized view for posts with author info
CREATE MATERIALIZED VIEW posts_with_author AS
SELECT 
  p.id,
  p.image_url,
  p.caption,
  p.category,
  p.created_at,
  p.like_count,
  p.comment_count,
  p.author_id,
  p.report_count,
  p.is_reported,
  p.report_threshold_reached,
  COALESCE(up.name, au.name, 'Unknown User') as author_name,
  COALESCE(up.profile_photo_url, au.profile_photo_url, 'https://api.dicebear.com/7.x/avataaars/svg?seed=' || p.author_id::text) as author_avatar
FROM posts p
LEFT JOIN user_profiles up ON p.author_id = up.user_id
LEFT JOIN automation_users au ON p.author_id = au.user_id;

-- Create unique index for concurrent refresh
CREATE UNIQUE INDEX idx_posts_with_author_id ON posts_with_author(id);

-- Function to refresh notifications materialized view
CREATE OR REPLACE FUNCTION refresh_notifications_view()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY notifications_with_sender;
END;
$$;

-- Function to refresh posts materialized view
CREATE OR REPLACE FUNCTION refresh_posts_view()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY posts_with_author;
END;
$$;

-- Trigger function for notifications refresh
CREATE OR REPLACE FUNCTION trigger_notifications_refresh()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  PERFORM pg_notify('refresh_notifications_view', 'refresh_needed');
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Trigger function for posts refresh
CREATE OR REPLACE FUNCTION trigger_posts_refresh()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  PERFORM pg_notify('refresh_posts_view', 'refresh_needed');
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create triggers for notifications
DROP TRIGGER IF EXISTS notifications_refresh_trigger ON notifications;
CREATE TRIGGER notifications_refresh_trigger
  AFTER INSERT OR UPDATE OR DELETE ON notifications
  FOR EACH ROW
  EXECUTE FUNCTION trigger_notifications_refresh();

DROP TRIGGER IF EXISTS user_profiles_notifications_refresh_trigger ON user_profiles;
CREATE TRIGGER user_profiles_notifications_refresh_trigger
  AFTER UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION trigger_notifications_refresh();

-- Create triggers for posts
DROP TRIGGER IF EXISTS posts_refresh_trigger ON posts;
CREATE TRIGGER posts_refresh_trigger
  AFTER INSERT OR UPDATE OR DELETE ON posts
  FOR EACH ROW
  EXECUTE FUNCTION trigger_posts_refresh();

DROP TRIGGER IF EXISTS user_profiles_posts_refresh_trigger ON user_profiles;
CREATE TRIGGER user_profiles_posts_refresh_trigger
  AFTER UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION trigger_posts_refresh();