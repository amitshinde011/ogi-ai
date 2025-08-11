import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { getLocalDateString } from '@/utils/dateUtils';
import { localCache } from '@/utils/localCache';

interface WeeklyProgressData {
  totalScore: number;
  averageScore: number;
  streak: number;
  activeDays: number;
  dailyScores: number[];
  suggestions: string[];
}

interface JourneyProgressData {
  totalDays: number;
  completedDays: number;
  activeDays: number;
  averageScore: number;
  totalScore: number;
  programName: string;
  startDate: string;
  endDate: string;
  currentStreak: number;
  bestStreak: number;
  milestones: Array<{
    day: number;
    score: number;
    cumulativeScore: number;
    date: string;
  }>;
  suggestions: string[];
}

interface ProgressData {
  weeklyData: WeeklyProgressData;
  journeyData: JourneyProgressData;
}

const cache = new Map<string, { data: ProgressData; timestamp: number }>();
const CACHE_DURATION = 300000; // 5 minutes

export const useOptimizedProgressData = () => {
  const { user } = useAuth();
  const [data, setData] = useState<ProgressData>({
    weeklyData: {
      totalScore: 0,
      averageScore: 0,
      streak: 0,
      activeDays: 0,
      dailyScores: [],
      suggestions: [],
    },
    journeyData: {
      totalDays: 0,
      completedDays: 0,
      activeDays: 0,
      averageScore: 0,
      totalScore: 0,
      programName: '',
      startDate: '',
      endDate: '',
      currentStreak: 0,
      bestStreak: 0,
      milestones: [],
      suggestions: [],
    },
  });
  const [loading, setLoading] = useState(true);
  const isInitialLoad = useRef(true);

  const fetchProgressData = useCallback(async () => {
    // Only set loading state for initial load
    if (isInitialLoad.current) {
      setLoading(true);
    }
    try {
      if (!user) return;

      const cacheKey = `progress-${user.id}`;
      
      // Clear cache to ensure fresh data with today's activities
      cache.delete(cacheKey);
      
      // Use optimized database functions
      await fetchProgressDataOptimized(user.id, cacheKey);
    } catch (error) {
      console.error('Error fetching progress data:', error);
    } finally {
      // Only update loading state if it was an initial load
      if (isInitialLoad.current) {
        setLoading(false);
        isInitialLoad.current = false;
      }
    }
  }, [user]);

  const fetchProgressDataOptimized = async (userId: string, cacheKey: string) => {
    // Use optimized database functions in parallel
    const [weeklyResult, journeyResult, streaksResult] = await Promise.all([
      fetchOptimizedWeeklyData(userId),
      fetchOptimizedJourneyData(userId),
      fetchOptimizedStreaks(userId)
    ]);

    const progressData: ProgressData = {
      weeklyData: { 
        ...weeklyResult, 
        streak: streaksResult.streak
      },
      journeyData: { 
        ...journeyResult, 
        currentStreak: streaksResult.currentStreak,
        bestStreak: streaksResult.bestStreak,
        activeDays: streaksResult.activeDays
      },
    };

    cache.set(cacheKey, { data: progressData, timestamp: Date.now() });
    setData(progressData);
  };

  const fetchOptimizedWeeklyData = async (userId: string): Promise<WeeklyProgressData> => {
    try {
      // Build last 7-day range (including today)
      const today = new Date();
      const startDate = new Date(today);
      startDate.setDate(today.getDate() - 6);
      const startStr = getLocalDateString(startDate);
      const endStr = getLocalDateString(today);

      // Fetch base tables in parallel for the range
      const [wellnessRes, mealsRes] = await Promise.all([
        supabase
          .from('daily_wellness')
          .select('date, water_litres, surya_namaskar_count, meditation_completed')
          .eq('user_id', userId)
          .gte('date', startStr)
          .lte('date', endStr),
        supabase
          .from('meal_tracking')
          .select('date')
          .eq('user_id', userId)
          .gte('date', startStr)
          .lte('date', endStr),
      ]);

      if (wellnessRes.error) throw wellnessRes.error;
      if (mealsRes.error) throw mealsRes.error;

      const wellnessByDate = new Map<string, any>();
      (wellnessRes.data || []).forEach((w: any) => wellnessByDate.set(w.date, w));

      const mealsByDate = new Map<string, number>();
      (mealsRes.data || []).forEach((m: any) => {
        mealsByDate.set(m.date, (mealsByDate.get(m.date) || 0) + 1);
      });

      // Merge today's offline data from IndexedDB
      const todayStr = getLocalDateString(new Date());
      const [cachedWellnessToday, offlineMealsToday] = await Promise.all([
        localCache.getTodayWellness(userId, todayStr),
        localCache.getOfflineMeals(userId, todayStr),
      ]);
      if (cachedWellnessToday) {
        wellnessByDate.set(todayStr, {
          date: todayStr,
          water_litres: cachedWellnessToday.water_litres || 0,
          surya_namaskar_count: cachedWellnessToday.surya_namaskar_count || 0,
          meditation_completed: !!cachedWellnessToday.meditation_completed,
        });
      }
      if ((offlineMealsToday || []).length > 0) {
        mealsByDate.set(todayStr, Math.max(mealsByDate.get(todayStr) || 0, offlineMealsToday.length));
      }

      // Calculate daily scores
      const dailyScores = Array(7).fill(0);
      let totalScore = 0;
      let activeDays = 0;

      for (let i = 0; i < 7; i++) {
        const d = new Date(startDate);
        d.setDate(startDate.getDate() + i);
        const ds = getLocalDateString(d);

        const w = wellnessByDate.get(ds) || {};
        const mealsLogged = mealsByDate.get(ds) || 0;

        const meditationScore = w.meditation_completed ? 20 : 0;
        const yogaScore = (w.surya_namaskar_count || 0) > 0 ? 20 : 0;
        const mealScore = mealsLogged > 0 ? 10 : 0;
        const waterScore = Math.min(((w.water_litres || 0) as number) * 5, 20);

        const dayScore = Math.round(meditationScore + yogaScore + mealScore + waterScore);
        dailyScores[i] = dayScore;
        totalScore += dayScore;
        if (dayScore >= 10) activeDays++;
      }

      const averageScore = activeDays > 0 ? Math.round(totalScore / 7) : 0;

      return {
        totalScore: Math.round(totalScore),
        averageScore,
        dailyScores,
        activeDays,
        streak: 0, // set in streaks function
        suggestions: averageScore >= 60 ? [
          'Great consistency this week!',
          'Keep tracking your daily activities',
          "You're building healthy habits!"
        ] : [
          'Start tracking your daily activities',
          'Focus on completing more activities each day',
          'Consistency is key to progress!'
        ]
      };
    } catch (error) {
      console.error('Error fetching weekly data (direct queries):', error);
      return {
        totalScore: 0,
        averageScore: 0,
        dailyScores: [0, 0, 0, 0, 0, 0, 0],
        activeDays: 0,
        streak: 0,
        suggestions: ["Let's focus on consistency this week!"]
      };
    }
  };

  const fetchOptimizedJourneyData = async (userId: string): Promise<Omit<JourneyProgressData, 'currentStreak' | 'bestStreak' | 'activeDays'>> => {
    try {
      // Get user's program info with programs table join for name
      const { data: subscription } = await supabase
        .from('user_subscriptions')
        .select('start_date, end_date, programs(name)')
        .eq('user_id', userId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!subscription?.start_date || !subscription?.end_date) {
        return {
          totalDays: 0,
          completedDays: 0,
          averageScore: 0,
          totalScore: 0,
          programName: 'No Active Program',
          startDate: 'Not Set',
          endDate: 'Not Set',
          milestones: [],
          suggestions: ['Start your wellness journey by subscribing to a program']
        };
      }

      // Fetch base tables for the full program range and compute points client-side
      const rangeStart = new Date(subscription.start_date);
      const rangeEnd = new Date(Math.min(new Date(subscription.end_date).getTime(), new Date().getTime()));
      const startStr = getLocalDateString(rangeStart);
      const endStr = getLocalDateString(rangeEnd);

      const [wellnessRes, mealsRes, stepsRes] = await Promise.all([
        supabase
          .from('daily_wellness')
          .select('date, water_litres, surya_namaskar_count, meditation_completed')
          .eq('user_id', userId)
          .gte('date', startStr)
          .lte('date', endStr),
        supabase
          .from('meal_tracking')
          .select('date')
          .eq('user_id', userId)
          .gte('date', startStr)
          .lte('date', endStr),
        supabase
          .from('steps_tracking')
          .select('date, steps_count')
          .eq('user_id', userId)
          .gte('date', startStr)
          .lte('date', endStr),
      ]);

      if (wellnessRes.error) throw wellnessRes.error;
      if (mealsRes.error) throw mealsRes.error;
      if (stepsRes.error) throw stepsRes.error;

      const wellnessMap = new Map<string, any>();
      (wellnessRes.data || []).forEach((w: any) => wellnessMap.set(w.date, w));

      const mealsMap = new Map<string, number>();
      (mealsRes.data || []).forEach((m: any) => mealsMap.set(m.date, (mealsMap.get(m.date) || 0) + 1));

      const stepsMap = new Map<string, number>();
      (stepsRes.data || []).forEach((s: any) => stepsMap.set(s.date, s.steps_count || 0));

      // Merge today's offline data
      const todayStr2 = getLocalDateString(new Date());
      const [cachedWellnessToday2, offlineMealsToday2, localStepsToday] = await Promise.all([
        localCache.getTodayWellness(userId, todayStr2),
        localCache.getOfflineMeals(userId, todayStr2),
        localCache.getLocalSteps(userId, todayStr2),
      ]);
      if (cachedWellnessToday2) {
        wellnessMap.set(todayStr2, {
          date: todayStr2,
          water_litres: cachedWellnessToday2.water_litres || 0,
          surya_namaskar_count: cachedWellnessToday2.surya_namaskar_count || 0,
          meditation_completed: !!cachedWellnessToday2.meditation_completed,
        });
      }
      if ((offlineMealsToday2 || []).length > 0) {
        mealsMap.set(todayStr2, Math.max(mealsMap.get(todayStr2) || 0, offlineMealsToday2.length));
      }
      if ((localStepsToday || 0) > (stepsMap.get(todayStr2) || 0)) {
        stepsMap.set(todayStr2, localStepsToday || 0);
      }

      const days: Array<{ day: number; score: number; cumulativeScore: number; date: string }> = [];
      let cumulative = 0;
      let dayCounter = 1;
      const totalDaysInRange = Math.floor((rangeEnd.getTime() - rangeStart.getTime()) / (24*60*60*1000)) + 1;

      for (let i = 0; i < totalDaysInRange; i++) {
        const d = new Date(rangeStart);
        d.setDate(rangeStart.getDate() + i);
        const ds = getLocalDateString(d);

        const w = wellnessMap.get(ds) || {};
        const meals = mealsMap.get(ds) || 0;
        const steps = stepsMap.get(ds) || 0;

        const med = w.meditation_completed ? 20 : 0;
        const yoga = (w.surya_namaskar_count || 0) > 0 ? 20 : 0;
        const meal = meals > 0 ? 10 : 0;
        const water = Math.min(((w.water_litres || 0) as number) * 5, 20);
        const stepsBonus = steps >= 5000 ? 10 : 0;

        const score = Math.round(med + yoga + meal + water + stepsBonus);
        cumulative += score;

        days.push({ day: dayCounter, score, cumulativeScore: cumulative, date: ds });
        dayCounter++;
      }

      const maxPerDay = 80;
      const maxPossible = totalDaysInRange * maxPerDay;
      const averageScore = maxPossible > 0 ? Math.round((cumulative / maxPossible) * 100) : 0;

      const { calculateProgramProgress } = await import('@/utils/dateUtils');
      const progress = calculateProgramProgress(subscription.start_date, subscription.end_date);

      const programName = (subscription.programs as any)?.name || 'Wellness Program';

      return {
        totalDays: progress.totalDays,
        completedDays: progress.daysCompleted,
        averageScore,
        totalScore: cumulative,
        programName,
        startDate: subscription.start_date,
        endDate: subscription.end_date,
        milestones: days,
        suggestions: [
          'Keep up the consistency in your wellness journey',
          'Focus on completing all daily activities',
          "You're making great progress!"
        ]
      };
    } catch (error) {
      console.error('Error fetching optimized journey data:', error);
      return {
        totalDays: 0,
        completedDays: 0,
        averageScore: 0,
        totalScore: 0,
        programName: 'Error Loading',
        startDate: 'Error',
        endDate: 'Error',
        milestones: [],
        suggestions: []
      };
    }
  };

  const fetchOptimizedStreaks = async (userId: string): Promise<{ currentStreak: number; bestStreak: number; activeDays: number; streak: number }> => {
    try {
      // Determine range: use subscription start if available, else last 60 days
      const { data: sub } = await supabase
        .from('user_subscriptions')
        .select('start_date')
        .eq('user_id', userId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      const today = new Date();
      const startDate = sub?.start_date ? new Date(sub.start_date) : new Date(today.getTime() - 60 * 24 * 60 * 60 * 1000);
      const startStr = getLocalDateString(startDate);
      const endStr = getLocalDateString(today);

      const [wellnessRes, mealsRes, stepsRes] = await Promise.all([
        supabase
          .from('daily_wellness')
          .select('date, water_litres, surya_namaskar_count, meditation_completed')
          .eq('user_id', userId)
          .gte('date', startStr)
          .lte('date', endStr),
        supabase
          .from('meal_tracking')
          .select('date')
          .eq('user_id', userId)
          .gte('date', startStr)
          .lte('date', endStr),
        supabase
          .from('steps_tracking')
          .select('date, steps_count')
          .eq('user_id', userId)
          .gte('date', startStr)
          .lte('date', endStr),
      ]);

      if (wellnessRes.error) throw wellnessRes.error;
      if (mealsRes.error) throw mealsRes.error;
      if (stepsRes.error) throw stepsRes.error;

      const activitySet = new Set<string>();
      (wellnessRes.data || []).forEach((w: any) => {
        if (w.meditation_completed || (w.water_litres || 0) > 0 || (w.surya_namaskar_count || 0) > 0) {
          activitySet.add(w.date);
        }
      });
      (mealsRes.data || []).forEach((m: any) => activitySet.add(m.date));
      (stepsRes.data || []).forEach((s: any) => { if ((s.steps_count || 0) > 1000) activitySet.add(s.date); });

      // Include today's offline activity
      const todayStr3 = getLocalDateString(new Date());
      const [cachedWellness3, offlineMeals3, localSteps3] = await Promise.all([
        localCache.getTodayWellness(userId, todayStr3),
        localCache.getOfflineMeals(userId, todayStr3),
        localCache.getLocalSteps(userId, todayStr3),
      ]);
      if (cachedWellness3 && (cachedWellness3.meditation_completed || (cachedWellness3.water_litres || 0) > 0 || (cachedWellness3.surya_namaskar_count || 0) > 0)) {
        activitySet.add(todayStr3);
      }
      if ((offlineMeals3 || []).length > 0) {
        activitySet.add(todayStr3);
      }
      if ((localSteps3 || 0) > 1000) {
        activitySet.add(todayStr3);
      }

      const activeDays = activitySet.size;

      // Current streak (up to today)
      let currentStreak = 0;
      let cursor = new Date(today);
      while (cursor >= startDate) {
        const ds = getLocalDateString(cursor);
        if (activitySet.has(ds)) {
          currentStreak += 1;
          cursor.setDate(cursor.getDate() - 1);
        } else {
          break;
        }
      }

      // Best streak across the range
      const datesSorted = Array.from(activitySet)
        .map(d => new Date(d))
        .sort((a, b) => a.getTime() - b.getTime());

      let bestStreak = 0;
      let temp = 0;
      for (let i = 0; i < datesSorted.length; i++) {
        if (i === 0) {
          temp = 1;
          bestStreak = Math.max(bestStreak, temp);
          continue;
        }
        const diffDays = Math.round((datesSorted[i].getTime() - datesSorted[i - 1].getTime()) / (24 * 60 * 60 * 1000));
        if (diffDays === 1) {
          temp += 1;
        } else if (diffDays > 1) {
          temp = 1;
        }
        bestStreak = Math.max(bestStreak, temp);
      }

      return { currentStreak, bestStreak, activeDays, streak: bestStreak };
    } catch (error) {
      console.error('Error fetching optimized streaks (direct queries):', error);
      return { currentStreak: 0, bestStreak: 0, activeDays: 0, streak: 0 };
    }
  };

  useEffect(() => {
    if (user) {
      fetchProgressData();
    }
  }, [user, fetchProgressData]);

  return { data, loading, refetch: fetchProgressData };
};