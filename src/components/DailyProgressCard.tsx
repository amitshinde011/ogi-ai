
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, Target, Footprints } from 'lucide-react';

interface DailyProgressCardProps {
  mealsLogged: number;
  steps: number;
  walkScore: number;
}

const DailyProgressCard = ({ mealsLogged, steps, walkScore }: DailyProgressCardProps) => {
  const stepsProgress = Math.min((steps / 10000) * 100, 100);

  return (
    <Card className="gradient-primary text-white shadow-xl border-0 animate-slide-up interactive">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Today's Progress</h2>
          <TrendingUp className="text-white/80" size={24} />
        </div>
        
        <div className="space-y-5">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center">
                <Target className="text-white/80 mr-2" size={18} />
                <span className="text-white font-medium">Meals Logged</span>
              </div>
              <span className="font-bold text-white text-lg">{mealsLogged}/3</span>
            </div>
            <Progress value={(mealsLogged / 3) * 100} className="bg-white/20 h-2" />
          </div>
          
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center">
                <Footprints className="text-white/80 mr-2" size={18} />
                <span className="text-white font-medium">Steps Walked</span>
              </div>
              <span className="font-bold text-white text-lg">{steps.toLocaleString()}</span>
            </div>
            <Progress value={stepsProgress} className="bg-white/20 h-2" />
          </div>
          
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex justify-between items-center">
              <span className="text-white font-medium">10km Walk Score</span>
              <div className="flex items-center">
                <span className="font-bold mr-2 text-white text-lg">{walkScore}/5</span>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <span 
                      key={i} 
                      className={`text-lg transition-all ${
                        i < walkScore ? 'text-yellow-300 scale-110' : 'text-white/40'
                      }`}
                    >
                      ⭐
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DailyProgressCard;
