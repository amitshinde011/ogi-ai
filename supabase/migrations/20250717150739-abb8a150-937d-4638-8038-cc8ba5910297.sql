-- Fix invalid timezone for Marcus Thompson
UPDATE automation_users 
SET timezone = 'America/New_York' 
WHERE name = 'Marcus Thompson' AND timezone = 'America/Atlanta';