import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import Header from '@/components/Header';
import WellnessTracker from '@/components/WellnessTracker';
import ProgramCompletionBanner from '@/components/ProgramCompletionBanner';
import DailyProgressCard from '@/components/DailyProgressCard';
import QuickActions from '@/components/QuickActions';
import TodayMeals from '@/components/TodayMeals';
import WeeklyStreak from '@/components/WeeklyStreak';
import StepTracker from '@/components/StepTracker';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useProgramCompletion } from '@/hooks/useProgramCompletion';
import ProfileMenu from '@/components/ProfileMenu';
import { useAuth } from '@/hooks/useAuth';
import { useWellnessTracking } from '@/hooks/useWellnessTracking';

const Home = () => {
  const navigate = useNavigate();
  const { user, userProfile, loading: authLoading, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [todayProgress, setTodayProgress] = useState({
    breakfast: false,
    lunch: false,
    dinner: false,
    steps: 0,
    walkScore: 0
  });
  const [weeklyStreak, setWeeklyStreak] = useState<boolean[]>([]);
  const { isCompleted, completedSubscription } = useProgramCompletion();
  
  // Use wellness tracking hook
  const { wellnessData, loading: wellnessLoading, updateWellnessData } = useWellnessTracking();

  // Listen for step updates from step tracker
  useEffect(() => {
    const handleStepsUpdated = (event: CustomEvent) => {
      const { steps } = event.detail;
      setTodayProgress(prev => ({
        ...prev,
        steps: steps,
        walkScore: Math.min(Math.floor(steps / 2000), 5)
      }));
    };

    window.addEventListener('stepsUpdated', handleStepsUpdated as EventListener);
    
    return () => {
      window.removeEventListener('stepsUpdated', handleStepsUpdated as EventListener);
    };
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning!';
    if (hour < 17) return 'Good afternoon!';
    return 'Good evening!';
  };

  useEffect(() => {
    const checkAuthAndLoadData = async () => {
      if (authLoading) return;
      
      if (!isAuthenticated || !user) {
        console.log('No authenticated user found, redirecting to login');
        navigate('/login');
        return;
      }

      console.log('Authenticated user found:', user.id);
      
      try {
        await fetchTodayProgress(user.id);
        await fetchWeeklyStreak(user.id);
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndLoadData();
  }, [navigate, user, isAuthenticated, authLoading]);

  const fetchTodayProgress = async (userId: string) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data: meals } = await supabase
        .from('meal_tracking')
        .select('meal_type')
        .eq('user_id', userId)
        .eq('date', today);

      const { data: steps } = await supabase
        .from('steps_tracking')
        .select('steps_count')
        .eq('user_id', userId)
        .eq('date', today)
        .maybeSingle();

      const mealTypes = meals?.map(m => m.meal_type) || [];
      const todaySteps = steps?.steps_count || 0;
      
      setTodayProgress({
        breakfast: mealTypes.includes('breakfast'),
        lunch: mealTypes.includes('lunch'),
        dinner: mealTypes.includes('dinner'),
        steps: todaySteps,
        walkScore: Math.min(Math.floor(todaySteps / 2000), 5)
      });

      // Dispatch initial step count to synchronize components
      window.dispatchEvent(new CustomEvent('stepsUpdated', { 
        detail: { steps: todaySteps, lastUpdated: new Date() } 
      }));
    } catch (error) {
      console.error('Error fetching today progress:', error);
    }
  };

  const fetchWeeklyStreak = async (userId: string) => {
    try {
      const today = new Date();
      const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
      const monday = new Date(today);
      
      // Calculate Monday of current week (adjust for Sunday = 0)
      const daysToMonday = currentDay === 0 ? -6 : 1 - currentDay;
      monday.setDate(today.getDate() + daysToMonday);
      
      const weekDates = [];
      for (let i = 0; i < 7; i++) {
        const date = new Date(monday);
        date.setDate(monday.getDate() + i);
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

  // Wellness tracker handlers
  const handleWaterChange = async (delta: number) => {
    const newValue = Math.max(0, wellnessData.water_litres + delta);
    await updateWellnessData({ water_litres: newValue });
  };

  const handleSuryaNamaskarChange = async (delta: number) => {
    const newValue = Math.max(0, wellnessData.surya_namaskar_count + delta);
    await updateWellnessData({ surya_namaskar_count: newValue });
  };

  const handleMeditationToggle = async () => {
    await updateWellnessData({ meditation_completed: !wellnessData.meditation_completed });
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-peaceful flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sage"></div>
      </div>
    );
  }

  if (!user || !userProfile) return null;

  const mealsLogged = [todayProgress.breakfast, todayProgress.lunch, todayProgress.dinner].filter(Boolean).length;

  return (
    <Layout>
      <Header 
        title={getGreeting()}
        rightElement={
          <ProfileMenu>
            <button className="w-8 h-8 rounded-full overflow-hidden border-2 border-sage/30 hover:border-sage transition-colors cursor-pointer">
              <img src={userProfile.profile_photo_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`} alt="Profile" className="w-full h-full object-cover" />
            </button>
          </ProfileMenu>
        }
      />
      
      <div className="p-4 space-y-6 max-w-md mx-auto">
        {isCompleted && completedSubscription && (
          <ProgramCompletionBanner completedSubscription={completedSubscription} />
        )}

        <DailyProgressCard 
          mealsLogged={mealsLogged}
          steps={todayProgress.steps}
          walkScore={todayProgress.walkScore}
        />

        <StepTracker />

        <WellnessTracker 
          waterLitres={wellnessData.water_litres}
          suryaNamaskarCount={wellnessData.surya_namaskar_count}
          meditationCompleted={wellnessData.meditation_completed}
          onWaterChange={handleWaterChange}
          onSuryaNamaskarChange={handleSuryaNamaskarChange}
          onMeditationToggle={handleMeditationToggle}
          loading={wellnessLoading}
        />

        <QuickActions />

        <TodayMeals 
          breakfast={todayProgress.breakfast}
          lunch={todayProgress.lunch}
          dinner={todayProgress.dinner}
        />

        <WeeklyStreak streak={weeklyStreak} />
      </div>
    </Layout>
  );
};

export default Home;
