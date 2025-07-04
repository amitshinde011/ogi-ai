
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
  averageScore: number;
  totalScore: number;
  programName: string;
  startDate: string;
  endDate: string;
  milestones: Array<{
    day: number;
    score: number;
    date: string;
  }>;
  suggestions: string[];
}

export const useProgressData = () => {
  const [weeklyData, setWeeklyData] = useState<WeeklyProgressData>({
    totalScore: 0,
    averageScore: 0,
    streak: 0,
    activeDays: 0,
    dailyScores: [],
    suggestions: []
  });
  
  const [journeyData, setJourneyData] = useState<JourneyProgressData>({
    totalDays: 0,
    completedDays: 0,
    averageScore: 0,
    totalScore: 0,
    programName: '',
    startDate: '',
    endDate: '',
    milestones: [],
    suggestions: []
  });
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProgressData();
  }, []);

  const calculateDailyScore = (meals: any[], wellness: any, steps: any) => {
    const uniqueMealTypes = new Set(meals?.map(m => m.meal_type.toLowerCase()) || []);
    const mealsLogged = uniqueMealTypes.size;
    
    const mealsScore = Math.min((mealsLogged / 3) * 30, 30);
    const suryaScore = Math.min(((wellness?.surya_namaskar_count || 0) / 12) * 20, 20);
    const meditationScore = (wellness?.meditation_completed || false) ? 20 : 0;
    const waterScore = Math.min(((wellness?.water_litres || 0) / 4) * 15, 15);
    const stepsScore = Math.min(((steps?.steps_count || 0) / 10000) * 15, 15);
    
    return mealsScore + suryaScore + meditationScore + waterScore + stepsScore;
  };

  const generateSuggestions = (score: number, type: 'weekly' | 'journey') => {
    const suggestions = [];
    
    if (score < 50) {
      suggestions.push("Focus on logging all three meals daily");
      suggestions.push("Start with basic Surya Namaskar practice");
      suggestions.push("Set water intake reminders throughout the day");
    } else if (score < 80) {
      suggestions.push("Great progress! Try to maintain consistency");
      suggestions.push("Complete your meditation sessions for better scores");
      suggestions.push("Increase your daily step count gradually");
    } else {
      suggestions.push("Excellent work! You're maintaining healthy habits");
      suggestions.push("Consider sharing your progress with the community");
      suggestions.push("Keep up the momentum for long-term wellness");
    }
    
    return suggestions;
  };

  const fetchProgressData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get current subscription
      const { data: subscription } = await supabase
        .from('user_subscriptions')
        .select(`
          *,
          programs (name, duration_days)
        `)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .maybeSingle();

      // Calculate date ranges
      const today = new Date();
      const weekAgo = new Date(today);
      weekAgo.setDate(today.getDate() - 6);
      
      const startDate = subscription?.start_date ? new Date(subscription.start_date) : weekAgo;
      const endDate = subscription?.end_date ? new Date(subscription.end_date) : today;

      // Fetch data for the past 7 days
      const weeklyPromises = [];
      const dailyScores = [];
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        weeklyPromises.push(
          Promise.all([
            supabase
              .from('meal_tracking')
              .select('meal_type')
              .eq('user_id', user.id)
              .eq('date', dateStr),
            supabase
              .from('daily_wellness')
              .select('*')
              .eq('user_id', user.id)
              .eq('date', dateStr)
              .maybeSingle(),
            supabase
              .from('steps_tracking')
              .select('steps_count')
              .eq('user_id', user.id)
              .eq('date', dateStr)
              .maybeSingle()
          ])
        );
      }

      const weeklyResults = await Promise.all(weeklyPromises);
      let activeDays = 0;
      let streak = 0;
      let currentStreak = 0;

      weeklyResults.forEach(([meals, wellness, steps], index) => {
        const dayScore = calculateDailyScore(meals.data, wellness.data, steps.data);
        dailyScores.push(dayScore);
        
        if (dayScore > 0) {
          activeDays++;
          currentStreak++;
          streak = Math.max(streak, currentStreak);
        } else {
          currentStreak = 0;
        }
      });

      const weeklyTotalScore = dailyScores.reduce((sum, score) => sum + score, 0);
      const weeklyAverageScore = activeDays > 0 ? weeklyTotalScore / 7 : 0;

      setWeeklyData({
        totalScore: weeklyTotalScore,
        averageScore: weeklyAverageScore,
        streak,
        activeDays,
        dailyScores,
        suggestions: generateSuggestions(weeklyAverageScore, 'weekly')
      });

      // Fetch journey data if subscription exists
      if (subscription) {
        const journeyStartDate = new Date(subscription.start_date);
        const journeyEndDate = new Date(subscription.end_date);
        const totalDays = Math.ceil((journeyEndDate.getTime() - journeyStartDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        const completedDays = Math.ceil((today.getTime() - journeyStartDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

        // Fetch journey milestones (every 7 days)
        const milestones = [];
        const milestonePromises = [];
        
        for (let day = 7; day <= Math.min(completedDays, totalDays); day += 7) {
          const milestoneDate = new Date(journeyStartDate);
          milestoneDate.setDate(milestoneDate.getDate() + day - 1);
          const dateStr = milestoneDate.toISOString().split('T')[0];
          
          milestonePromises.push(
            Promise.all([
              supabase
                .from('meal_tracking')
                .select('meal_type')
                .eq('user_id', user.id)
                .eq('date', dateStr),
              supabase
                .from('daily_wellness')
                .select('*')
                .eq('user_id', user.id)
                .eq('date', dateStr)
                .maybeSingle(),
              supabase
                .from('steps_tracking')
                .select('steps_count')
                .eq('user_id', user.id)
                .eq('date', dateStr)
                .maybeSingle()
            ]).then(([meals, wellness, steps]) => ({
              day,
              score: calculateDailyScore(meals.data, wellness.data, steps.data),
              date: dateStr
            }))
          );
        }

        const milestoneResults = await Promise.all(milestonePromises);
        const journeyTotalScore = milestoneResults.reduce((sum, milestone) => sum + milestone.score, 0);
        const journeyAverageScore = milestoneResults.length > 0 ? journeyTotalScore / milestoneResults.length : 0;

        setJourneyData({
          totalDays,
          completedDays: Math.min(completedDays, totalDays),
          averageScore: journeyAverageScore,
          totalScore: journeyTotalScore,
          programName: subscription.programs?.name || 'Wellness Program',
          startDate: subscription.start_date,
          endDate: subscription.end_date,
          milestones: milestoneResults,
          suggestions: generateSuggestions(journeyAverageScore, 'journey')
        });
      }
    } catch (error) {
      console.error('Error fetching progress data:', error);
    } finally {
      setLoading(false);
    }
  };

  return { weeklyData, journeyData, loading, refetch: fetchProgressData };
};
