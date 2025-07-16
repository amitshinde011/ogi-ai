-- Fix comment count triggers and update existing data

-- Drop existing trigger first
DROP TRIGGER IF EXISTS on_comment_change ON comments;

-- Create improved comment count trigger function
CREATE OR REPLACE FUNCTION update_comment_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Increment comment count
        UPDATE posts 
        SET comment_count = comment_count + 1 
        WHERE id = NEW.post_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        -- Decrement comment count
        UPDATE posts 
        SET comment_count = GREATEST(0, comment_count - 1) 
        WHERE id = OLD.post_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create new trigger for comment changes
CREATE TRIGGER update_comment_count_trigger
    AFTER INSERT OR DELETE ON comments
    FOR EACH ROW
    EXECUTE FUNCTION update_comment_count();

-- Fix existing comment counts by recalculating from actual comments
UPDATE posts 
SET comment_count = (
    SELECT COUNT(*) 
    FROM comments 
    WHERE comments.post_id = posts.id
)
WHERE comment_count != (
    SELECT COUNT(*) 
    FROM comments 
    WHERE comments.post_id = posts.id
);

-- Refresh the community feed materialized view to reflect updated counts
REFRESH MATERIALIZED VIEW community_feed_view;