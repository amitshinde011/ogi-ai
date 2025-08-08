-- Create function to securely delete user account and all associated data
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
  DELETE FROM public.notifications WHERE sender_id IN (
    SELECT id FROM public.user_profiles WHERE user_id = target_user_id
  );
  DELETE FROM public.notifications WHERE recipient_id IN (
    SELECT id FROM public.user_profiles WHERE user_id = target_user_id
  );
  
  -- Delete user's conversations and messages
  DELETE FROM public.messages WHERE sender_id IN (
    SELECT id FROM public.user_profiles WHERE user_id = target_user_id
  );
  DELETE FROM public.conversation_participants WHERE user_id IN (
    SELECT id FROM public.user_profiles WHERE user_id = target_user_id
  );
  
  -- Delete user's followers relationships
  DELETE FROM public.followers WHERE follower_id IN (
    SELECT id FROM public.user_profiles WHERE user_id = target_user_id
  );
  DELETE FROM public.followers WHERE following_id IN (
    SELECT id FROM public.user_profiles WHERE user_id = target_user_id
  );
  
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