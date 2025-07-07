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
import DailySpecialTracking from '@/components/DailySpecialTracking';
import SubscriptionBanner from '@/components/SubscriptionBanner';
import { useNavigate } from 'react-router-dom';
import { useProgramCompletion } from '@/hooks/useProgramCompletion';
import ProfileMenu from '@/components/ProfileMenu';
import { useAuth } from '@/hooks/useAuth';
import { useSubscriptionBanner } from '@/hooks/useSubscriptionBanner';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useOptimizedHomeData } from '@/hooks/useOptimizedHomeData';
import { useOptimizedWellness } from '@/hooks/useOptimizedWellness';

const Home = () => {
  const navigate = useNavigate();
  const { user, userProfile, loading: authLoading, isAuthenticated } = useAuth();
  const { isCompleted, completedSubscription } = useProgramCompletion();
  const { showBanner } = useSubscriptionBanner();
  
  // Use optimized data fetching
  const { data: homeData, loading: homeLoading } = useOptimizedHomeData();
  
  // Use optimized wellness updates
  const {
    wellnessData,
    isUpdating: wellnessUpdating,
    updateWater,
    updateSuryaNamaskar,
    toggleMeditation
  } = useOptimizedWellness(homeData.wellnessData);

  // Listen for step updates from step tracker
  useEffect(() => {
    const handleStepsUpdated = (event: CustomEvent) => {
      // Steps are already handled by the optimized hook
      console.log('Steps updated:', event.detail.steps);
    };

    window.addEventListener('stepsUpdated', handleStepsUpdated as EventListener);
    
    return () => {
      window.removeEventListener('stepsUpdated', handleStepsUpdated as EventListener);
    };
  }, []);

  useEffect(() => {
    if (authLoading) return;
    
    if (!isAuthenticated || !user) {
      console.log('No authenticated user found, redirecting to login');
      navigate('/login');
      return;
    }
  }, [navigate, user, isAuthenticated, authLoading]);

  if (authLoading || homeLoading) {
    return (
      <div className="min-h-screen bg-gradient-peaceful flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sage"></div>
      </div>
    );
  }

  if (!user || !userProfile) return null;

  const mealsLogged = [
    homeData.todayProgress.breakfast, 
    homeData.todayProgress.lunch, 
    homeData.todayProgress.dinner
  ].filter(Boolean).length;

  // Profile menu component for the header
  const profileElement = (
    <ProfileMenu>
      <button className="hover:bg-slate-100 rounded-xl transition-all duration-200 interactive">
        <Avatar className="h-12 w-12 border-2 border-slate-300">
          <AvatarImage 
            src={userProfile.profile_photo_url || undefined} 
            alt={userProfile.name}
          />
          <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
            {userProfile.name?.charAt(0) || 'U'}
          </AvatarFallback>
        </Avatar>
      </button>
    </ProfileMenu>
  );

  return (
    <Layout>
      <Header title="Home" rightElement={profileElement} />
      {showBanner && <SubscriptionBanner />}
      
      <div className="p-4 space-y-6 max-w-md mx-auto">
        {isCompleted && completedSubscription && (
          <ProgramCompletionBanner completedSubscription={completedSubscription} />
        )}

        <DailyProgressCard 
          mealsLogged={mealsLogged}
          steps={homeData.todayProgress.steps}
          walkScore={homeData.todayProgress.walkScore}
        />

        <StepTracker />

        <WellnessTracker 
          waterLitres={wellnessData.water_litres}
          suryaNamaskarCount={wellnessData.surya_namaskar_count}
          meditationCompleted={wellnessData.meditation_completed}
          onWaterChange={updateWater}
          onSuryaNamaskarChange={updateSuryaNamaskar}
          onMeditationToggle={toggleMeditation}
          loading={wellnessUpdating}
        />

        <QuickActions />

        <TodayMeals 
          breakfast={homeData.todayProgress.breakfast}
          lunch={homeData.todayProgress.lunch}
          dinner={homeData.todayProgress.dinner}
        />

        <DailySpecialTracking 
          saladBowlCompleted={homeData.todayProgress.saladBowl}
          kanjiCompleted={homeData.todayProgress.kanji}
        />

        <WeeklyStreak streak={homeData.weeklyStreak} />
      </div>
    </Layout>
  );
};

export default Home;
