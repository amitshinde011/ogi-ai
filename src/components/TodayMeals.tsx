
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
    <Card className="bg-white border border-gray-200">
      <CardContent className="p-4">
        <h3 className="font-semibold text-gray-900 mb-4">Today's Meals</h3>
        <div className="space-y-3">
          {meals.map(({ meal, time, logged }) => (
            <div key={meal} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div>
                <p className="font-medium text-gray-900">{meal}</p>
                <p className="text-sm text-gray-600">{time}</p>
              </div>
              <div className="flex items-center">
                {logged ? (
                  <div className="flex items-center bg-green-100 text-green-700 px-3 py-1.5 rounded-full border border-green-200">
                    <Award size={16} className="mr-1" />
                    <span className="text-sm font-medium">Logged</span>
                  </div>
                ) : (
                  <Button 
                    size="sm" 
                    variant="secondary" 
                    className="rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
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
