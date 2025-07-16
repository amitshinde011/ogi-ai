
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, Target, Footprints } from 'lucide-react';

interface DailyProgressCardProps {
  mealsLogged: number;
  steps: number;
  walkScore: number;
}

const DailyProgressCard = ({ mealsLogged, steps: initialSteps, walkScore: initialWalkScore }: DailyProgressCardProps) => {
  console.log('📊 DailyProgressCard: Component rendered with props:', { mealsLogged, initialSteps, initialWalkScore });
  
  // Calculate walk score from steps on initial load
  const calculatedWalkScore = Math.min(Math.floor((initialSteps / 5000) * 5), 5);
  
  const [currentSteps, setCurrentSteps] = useState(initialSteps);
  const [currentWalkScore, setCurrentWalkScore] = useState(calculatedWalkScore);

  // Listen for step updates from StepTracker
  useEffect(() => {
    const handleStepsUpdated = (event: CustomEvent) => {
      console.log('📢 DailyProgressCard: Steps updated event received:', event.detail);
      const newSteps = event.detail.steps;
      setCurrentSteps(newSteps);
      
      // Calculate walk score: Based on 5000 steps = 5 stars goal
      // Score out of 5: (steps / 5000) * 5 stars
      const newWalkScore = Math.min(Math.floor((newSteps / 5000) * 5), 5);
      setCurrentWalkScore(newWalkScore);
      
      console.log('📊 DailyProgressCard: Updated steps and walk score:', { 
        steps: newSteps, 
        walkScore: newWalkScore,
        kmWalked: (newSteps / 1000).toFixed(1)
      });
    };

    window.addEventListener('stepsUpdated', handleStepsUpdated as EventListener);
    
    return () => {
      console.log('🧹 DailyProgressCard: Cleaning up steps listener');
      window.removeEventListener('stepsUpdated', handleStepsUpdated as EventListener);
    };
  }, []);

  // Sync with props when they change
  useEffect(() => {
    console.log('🔄 DailyProgressCard: Props updated, syncing state.');
    
    // This effect now correctly syncs state ONLY when the props change.
    setCurrentSteps(initialSteps);
    
    const calculatedWalkScore = Math.min(Math.floor((initialSteps / 5000) * 5), 5);
    setCurrentWalkScore(calculatedWalkScore);
    
  }, [initialSteps, initialWalkScore]);

  const stepsProgress = Math.min((currentSteps / 5000) * 100, 100); // 5,000 steps = 100%
  const kmWalked = (currentSteps / 1000).toFixed(1); // 1000 steps ≈ 1km

  console.log('📈 DailyProgressCard: Current state:', {
    currentSteps,
    currentWalkScore,
    stepsProgress: stepsProgress.toFixed(1),
    kmWalked
  });

  return (
    <Card className="gradient-primary text-white shadow-xl border-0 animate-slide-up interactive max-w-md mx-auto">
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
              <span className="font-bold text-white text-lg">{currentSteps.toLocaleString()}</span>
            </div>
            <Progress value={stepsProgress} className="bg-white/20 h-2" />
            <div className="text-white/80 text-sm mt-1">
              {kmWalked} km walked
            </div>
          </div>
          
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex justify-between items-center">
              <span className="text-white font-medium">5km Walk Score</span>
              <div className="flex items-center">
                <span className="font-bold mr-2 text-white text-lg">{currentWalkScore}/5</span>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <span 
                      key={i} 
                      className={`text-lg transition-all ${
                        i < currentWalkScore ? 'text-amber-300 scale-110' : 'text-white/40'
                      }`}
                    >
                      ⭐
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="text-white/80 text-sm mt-1">
              {currentSteps.toLocaleString()} / 5,000 steps to 5km
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DailyProgressCard;
