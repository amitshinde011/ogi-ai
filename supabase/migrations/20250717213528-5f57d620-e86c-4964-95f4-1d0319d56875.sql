-- Update automation_comments to include bot identifier
ALTER TABLE automation_comments 
ADD COLUMN bot_identifier text NOT NULL DEFAULT 'default';

-- Create a unique index to prevent duplicates and improve query performance
CREATE UNIQUE INDEX idx_unique_bot_comments 
ON automation_comments (bot_identifier, id);

-- Create an index on bot_identifier for faster filtering
CREATE INDEX idx_bot_comments_filter 
ON automation_comments (bot_identifier);