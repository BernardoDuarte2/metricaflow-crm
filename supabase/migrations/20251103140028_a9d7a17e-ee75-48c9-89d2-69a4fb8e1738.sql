-- Re-enable RLS on rate_limit_log and add appropriate policies
ALTER TABLE public.rate_limit_log ENABLE ROW LEVEL SECURITY;

-- Only allow service role to manage rate limit logs (used by edge functions)
CREATE POLICY "Service role can manage rate limits"
ON public.rate_limit_log
FOR ALL
USING (auth.jwt()->>'role' = 'service_role')
WITH CHECK (auth.jwt()->>'role' = 'service_role');