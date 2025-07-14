import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

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

      // Fallback to direct queries since materialized views are new
      await fetchProgressDataFallback(user.id, cacheKey);
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

  const fetchWeeklyDataFallback = async (userId: string): Promise<WeeklyProgressData> => {
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

      // Skip old weekly aggregation logic since we're focusing on daily scores

      // Calculate daily scores for last 7 days
      const dailyScores = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        // Calculate score based on activities
        let score = 0;
        const dayWellness = wellness.data?.find(w => w.date === dateStr);
        const dayMeals = meals.data?.filter(m => m.date === dateStr).length || 0;
        const daySteps = steps.data?.find(s => s.date === dateStr)?.steps_count || 0;
        
        if (dayWellness?.meditation_completed) score += 25;
        if ((dayWellness?.surya_namaskar_count || 0) > 0) score += 25;
        if ((dayWellness?.water_litres || 0) >= 3) score += 25;
        if (dayMeals >= 3) score += 25;
        
        dailyScores.push(score);
      }

      const activeDays = dailyScores.filter(score => score > 0).length;
      const averageScore = dailyScores.reduce((sum, score) => sum + score, 0) / 7;
      const totalScore = dailyScores.reduce((sum, score) => sum + score, 0);
      
      // Calculate streak
      let streak = 0;
      for (let i = dailyScores.length - 1; i >= 0; i--) {
        if (dailyScores[i] > 50) {
          streak++;
        } else {
          break;
        }
      }

      return {
        totalScore,
        averageScore,
        streak,
        activeDays,
        dailyScores,
        suggestions: [
          'Try to maintain consistency in daily activities',
          'Focus on completing all wellness activities each day',
          'Keep up the great work!'
        ]
      };
    } catch (error) {
      console.error('Error fetching weekly data fallback:', error);
      return {
        totalScore: 0,
        averageScore: 0,
        streak: 0,
        activeDays: 0,
        dailyScores: [],
        suggestions: []
      };
    }
  };

  const fetchJourneyDataFallback = async (userId: string): Promise<JourneyProgressData> => {
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

      if (!subscription?.start_date || !subscription?.end_date) {
        return {
          totalDays: 0,
          completedDays: 0,
          activeDays: 0,
          averageScore: 0,
          totalScore: 0,
          programName: 'Wellness Program',
          startDate: '',
          endDate: '',
          currentStreak: 0,
          bestStreak: 0,
          milestones: [],
          suggestions: []
        };
      }

      const { calculateProgramProgress } = await import('@/utils/dateUtils');
      const progress = calculateProgramProgress(subscription.start_date, subscription.end_date);

      // Get aggregated data since start
      const [wellness, meals, steps] = await Promise.all([
        supabase
          .from('daily_wellness')
          .select('date, meditation_completed, surya_namaskar_count, water_litres')
          .eq('user_id', userId)
          .gte('date', subscription.start_date),
        
        supabase
          .from('meal_tracking')
          .select('date')
          .eq('user_id', userId)
          .gte('date', subscription.start_date),
        
        supabase
          .from('steps_tracking')
          .select('steps_count')
          .eq('user_id', userId)
          .gte('date', subscription.start_date)
      ]);

      const activeDays = new Set([
        ...(wellness.data?.map(w => w.date) || []),
        ...(meals.data?.map(m => m.date) || []),
      ]).size;

      // Calculate streaks - get all unique dates with activity
      const activityDates = Array.from(new Set([
        ...(wellness.data?.map(w => w.date) || []),
        ...(meals.data?.map(m => m.date) || []),
      ])).sort();

      // Calculate current and best streak
      let currentStreak = 0;
      let bestStreak = 0;
      let tempStreak = 0;
      
      const today = new Date().toISOString().split('T')[0];
      let checkingCurrent = true;
      
      // Generate all dates from start to today
      const startDate = new Date(subscription.start_date);
      const endDate = new Date(today);
      const allDates = [];
      
      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        allDates.push(d.toISOString().split('T')[0]);
      }
      
      // Check streaks from most recent to oldest
      for (let i = allDates.length - 1; i >= 0; i--) {
        const dateStr = allDates[i];
        const hasActivity = activityDates.includes(dateStr);
        
        if (hasActivity) {
          tempStreak++;
          bestStreak = Math.max(bestStreak, tempStreak);
          if (checkingCurrent) {
            currentStreak = tempStreak;
          }
        } else {
          if (checkingCurrent) {
            checkingCurrent = false;
            currentStreak = tempStreak;
          }
          tempStreak = 0;
        }
      }

      const totalWater = wellness.data?.reduce((sum, w) => sum + (w.water_litres || 0), 0) || 0;
      const totalSteps = steps.data?.reduce((sum, s) => sum + (s.steps_count || 0), 0) || 0;
      const meditationSessions = wellness.data?.filter(w => w.meditation_completed).length || 0;
      const yogaSessions = wellness.data?.filter(w => (w.surya_namaskar_count || 0) > 0).length || 0;

      const calculatedTotalScore = wellness.data?.length * 25 + (meals.data?.length * 10) || 0;
      const averageScore = activeDays > 0 ? (calculatedTotalScore / activeDays) : 0;

      return {
        totalDays: progress.totalDays,
        completedDays: progress.daysCompleted,
        activeDays,
        averageScore,
        totalScore: calculatedTotalScore,
        programName: 'Wellness Program',
        startDate: subscription.start_date,
        endDate: subscription.end_date,
        currentStreak,
        bestStreak,
        milestones: [],
        suggestions: [
          'Keep up the consistency in your wellness journey',
          'Focus on completing all daily activities',
          'You\'re making great progress!'
        ]
      };
    } catch (error) {
      console.error('Error fetching journey data fallback:', error);
      return {
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
        suggestions: []
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