
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ActivityData {
  mealsLogged: number;
  suryaNamaskarCount: number;
  meditationCompleted: boolean;
  waterLitres: number;
  steps: number;
}

export const useTodayActivity = () => {
  const [activityData, setActivityData] = useState<ActivityData>({
    mealsLogged: 0,
    suryaNamaskarCount: 0,
    meditationCompleted: false,
    waterLitres: 0,
    steps: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTodayActivity();
  }, []);

  const fetchTodayActivity = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const today = new Date().toISOString().split('T')[0];

      // Fetch meals data
      const { data: meals } = await supabase
        .from('meal_tracking')
        .select('meal_type')
        .eq('user_id', user.id)
        .eq('date', today);

      // Fetch wellness data
      const { data: wellness } = await supabase
        .from('daily_wellness')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .maybeSingle();

      // Fetch steps data
      const { data: steps } = await supabase
        .from('steps_tracking')
        .select('steps_count')
        .eq('user_id', user.id)
        .eq('date', today)
        .maybeSingle();

      // Count unique meal types
      const uniqueMealTypes = new Set(meals?.map(m => m.meal_type.toLowerCase()) || []);
      const mealsLogged = uniqueMealTypes.size;

      setActivityData({
        mealsLogged,
        suryaNamaskarCount: wellness?.surya_namaskar_count || 0,
        meditationCompleted: wellness?.meditation_completed || false,
        waterLitres: wellness?.water_litres || 0,
        steps: steps?.steps_count || 0
      });
    } catch (error) {
      console.error('Error fetching today activity:', error);
    } finally {
      setLoading(false);
    }
  };

  return { activityData, loading, refetch: fetchTodayActivity };
};
