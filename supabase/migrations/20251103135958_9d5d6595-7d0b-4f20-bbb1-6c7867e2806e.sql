-- Move pg_net extension to extensions schema
CREATE SCHEMA IF NOT EXISTS extensions;

-- Drop and recreate pg_net in the correct schema
DROP EXTENSION IF EXISTS pg_net CASCADE;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Disable RLS on rate_limit_log since it's a system table
ALTER TABLE public.rate_limit_log DISABLE ROW LEVEL SECURITY;