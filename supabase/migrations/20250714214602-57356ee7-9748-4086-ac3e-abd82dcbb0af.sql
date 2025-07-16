-- Drop all dependent materialized views first
DROP MATERIALIZED VIEW IF EXISTS weekly_progress_summary CASCADE;
DROP MATERIALIZED VIEW IF EXISTS user_program_summary CASCADE;
DROP MATERIALIZED VIEW IF EXISTS daily_activity_summary CASCADE;

-- Recreate the daily_activity_summary materialized view with correct walk score calculation
CREATE MATERIALIZED VIEW daily_activity_summary AS
SELECT 
  COALESCE(dw.user_id, mt.user_id, st.user_id) as user_id,
  COALESCE(dw.date, mt.date, st.date) as date,
  COALESCE(
    (SELECT COUNT(DISTINCT meal_type) 
     FROM meal_tracking mt2 
     WHERE mt2.user_id = COALESCE(dw.user_id, mt.user_id, st.user_id)
       AND mt2.date = COALESCE(dw.date, mt.date, st.date)
    ), 0
  ) as meals_logged,
  COALESCE(dw.water_litres, 0) as water_litres,
  COALESCE(dw.surya_namaskar_count, 0) as surya_namaskar_count,
  COALESCE(dw.meditation_completed, false) as meditation_completed,
  COALESCE(st.steps_count, 0) as steps_count,
  -- Fixed walk score calculation: should be based on 5000 steps = 5 stars
  CASE 
    WHEN COALESCE(st.steps_count, 0) > 0 THEN 
      LEAST(FLOOR((COALESCE(st.steps_count, 0)::numeric / 5000) * 5), 5)::integer
    ELSE 0 
  END as walk_score,
  EXISTS(
    SELECT 1 FROM meal_tracking mt3 
    WHERE mt3.user_id = COALESCE(dw.user_id, mt.user_id, st.user_id)
      AND mt3.date = COALESCE(dw.date, mt.date, st.date)
      AND mt3.meal_type = 'breakfast'
  ) as has_breakfast,
  EXISTS(
    SELECT 1 FROM meal_tracking mt4 
    WHERE mt4.user_id = COALESCE(dw.user_id, mt.user_id, st.user_id)
      AND mt4.date = COALESCE(dw.date, mt.date, st.date)
      AND mt4.meal_type = 'lunch'
  ) as has_lunch,
  EXISTS(
    SELECT 1 FROM meal_tracking mt5 
    WHERE mt5.user_id = COALESCE(dw.user_id, mt.user_id, st.user_id)
      AND mt5.date = COALESCE(dw.date, mt.date, st.date)
      AND mt5.meal_type = 'dinner'
  ) as has_dinner,
  EXISTS(
    SELECT 1 FROM meal_tracking mt6 
    WHERE mt6.user_id = COALESCE(dw.user_id, mt.user_id, st.user_id)
      AND mt6.date = COALESCE(dw.date, mt.date, st.date)
      AND LOWER(mt6.food_item) LIKE '%salad%' 
      AND LOWER(mt6.food_item) LIKE '%bowl%'
  ) as has_salad_bowl,
  EXISTS(
    SELECT 1 FROM meal_tracking mt7 
    WHERE mt7.user_id = COALESCE(dw.user_id, mt.user_id, st.user_id)
      AND mt7.date = COALESCE(dw.date, mt.date, st.date)
      AND (LOWER(mt7.food_item) LIKE '%kanji%' 
           OR LOWER(mt7.food_item) LIKE '%millet%' 
           OR LOWER(mt7.food_item) LIKE '%porridge%')
  ) as has_kanji,
  GREATEST(
    COALESCE(dw.updated_at, dw.created_at),
    COALESCE(mt.updated_at, mt.created_at),
    COALESCE(st.updated_at, st.created_at)
  ) as last_updated
