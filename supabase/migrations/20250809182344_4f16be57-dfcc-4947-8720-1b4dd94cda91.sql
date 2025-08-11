-- Consolidate to v2 schema: backfill -> drop v1 -> rename v2 -> update functions
-- Safe, idempotent where possible

-- 1) Backfill data from v1 -> v2 when both exist and v2 is missing rows
DO $$
BEGIN
  -- Followers: map user_profiles.id -> auth uid
  IF to_regclass('public.followers') IS NOT NULL AND to_regclass('public.followers_v2') IS NOT NULL THEN
    INSERT INTO public.followers_v2 (follower_user_id, following_user_id, created_at)
    SELECT up_f.user_id, up_fg.user_id, f.created_at
    FROM public.followers f
    JOIN public.user_profiles up_f ON up_f.id = f.follower_id
    JOIN public.user_profiles up_fg ON up_fg.id = f.following_id
    LEFT JOIN public.followers_v2 fv2 
      ON fv2.follower_user_id = up_f.user_id AND fv2.following_user_id = up_fg.user_id
    WHERE fv2.follower_user_id IS NULL;
  END IF;

  -- Conversations: copy missing conversations
  IF to_regclass('public.conversations') IS NOT NULL AND to_regclass('public.conversations_v2') IS NOT NULL THEN
    INSERT INTO public.conversations_v2 (id, created_at)
    SELECT c.id, c.created_at
    FROM public.conversations c
    LEFT JOIN public.conversations_v2 c2 ON c2.id = c.id
    WHERE c2.id IS NULL;
  END IF;

  -- Conversation participants: map user_profiles.id -> auth uid
  IF to_regclass('public.conversation_participants') IS NOT NULL 
     AND to_regclass('public.conversation_participants_v2') IS NOT NULL THEN
    INSERT INTO public.conversation_participants_v2 (conversation_id, user_id, joined_at)
    SELECT cp.conversation_id, up.user_id, cp.joined_at
    FROM public.conversation_participants cp
    JOIN public.user_profiles up ON up.id = cp.user_id
    LEFT JOIN public.conversation_participants_v2 cp2 
      ON cp2.conversation_id = cp.conversation_id AND cp2.user_id = up.user_id
    WHERE cp2.user_id IS NULL;
  END IF;

  -- Messages: map sender user_profiles.id -> auth uid
  IF to_regclass('public.messages') IS NOT NULL AND to_regclass('public.messages_v2') IS NOT NULL THEN
    INSERT INTO public.messages_v2 (id, conversation_id, sender_user_id, message_text, created_at)
    SELECT m.id, m.conversation_id, up.user_id, m.message_text, m.created_at
    FROM public.messages m
    JOIN public.user_profiles up ON up.id = m.sender_id
    LEFT JOIN public.messages_v2 mv2 ON mv2.id = m.id
    WHERE mv2.id IS NULL;
  END IF;

  -- Notifications: map sender/recipient user_profiles.id -> auth uid
  IF to_regclass('public.notifications') IS NOT NULL AND to_regclass('public.notifications_v2') IS NOT NULL THEN
    INSERT INTO public.notifications_v2 (id, recipient_user_id, sender_user_id, type, post_id, is_read, created_at)
    SELECT n.id, upr.user_id, ups.user_id, n.type, n.post_id, n.is_read, n.created_at
    FROM public.notifications n
    LEFT JOIN public.user_profiles upr ON upr.id = n.recipient_id
    LEFT JOIN public.user_profiles ups ON ups.id = n.sender_id
    LEFT JOIN public.notifications_v2 nv2 ON nv2.id = n.id
    WHERE nv2.id IS NULL;
  END IF;
END $$;

-- 2) Drop v1 tables (if present) before renaming v2 -> original names
DO $$
BEGIN
  IF to_regclass('public.followers') IS NOT NULL THEN
    DROP TABLE public.followers CASCADE;
  END IF;
  IF to_regclass('public.messages') IS NOT NULL THEN
    DROP TABLE public.messages CASCADE;
  END IF;
  IF to_regclass('public.conversation_participants') IS NOT NULL THEN
    DROP TABLE public.conversation_participants CASCADE;
  END IF;
  IF to_regclass('public.conversations') IS NOT NULL THEN
    DROP TABLE public.conversations CASCADE;
  END IF;
  IF to_regclass('public.notifications') IS NOT NULL THEN
    DROP TABLE public.notifications CASCADE;
  END IF;
END $$;

-- 3) Rename all v2 tables to original names (only if target name is free)
DO $$
BEGIN
  IF to_regclass('public.followers_v2') IS NOT NULL AND to_regclass('public.followers') IS NULL THEN
    ALTER TABLE public.followers_v2 RENAME TO followers;
  END IF;
  IF to_regclass('public.messages_v2') IS NOT NULL AND to_regclass('public.messages') IS NULL THEN
    ALTER TABLE public.messages_v2 RENAME TO messages;
  END IF;
  IF to_regclass('public.conversation_participants_v2') IS NOT NULL AND to_regclass('public.conversation_participants') IS NULL THEN
    ALTER TABLE public.conversation_participants_v2 RENAME TO conversation_participants;
  END IF;
  IF to_regclass('public.conversations_v2') IS NOT NULL AND to_regclass('public.conversations') IS NULL THEN
    ALTER TABLE public.conversations_v2 RENAME TO conversations;
  END IF;
  IF to_regclass('public.notifications_v2') IS NOT NULL AND to_regclass('public.notifications') IS NULL THEN
    ALTER TABLE public.notifications_v2 RENAME TO notifications;
  END IF;
