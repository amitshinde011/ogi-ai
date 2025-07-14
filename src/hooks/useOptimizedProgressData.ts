import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface WeeklyData {
  week: string;
  daysTracked: number;
  daysWithMeals: number;
  meditationDays: number;
  yogaDays: number;
  stepGoalDays: number;
  avgWater: number;
  avgSteps: number;
  totalSteps: number;
}

interface JourneyData {
  totalDays: number;
  activeDays: number;
  totalMeals: number;
  totalWater: number;
  totalSteps: number;
  meditationSessions: number;
  yogaSessions: number;
  progressPercentage: number;
}

interface ProgressData {
  weeklyData: WeeklyData[];
  journeyData: JourneyData;
}

const cache = new Map<string, { data: ProgressData; timestamp: number }>();
const CACHE_DURATION = 300000; // 5 minutes

export const useOptimizedProgressData = () => {
  const [data, setData] = useState<ProgressData>({
    weeklyData: [],
    journeyData: {
      totalDays: 0,
      activeDays: 0,
      totalMeals: 0,
      totalWater: 0,
      totalSteps: 0,
      meditationSessions: 0,
      yogaSessions: 0,
      progressPercentage: 0,
    },
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProgressData();
  }, []);

  const fetchProgressData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const cacheKey = `progress-${user.id}`;
      
      // Check cache first
      const cached = cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        setData(cached.data);
        setLoading(false);
        return;
      }

      // Try to use materialized views with RPC
      const { data: rpcData, error } = await supabase.rpc('get_progress_data', {
        p_user_id: user.id
      });

      if (error) {
        console.error('Error calling get_progress_data RPC:', error);
        
        // Fallback to direct queries
        await fetchProgressDataFallback(user.id, cacheKey);
        return;
      }

      const progressData: ProgressData = {
        weeklyData: rpcData?.weekly_data || [],
        journeyData: rpcData?.journey_data || {
          totalDays: 0,
          activeDays: 0,
          totalMeals: 0,
          totalWater: 0,
          totalSteps: 0,
          meditationSessions: 0,
          yogaSessions: 0,
          progressPercentage: 0,
        },
      };

      // Cache the result
      cache.set(cacheKey, { data: progressData, timestamp: Date.now() });
      setData(progressData);
    } catch (error) {
      console.error('Error fetching progress data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProgressDataFallback = async (userId: string, cacheKey: string) => {
    // Fallback to original complex queries
    const [weeklyResult, journeyResult] = await Promise.all([
      fetchWeeklyDataFallback(userId),
      fetchJourneyDataFallback(userId)
    ]);

    const progressData: ProgressData = {
      weeklyData: weeklyResult,
      journeyData: journeyResult,
    };

    cache.set(cacheKey, { data: progressData, timestamp: Date.now() });
    setData(progressData);
  };

  const fetchWeeklyDataFallback = async (userId: string): Promise<WeeklyData[]> => {
    try {
      // Get last 8 weeks of data
      const eightWeeksAgo = new Date();
      eightWeeksAgo.setDate(eightWeeksAgo.getDate() - 56);

      const [wellness, meals, steps] = await Promise.all([
        supabase
          .from('daily_wellness')
          .select('date, meditation_completed, surya_namaskar_count, water_litres')
          .eq('user_id', userId)
          .gte('date', eightWeeksAgo.toISOString().split('T')[0]),
        
        supabase
          .from('meal_tracking')
          .select('date, meal_type')
          .eq('user_id', userId)
          .gte('date', eightWeeksAgo.toISOString().split('T')[0]),
        
        supabase
          .from('steps_tracking')
          .select('date, steps_count')
          .eq('user_id', userId)
          .gte('date', eightWeeksAgo.toISOString().split('T')[0])
      ]);

      // Process weekly aggregation (simplified)
      const weeklyMap = new Map<string, Partial<WeeklyData>>();
      
      // Process wellness data
      wellness.data?.forEach(item => {
        const weekKey = getWeekKey(item.date);
        if (!weeklyMap.has(weekKey)) {
          weeklyMap.set(weekKey, { week: weekKey, daysTracked: 0, daysWithMeals: 0, meditationDays: 0, yogaDays: 0, stepGoalDays: 0, avgWater: 0, avgSteps: 0, totalSteps: 0 });
        }
        const week = weeklyMap.get(weekKey)!;
        week.daysTracked = (week.daysTracked || 0) + 1;
        if (item.meditation_completed) week.meditationDays = (week.meditationDays || 0) + 1;
        if ((item.surya_namaskar_count || 0) > 0) week.yogaDays = (week.yogaDays || 0) + 1;
      });

      return Array.from(weeklyMap.values())
        .filter((week): week is WeeklyData => week.week !== undefined)
        .sort((a, b) => b.week.localeCompare(a.week))
        .slice(0, 8);
    } catch (error) {
      console.error('Error fetching weekly data fallback:', error);
      return [];
    }
  };

  const fetchJourneyDataFallback = async (userId: string): Promise<JourneyData> => {
    try {
      // Get user's program start date
      const { data: subscription } = await supabase
        .from('user_subscriptions')
        .select('start_date, end_date')
        .eq('user_id', userId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      const startDate = subscription?.start_date || new Date().toISOString().split('T')[0];
      const currentDate = new Date().toISOString().split('T')[0];

      // Calculate total days since start
      const totalDays = Math.floor((new Date(currentDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1;

      // Get aggregated data since start
      const [wellness, meals, steps] = await Promise.all([
        supabase
          .from('daily_wellness')
          .select('date, meditation_completed, surya_namaskar_count, water_litres')
          .eq('user_id', userId)
          .gte('date', startDate),
        
        supabase
          .from('meal_tracking')
          .select('date')
          .eq('user_id', userId)
          .gte('date', startDate),
        
        supabase
          .from('steps_tracking')
          .select('steps_count')
          .eq('user_id', userId)
          .gte('date', startDate)
      ]);

      const activeDays = new Set([
        ...(wellness.data?.map(w => w.date) || []),
        ...(meals.data?.map(m => m.date) || []),
      ]).size;

      const totalWater = wellness.data?.reduce((sum, w) => sum + (w.water_litres || 0), 0) || 0;
      const totalSteps = steps.data?.reduce((sum, s) => sum + (s.steps_count || 0), 0) || 0;
      const meditationSessions = wellness.data?.filter(w => w.meditation_completed).length || 0;
      const yogaSessions = wellness.data?.filter(w => (w.surya_namaskar_count || 0) > 0).length || 0;

      return {
        totalDays,
        activeDays,
        totalMeals: meals.data?.length || 0,
        totalWater,
        totalSteps,
        meditationSessions,
        yogaSessions,
        progressPercentage: totalDays > 0 ? Math.round((activeDays / totalDays) * 100) : 0,
      };
    } catch (error) {
      console.error('Error fetching journey data fallback:', error);
      return {
        totalDays: 0,
        activeDays: 0,
        totalMeals: 0,
        totalWater: 0,
        totalSteps: 0,
        meditationSessions: 0,
        yogaSessions: 0,
        progressPercentage: 0,
      };
    }
  };

  const getWeekKey = (dateString: string): string => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const week = Math.ceil(((date.getTime() - new Date(year, 0, 1).getTime()) / 86400000 + new Date(year, 0, 1).getDay() + 1) / 7);
    return `${year}-W${week.toString().padStart(2, '0')}`;
  };

  return { data, loading, refetch: fetchProgressData };
};