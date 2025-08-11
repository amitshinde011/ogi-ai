-- Security hardening: add SET search_path to functions without changing logic

-- generate_invite_code
CREATE OR REPLACE FUNCTION public.generate_invite_code()
RETURNS text
LANGUAGE plpgsql
SET search_path TO 'public','pg_temp'
AS $$
BEGIN
  RETURN upper(substr(md5(random()::text), 1, 8));
END;
$$;

-- update_post_likes_count
CREATE OR REPLACE FUNCTION public.update_post_likes_count()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public','pg_temp'
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.community_posts 
    SET likes_count = likes_count + 1 
    WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.community_posts 
    SET likes_count = likes_count - 1 
    WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- update_post_comments_count
CREATE OR REPLACE FUNCTION public.update_post_comments_count()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public','pg_temp'
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.community_posts 
    SET comments_count = comments_count + 1 
    WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.community_posts 
    SET comments_count = comments_count - 1 
    WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- update_post_like_count
CREATE OR REPLACE FUNCTION public.update_post_like_count()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public','pg_temp'
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.posts 
    SET like_count = like_count + 1 
    WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.posts 
    SET like_count = like_count - 1 
    WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- update_post_comment_count
CREATE OR REPLACE FUNCTION public.update_post_comment_count()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public','pg_temp'
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.posts 
    SET comment_count = comment_count + 1 
    WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.posts 
    SET comment_count = comment_count - 1 
    WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- populate_post_user_info
CREATE OR REPLACE FUNCTION public.populate_post_user_info()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public','pg_temp'
AS $$
BEGIN
  SELECT 
    COALESCE(up.name, au.email, 'Unknown User') as user_name,
    up.profile_photo_url
  INTO 
    NEW.user_name,
    NEW.user_profile_picture_url
  FROM auth.users au
  LEFT JOIN public.user_profiles up ON au.id = up.user_id
  WHERE au.id = NEW.user_id;
  
  IF NEW.user_profile_picture_url IS NULL THEN
    NEW.user_profile_picture_url := 'https://api.dicebear.com/7.x/avataaars/svg?seed=' || NEW.user_id::text;
  END IF;
  
  RETURN NEW;
END;
$$;

-- handle_comment_change
CREATE OR REPLACE FUNCTION public.handle_comment_change()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public','pg_temp'
AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE posts SET comment_count = comment_count + 1 WHERE id = NEW.post_id;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE posts SET comment_count = comment_count - 1 WHERE id = OLD.post_id;
    END IF;
    RETURN NULL;
END;
$$;

-- populate_comment_user_info
CREATE OR REPLACE FUNCTION public.populate_comment_user_info()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public','pg_temp'
AS $$
BEGIN
  SELECT 
    COALESCE(up.name, au.email, 'Unknown User') as user_name,
    COALESCE(up.profile_photo_url, 'https://api.dicebear.com/7.x/avataaars/svg?seed=' || NEW.user_id::text) as user_avatar
  INTO 
    NEW.user_name,
    NEW.user_avatar
  FROM auth.users au
  LEFT JOIN public.user_profiles up ON au.id = up.user_id
  WHERE au.id = NEW.user_id;
  
  RETURN NEW;
END;
$$;

-- update_group_purchase_size
CREATE OR REPLACE FUNCTION public.update_group_purchase_size()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public','pg_temp'
AS $$
DECLARE
  new_size INTEGER;
  new_discount NUMERIC;
  base_price NUMERIC;
  new_discounted_price NUMERIC;
