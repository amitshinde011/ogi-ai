
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Droplets, Activity, Brain, Plus, Minus } from 'lucide-react';
import { useWellnessTracking } from '@/hooks/useWellnessTracking';

const WellnessTracker = () => {
  const { wellnessData, loading, updateWellnessData } = useWellnessTracking();

  if (loading) {
    return (
      <Card className="bg-white border border-gray-200">
        <CardContent className="p-4">
          <div className="animate-pulse">Loading wellness data...</div>
        </CardContent>
      </Card>
    );
  }

  const waterProgress = Math.min((wellnessData.water_litres / 3) * 100, 100);
  const suryaProgress = Math.min((wellnessData.surya_namaskar_count / 12) * 100, 100);

  return (
    <Card className="bg-white border border-gray-200">
      <CardContent className="p-4">
        <h3 className="font-semibold text-primary mb-4">Daily Wellness</h3>
        
        {/* Water Tracking */}
        <div className="space-y-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Droplets className="text-blue-500 mr-2" size={20} />
              <span className="font-medium">Water Intake</span>
            </div>
            <div className="text-sm text-muted-foreground">
              {wellnessData.water_litres}L / 3L
            </div>
          </div>
          <Progress value={waterProgress} className="h-2" />
          <div className="flex items-center justify-center space-x-3">
            <Button
              size="sm"
              variant="outline"
              onClick={() => updateWellnessData({ 
                water_litres: Math.max(0, wellnessData.water_litres - 0.25) 
              })}
              disabled={wellnessData.water_litres <= 0}
            >
              <Minus size={14} />
            </Button>
            <span className="text-sm font-medium">+0.25L</span>
            <Button
              size="sm"
              onClick={() => updateWellnessData({ 
                water_litres: wellnessData.water_litres + 0.25 
              })}
            >
              <Plus size={14} />
            </Button>
          </div>
        </div>

        {/* Surya Namaskar Tracking */}
        <div className="space-y-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Activity className="text-orange-500 mr-2" size={20} />
              <span className="font-medium">Surya Namaskar</span>
            </div>
            <div className="text-sm text-muted-foreground">
              {wellnessData.surya_namaskar_count} / 12
            </div>
          </div>
          <Progress value={suryaProgress} className="h-2" />
          <div className="flex items-center justify-center space-x-3">
            <Button
              size="sm"
              variant="outline"
              onClick={() => updateWellnessData({ 
                surya_namaskar_count: Math.max(0, wellnessData.surya_namaskar_count - 1) 
              })}
              disabled={wellnessData.surya_namaskar_count <= 0}
            >
              <Minus size={14} />
            </Button>
            <span className="text-sm font-medium">+1 Round</span>
            <Button
              size="sm"
              onClick={() => updateWellnessData({ 
                surya_namaskar_count: wellnessData.surya_namaskar_count + 1 
              })}
            >
              <Plus size={14} />
            </Button>
          </div>
        </div>

        {/* Meditation Tracking */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Brain className="text-purple-500 mr-2" size={20} />
              <span className="font-medium">Morning Meditation</span>
            </div>
            <div className="text-sm text-muted-foreground">
              {wellnessData.meditation_completed ? 'Completed' : 'Pending'}
            </div>
          </div>
          
          {!wellnessData.meditation_completed ? (
            <Button
              className="w-full bg-sage hover:bg-sage/90 text-white"
              onClick={() => updateWellnessData({ 
                meditation_completed: true,
                meditation_minutes: 10
              })}
            >
              Complete 10 Min Meditation
            </Button>
          ) : (
            <div className="flex items-center justify-center p-3 bg-green-50 rounded-lg border border-green-200">
              <span className="text-green-600 font-medium">✓ Meditation Completed!</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default WellnessTracker;
