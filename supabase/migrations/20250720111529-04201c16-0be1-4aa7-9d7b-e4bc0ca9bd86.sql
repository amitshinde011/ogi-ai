
-- Fix the post_id data type mismatch in notifications table
ALTER TABLE notifications ALTER COLUMN post_id TYPE bigint USING post_id::text::bigint;

-- Create function to handle like notifications
CREATE OR REPLACE FUNCTION create_like_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create notification if the liker is not the post owner
  IF NEW.user_id != (SELECT author_id FROM posts WHERE id = NEW.post_id) THEN
    INSERT INTO notifications (recipient_id, sender_id, type, post_id)
    SELECT 
      -- Get the user_profiles.id for the post author
      (SELECT up.id FROM user_profiles up WHERE up.user_id = p.author_id),
      -- Get the user_profiles.id for the person who liked
      (SELECT up.id FROM user_profiles up WHERE up.user_id = NEW.user_id),
      'like',
      NEW.post_id
    FROM posts p WHERE p.id = NEW.post_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for like notifications
DROP TRIGGER IF EXISTS like_notification_trigger ON likes;
CREATE TRIGGER like_notification_trigger
  AFTER INSERT ON likes
  FOR EACH ROW
  EXECUTE FUNCTION create_like_notification();

-- Create function to handle comment notifications  
CREATE OR REPLACE FUNCTION create_comment_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create notification if the commenter is not the post owner
  IF NEW.author_id != (SELECT author_id FROM posts WHERE id = NEW.post_id) THEN
    INSERT INTO notifications (recipient_id, sender_id, type, post_id)
    SELECT 
      -- Get the user_profiles.id for the post author
      (SELECT up.id FROM user_profiles up WHERE up.user_id = p.author_id),
      -- Get the user_profiles.id for the person who commented
      (SELECT up.id FROM user_profiles up WHERE up.user_id = NEW.author_id),
      'comment',
      NEW.post_id
    FROM posts p WHERE p.id = NEW.post_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for comment notifications
DROP TRIGGER IF EXISTS comment_notification_trigger ON comments;
CREATE TRIGGER comment_notification_trigger
  AFTER INSERT ON comments
  FOR EACH ROW
  EXECUTE FUNCTION create_comment_notification();