FROM daily_wellness dw
FULL OUTER JOIN (
  SELECT user_id, date, MAX(updated_at) as updated_at, MAX(created_at) as created_at
  FROM meal_tracking 
  GROUP BY user_id, date
) mt ON dw.user_id = mt.user_id AND dw.date = mt.date
FULL OUTER JOIN steps_tracking st ON COALESCE(dw.user_id, mt.user_id) = st.user_id 
  AND COALESCE(dw.date, mt.date) = st.date;

-- Recreate weekly_progress_summary materialized view
CREATE MATERIALIZED VIEW weekly_progress_summary AS
SELECT 
  user_id,
  DATE_TRUNC('week', date)::date + INTERVAL '1 day' as week_start,
  COUNT(DISTINCT date) as days_tracked,
  COUNT(DISTINCT CASE WHEN meals_logged > 0 THEN date END) as days_with_meals,
  COUNT(DISTINCT CASE WHEN meditation_completed = true THEN date END) as meditation_days,
  COUNT(DISTINCT CASE WHEN surya_namaskar_count > 0 THEN date END) as yoga_days,
  COUNT(DISTINCT CASE WHEN steps_count >= 5000 THEN date END) as step_goal_days,
  ROUND(AVG(COALESCE(water_litres, 0))::numeric, 2) as avg_water,
  ROUND(AVG(COALESCE(steps_count, 0))::numeric, 0) as avg_steps,
  SUM(COALESCE(steps_count, 0)) as total_steps,
  SUM(COALESCE(water_litres, 0)) as total_water,
  MAX(last_updated) as last_updated
FROM daily_activity_summary
GROUP BY user_id, DATE_TRUNC('week', date);

-- Recreate user_program_summary materialized view
CREATE MATERIALIZED VIEW user_program_summary AS
SELECT 
  us.user_id,
  us.id as subscription_id,
  p.name as program_name,
  us.start_date,
  us.end_date,
  p.duration_days,
  us.status,
  -- Calculate days completed based on start date to today (or end date if completed)
  CASE 
    WHEN us.start_date IS NULL THEN 0
    WHEN CURRENT_DATE < us.start_date THEN 0
    WHEN us.end_date IS NOT NULL AND CURRENT_DATE > us.end_date THEN 
      (us.end_date - us.start_date + 1)
    ELSE 
      (CURRENT_DATE - us.start_date + 1)
  END as days_completed,
  -- Calculate progress percentage
  CASE 
    WHEN us.start_date IS NULL OR p.duration_days IS NULL OR p.duration_days = 0 THEN 0
    WHEN CURRENT_DATE < us.start_date THEN 0
    WHEN us.end_date IS NOT NULL AND CURRENT_DATE > us.end_date THEN 100
    ELSE 
      LEAST(100, ROUND(((CURRENT_DATE - us.start_date + 1)::numeric / p.duration_days) * 100, 0))
  END as progress_percentage,
  -- Determine if program is completed
  (us.end_date IS NOT NULL AND CURRENT_DATE > us.end_date) as is_completed,
  -- Determine if this is the current active program
  (us.status = 'active' AND 
   (us.start_date IS NULL OR CURRENT_DATE >= us.start_date) AND 
   (us.end_date IS NULL OR CURRENT_DATE <= us.end_date)) as is_current,
  GREATEST(us.updated_at, us.created_at) as last_updated
FROM user_subscriptions us
LEFT JOIN programs p ON us.program_id = p.id
WHERE us.status IN ('active', 'completed');

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_daily_activity_summary_user_date ON daily_activity_summary(user_id, date);
CREATE INDEX IF NOT EXISTS idx_daily_activity_summary_date ON daily_activity_summary(date);
CREATE INDEX IF NOT EXISTS idx_weekly_progress_summary_user_week ON weekly_progress_summary(user_id, week_start);
CREATE INDEX IF NOT EXISTS idx_user_program_summary_user ON user_program_summary(user_id);