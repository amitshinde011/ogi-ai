
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAnalytics } from '@/hooks/useAnalytics';

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

  // Listen for step updates and sync with data
  useEffect(() => {
    const handleStepsUpdated = (event: CustomEvent) => {
      console.log('📢 useOptimizedHomeData: External steps update received:', event.detail);
      const newSteps = event.detail.steps;
      
      setData(prev => {
        const newWalkScore = Math.min(Math.floor(newSteps / 1000), 5);
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

    window.addEventListener('stepsUpdated', handleStepsUpdated as EventListener);
    
    return () => {
      console.log('🧹 useOptimizedHomeData: Cleaning up steps listener');
      window.removeEventListener('stepsUpdated', handleStepsUpdated as EventListener);
    };
  }, []);

  const fetchAllData = useCallback(async () => {
    const now = Date.now();
    
    // Prevent duplicate fetches within 5 seconds
    if (fetchingRef.current || (now - lastFetchRef.current < 5000)) {
      console.log('🚫 useOptimizedHomeData: Preventing duplicate fetch');
      return;
    }

    fetchingRef.current = true;
    lastFetchRef.current = now;
    
    console.log('📡 useOptimizedHomeData: Starting data fetch');
    const startTime = performance.now();
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.warn('⚠️ useOptimizedHomeData: No authenticated user found');
        trackEvent('home_data_error', 'Error', 'No User');
        return;
      }

      console.log('👤 useOptimizedHomeData: User authenticated:', user.id);
      const today = new Date().toISOString().split('T')[0];
      
      // Calculate week dates once
      const currentDay = new Date().getDay();
      const monday = new Date();
      const daysToMonday = currentDay === 0 ? -6 : 1 - currentDay;
      monday.setDate(monday.getDate() + daysToMonday);
      
      const weekDates = [];
      for (let i = 0; i < 7; i++) {
        const date = new Date(monday);
        date.setDate(monday.getDate() + i);
        weekDates.push(date.toISOString().split('T')[0]);
      }

      console.log('📅 useOptimizedHomeData: Calculated week dates:', { today, weekDates });

      // Execute all queries in parallel - single batch request
      console.log('🔄 useOptimizedHomeData: Executing single batch query');
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
      const walkScore = Math.min(Math.floor(todaySteps / 1000), 5); // Updated: 1000 steps = 1 point for 5km goal
      
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

      const finalData = {
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

      setData(finalData);

      // Dispatch step count update event
      console.log('📢 useOptimizedHomeData: Dispatching steps update event');
      window.dispatchEvent(new CustomEvent('stepsUpdated', { 
        detail: { steps: todaySteps, lastUpdated: new Date() } 
      }));

      const endTime = performance.now();
      const loadTime = endTime - startTime;
      console.log(`✅ useOptimizedHomeData: Data fetch completed in ${loadTime.toFixed(2)}ms`);
      
      // Track analytics
      trackEvent('home_data_loaded', 'Performance', `Load Time: ${Math.round(loadTime)}ms`);

    } catch (error) {
      console.error('❌ useOptimizedHomeData: Error fetching home data:', error);
      trackEvent('home_data_error', 'Error', 'Fetch Failed');
    } finally {
      setLoading(false);
      fetchingRef.current = false;
      console.log('🏁 useOptimizedHomeData: Loading state updated to false');
    }
  }, []); // Remove trackEvent to prevent infinite loops

  useEffect(() => {
    console.log('🔄 useOptimizedHomeData: useEffect triggered, calling fetchAllData');
    fetchAllData();
  }, [fetchAllData]);

  console.log('📊 useOptimizedHomeData: Current state:', { 
    loading, 
    dataKeys: Object.keys(data),
    todayProgressKeys: Object.keys(data.todayProgress),
    currentSteps: data.todayProgress.steps,
    currentWalkScore: data.todayProgress.walkScore
  });

  return { data, loading, refetch: fetchAllData };
};
