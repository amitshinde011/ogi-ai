
import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { getLocalDateString } from '@/utils/dateUtils';

interface ActivityData {
  mealsLogged: number;
  suryaNamaskarCount: number;
  meditationCompleted: boolean;
  waterLitres: number;
  steps: number;
}

const cache = new Map<string, { data: ActivityData; timestamp: number }>();
const CACHE_DURATION = 30000; // 30 seconds

export const useTodayActivity = () => {
  const { user } = useAuth();
  const [activityData, setActivityData] = useState<ActivityData>({
    mealsLogged: 0,
    suryaNamaskarCount: 0,
    meditationCompleted: false,
    waterLitres: 0,
    steps: 0
  });
  const [loading, setLoading] = useState(true);
  const isInitialLoad = useRef(true);
  const lastFetchRef = useRef<number>(0);

  const fetchTodayActivity = useCallback(async () => {
    // Only set loading state for initial load
    if (isInitialLoad.current) {
      setLoading(true);
    }
    try {
      if (!user) return;

      const today = getLocalDateString();
      const cacheKey = `${user.id}-${today}`;
      
      // Clear cache to ensure fresh data
      cache.delete(cacheKey);

      // Fetch all data in parallel
      const [mealsResult, wellnessResult, stepsResult] = await Promise.all([
        supabase
          .from('meal_tracking')
          .select('meal_type')
          .eq('user_id', user.id)
          .eq('date', today),
        
        supabase
          .from('daily_wellness')
          .select('*')
          .eq('user_id', user.id)
          .eq('date', today)
          .maybeSingle(),
        
        supabase
          .from('steps_tracking')
          .select('steps_count')
          .eq('user_id', user.id)
          .eq('date', today)
          .maybeSingle()
      ]);

      // Count unique meal types
      const uniqueMealTypes = new Set(mealsResult.data?.map(m => m.meal_type.toLowerCase()) || []);
      const mealsLogged = uniqueMealTypes.size;

      const newActivityData = {
        mealsLogged,
        suryaNamaskarCount: wellnessResult.data?.surya_namaskar_count || 0,
        meditationCompleted: wellnessResult.data?.meditation_completed || false,
        waterLitres: wellnessResult.data?.water_litres || 0,
        steps: stepsResult.data?.steps_count || 0
      };

      // Cache the result
      cache.set(cacheKey, { data: newActivityData, timestamp: Date.now() });
      setActivityData(newActivityData);
    } catch (error) {
      console.error('Error fetching today activity:', error);
    } finally {
      // Only update loading state if it was an initial load
      if (isInitialLoad.current) {
        setLoading(false);
        isInitialLoad.current = false;
      }
    }
  }, [user]);

  useEffect(() => {
    const now = Date.now();
    // Only fetch if enough time has passed since last fetch
    if (now - lastFetchRef.current > CACHE_DURATION) {
      fetchTodayActivity();
      lastFetchRef.current = now;
    } else if (isInitialLoad.current) {
      setLoading(false);
      isInitialLoad.current = false;
    }
  }, [fetchTodayActivity]);

  return { activityData, loading, refetch: fetchTodayActivity };
};
