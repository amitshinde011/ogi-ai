
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Footprints, Plus, Play, Pause } from 'lucide-react';
import { useStepTracking } from '@/hooks/useStepTracking';

const StepTracker = () => {
  const { stepData, isTracking, permission, manuallyAddSteps, requestPermission } = useStepTracking();

  const handleAdd100Steps = () => {
    manuallyAddSteps(100);
  };

  const handleAdd500Steps = () => {
    manuallyAddSteps(500);
  };

  const handleAdd1000Steps = () => {
    manuallyAddSteps(1000);
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Footprints className="text-blue-500 mr-2" size={20} />
            <span className="font-medium">Step Tracker</span>
          </div>
          <div className="flex items-center">
            {isTracking ? (
              <div className="flex items-center text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                <span className="text-sm">Tracking</span>
              </div>
            ) : (
              <div className="flex items-center text-gray-500">
                <Pause size={16} className="mr-1" />
                <span className="text-sm">Not tracking</span>
              </div>
            )}
          </div>
        </div>

        <div className="text-center mb-4">
          <div className="text-3xl font-bold text-primary">{stepData.steps.toLocaleString()}</div>
          <div className="text-sm text-muted-foreground">steps today</div>
          <div className="text-xs text-muted-foreground mt-1">
            Last updated: {stepData.lastUpdated.toLocaleTimeString()}
          </div>
        </div>

        {permission === 'prompt' && (
          <Button 
            onClick={requestPermission}
            className="w-full mb-4"
            variant="outline"
          >
            <Play size={16} className="mr-2" />
            Enable Step Tracking
          </Button>
        )}

        {permission === 'denied' && (
          <div className="text-center mb-4 p-3 bg-yellow-50 rounded-lg">
            <p className="text-sm text-yellow-800">
              Step tracking permission denied. You can still manually add steps below.
            </p>
          </div>
        )}

        <div className="space-y-2">
          <p className="text-sm font-medium text-center">Manually add steps:</p>
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={handleAdd100Steps}
              className="flex-1"
            >
              <Plus size={14} className="mr-1" />
              +100
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={handleAdd500Steps}
              className="flex-1"
            >
              <Plus size={14} className="mr-1" />
              +500
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={handleAdd1000Steps}
              className="flex-1"
            >
              <Plus size={14} className="mr-1" />
              +1K
            </Button>
          </div>
        </div>

        <div className="mt-4 text-xs text-muted-foreground text-center">
          Goal: 10,000 steps per day
        </div>
      </CardContent>
    </Card>
  );
};

export default StepTracker;
