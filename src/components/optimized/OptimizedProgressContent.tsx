import React, { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useOptimizedProgressData } from '@/hooks/useOptimizedData';
import WeeklyProgress from '@/components/progress/WeeklyProgress';
import JourneyProgress from '@/components/progress/JourneyProgress';
import WeeklyStreak from '@/components/WeeklyStreak';

export const OptimizedProgressContent = () => {
  const { data: progressData, isLoading, error, refetch } = useOptimizedProgressData();

  useEffect(() => {
    const onUpdate = () => {
      setTimeout(() => refetch?.(), 50);
    };
    window.addEventListener('wellnessUpdated', onUpdate as any);
    window.addEventListener('stepsUpdated', onUpdate as any);
    window.addEventListener('mealLogged', onUpdate as any);
    window.addEventListener('progressDataInvalidated', onUpdate as any);
    return () => {
      window.removeEventListener('wellnessUpdated', onUpdate as any);
      window.removeEventListener('stepsUpdated', onUpdate as any);
      window.removeEventListener('mealLogged', onUpdate as any);
      window.removeEventListener('progressDataInvalidated', onUpdate as any);
    };
  }, [refetch]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Loading skeletons */}
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-6 w-48 mb-4" />
            <div className="space-y-3">
              <Skeleton className="h-8" />
              <Skeleton className="h-8" />
              <Skeleton className="h-8" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-6 w-40 mb-4" />
            <Skeleton className="h-64" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-6 w-44 mb-4" />
            <Skeleton className="h-48" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-destructive">Failed to load progress data. Please try refreshing the page.</p>
        </CardContent>
      </Card>
    );
  }

  // Type-safe data extraction
  const weeklyData = (progressData as any)?.weeklyData || (progressData as any)?.weekly_data || [];
  const journeyData = (progressData as any)?.journeyData || (progressData as any)?.journey_data || {
    totalDays: 90,
    completedDays: 0,
    activeDays: 0,
    averageScore: 0,
    totalScore: 0,
    programName: 'Wellness Journey',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    currentStreak: 0,
    bestStreak: 0,
    milestones: [],
    suggestions: ['Start your wellness journey today!']
  };

  // Normalize journey data for chart consumption (fallback for RPC shapes)
  const journeyDataNormalized = React.useMemo(() => {
    const jd: any = journeyData;
    if (jd && !jd.milestones) {
      const dp = (jd as any)?.dailyPoints || (jd as any)?.daily_points;
      if (Array.isArray(dp)) {
        return {
          ...jd,
          milestones: dp.map((d: any) => ({
            day: d.day ?? 0,
            date: d.date ?? '',
            points: d.score ?? 0,
            cumulative: d.cumulativeScore ?? 0,
          })),
        };
      }
    }
    return jd;
  }, [journeyData]);

  const mockWeeklyData = {
    totalScore: 420,
    averageScore: 75,
    streak: 5,
    activeDays: 6,
    dailyScores: [70, 80, 65, 90, 75, 85, 95],
    suggestions: ['Great consistency this week!', 'Keep up the meditation practice']
  };

  const mockStreakData = [true, true, false, true, true, true, false];

  return (
    <div className="space-y-6">
      {/* Journey Overview */}
      <Card className="border-0 shadow-md bg-white/95 backdrop-blur-sm">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-6 text-primary">Journey Overview</h2>
          <JourneyProgress data={journeyDataNormalized} />
        </CardContent>
      </Card>

      {/* Weekly Streak */}
      <Card className="border-0 shadow-md bg-white/95 backdrop-blur-sm">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-6 text-primary">Weekly Streak</h2>
          <WeeklyStreak streak={mockStreakData} />
        </CardContent>
      </Card>

      {/* Weekly Progress Chart */}
      <Card className="border-0 shadow-md bg-white/95 backdrop-blur-sm">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-6 text-primary">Weekly Progress</h2>
          <WeeklyProgress data={mockWeeklyData} />
        </CardContent>
      </Card>
    </div>
  );
};