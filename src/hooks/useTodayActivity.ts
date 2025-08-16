
import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { getLocalDateString } from '@/utils/dateUtils';
import { localCache } from '@/utils/localCache';

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

      // Offline-first: load from IndexedDB immediately
      const [cachedWellness, localSteps, offlineMeals] = await Promise.all([
        localCache.getTodayWellness(user.id, today),
        localCache.getLocalSteps(user.id, today),
        localCache.getOfflineMeals(user.id, today),
      ]);

      const uniqueMealTypesOffline = new Set((offlineMeals || []).map(m => m.toLowerCase()));
      const offlineData: ActivityData = {
        mealsLogged: uniqueMealTypesOffline.size,
        suryaNamaskarCount: cachedWellness?.surya_namaskar_count || 0,
        meditationCompleted: !!cachedWellness?.meditation_completed,
        waterLitres: cachedWellness?.water_litres || 0,
        steps: Number(localSteps) || 0,
      };
      setActivityData(offlineData);
      cache.set(cacheKey, { data: offlineData, timestamp: Date.now() });

      // If offline, stop here
      if (!navigator.onLine) return;

      // Fetch all data in parallel
      const [mealsResult, wellnessResult, stepsResult] = await Promise.all([
        supabase
          .from('meal_tracking')
          .select('meal_type')
          .eq('user_id', user.id)
          .eq('date', today),
        supabase
          .from('daily_wellness')
          .select('water_litres, surya_namaskar_count, meditation_completed, updated_at')
          .eq('user_id', user.id)
          .eq('date', today)
          .maybeSingle(),
        supabase
          .from('steps_tracking')
          .select('steps_count')
          .eq('user_id', user.id)
          .eq('date', today)
          .maybeSingle(),
      ]);

      // Merge offline + online
      const uniqueMealTypes = new Set([
        ...((mealsResult.data || []).map((m: any) => (m.meal_type || '').toLowerCase())),
        ...Array.from(uniqueMealTypesOffline),
      ]);
      const mealsLogged = uniqueMealTypes.size;

      // Update local wellness cache if DB is newer
      if (wellnessResult.data) {
        const dbTs = wellnessResult.data.updated_at ? new Date(wellnessResult.data.updated_at as any).getTime() : 0;
        const cacheTs = cachedWellness?.timestamp || 0;
        if (dbTs > cacheTs) {
          await localCache.setTodayWellness(user.id, today, {
            water_litres: wellnessResult.data.water_litres || 0,
            surya_namaskar_count: wellnessResult.data.surya_namaskar_count || 0,
            meditation_completed: wellnessResult.data.meditation_completed || false,
            meditation_minutes: 0,
          }, dbTs);
        }
      }

      const finalSteps = Math.max(Number(localSteps) || 0, stepsResult.data?.steps_count || 0);

      const newActivityData: ActivityData = {
        mealsLogged,
        suryaNamaskarCount: wellnessResult.data?.surya_namaskar_count || cachedWellness?.surya_namaskar_count || 0,
        meditationCompleted: wellnessResult.data?.meditation_completed ?? (!!cachedWellness?.meditation_completed),
        waterLitres: wellnessResult.data?.water_litres || cachedWellness?.water_litres || 0,
        steps: finalSteps,
      };

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
