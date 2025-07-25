import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { PageContainer } from '@/components/Layout/PageContainer';
import Header from '@/components/Header';
import WellnessTracker from '@/components/WellnessTracker';
import ProgramCompletionBanner from '@/components/ProgramCompletionBanner';
import DailyProgressCard from '@/components/DailyProgressCard';
import QuickActions from '@/components/QuickActions';
import TodayMeals from '@/components/TodayMeals';
import WeeklyStreak from '@/components/WeeklyStreak';
import StepTracker from '@/components/wellness/StepTracker';
import DailySpecialTracking from '@/components/DailySpecialTracking';
import SubscriptionBanner from '@/components/SubscriptionBanner';
import { useNavigate } from 'react-router-dom';
import { useProgramCompletion } from '@/hooks/useProgramCompletion';
import ProfileMenu from '@/components/ProfileMenu';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/hooks/useNotifications';
import { Bell } from 'lucide-react';
import { useSubscriptionBanner } from '@/hooks/useSubscriptionBanner';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useOptimizedHomeData } from '@/hooks/useOptimizedHomeData';
import { useOptimizedWellness } from '@/hooks/useOptimizedWellness';
import { useAnalytics } from '@/hooks/useAnalytics';
import { UserAvatar } from '@/components/ui/user-avatar';

import Loader from '@/components/ui/loader';

const Home = () => {
  console.log('🏠 Home: Component initialized');
  
  const navigate = useNavigate();
  
  // Always call all hooks in the same order - never conditionally
  const { user, userProfile, loading: authLoading, isAuthenticated } = useAuth();
  const { isCompleted, completedSubscription } = useProgramCompletion();
  const { showBanner } = useSubscriptionBanner();
  const { trackEvent, trackUserEngagement } = useAnalytics();
  const { unreadCount } = useNotifications();
  
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

  // Calculate meals logged once
  const mealsLogged = [
    homeData.todayProgress.breakfast, 
    homeData.todayProgress.lunch, 
    homeData.todayProgress.dinner
  ].filter(Boolean).length;

  // Always call useEffect hooks in the same order
  // Listen for step updates from step tracker (only once)
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
  }, []);

  // Auth check effect - always called, but logic is conditional
  useEffect(() => {
    console.log('🔐 Home: Auth state check:', { authLoading, isAuthenticated, hasUser: !!user });
    
    // Only redirect if we're sure about auth state
    if (!authLoading) {
      if (!isAuthenticated || !user) {
        console.log('🚪 Home: No authenticated user found, redirecting to login');
        trackEvent('home_access_denied', 'Security', 'Unauthenticated');
        navigate('/login');
        return;
      }

      console.log('✅ Home: User authenticated successfully:', user.id);
      trackEvent('home_page_view', 'Navigation', 'Authenticated Access');
    }
  }, [navigate, user, isAuthenticated, authLoading]);

  // Track user engagement on home page - always called
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      console.log('📊 Home: Tracking user engagement on home page');
      trackUserEngagement('home_page_visit');
      
      const engagementTimer = setTimeout(() => {
        console.log('⏰ Home: User engaged for 5+ seconds');
        trackUserEngagement('home_page_engaged_5s');
      }, 5000);

      return () => {
        clearTimeout(engagementTimer);
      };
    }
  }, [authLoading, isAuthenticated]);

  // Track meals completion - always called
  useEffect(() => {
    if (mealsLogged > 0) {
      trackEvent('daily_meals_count', 'Nutrition', `${mealsLogged} meals logged`);
    }
  }, [mealsLogged]);


  // Early return for missing user while auth is loading
  if (authLoading || !user) {
    console.log('⏳ Home: Showing auth loading state');
    return (
      <div className="min-h-screen bg-gradient-peaceful flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  // Early return for missing profile but don't show full-page loader for data fetching
  if (!userProfile) {
    console.log('❌ Home: Missing user profile data');
    return (
      <div className="min-h-screen bg-gradient-peaceful flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  console.log('🍽️ Home: Meals logged today:', mealsLogged);
  console.log('📊 Home: Current wellness data:', wellnessData);
  console.log('🏃 Home: Today\'s progress:', homeData.todayProgress);
  console.log('👤 Home: User profile for avatar:', userProfile);

  // Header elements - notifications only
  const headerElements = (
    <div className="flex items-center gap-3">
      {/* Notification Icon */}
      <button 
        onClick={() => {
          console.log('🔔 Home: Notifications clicked');
          trackEvent('notifications_click', 'UI', 'Header Navigation');
          navigate('/notifications');
        }}
        className="relative hover:bg-slate-100 p-2 rounded-xl transition-all duration-200 interactive"
      >
        <Bell size={20} className="text-slate-700" />
        {unreadCount > 0 && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </div>
        )}
      </button>
    </div>
  );

  console.log('🎨 Home: Rendering home page with all components');

  return (
    <Layout noContainer>
      <PageContainer>
        <Header title="Home" rightElement={headerElements} />
        {showBanner && (
          <>
            <SubscriptionBanner />
            {console.log('📢 Home: Subscription banner displayed')}
          </>
        )}
        
        <div className="space-y-6 py-4">
        {homeLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader size="lg" className="mx-auto mb-4" />
              <p className="text-gray-600">Loading your wellness data...</p>
            </div>
          </div>
        ) : (
          <>
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
          </>
        )}
        </div>
      </PageContainer>
    </Layout>
  );
};

export default Home;
