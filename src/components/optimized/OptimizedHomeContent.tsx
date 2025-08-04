import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useOptimizedHomeData } from '@/hooks/useOptimizedData';
import { WaterTracker } from '@/components/wellness/WaterTracker';
import { SuryaNamaskarTracker } from '@/components/wellness/SuryaNamaskarTracker';
import { MeditationTracker } from '@/components/wellness/MeditationTracker';
import StepTracker from '@/components/wellness/StepTracker';
import MealLogger from '@/components/MealLogger';
import QuickActions from '@/components/QuickActions';

interface OptimizedHomeContentProps {
  date?: string;
}

export const OptimizedHomeContent = ({ 
  date = new Date().toISOString().split('T')[0] 
}: OptimizedHomeContentProps) => {
  const { data: homeData, isLoading, error } = useOptimizedHomeData(date);

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Loading skeletons */}
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-6 w-48 mb-4" />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-6 w-32 mb-4" />
            <div className="space-y-3">
              <Skeleton className="h-16" />
              <Skeleton className="h-16" />
              <Skeleton className="h-16" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-6 w-40 mb-4" />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-12" />
              <Skeleton className="h-12" />
              <Skeleton className="h-12" />
              <Skeleton className="h-12" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-destructive">Failed to load data. Please try refreshing the page.</p>
        </CardContent>
      </Card>
    );
  }

  const wellnessData = homeData as any || {};

  return (
    <div className="space-y-6">
      {/* Wellness Tracking Section */}
      <Card className="border-0 shadow-md bg-white/95 backdrop-blur-sm">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-6 text-primary">Today's Wellness</h2>
          <div className="grid grid-cols-2 gap-4">
            <WaterTracker 
              waterLitres={wellnessData.water_litres || 0}
              onWaterChange={(delta) => console.log('Water change:', delta)}
              loading={isLoading}
            />
            <SuryaNamaskarTracker 
              suryaNamaskarCount={wellnessData.surya_namaskar_count || 0}
              onSuryaNamaskarChange={(delta) => console.log('Surya Namaskar change:', delta)}
              loading={isLoading}
            />
            <MeditationTracker 
              meditationCompleted={wellnessData.meditation_completed || false}
              onMeditationToggle={() => console.log('Meditation toggle')}
              loading={isLoading}
            />
            <StepTracker />
          </div>
        </CardContent>
      </Card>

      {/* Meal Tracking Section */}
      <Card className="border-0 shadow-md bg-white/95 backdrop-blur-sm">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-6 text-primary">Meal Tracking</h2>
          <MealLogger />
        </CardContent>
      </Card>

      {/* Quick Actions Section */}
      <QuickActions />
    </div>
  );
};