BEGIN
  SELECT COUNT(*) INTO new_size
  FROM group_purchase_participants
  WHERE group_purchase_id = COALESCE(NEW.group_purchase_id, OLD.group_purchase_id);
  
  SELECT 
    CASE 
      WHEN new_size >= 6 THEN 50
      WHEN new_size >= 5 THEN 45
      WHEN new_size >= 4 THEN 40
      WHEN new_size >= 3 THEN 35
      WHEN new_size >= 2 THEN 30
      ELSE 0
    END INTO new_discount;
  
  SELECT gp.base_price INTO base_price
  FROM group_purchases gp
  WHERE gp.id = COALESCE(NEW.group_purchase_id, OLD.group_purchase_id);
  
  new_discounted_price := base_price * (1 - new_discount / 100);
  
  UPDATE group_purchases 
  SET 
    current_size = new_size,
    discount_percentage = new_discount,
    discounted_price = new_discounted_price,
    updated_at = now()
  WHERE id = COALESCE(NEW.group_purchase_id, OLD.group_purchase_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- handle_like_change
CREATE OR REPLACE FUNCTION public.handle_like_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public','pg_temp'
as $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE public.posts SET like_count = like_count + 1 WHERE id = NEW.post_id;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE public.posts SET like_count = like_count - 1 WHERE id = OLD.post_id;
    END IF;
    RETURN NULL;
END;
$$;

-- update_profile_photos_from_automation
CREATE OR REPLACE FUNCTION public.update_profile_photos_from_automation()
RETURNS void
LANGUAGE plpgsql
SET search_path TO 'public','pg_temp'
AS $$
BEGIN
  UPDATE user_profiles p
  SET name = u.name
  FROM automation_users u
  WHERE p.user_id = u.user_id;
END;
$$;

-- set_automation_user_profile_photo
CREATE OR REPLACE FUNCTION public.set_automation_user_profile_photo()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public','pg_temp'
AS $$
BEGIN
  IF NEW.profile_photo_url IS NULL THEN
    NEW.profile_photo_url := CASE 
      WHEN NEW.persona_type = 'health_enthusiast' THEN 
        (ARRAY[
          'https://images.unsplash.com/photo-1579628573859-eee1f9a04ab3?q=80&w=400&h=400&fit=crop',
          'https://images.unsplash.com/photo-1562771379-eafdca7a02f8?q=80&w=400&h=400&fit=crop',
          'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?q=80&w=400&h=400&fit=crop'
        ])[floor(random()*3+1)]
      WHEN NEW.persona_type = 'foodie' THEN 
        (ARRAY[
          'https://images.unsplash.com/photo-1587241321921-91a834d6d191?q=80&w=400&h=400&fit=crop',
          'https://images.unsplash.com/photo-1584729724879-75a56129bddf?q=80&w=400&h=400&fit=crop',
          'https://images.unsplash.com/photo-1514846326710-096e4a8035e0?q=80&w=400&h=400&fit=crop'
        ])[floor(random()*3+1)]
      WHEN NEW.persona_type = 'home_cook' THEN 
        (ARRAY[
          'https://images.unsplash.com/photo-1589156280159-27698a70f29e?q=80&w=400&h=400&fit=crop',
          'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400&h=400&fit=crop',
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&h=400&fit=crop'
        ])[floor(random()*3+1)]
      ELSE 
        'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?q=80&w=400&h=400&fit=crop'
    END;
  END IF;
  RETURN NEW;
END;
$$;

-- has_role
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public','pg_temp'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- get_current_user_role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public','pg_temp'
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = auth.uid()
  ORDER BY 
    CASE role
      WHEN 'admin' THEN 1
      WHEN 'moderator' THEN 2
      WHEN 'user' THEN 3
    END
  LIMIT 1
$$;

-- expire_old_group_purchases
CREATE OR REPLACE FUNCTION public.expire_old_group_purchases()
RETURNS void
LANGUAGE plpgsql
SET search_path TO 'public','pg_temp'
AS $$
BEGIN
  UPDATE group_purchases 
  SET status = 'expired', updated_at = now()
  WHERE status = 'active' AND expires_at < now();
END;
$$;

-- calculate_user_streaks
CREATE OR REPLACE FUNCTION public.calculate_user_streaks(p_user_id uuid, p_start_date date DEFAULT NULL::date)
RETURNS TABLE(current_streak integer, best_streak integer, active_days integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public','pg_temp'
AS $$
DECLARE
  start_date date;
  activity_dates date[];
  current_streak_count integer := 0;
  best_streak_count integer := 0;
  temp_streak integer := 0;
  check_date date;
  active_days_count integer := 0;
BEGIN
  IF p_start_date IS NULL THEN
    SELECT us.start_date INTO start_date
    FROM user_subscriptions us
    WHERE us.user_id = p_user_id
      AND us.status = 'active'
    ORDER BY us.created_at DESC
    LIMIT 1;
    start_date := COALESCE(start_date, CURRENT_DATE - INTERVAL '8 weeks');
  ELSE
    start_date := p_start_date;
  END IF;

  SELECT ARRAY(
    SELECT DISTINCT activity_date
    FROM (
      SELECT dw.date as activity_date
      FROM daily_wellness dw
      WHERE dw.user_id = p_user_id 
        AND dw.date >= start_date
        AND (dw.meditation_completed OR dw.water_litres > 0 OR dw.surya_namaskar_count > 0)
      UNION
      SELECT DISTINCT mt.date as activity_date
      FROM meal_tracking mt
      WHERE mt.user_id = p_user_id 
        AND mt.date >= start_date
      UNION
      SELECT st.date as activity_date
      FROM steps_tracking st
      WHERE st.user_id = p_user_id 
        AND st.date >= start_date
        AND st.steps_count > 1000
    ) activities
    ORDER BY activity_date DESC
  ) INTO activity_dates;

  active_days_count := array_length(activity_dates, 1);

  check_date := CURRENT_DATE;
  
  WHILE check_date >= start_date LOOP
    IF check_date = ANY(activity_dates) THEN
      current_streak_count := current_streak_count + 1;
      temp_streak := temp_streak + 1;
      best_streak_count := GREATEST(best_streak_count, temp_streak);
    ELSE
      IF current_streak_count > 0 THEN
        EXIT;
      END IF;
      temp_streak := 0;
    END IF;
    
    check_date := check_date - INTERVAL '1 day';
  END LOOP;

  temp_streak := 0;
  FOR i IN 1..array_length(activity_dates, 1) LOOP
    IF i = 1 OR activity_dates[i-1] - activity_dates[i] = 1 THEN
      temp_streak := temp_streak + 1;
      best_streak_count := GREATEST(best_streak_count, temp_streak);
    ELSE
      temp_streak := 1;
    END IF;
  END LOOP;

  RETURN QUERY SELECT current_streak_count, best_streak_count, COALESCE(active_days_count, 0);
END;
$$;

-- delete_user_account
CREATE OR REPLACE FUNCTION public.delete_user_account(target_user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public','pg_temp'
AS $$
DECLARE
  result json;
  deletion_count integer := 0;
BEGIN
  IF auth.uid() != target_user_id THEN
    RAISE EXCEPTION 'Unauthorized: Users can only delete their own accounts';
  END IF;

  DELETE FROM public.daily_wellness WHERE user_id = target_user_id;
  GET DIAGNOSTICS deletion_count = ROW_COUNT;
  
  DELETE FROM public.meal_tracking WHERE user_id = target_user_id;
  DELETE FROM public.steps_tracking WHERE user_id = target_user_id;
  DELETE FROM public.user_saved_recipes WHERE user_id = target_user_id;
  DELETE FROM public.user_video_watch_status WHERE user_id = target_user_id;
  DELETE FROM public.user_onboarding WHERE user_id = target_user_id;
  DELETE FROM public.assessment_comparisons WHERE user_id = target_user_id;
  DELETE FROM public.final_assessments WHERE user_id = target_user_id;
  DELETE FROM public.journey_assessments WHERE user_id = target_user_id;
  DELETE FROM public.user_subscriptions WHERE user_id = target_user_id;
  DELETE FROM public.user_roles WHERE user_id = target_user_id;
  DELETE FROM public.group_purchase_participants WHERE user_id = target_user_id;
  DELETE FROM public.group_purchases WHERE organizer_id = target_user_id;
  DELETE FROM public.orders WHERE user_id = target_user_id;
  DELETE FROM public.likes WHERE user_id = target_user_id;
  DELETE FROM public.comments WHERE author_id = target_user_id;
  DELETE FROM public.posts WHERE author_id = target_user_id;
  DELETE FROM public.post_reports WHERE reporter_id = target_user_id;
  DELETE FROM public.notifications WHERE sender_user_id = target_user_id;
  DELETE FROM public.notifications WHERE recipient_user_id = target_user_id;
  DELETE FROM public.messages WHERE sender_user_id = target_user_id;
  DELETE FROM public.conversation_participants WHERE user_id = target_user_id;
  DELETE FROM public.followers WHERE follower_user_id = target_user_id;
  DELETE FROM public.followers WHERE following_user_id = target_user_id;
  DELETE FROM public.user_profiles WHERE user_id = target_user_id;
  DELETE FROM auth.users WHERE id = target_user_id;
  
  result := json_build_object(
    'success', true,
    'message', 'Account successfully deleted',
    'deleted_at', now()
  );
  
  RETURN result;
  
EXCEPTION
  WHEN OTHERS THEN
    result := json_build_object(
      'success', false,
      'error', SQLERRM,
      'message', 'Failed to delete account'
    );
    RETURN result;
END;
$$;

-- scheduled_community_feed_refresh (keep behavior, add search_path)
CREATE OR REPLACE FUNCTION public.scheduled_community_feed_refresh()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public','pg_temp'
AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM posts 
    WHERE created_at > now() - INTERVAL '5 minutes'
    LIMIT 1
  ) OR EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE updated_at > now() - INTERVAL '5 minutes'
    LIMIT 1
  ) THEN
    PERFORM public.refresh_community_feed_view();
  END IF;
END;
$$;

-- create_like_notification
CREATE OR REPLACE FUNCTION public.create_like_notification()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public','pg_temp'
AS $$
BEGIN
  IF NEW.user_id != (SELECT author_id FROM public.posts WHERE id = NEW.post_id) THEN
    INSERT INTO public.notifications (recipient_user_id, sender_user_id, type, post_id)
    SELECT p.author_id, NEW.user_id, 'like', NEW.post_id
    FROM public.posts p WHERE p.id = NEW.post_id;
  END IF;
  RETURN NEW;
END;
$$;

-- create_comment_notification
CREATE OR REPLACE FUNCTION public.create_comment_notification()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public','pg_temp'
AS $$
BEGIN
  IF NEW.author_id != (SELECT author_id FROM public.posts WHERE id = NEW.post_id) THEN
    INSERT INTO public.notifications (recipient_user_id, sender_user_id, type, post_id)
    SELECT p.author_id, NEW.author_id, 'comment', NEW.post_id
    FROM public.posts p WHERE p.id = NEW.post_id;
  END IF;
  RETURN NEW;
END;
$$;

-- update_post_report_count
CREATE OR REPLACE FUNCTION public.update_post_report_count()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public','pg_temp'
AS $$
DECLARE
  report_threshold INTEGER := 3;
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.posts 
    SET 
      report_count = report_count + 1,
      is_reported = true,
      report_threshold_reached = (report_count + 1) >= report_threshold
    WHERE id = NEW.post_id;
    
    IF (SELECT report_count FROM public.posts WHERE id = NEW.post_id) >= report_threshold THEN
      UPDATE public.posts 
      SET report_threshold_reached = true 
      WHERE id = NEW.post_id;
    END IF;
    
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.posts 
    SET 
      report_count = GREATEST(0, report_count - 1),
      is_reported = (report_count - 1) > 0,
      report_threshold_reached = (report_count - 1) >= report_threshold
    WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- update_comment_count
CREATE OR REPLACE FUNCTION public.update_comment_count()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public','pg_temp'
AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE posts 
        SET comment_count = comment_count + 1 
        WHERE id = NEW.post_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE posts 
        SET comment_count = GREATEST(0, comment_count - 1) 
        WHERE id = OLD.post_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$;

-- update_updated_at_column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public','pg_temp'
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;