END $$;

-- 4) Update dependent functions to align with the consolidated schema
-- create_like_notification: now targets notifications with *_user_id columns
CREATE OR REPLACE FUNCTION public.create_like_notification()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Only create notification if the liker is not the post owner
  IF NEW.user_id != (SELECT author_id FROM public.posts WHERE id = NEW.post_id) THEN
    INSERT INTO public.notifications (recipient_user_id, sender_user_id, type, post_id)
    SELECT p.author_id, NEW.user_id, 'like', NEW.post_id
    FROM public.posts p WHERE p.id = NEW.post_id;
  END IF;
  RETURN NEW;
END;
$$;

-- create_comment_notification: now targets notifications with *_user_id columns
CREATE OR REPLACE FUNCTION public.create_comment_notification()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Only create notification if the commenter is not the post owner
  IF NEW.author_id != (SELECT author_id FROM public.posts WHERE id = NEW.post_id) THEN
    INSERT INTO public.notifications (recipient_user_id, sender_user_id, type, post_id)
    SELECT p.author_id, NEW.author_id, 'comment', NEW.post_id
    FROM public.posts p WHERE p.id = NEW.post_id;
  END IF;
  RETURN NEW;
END;
$$;

-- delete_user_account: switch to consolidated tables using auth uid directly
CREATE OR REPLACE FUNCTION public.delete_user_account(target_user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result json;
  deletion_count integer := 0;
BEGIN
  -- Verify the requesting user is deleting their own account
  IF auth.uid() != target_user_id THEN
    RAISE EXCEPTION 'Unauthorized: Users can only delete their own accounts';
  END IF;

  -- Start deletion process
  
  -- Delete user's wellness tracking data
  DELETE FROM public.daily_wellness WHERE user_id = target_user_id;
  GET DIAGNOSTICS deletion_count = ROW_COUNT;
  
  -- Delete user's meal tracking data
  DELETE FROM public.meal_tracking WHERE user_id = target_user_id;
  
  -- Delete user's steps tracking data
  DELETE FROM public.steps_tracking WHERE user_id = target_user_id;
  
  -- Delete user's saved recipes
  DELETE FROM public.user_saved_recipes WHERE user_id = target_user_id;
  
  -- Delete user's video watch status
  DELETE FROM public.user_video_watch_status WHERE user_id = target_user_id;
  
  -- Delete user's onboarding data
  DELETE FROM public.user_onboarding WHERE user_id = target_user_id;
  
  -- Delete user's assessment data
  DELETE FROM public.assessment_comparisons WHERE user_id = target_user_id;
  DELETE FROM public.final_assessments WHERE user_id = target_user_id;
  DELETE FROM public.journey_assessments WHERE user_id = target_user_id;
  
  -- Delete user's subscription data
  DELETE FROM public.user_subscriptions WHERE user_id = target_user_id;
  
  -- Delete user's roles
  DELETE FROM public.user_roles WHERE user_id = target_user_id;
  
  -- Delete user's group purchase participation
  DELETE FROM public.group_purchase_participants WHERE user_id = target_user_id;
  
  -- Delete user's group purchases (they organized)
  DELETE FROM public.group_purchases WHERE organizer_id = target_user_id;
  
  -- Delete user's orders
  DELETE FROM public.orders WHERE user_id = target_user_id;
  
  -- Delete user's likes
  DELETE FROM public.likes WHERE user_id = target_user_id;
  
  -- Delete user's comments
  DELETE FROM public.comments WHERE author_id = target_user_id;
  
  -- Delete user's posts
  DELETE FROM public.posts WHERE author_id = target_user_id;
  
  -- Delete user's post reports
  DELETE FROM public.post_reports WHERE reporter_id = target_user_id;
  
  -- Delete user's notifications (sent and received)
  DELETE FROM public.notifications WHERE sender_user_id = target_user_id;
  DELETE FROM public.notifications WHERE recipient_user_id = target_user_id;
  
  -- Delete user's messages and conversation participations
  DELETE FROM public.messages WHERE sender_user_id = target_user_id;
  DELETE FROM public.conversation_participants WHERE user_id = target_user_id;
  
  -- Delete user's follower relationships
  DELETE FROM public.followers WHERE follower_user_id = target_user_id;
  DELETE FROM public.followers WHERE following_user_id = target_user_id;
  
  -- Delete user profile
  DELETE FROM public.user_profiles WHERE user_id = target_user_id;
  
  -- Finally, delete from auth.users (this will cascade delete the user completely)
  DELETE FROM auth.users WHERE id = target_user_id;
  
  -- Return success response
  result := json_build_object(
    'success', true,
    'message', 'Account successfully deleted',
    'deleted_at', now()
  );
  
  RETURN result;
  
EXCEPTION
  WHEN OTHERS THEN
    -- Return error response
    result := json_build_object(
      'success', false,
      'error', SQLERRM,
      'message', 'Failed to delete account'
    );
    RETURN result;
END;
$$;