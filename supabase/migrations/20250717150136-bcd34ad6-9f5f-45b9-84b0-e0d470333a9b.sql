-- Create a policy that allows service role to create posts for automation users
CREATE POLICY "Service role can create posts for automation users"
ON public.posts
FOR INSERT
TO service_role
WITH CHECK (
  author_id IN (SELECT user_id FROM automation_users WHERE user_id IS NOT NULL)
);

-- Also allow service role to read posts for automation purposes
CREATE POLICY "Service role can read all posts"
ON public.posts
FOR SELECT
TO service_role
USING (true);