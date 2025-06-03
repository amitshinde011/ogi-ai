
import React, { useState, useEffect } from 'react';
import { Plus, Camera, Award, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import Layout from '@/components/Layout';
import Header from '@/components/Header';
import WellnessTracker from '@/components/WellnessTracker';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [todayProgress, setTodayProgress] = useState({
    breakfast: false,
    lunch: false,
    dinner: false,
    steps: 4200,
    walkScore: 3
  });

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      navigate('/login');
    }
  }, [navigate]);

  if (!user) return null;

  const mealsLogged = [todayProgress.breakfast, todayProgress.lunch, todayProgress.dinner].filter(Boolean).length;
  const stepsProgress = Math.min((todayProgress.steps / 10000) * 100, 100);

  return (
    <Layout>
      <Header 
        title="Good morning!" 
        rightElement={
          <div className="w-8 h-8 rounded-full overflow-hidden">
            <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
          </div>
        }
      />
      
      <div className="p-4 space-y-6 max-w-md mx-auto">
        {/* Daily Progress Card */}
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
                <span className="font-bold">{todayProgress.steps.toLocaleString()}</span>
              </div>
              <Progress value={stepsProgress} className="bg-white/20" />
              
              <div className="flex justify-between items-center">
                <span>10km Walk Score</span>
                <div className="flex items-center">
                  <span className="font-bold mr-1">{todayProgress.walkScore}/5</span>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <span 
                        key={i} 
                        className={`text-sm ${i < todayProgress.walkScore ? 'text-gray-300' : 'text-white/50'}`}
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

        {/* Wellness Tracker */}
        <WellnessTracker />

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/upload')}>
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 bg-sage/10 rounded-full flex items-center justify-center mx-auto mb-2">
                <Camera className="text-primary" size={24} />
              </div>
              <h3 className="font-semibold text-primary">Log Meal</h3>
              <p className="text-sm text-muted-foreground">Upload your meal photo</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/community')}>
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 bg-sage/10 rounded-full flex items-center justify-center mx-auto mb-2">
                <TrendingUp className="text-primary" size={24} />
              </div>
              <h3 className="font-semibold text-primary">Community</h3>
              <p className="text-sm text-muted-foreground">See others' journeys</p>
            </CardContent>
          </Card>
        </div>

        {/* Meal Status */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold text-primary mb-4">Today's Meals</h3>
            <div className="space-y-3">
              {[
                { meal: 'Breakfast', time: '8:00 AM', logged: todayProgress.breakfast },
                { meal: 'Lunch', time: '12:30 PM', logged: todayProgress.lunch },
                { meal: 'Dinner', time: '7:00 PM', logged: todayProgress.dinner }
              ].map(({ meal, time, logged }) => (
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

        {/* Weekly Streak */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold text-primary mb-4">7-Day Streak</h3>
            <div className="flex justify-between">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
                <div key={day} className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${
                    index < 4 ? 'bg-green-500 text-white' : 'bg-gray-200'
                  }`}>
                    {index < 4 ? '✓' : ''}
                  </div>
                  <span className="text-xs text-muted-foreground">{day}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Home;
