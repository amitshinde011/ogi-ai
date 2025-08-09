-- Phase 2 follow-up: Drop remaining materialized views with proper ordering / CASCADE
DROP MATERIALIZED VIEW IF EXISTS public.weekly_progress_summary CASCADE;
DROP MATERIALIZED VIEW IF EXISTS public.daily_activity_summary CASCADE;
DROP MATERIALIZED VIEW IF EXISTS public.user_program_summary CASCADE;
DROP MATERIALIZED VIEW IF EXISTS public.notifications_with_sender CASCADE;
DROP MATERIALIZED VIEW IF EXISTS public.posts_with_author CASCADE;
DROP MATERIALIZED VIEW IF EXISTS public.community_feed_view CASCADE;