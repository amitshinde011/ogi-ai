import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Award, Plus, Salad, Coffee } from 'lucide-react';
import { useUserProgram } from '@/hooks/useUserProgram';

interface DailySpecialTrackingProps {
  saladBowlCompleted: boolean;
  kanjiCompleted: boolean;
}

const DailySpecialTracking = ({ saladBowlCompleted, kanjiCompleted }: DailySpecialTrackingProps) => {
  const navigate = useNavigate();
  const { data: userProgram } = useUserProgram();

  // Only show for 49 day and 108 day programs
  const shouldShowTracking = userProgram?.programs?.duration_days === 49 || userProgram?.programs?.duration_days === 108;

  if (!shouldShowTracking) {
    return null;
  }

  const specialItems = [
    {
      name: 'Daily Salad Bowl',
      description: 'Breakfast salad bowl',
      icon: Salad,
      completed: saladBowlCompleted,
      trackingType: 'salad_bowl'
    },
    {
      name: 'Daily Kanji',
      description: 'Finger Millet Porridge',
      icon: Coffee,
      completed: kanjiCompleted,
      trackingType: 'kanji',
      recipeId: '4cb18b49-fb47-4452-8ef0-8f9be8f1fd98' // Simple Finger Millet Porridge
    }
  ];

  const handleViewRecipe = (recipeId: string) => {
    navigate(`/recipe/${recipeId}`);
  };

  const handleTrackItem = (trackingType: string) => {
    navigate('/upload', { state: { specialTracking: trackingType } });
  };

  return (
    <Card className="bg-white border border-gray-200">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">
          Daily Special Items
        </CardTitle>
        <p className="text-sm text-gray-600">
          Special tracking for your {userProgram?.programs?.duration_days}-day program
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {specialItems.map(({ name, description, icon: Icon, completed, trackingType, recipeId }) => (
          <div key={name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-sage/10 rounded-full">
                <Icon size={16} className="text-sage" />
              </div>
              <div>
                <p className="font-medium text-gray-900">{name}</p>
                <p className="text-sm text-gray-600">{description}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {recipeId && (
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="text-xs"
                  onClick={() => handleViewRecipe(recipeId)}
                >
                  Recipe
                </Button>
              )}
              {completed ? (
                <div className="flex items-center bg-green-100 text-green-700 px-3 py-1.5 rounded-full border border-green-200">
                  <Award size={16} className="mr-1" />
                  <span className="text-sm font-medium">Done</span>
                </div>
              ) : (
                <Button 
                  size="sm" 
                  variant="secondary" 
                  className="rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                  onClick={() => handleTrackItem(trackingType)}
                >
                  <Plus size={14} className="mr-1" />
                  Track
                </Button>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default DailySpecialTracking;