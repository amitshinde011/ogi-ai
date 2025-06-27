
-- This policy allows anyone to view all rows in the user_profiles table.
-- This is common for public profile information like names and avatars.
CREATE POLICY "User profiles are viewable by everyone."
ON public.user_profiles FOR SELECT
USING (true);
