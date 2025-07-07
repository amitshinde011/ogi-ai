
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
import { useAnalytics } from '@/hooks/useAnalytics';

const Home = () => {
  console.log('🏠 Home: Component initialized');
  
  const navigate = useNavigate();
  const { user, userProfile, loading: authLoading, isAuthenticated } = useAuth();
  const { isCompleted, completedSubscription } = useProgramCompletion();
  const { showBanner } = useSubscriptionBanner();
  const { trackEvent, trackUserEngagement } = useAnalytics();
  
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
      console.log('📢 Home: Steps updated event received:', event.detail);
      trackEvent('steps_updated_home', 'Data Sync', 'Step Tracker Update', event.detail.steps);
    };

    window.addEventListener('stepsUpdated', handleStepsUpdated as EventListener);
    
    return () => {
      console.log('🧹 Home: Cleaning up steps updated listener');
      window.removeEventListener('stepsUpdated', handleStepsUpdated as EventListener);
    };
  }, [trackEvent]);

  useEffect(() => {
    console.log('🔐 Home: Auth state check:', { authLoading, isAuthenticated, hasUser: !!user });
    
    if (authLoading) {
      console.log('⏳ Home: Auth still loading, waiting...');
      return;
    }
    
    if (!isAuthenticated || !user) {
      console.log('🚪 Home: No authenticated user found, redirecting to login');
      trackEvent('home_access_denied', 'Security', 'Unauthenticated');
      navigate('/login');
      return;
    }

    console.log('✅ Home: User authenticated successfully:', user.id);
    trackEvent('home_page_view', 'Navigation', 'Authenticated Access');
  }, [navigate, user, isAuthenticated, authLoading, trackEvent]);

  // Track user engagement on home page
  useEffect(() => {
    console.log('📊 Home: Tracking user engagement on home page');
    trackUserEngagement('home_page_visit');
    
    const engagementTimer = setTimeout(() => {
      console.log('⏰ Home: User engaged for 5+ seconds');
      trackUserEngagement('home_page_engaged_5s');
    }, 5000);

    return () => {
      clearTimeout(engagementTimer);
    };
  }, [trackUserEngagement]);

  if (authLoading || homeLoading) {
    console.log('⏳ Home: Showing loading state');
    return (
      <div className="min-h-screen bg-gradient-peaceful flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sage"></div>
      </div>
    );
  }

  if (!user || !userProfile) {
    console.log('❌ Home: Missing user or profile data');
    return null;
  }

  const mealsLogged = [
    homeData.todayProgress.breakfast, 
    homeData.todayProgress.lunch, 
    homeData.todayProgress.dinner
  ].filter(Boolean).length;

  console.log('🍽️ Home: Meals logged today:', mealsLogged);
  console.log('📊 Home: Current wellness data:', wellnessData);
  console.log('🏃 Home: Today\'s progress:', homeData.todayProgress);

  // Track meals completion
  useEffect(() => {
    if (mealsLogged > 0) {
      trackEvent('daily_meals_count', 'Nutrition', `${mealsLogged} meals logged`);
    }
  }, [mealsLogged, trackEvent]);

  // Profile menu component for the header
  const profileElement = (
    <ProfileMenu>
      <button 
        className="hover:bg-slate-100 rounded-xl transition-all duration-200 interactive"
        onClick={() => {
          console.log('👤 Home: Profile menu clicked');
          trackEvent('profile_menu_click', 'UI', 'Header Navigation');
        }}
      >
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

  console.log('🎨 Home: Rendering home page with all components');

  return (
    <Layout>
      <Header title="Home" rightElement={profileElement} />
      {showBanner && (
        <>
          <SubscriptionBanner />
          {console.log('📢 Home: Subscription banner displayed')}
        </>
      )}
      
      <div className="p-4 space-y-6 max-w-md mx-auto">
        {isCompleted && completedSubscription && (
          <>
            <ProgramCompletionBanner completedSubscription={completedSubscription} />
            {console.log('🎉 Home: Program completion banner displayed')}
          </>
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
          onWaterChange={(delta) => {
            console.log('💧 Home: Water change requested:', delta);
            updateWater(delta);
          }}
          onSuryaNamaskarChange={(delta) => {
            console.log('🧘 Home: Surya Namaskar change requested:', delta);
            updateSuryaNamaskar(delta);
          }}
          onMeditationToggle={() => {
            console.log('🧘‍♀️ Home: Meditation toggle requested');
            toggleMeditation();
          }}
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
