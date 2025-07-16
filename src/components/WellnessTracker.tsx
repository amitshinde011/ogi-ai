
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WaterTracker } from '@/components/wellness/WaterTracker';
import { SuryaNamaskarTracker } from '@/components/wellness/SuryaNamaskarTracker';
import { MeditationTracker } from '@/components/wellness/MeditationTracker';

interface WellnessTrackerProps {
  waterLitres: number;
  suryaNamaskarCount: number;
  meditationCompleted: boolean;
  onWaterChange: (delta: number) => void;
  onSuryaNamaskarChange: (delta: number) => void;
  onMeditationToggle: () => void;
  loading: boolean;
}

const WellnessTracker: React.FC<WellnessTrackerProps> = ({
  waterLitres,
  suryaNamaskarCount,
  meditationCompleted,
  onWaterChange,
  onSuryaNamaskarChange,
  onMeditationToggle,
  loading
}) => {
  return (
    <Card className="bg-white shadow-sm border-0 w-full max-w-md mx-auto">
      <CardHeader className="pb-3 sm:pb-4">
        <CardTitle className="text-base sm:text-lg md:text-xl font-semibold text-dark-text">Today's Wellness</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4 md:space-y-6">
        <div className="grid gap-3 sm:gap-4 md:gap-6">
          <WaterTracker 
            waterLitres={waterLitres}
            onWaterChange={onWaterChange}
            loading={loading}
          />
          
          <SuryaNamaskarTracker 
            suryaNamaskarCount={suryaNamaskarCount}
            onSuryaNamaskarChange={onSuryaNamaskarChange}
            loading={loading}
          />
          
          <MeditationTracker 
            meditationCompleted={meditationCompleted}
            onMeditationToggle={onMeditationToggle}
            loading={loading}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default WellnessTracker;
