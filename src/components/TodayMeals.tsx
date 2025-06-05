
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Award, Plus } from 'lucide-react';

interface TodayMealsProps {
  breakfast: boolean;
  lunch: boolean;
  dinner: boolean;
}

const TodayMeals = ({ breakfast, lunch, dinner }: TodayMealsProps) => {
  const navigate = useNavigate();

  const meals = [
    { meal: 'Breakfast', time: '8:00 AM', logged: breakfast },
    { meal: 'Lunch', time: '12:30 PM', logged: lunch },
    { meal: 'Dinner', time: '7:00 PM', logged: dinner }
  ];

  return (
    <Card>
      <CardContent className="p-4">
        <h3 className="font-semibold text-primary mb-4">Today's Meals</h3>
        <div className="space-y-3">
          {meals.map(({ meal, time, logged }) => (
            <div key={meal} className="flex items-center justify-between p-3 bg-sage/5 rounded-lg">
              <div>
                <p className="font-medium">{meal}</p>
                <p className="text-sm text-muted-foreground">{time}</p>
              </div>
              <div className="flex items-center">
                {logged ? (
                  <div className="flex items-center text-green-600">
                    <Award size={16} className="mr-1" />
                    <span className="text-sm font-medium">Logged</span>
                  </div>
                ) : (
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="rounded-lg"
                    onClick={() => navigate('/upload', { state: { mealType: meal.toLowerCase() } })}
                  >
                    <Plus size={14} className="mr-1" />
                    Add
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TodayMeals;
