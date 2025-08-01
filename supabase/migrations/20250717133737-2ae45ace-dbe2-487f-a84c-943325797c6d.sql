-- Add cleanup activity type to automation_activity_log
ALTER TABLE public.automation_activity_log 
DROP CONSTRAINT IF EXISTS automation_activity_log_activity_type_check;

ALTER TABLE public.automation_activity_log 
ADD CONSTRAINT automation_activity_log_activity_type_check 
CHECK (activity_type IN ('post', 'like', 'comment', 'cleanup'));

-- Schedule cleanup job to run daily at 2 AM UTC
SELECT cron.schedule(
  'automation-cleanup',
  '0 2 * * *', -- daily at 2 AM
  $$
  SELECT
    net.http_post(
        url:='https://mxigbftmmkqnhmocyeeo.supabase.co/functions/v1/automation-cleanup',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im14aWdiZnRtbWtxbmhtb2N5ZWVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg5ODQ3NDIsImV4cCI6MjA2NDU2MDc0Mn0.hbYNmEvhL-tSN7ib7A0gFrNZocpVi5uKaTEhC_yAQSU"}'::jsonb,
        body:='{"scheduled": true}'::jsonb
    ) as request_id;
  $$
);