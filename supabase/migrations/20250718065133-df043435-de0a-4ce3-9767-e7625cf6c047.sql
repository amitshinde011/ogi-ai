-- Keep only one automation user active for testing
UPDATE automation_users 
SET is_active = false 
WHERE id NOT IN (
  SELECT id 
  FROM automation_users 
  WHERE is_active = true 
  ORDER BY created_at ASC 
  LIMIT 1
);