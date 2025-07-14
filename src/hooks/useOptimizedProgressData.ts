import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

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

  useEffect(() => {
    fetchProgressData();
  }, []);

  const fetchProgressData = async () => {
    try {
      if (!user) return;

      const cacheKey = `progress-${user.id}`;
      
      // Check cache first
      const cached = cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        setData(cached.data);
        setLoading(false);
        return;
      }

      // Use optimized database functions
      await fetchProgressDataOptimized(user.id, cacheKey);
    } catch (error) {
      console.error('Error fetching progress data:', error);
    } finally {
      setLoading(false);
    }
  };

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
      // Get daily activity data for the current week (last 7 days)
      const today = new Date();
      const startDate = new Date(today);
      startDate.setDate(today.getDate() - 6); // Last 7 days including today
      
      const { data: dailyData, error } = await supabase
        .from('daily_activity_summary')
        .select('*')
        .eq('user_id', userId)
        .gte('date', startDate.toISOString().split('T')[0])
        .lte('date', today.toISOString().split('T')[0])
        .order('date', { ascending: true });

      if (error) {
        console.error('Error fetching daily activity data:', error);
        throw error;
      }

      // Create daily scores array for the last 7 days
      const dailyScores = Array(7).fill(0);
      let totalScore = 0;
      let activeDays = 0;
      
      // Process each day's data
      for (let i = 0; i < 7; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        const dateStr = date.toISOString().split('T')[0];
        
        const dayData = dailyData?.find(d => d.date === dateStr);
        
        if (dayData) {
          // Calculate daily score based on activities
          const meditationScore = dayData.meditation_completed ? 20 : 0;
          const yogaScore = dayData.surya_namaskar_count > 0 ? 20 : 0;
          const mealScore = dayData.meals_logged > 0 ? 10 : 0;
          const waterScore = Math.min((dayData.water_litres || 0) * 5, 20);
          
          const dayScore = meditationScore + yogaScore + mealScore + waterScore;
          dailyScores[i] = Math.round(dayScore);
          totalScore += dayScore;
          
          // Only count as active day if there's meaningful activity (score >= 10)
          if (dayScore >= 10) {
            activeDays++;
          }
        }
      }

      const averageScore = activeDays > 0 ? Math.round(totalScore / 7) : 0;

      return {
        totalScore: Math.round(totalScore),
        averageScore,
        dailyScores,
        activeDays,
        streak: 0, // Will be set by streak data
        suggestions: averageScore >= 60 ? [
          'Great consistency this week!',
          'Keep tracking your daily activities',
          'You\'re building healthy habits!'
        ] : [
          'Start tracking your daily activities',
          'Focus on completing more activities each day',
          'Consistency is key to progress!'
        ]
      };
    } catch (error) {
      console.error('Error fetching weekly data:', error);
      return {
        totalScore: 0,
        averageScore: 0,
        dailyScores: [0, 0, 0, 0, 0, 0, 0],
        activeDays: 0,
        streak: 0,
        suggestions: ['Let\'s focus on consistency this week!']
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

      // Use optimized database function for journey data
      const { data: journeyData, error } = await supabase.rpc('get_journey_progress_data', {
        p_user_id: userId,
        p_start_date: subscription.start_date,
        p_end_date: subscription.end_date
      });

      if (error) {
        console.error('Error fetching journey data:', error);
        throw error;
      }

      const result = journeyData?.[0];
      if (!result) {
        throw new Error('No journey data returned');
      }

      const { calculateProgramProgress } = await import('@/utils/dateUtils');
      const progress = calculateProgramProgress(subscription.start_date, subscription.end_date);

      // Parse the daily points JSON into milestones array
      const milestones = result.daily_points && typeof result.daily_points === 'string' ? 
        JSON.parse(result.daily_points) : 
        (Array.isArray(result.daily_points) ? result.daily_points : []);

      // Get program name
      const programName = (subscription.programs as any)?.name || 'Wellness Program';

      return {
        totalDays: progress.totalDays,
        completedDays: progress.daysCompleted,
        averageScore: Number(result.average_score) || 0,
        totalScore: Number(result.total_points) || 0,
        programName,
        startDate: subscription.start_date,
        endDate: subscription.end_date,
        milestones,
        suggestions: [
          'Keep up the consistency in your wellness journey',
          'Focus on completing all daily activities',
          'You\'re making great progress!'
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
      // Use optimized database function which already includes streak calculation
      const { data: weeklyResult, error } = await supabase.rpc('get_optimized_weekly_data', {
        p_user_id: userId,
        p_weeks_back: 1
      });

      if (error) throw error;

      const result = weeklyResult?.[0];
      if (!result?.streak_data) {
        return { currentStreak: 0, bestStreak: 0, activeDays: 0, streak: 0 };
      }

      const streakData = result.streak_data && typeof result.streak_data === 'string' ? 
        JSON.parse(result.streak_data) : 
        (typeof result.streak_data === 'object' ? result.streak_data : {});
      
      return {
        currentStreak: streakData.current_streak || 0,
        bestStreak: streakData.best_streak || 0,
        activeDays: streakData.active_days || 0,
        streak: streakData.best_streak || 0 // Use best_streak for weekly display
      };
    } catch (error) {
      console.error('Error fetching optimized streaks:', error);
      return { currentStreak: 0, bestStreak: 0, activeDays: 0, streak: 0 };
    }
  };

  return { data, loading, refetch: fetchProgressData };
};