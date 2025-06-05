
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface DailyProgressCardProps {
  mealsLogged: number;
  steps: number;
  walkScore: number;
}

const DailyProgressCard = ({ mealsLogged, steps, walkScore }: DailyProgressCardProps) => {
  const stepsProgress = Math.min((steps / 10000) * 100, 100);

  return (
    <Card className="bg-gradient-sage text-white animate-fade-in">
      <CardContent className="p-6">
        <h2 className="text-xl font-bold mb-4">Today's Progress</h2>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span>Meals Logged</span>
            <span className="font-bold">{mealsLogged}/3</span>
          </div>
          <Progress value={(mealsLogged / 3) * 100} className="bg-white/20" />
          
          <div className="flex justify-between items-center">
            <span>Steps Walked</span>
            <span className="font-bold">{steps.toLocaleString()}</span>
          </div>
          <Progress value={stepsProgress} className="bg-white/20" />
          
          <div className="flex justify-between items-center">
            <span>10km Walk Score</span>
            <div className="flex items-center">
              <span className="font-bold mr-1">{walkScore}/5</span>
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <span 
                    key={i} 
                    className={`text-sm ${i < walkScore ? 'text-gray-300' : 'text-white/50'}`}
                  >
                    ⭐
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DailyProgressCard;
