import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useAnalytics } from '@/hooks/useAnalytics';
import { getLocalDateString } from '@/utils/dateUtils';
import { localCache } from '@/utils/localCache';

interface HomeData {
  todayProgress: {
    breakfast: boolean;
    lunch: boolean;
    dinner: boolean;
    steps: number;
    walkScore: number;
    saladBowl: boolean;
    kanji: boolean;
  };
  weeklyStreak: boolean[];
  wellnessData: {
    id?: string;
    water_litres: number;
    surya_namaskar_count: number;
    meditation_completed: boolean;
  };
}

export const useOptimizedHomeData = () => {
  const { user } = useAuth();
  console.log('🏠 useOptimizedHomeData: Hook initialized');
  
  const [data, setData] = useState<HomeData>({
    todayProgress: {
      breakfast: false,
      lunch: false,
      dinner: false,
      steps: 0,
      walkScore: 0,
      saladBowl: false,
      kanji: false
    },
    weeklyStreak: [],
    wellnessData: {
      water_litres: 0,
      surya_namaskar_count: 0,
      meditation_completed: false
    }
  });
  const [loading, setLoading] = useState(true);
  const { trackEvent } = useAnalytics();
  const fetchingRef = useRef(false);
  const lastFetchRef = useRef<number>(0);
  const isInitialLoad = useRef(true);

  const fetchAllData = useCallback(async () => {
    if (!user) {
      console.log('👤 useOptimizedHomeData: Waiting for user authentication');
      setLoading(false);
      return;
    }

    const now = Date.now();
    
    if (fetchingRef.current && (now - lastFetchRef.current > 30000)) {
      console.log('🔄 useOptimizedHomeData: Resetting stuck fetching flag');
      fetchingRef.current = false;
    }
    
    if (fetchingRef.current || (now - lastFetchRef.current < 2000)) {
      console.log('🚫 useOptimizedHomeData: Preventing duplicate fetch');
      return;
    }

    fetchingRef.current = true;
    lastFetchRef.current = now;
    if (isInitialLoad.current) {
      setLoading(true);
    }
    
    console.log('📡 useOptimizedHomeData: Starting data fetch');
    const startTime = performance.now();
    
    try {
      // ... (rest of the fetchAllData function remains the same)
       if (!user) {
        console.warn('⚠️ useOptimizedHomeData: No authenticated user found');
        trackEvent('home_data_error', 'Error', 'No User');
        setLoading(false);
        return;
      }

      console.log('👤 useOptimizedHomeData: User authenticated:', user.id);
      
      const today = getLocalDateString();
      const currentDay = new Date().getDay();
      const monday = new Date();
      const daysToMonday = currentDay === 0 ? -6 : 1 - currentDay;
      monday.setDate(monday.getDate() + daysToMonday);
      
      const weekDates = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(monday);
        date.setDate(monday.getDate() + i);
        return getLocalDateString(date);
      });

      // Offline-first: show cached data immediately
      const cachedWellness = localCache.getTodayWellness(user.id, today);
      const localSteps = localCache.getLocalSteps(user.id, today);
      const offlineMeals = localCache.getOfflineMeals(user.id, today).map(m => m.toLowerCase());

      setData(d => ({
        ...d,
        todayProgress: {
          ...d.todayProgress,
          breakfast: offlineMeals.includes('breakfast') || d.todayProgress.breakfast,
          lunch: offlineMeals.includes('lunch') || d.todayProgress.lunch,
          dinner: offlineMeals.includes('dinner') || d.todayProgress.dinner,
          steps: localSteps,
          walkScore: Math.min(Math.floor((localSteps / 5000) * 5), 5),
          saladBowl: d.todayProgress.saladBowl,
          kanji: d.todayProgress.kanji,
        },
        wellnessData: cachedWellness ? {
          water_litres: cachedWellness.water_litres || 0,
          surya_namaskar_count: cachedWellness.surya_namaskar_count || 0,
          meditation_completed: !!cachedWellness.meditation_completed,
        } : d.wellnessData,
      }));

      // Network fetch (will only update if newer)
      console.warn('ℹ️ useOptimizedHomeData: Using direct queries (RPC removed)');
      const [mealsResult, wellnessResult, stepsResult, weeklyWellnessRes] = await Promise.all([
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
          .select('steps_count, updated_at')
          .eq('user_id', user.id)
          .eq('date', today)
          .maybeSingle(),
        supabase
          .from('daily_wellness')
          .select('date, meditation_completed, water_litres, surya_namaskar_count')
          .eq('user_id', user.id)
          .in('date', weekDates)
      ]);

      const dbMealTypes = new Set((mealsResult.data || []).map(m => (m.meal_type || '').toLowerCase()));
      const mergedMeals = new Set<string>([...dbMealTypes, ...offlineMeals]);
      const dbSteps = stepsResult?.data?.steps_count || 0;
      const finalSteps = Math.max(localSteps, dbSteps);

      const weeklyWellness = weeklyWellnessRes.data || [];
      const streak = weekDates.map(date => {
        const dayData = weeklyWellness.find((w: any) => w.date === date);
        return !!(dayData?.meditation_completed || 
                 (dayData?.water_litres && dayData.water_litres > 0) || 
                 (dayData?.surya_namaskar_count && dayData.surya_namaskar_count > 0));
      });

      // If DB wellness is newer and cache missing/stale, refresh cache
      if (wellnessResult.data) {
        const dbTs = wellnessResult.data.updated_at ? new Date(wellnessResult.data.updated_at as any).getTime() : 0;
        const cacheTs = cachedWellness?.timestamp || 0;
        if (dbTs > cacheTs) {
          localCache.setTodayWellness(user.id, today, {
            water_litres: wellnessResult.data.water_litres || 0,
            surya_namaskar_count: wellnessResult.data.surya_namaskar_count || 0,
            meditation_completed: wellnessResult.data.meditation_completed || false,
            meditation_minutes: 0,
          }, dbTs);
        }
      }

      setData({
        todayProgress: {
          breakfast: mergedMeals.has('breakfast'),
          lunch: mergedMeals.has('lunch'),
          dinner: mergedMeals.has('dinner'),
          steps: finalSteps,
          walkScore: Math.min(Math.floor((finalSteps / 5000) * 5), 5),
          saladBowl: false,
          kanji: false
        },
        weeklyStreak: streak,
        wellnessData: cachedWellness ? {
          water_litres: cachedWellness.water_litres || 0,
          surya_namaskar_count: cachedWellness.surya_namaskar_count || 0,
          meditation_completed: !!cachedWellness.meditation_completed,
        } : {
          water_litres: wellnessResult.data?.water_litres || 0,
          surya_namaskar_count: wellnessResult.data?.surya_namaskar_count || 0,
          meditation_completed: wellnessResult.data?.meditation_completed || false
        }
      });

      const endTime = performance.now();
      console.log(`✅ useOptimizedHomeData: Data fetch completed in ${(endTime - startTime).toFixed(2)}ms (direct queries)`);
      return;
    } catch (error) {
      console.error('❌ useOptimizedHomeData: Error fetching home data:', error);
      trackEvent('home_data_error', 'Error', 'Fetch Failed');
    } finally {
      if (isInitialLoad.current) {
        setLoading(false);
        isInitialLoad.current = false;
        console.log('🏁 useOptimizedHomeData: Initial load completed');
      }
      fetchingRef.current = false;
    }
  }, [user, trackEvent]);

  // Create a ref to hold the latest fetchAllData function
  const fetchAllDataRef = useRef(fetchAllData);
  useEffect(() => {
    fetchAllDataRef.current = fetchAllData;
  });

  // This useEffect now safely runs only once on mount
  useEffect(() => {
    const handleStepsUpdated = (event: CustomEvent) => {
      const newSteps = event.detail.steps;
      setData(prev => ({
        ...prev,
        todayProgress: {
          ...prev.todayProgress,
          steps: newSteps,
          walkScore: Math.min(Math.floor((newSteps / 5000) * 5), 5),
        },
      }));
    };

    const triggerRefetch = () => {
      setTimeout(() => {
        fetchAllDataRef.current();
      }, 300);
    };

    const handleMealLogged = triggerRefetch;
    const handleWellnessUpdated = triggerRefetch;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchAllDataRef.current();
      }
    };

    window.addEventListener('stepsUpdated', handleStepsUpdated as EventListener);
    window.addEventListener('mealLogged', handleMealLogged as EventListener);
    window.addEventListener('wellnessUpdated', handleWellnessUpdated as EventListener);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      window.removeEventListener('stepsUpdated', handleStepsUpdated as EventListener);
      window.removeEventListener('mealLogged', handleMealLogged as EventListener);
      window.removeEventListener('wellnessUpdated', handleWellnessUpdated as EventListener);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []); // Corrected: Empty dependency array

  useEffect(() => {
    if (user) {
      fetchAllData();
    }
  }, [user, fetchAllData]);

  return { data, loading, refetch: fetchAllData };
};