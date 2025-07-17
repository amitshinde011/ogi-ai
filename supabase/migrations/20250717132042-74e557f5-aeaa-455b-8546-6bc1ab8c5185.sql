-- Set up cron jobs for automation
SELECT cron.schedule(
  'automation-posting-bot',
  '*/15 * * * *', -- every 15 minutes
  $$
  SELECT
    net.http_post(
        url:='https://mxigbftmmkqnhmocyeeo.supabase.co/functions/v1/automation-posting-bot',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im14aWdiZnRtbWtxbmhtb2N5ZWVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg5ODQ3NDIsImV4cCI6MjA2NDU2MDc0Mn0.hbYNmEvhL-tSN7ib7A0gFrNZocpVi5uKaTEhC_yAQSU"}'::jsonb,
        body:='{"scheduled": true}'::jsonb
    ) as request_id;
  $$
);

SELECT cron.schedule(
  'automation-engagement-bot',
  '*/10 * * * *', -- every 10 minutes
  $$
  SELECT
    net.http_post(
        url:='https://mxigbftmmkqnhmocyeeo.supabase.co/functions/v1/automation-engagement-bot',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im14aWdiZnRtbWtxbmhtb2N5ZWVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg5ODQ3NDIsImV4cCI6MjA2NDU2MDc0Mn0.hbYNmEvhL-tSN7ib7A0gFrNZocpVi5uKaTEhC_yAQSU"}'::jsonb,
        body:='{"scheduled": true}'::jsonb
    ) as request_id;
  $$
);