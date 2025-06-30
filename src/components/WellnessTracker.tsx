
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
    <Card className="bg-white shadow-sm border-0">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg sm:text-xl font-semibold text-dark-text">Today's Wellness</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 sm:space-y-6">
        <div className="grid gap-4 sm:gap-6">
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
