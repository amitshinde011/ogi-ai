
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

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

  const fetchAllData = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

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

      // Execute all queries in parallel
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

      // Process meals data
      const meals = mealsResult.data || [];
      const mealTypes = meals.map(m => m.meal_type);
      const mealItems = meals.map(m => m.food_item.toLowerCase());
      
      const hasSaladBowl = mealItems.some(item => 
        item.includes('salad') && item.includes('bowl')
      );
      const hasKanji = mealItems.some(item => 
        item.includes('kanji') || item.includes('millet') || item.includes('porridge')
      );

      // Process steps data
      const todaySteps = stepsResult.data?.steps_count || 0;

      // Process wellness data
      const wellness = wellnessResult.data;
      const wellnessData = {
        id: wellness?.id,
        water_litres: wellness?.water_litres || 0,
        surya_namaskar_count: wellness?.surya_namaskar_count || 0,
        meditation_completed: wellness?.meditation_completed || false
      };

      // Process weekly streak
      const weeklyWellness = weeklyWellnessResult.data || [];
      const streak = weekDates.map(date => {
        const dayData = weeklyWellness.find(w => w.date === date);
        return !!(dayData?.meditation_completed || 
                 (dayData?.water_litres && dayData.water_litres > 0) || 
                 (dayData?.surya_namaskar_count && dayData.surya_namaskar_count > 0));
      });

      setData({
        todayProgress: {
          breakfast: mealTypes.includes('breakfast'),
          lunch: mealTypes.includes('lunch'),
          dinner: mealTypes.includes('dinner'),
          steps: todaySteps,
          walkScore: Math.min(Math.floor(todaySteps / 1000), 5),
          saladBowl: hasSaladBowl,
          kanji: hasKanji
        },
        weeklyStreak: streak,
        wellnessData
      });

      // Dispatch step count for other components
      window.dispatchEvent(new CustomEvent('stepsUpdated', { 
        detail: { steps: todaySteps, lastUpdated: new Date() } 
      }));

    } catch (error) {
      console.error('Error fetching home data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  return { data, loading, refetch: fetchAllData };
};
