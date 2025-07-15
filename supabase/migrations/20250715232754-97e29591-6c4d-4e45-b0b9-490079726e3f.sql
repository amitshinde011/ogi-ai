-- Fix the comment count for post 48
UPDATE posts SET comment_count = (
  SELECT COUNT(*) FROM comments WHERE post_id = posts.id
) WHERE id = 48;

-- Let's also fix any other posts that might have incorrect counts
UPDATE posts SET comment_count = (
  SELECT COUNT(*) FROM comments WHERE post_id = posts.id
) WHERE id IN (
  SELECT DISTINCT post_id FROM comments
);

-- Verify the trigger exists and recreate it to ensure it works properly
DROP TRIGGER IF EXISTS on_comment_change ON comments;

CREATE TRIGGER on_comment_change
AFTER INSERT OR DELETE ON comments
FOR EACH ROW EXECUTE FUNCTION handle_comment_change();