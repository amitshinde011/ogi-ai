
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useProgramCompletion } from '@/hooks/useProgramCompletion';
import { AchievementBanner } from '@/components/AchievementBanner';
import { SubscriptionHeader } from '@/components/subscription/SubscriptionHeader';
import { SubscriptionGrid } from '@/components/subscription/SubscriptionGrid';
import { useSubscriptionData } from '@/hooks/useSubscriptionData';
import { useSubscriptionActions } from '@/hooks/useSubscriptionActions';

const Subscriptions = () => {
  const location = useLocation();
  const { completedSubscription } = useProgramCompletion();
  const { programs, loading } = useSubscriptionData();
  const { handleSubscribe, isIndiaUser, userLocation } = useSubscriptionActions(programs);
  const [showAchievementBanner, setShowAchievementBanner] = useState(false);

  // Check if user arrived here after completing a program
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const completed = urlParams.get('completed');
    if (completed === 'true' && completedSubscription) {
      setShowAchievementBanner(true);
    }
  }, [location.search, completedSubscription]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-peaceful flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sage"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-peaceful p-4">
      <div className="max-w-6xl mx-auto">
        {/* Achievement Banner */}
        {showAchievementBanner && completedSubscription && (
          <AchievementBanner
            completedSubscription={completedSubscription}
            onClose={() => setShowAchievementBanner(false)}
          />
        )}

        <SubscriptionHeader
          showAchievementBanner={showAchievementBanner}
          isIndiaUser={isIndiaUser}
          userLocation={userLocation}
        />

        <SubscriptionGrid
          programs={programs}
          isIndiaUser={isIndiaUser}
          onSubscribe={handleSubscribe}
        />
      </div>
    </div>
  );
};

export default Subscriptions;
