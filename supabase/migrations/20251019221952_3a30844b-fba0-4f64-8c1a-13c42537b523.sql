-- Enable pg_cron extension for scheduled tasks
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Enable pg_net extension for HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule daily cleanup of completed tasks at midnight
SELECT cron.schedule(
  'cleanup-completed-tasks-daily',
  '0 0 * * *', -- At 00:00 every day
  $$
  SELECT
    net.http_post(
        url:='https://jppjrbxtvduhuyjuvxsw.supabase.co/functions/v1/cleanup-completed-tasks',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpwcGpyYnh0dmR1aHV5anV2eHN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzNjM4ODEsImV4cCI6MjA3NDkzOTg4MX0.YcaQFvbrM_P5lRx5uUf2C1r6OAy1iWmy37skrx0yxic"}'::jsonb,
        body:='{"scheduled": true}'::jsonb
    ) as request_id;
  $$
);