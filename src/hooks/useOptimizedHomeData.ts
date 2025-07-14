
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useAnalytics } from '@/hooks/useAnalytics';
import { getLocalDateString } from '@/utils/dateUtils';

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
  const [initialLoad, setInitialLoad] = useState(true);
  const { trackEvent } = useAnalytics();
  const fetchingRef = useRef(false);
  const lastFetchRef = useRef<number>(0);

  const fetchAllData = useCallback(async () => {
    if (!user) {
      console.log('👤 useOptimizedHomeData: Waiting for user authentication');
      setLoading(false);
      return;
    }

    const now = Date.now();
    
    // Reset stuck fetching flag if it's been too long (30 seconds)
    if (fetchingRef.current && (now - lastFetchRef.current > 30000)) {
      console.log('🔄 useOptimizedHomeData: Resetting stuck fetching flag');
      fetchingRef.current = false;
    }
    
    // Prevent duplicate fetches within 2 seconds (reduced from 5)
    if (fetchingRef.current || (now - lastFetchRef.current < 2000)) {
      console.log('🚫 useOptimizedHomeData: Preventing duplicate fetch');
      return;
    }

    fetchingRef.current = true;
    lastFetchRef.current = now;
    setLoading(true);
    
    console.log('📡 useOptimizedHomeData: Starting data fetch');
    const startTime = performance.now();
    
    try {
      if (!user) {
        console.warn('⚠️ useOptimizedHomeData: No authenticated user found');
        trackEvent('home_data_error', 'Error', 'No User');
        setLoading(false);
        return;
      }

      console.log('👤 useOptimizedHomeData: User authenticated:', user.id);
      
      // Use local date ensuring consistency with step tracker
      const today = getLocalDateString();
      console.log('📅 useOptimizedHomeData: Using date:', today);
      
      // Calculate week dates once using local time
      const currentDay = new Date().getDay();
      const monday = new Date();
      const daysToMonday = currentDay === 0 ? -6 : 1 - currentDay;
      monday.setDate(monday.getDate() + daysToMonday);
      
      const weekDates = [];
      for (let i = 0; i < 7; i++) {
        const date = new Date(monday);
        date.setDate(monday.getDate() + i);
        weekDates.push(getLocalDateString(date));
      }

      console.log('📅 useOptimizedHomeData: Calculated week dates:', { today, weekDates });

      // Try optimized query first, fallback to original if needed
      console.log('🔄 useOptimizedHomeData: Trying optimized materialized view query');
      
      // First refresh materialized views to get latest data
      try {
        await supabase.rpc('refresh_materialized_views');
        console.log('✅ useOptimizedHomeData: Materialized views refreshed');
      } catch (refreshError) {
        console.warn('⚠️ useOptimizedHomeData: Failed to refresh materialized views:', refreshError);
      }

      const { data: optimizedData, error: rpcError } = await supabase.rpc('get_home_data', {
        p_user_id: user.id,
        p_date: today
      });

      if (!rpcError && optimizedData && optimizedData.length > 0) {
        console.log('✅ useOptimizedHomeData: Using optimized materialized view data');
        const data = optimizedData[0];
        
        // Get weekly wellness for streak calculation
        const { data: weeklyWellnessResult } = await supabase
          .from('daily_wellness')
          .select('date, meditation_completed, water_litres, surya_namaskar_count')
          .eq('user_id', user.id)
          .in('date', weekDates);

        // Process streak data
        const weeklyWellness = weeklyWellnessResult || [];
        const streak = weekDates.map(date => {
          const dayData = weeklyWellness.find(w => w.date === date);
          return !!(dayData?.meditation_completed || 
                   (dayData?.water_litres && dayData.water_litres > 0) || 
                   (dayData?.surya_namaskar_count && dayData.surya_namaskar_count > 0));
        });

        const finalData = {
          todayProgress: {
            breakfast: data.has_breakfast,
            lunch: data.has_lunch,
            dinner: data.has_dinner,
            steps: data.steps_count,
            walkScore: data.walk_score,
            saladBowl: data.has_salad_bowl,
            kanji: data.has_kanji
          },
          weeklyStreak: streak,
          wellnessData: {
            water_litres: data.water_litres || 0,
            surya_namaskar_count: data.surya_namaskar_count || 0,
            meditation_completed: data.meditation_completed || false
          }
        };

        setData(finalData);
        
        // Don't dispatch stepsUpdated events to prevent page reload loops
        console.log('✅ useOptimizedHomeData: Data updated (no stepsUpdated event dispatched to prevent loops)');

        const endTime = performance.now();
        const loadTime = endTime - startTime;
        console.log(`✅ useOptimizedHomeData: Data fetch completed in ${loadTime.toFixed(2)}ms (optimized)`);
        trackEvent('home_data_loaded_optimized', 'Performance', `Load Time: ${Math.round(loadTime)}ms`);
        
        // Mark initial load as complete (done outside fetchAllData to avoid circular dependency)
        return;
      }

      // Fallback to original queries
      console.log('🔄 useOptimizedHomeData: Falling back to original queries');
      const [mealsResult, stepsResult, wellnessResult, weeklyWellnessResult] = await Promise.all([
        supabase
          .from('meal_tracking')
          .select('meal_type, food_item')
          .eq('user_id', user.id)
          .eq('date', today),
        
        supabase
          .from('steps_tracking')
          .select('steps_count')
          .eq('user_id', user.id)
          .eq('date', today)
          .maybeSingle(),
        
        supabase
          .from('daily_wellness')
          .select('*')
          .eq('user_id', user.id)
          .eq('date', today)
          .maybeSingle(),
        
        supabase
          .from('daily_wellness')
          .select('date, meditation_completed, water_litres, surya_namaskar_count')
          .eq('user_id', user.id)
          .in('date', weekDates)
      ]);

      console.log('📊 useOptimizedHomeData: Database queries completed:', {
        mealsCount: mealsResult.data?.length || 0,
        stepsData: !!stepsResult.data,
        wellnessData: !!wellnessResult.data,
        weeklyWellnessCount: weeklyWellnessResult.data?.length || 0
      });

      // Process all data
      const meals = mealsResult.data || [];
      const mealTypes = meals.map(m => m.meal_type);
      const mealItems = meals.map(m => m.food_item.toLowerCase());
      
      console.log('🍽️ useOptimizedHomeData: Meals processed:', {
        totalMeals: meals.length,
        mealTypes,
        hasSaladBowl: mealItems.some(item => item.includes('salad') && item.includes('bowl')),
        hasKanji: mealItems.some(item => item.includes('kanji') || item.includes('millet') || item.includes('porridge'))
      });
      
      const hasSaladBowl = mealItems.some(item => 
        item.includes('salad') && item.includes('bowl')
      );
      const hasKanji = mealItems.some(item => 
        item.includes('kanji') || item.includes('millet') || item.includes('porridge')
      );

      const todaySteps = stepsResult.data?.steps_count || 0;
      const walkScore = Math.min(Math.floor((todaySteps / 5000) * 5), 5); // Updated: Based on 5000 steps = 5 stars goal
      
      console.log('👟 useOptimizedHomeData: Steps processed:', {
        todaySteps,
        walkScore,
        kmWalked: (todaySteps / 1000).toFixed(1)
      });
      
      const wellness = wellnessResult.data;
      const wellnessData = {
        id: wellness?.id,
        water_litres: wellness?.water_litres || 0,
        surya_namaskar_count: wellness?.surya_namaskar_count || 0,
        meditation_completed: wellness?.meditation_completed || false
      };

      console.log('🌟 useOptimizedHomeData: Wellness data processed:', wellnessData);

      const weeklyWellness = weeklyWellnessResult.data || [];
      const streak = weekDates.map(date => {
        const dayData = weeklyWellness.find(w => w.date === date);
        return !!(dayData?.meditation_completed || 
                 (dayData?.water_litres && dayData.water_litres > 0) || 
                 (dayData?.surya_namaskar_count && dayData.surya_namaskar_count > 0));
      });

      console.log('📈 useOptimizedHomeData: Weekly streak calculated:', {
        streakDays: streak.filter(Boolean).length,
        totalDays: streak.length
      });

      const fetchedData = {
        todayProgress: {
          breakfast: mealTypes.includes('breakfast'),
          lunch: mealTypes.includes('lunch'),
          dinner: mealTypes.includes('dinner'),
          steps: todaySteps,
          walkScore: walkScore,
          saladBowl: hasSaladBowl,
          kanji: hasKanji
        },
        weeklyStreak: streak,
        wellnessData
      };

      setData(fetchedData);

      // Don't dispatch stepsUpdated events to prevent page reload loops
      console.log('✅ useOptimizedHomeData: Data updated (no stepsUpdated event dispatched to prevent loops)');

      const endTime = performance.now();
      const loadTime = endTime - startTime;
      console.log(`✅ useOptimizedHomeData: Data fetch completed in ${loadTime.toFixed(2)}ms`);
      
      // Track analytics
      trackEvent('home_data_loaded', 'Performance', `Load Time: ${Math.round(loadTime)}ms`);
      
      // Mark initial load as complete (done outside fetchAllData to avoid circular dependency)

    } catch (error) {
      console.error('❌ useOptimizedHomeData: Error fetching home data:', error);
      trackEvent('home_data_error', 'Error', 'Fetch Failed');
    } finally {
      setLoading(false);
      fetchingRef.current = false;
      console.log('🏁 useOptimizedHomeData: Loading state updated to false');
    }
  }, [user, trackEvent]); // Fixed dependencies

  // Listen for step updates and meal logging events
  useEffect(() => {
    const handleStepsUpdated = (event: CustomEvent) => {
      console.log('📢 useOptimizedHomeData: External steps update received:', event.detail);
      const newSteps = event.detail.steps;
      
      setData(prev => {
        const newWalkScore = Math.min(Math.floor((newSteps / 5000) * 5), 5);
        const updatedData = {
          ...prev,
          todayProgress: {
            ...prev.todayProgress,
            steps: newSteps,
            walkScore: newWalkScore
          }
        };
        
        console.log('📊 useOptimizedHomeData: Data updated with new steps:', {
          oldSteps: prev.todayProgress.steps,
          newSteps,
          oldWalkScore: prev.todayProgress.walkScore,
          newWalkScore
        });
        
        return updatedData;
      });
    };

    const handleMealLogged = (event: CustomEvent) => {
      console.log('📢 useOptimizedHomeData: Meal logged event received:', event.detail);
      const { mealType, mealData } = event.detail;
      
      // Update state immediately for instant UI feedback
      setData(prev => ({
        ...prev,
        todayProgress: {
          ...prev.todayProgress,
          [mealType]: true
        }
      }));
      
      // Use current ref to ensure we have the latest function
      setTimeout(() => {
        if (fetchingRef.current) {
          console.log('🔄 useOptimizedHomeData: Skipping refetch - already fetching');
          return;
        }
        fetchAllData();
      }, 500); // Small delay to ensure database is updated
    };

    window.addEventListener('stepsUpdated', handleStepsUpdated as EventListener);
    window.addEventListener('mealLogged', handleMealLogged as EventListener);
    
    return () => {
      console.log('🧹 useOptimizedHomeData: Cleaning up listeners');
      window.removeEventListener('stepsUpdated', handleStepsUpdated as EventListener);
      window.removeEventListener('mealLogged', handleMealLogged as EventListener);
    };
  }, []); // Remove fetchAllData dependency to prevent circular dependency

  useEffect(() => {
    console.log('🔄 useOptimizedHomeData: useEffect triggered, user:', !!user);
    if (user) {
      fetchAllData();
      setInitialLoad(false);
    } else {
      setLoading(false); // Don't keep loading if no user
    }
  }, [user]); // Remove fetchAllData dependency to prevent loops

  console.log('📊 useOptimizedHomeData: Current state:', { 
    loading, 
    initialLoad,
    dataKeys: Object.keys(data),
    todayProgressKeys: Object.keys(data.todayProgress),
    currentSteps: data.todayProgress.steps,
    currentWalkScore: data.todayProgress.walkScore
  });

  return { data, loading: loading && initialLoad, refetch: fetchAllData };
};
