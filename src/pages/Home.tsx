
import React, { useState, useEffect } from 'react';
import { Plus, Camera, Award, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import Layout from '@/components/Layout';
import Header from '@/components/Header';
import WellnessTracker from '@/components/WellnessTracker';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const Home = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [todayProgress, setTodayProgress] = useState({
    breakfast: false,
    lunch: false,
    dinner: false,
    steps: 0,
    walkScore: 0
  });
  const [weeklyStreak, setWeeklyStreak] = useState<boolean[]>([]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error || !user) {
          console.log('No authenticated user found, redirecting to login');
          navigate('/login');
          return;
        }

        console.log('Authenticated user found:', user.id);
        setUser({
          ...user,
          avatar: user.user_metadata?.avatar_url || '/placeholder.svg'
        });

        // Fetch real tracking data
        await fetchTodayProgress(user.id);
        await fetchWeeklyStreak(user.id);
      } catch (error) {
        console.error('Error checking authentication:', error);
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  const fetchTodayProgress = async (userId: string) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Fetch today's meals
      const { data: meals } = await supabase
        .from('meal_tracking')
        .select('meal_type')
        .eq('user_id', userId)
        .eq('date', today);

      // Fetch today's steps
      const { data: steps } = await supabase
        .from('steps_tracking')
        .select('steps_count')
        .eq('user_id', userId)
        .eq('date', today)
        .single();

      const mealTypes = meals?.map(m => m.meal_type) || [];
      const todaySteps = steps?.steps_count || 0;
      
      setTodayProgress({
        breakfast: mealTypes.includes('breakfast'),
        lunch: mealTypes.includes('lunch'),
        dinner: mealTypes.includes('dinner'),
        steps: todaySteps,
        walkScore: Math.min(Math.floor(todaySteps / 2000), 5) // 1 star per 2000 steps, max 5
      });
    } catch (error) {
      console.error('Error fetching today progress:', error);
    }
  };

  const fetchWeeklyStreak = async (userId: string) => {
    try {
      const today = new Date();
      const weekDates = [];
      
      // Get last 7 days
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        weekDates.push(date.toISOString().split('T')[0]);
      }

      const { data: wellness } = await supabase
        .from('daily_wellness')
        .select('date, meditation_completed, water_litres, surya_namaskar_count')
        .eq('user_id', userId)
        .in('date', weekDates);

      const streak = weekDates.map(date => {
        const dayData = wellness?.find(w => w.date === date);
        return !!(dayData?.meditation_completed || (dayData?.water_litres && dayData.water_litres > 0) || (dayData?.surya_namaskar_count && dayData.surya_namaskar_count > 0));
      });

      setWeeklyStreak(streak);
    } catch (error) {
      console.error('Error fetching weekly streak:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-peaceful flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sage"></div>
      </div>
    );
  }

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
                    weeklyStreak[index] ? 'bg-green-500 text-white' : 'bg-gray-200'
                  }`}>
                    {weeklyStreak[index] ? '✓' : ''}
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
