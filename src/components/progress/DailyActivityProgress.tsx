
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { 
  Utensils, 
  Heart, 
  Droplet, 
  Activity,
  Target
} from 'lucide-react';

interface ActivityData {
  mealsLogged: number;
  suryaNamaskarCount: number;
  meditationCompleted: boolean;
  waterLitres: number;
  steps: number;
}

interface DailyActivityProgressProps {
  activityData: ActivityData;
}

const DailyActivityProgress: React.FC<DailyActivityProgressProps> = ({ activityData }) => {
  // Calculate weighted progress for each activity
  const calculateMealsProgress = () => {
    return Math.min((activityData.mealsLogged / 3) * 30, 30);
  };

  const calculateSuryaNamaskarProgress = () => {
    return Math.min((activityData.suryaNamaskarCount / 12) * 20, 20);
  };

  const calculateMeditationProgress = () => {
    return activityData.meditationCompleted ? 20 : 0;
  };

  const calculateWaterProgress = () => {
    return Math.min((activityData.waterLitres / 4) * 15, 15);
  };

  const calculateStepsProgress = () => {
    return Math.min((activityData.steps / 5000) * 15, 15);
  };

  const totalProgress = 
    calculateMealsProgress() + 
    calculateSuryaNamaskarProgress() + 
    calculateMeditationProgress() + 
    calculateWaterProgress() + 
    calculateStepsProgress();

  const activities = [
    {
      name: 'Meals',
      icon: Utensils,
      current: activityData.mealsLogged,
      target: 3,
      progress: calculateMealsProgress(),
      weight: 30,
      unit: 'meals',
      color: 'hsl(var(--pastel-purple))'
    },
    {
      name: 'Surya Namaskar',
      icon: Activity,
      current: activityData.suryaNamaskarCount,
      target: 12,
      progress: calculateSuryaNamaskarProgress(),
      weight: 20,
      unit: 'rounds',
      color: 'hsl(var(--pastel-lavender))'
    },
    {
      name: 'Dhatu Meditation',
      icon: Heart,
      current: activityData.meditationCompleted ? 1 : 0,
      target: 1,
      progress: calculateMeditationProgress(),
      weight: 20,
      unit: 'session',
      color: 'hsl(var(--pastel-mint))'
    },
    {
      name: 'Water Intake',
      icon: Droplet,
      current: activityData.waterLitres,
      target: 4,
      progress: calculateWaterProgress(),
      weight: 15,
      unit: 'liters',
      color: 'hsl(var(--pastel-blue))'
    },
    {
      name: 'Steps',
      icon: Target,
      current: activityData.steps,
      target: 5000,
      progress: calculateStepsProgress(),
      weight: 15,
      unit: 'steps',
      color: 'hsl(var(--pastel-peach))'
    }
  ];

  return (
    <div className="space-y-4">
      {/* Overall Progress Circle */}
      <Card className="bg-gradient-to-br from-white to-gray-50 border-0 shadow-lg">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl font-bold text-gray-800">Today's Progress</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          <div className="w-32 h-32 mb-4">
            <CircularProgressbar
              value={totalProgress}
              text={`${Math.round(totalProgress)}%`}
              styles={buildStyles({
                textSize: '16px',
                pathColor: totalProgress >= 80 ? 'hsl(var(--success))' : totalProgress >= 50 ? 'hsl(var(--warning))' : 'hsl(var(--destructive))',
                textColor: 'hsl(var(--foreground))',
                trailColor: 'hsl(var(--muted))',
                backgroundColor: 'hsl(var(--background))',
              })}
            />
          </div>
          <p className="text-sm text-gray-600 text-center">
            Complete all activities to reach 100%
          </p>
        </CardContent>
      </Card>

      {/* Individual Activity Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {activities.map((activity) => {
          const Icon = activity.icon;
          const completionPercentage = (activity.progress / activity.weight) * 100;
          
          return (
            <Card key={activity.name} className="bg-white border-0 shadow-sm hover:shadow-md transition-all duration-200 max-w-md mx-auto">
              <CardContent className="p-4 text-center">
                <div className="flex flex-col items-center space-y-3 mb-4">
                  <div 
                    className="p-3 rounded-full bg-primary/10"
                  >
                    <Icon size={24} className="text-primary" style={{ color: activity.color }} />
                  </div>
                  <div className="text-center">
                    <h3 className="font-semibold text-gray-800 mb-1">{activity.name}</h3>
                    <p className="text-sm text-gray-500 mb-2">
                      {activity.current} / {activity.target} {activity.unit}
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-primary mb-1" style={{ color: activity.color }}>
                      {Math.round(activity.progress)}/{activity.weight}
                    </div>
                    <div className="text-xs text-gray-500">points</div>
                  </div>
                </div>
                
                <div className="space-y-2 w-full">
                  <Progress 
                    value={completionPercentage} 
                    className="h-2"
                    style={{
                      '--progress-background': activity.color,
                    } as React.CSSProperties}
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{Math.round(completionPercentage)}% complete</span>
                    <span>Weight: {activity.weight}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Progress Insights */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-0 max-w-md mx-auto">
        <CardContent className="p-4">
          <h3 className="font-semibold text-gray-800 mb-2">Progress Insights</h3>
          <div className="text-sm text-gray-600 space-y-1">
            {totalProgress === 100 && (
              <p className="text-green-600 font-medium">🎉 Perfect day! All activities completed!</p>
            )}
            {totalProgress < 100 && totalProgress >= 80 && (
              <p className="text-blue-600">You're almost there! Just a few more activities to go.</p>
            )}
            {totalProgress < 80 && totalProgress >= 50 && (
              <p className="text-yellow-600">Good progress! Keep building those healthy habits.</p>
            )}
            {totalProgress < 50 && (
              <p className="text-orange-600">Great start! Remember, every small step counts.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DailyActivityProgress;
