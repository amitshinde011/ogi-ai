
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useProgramCompletion } from '@/hooks/useProgramCompletion';
import { AchievementBanner } from '@/components/AchievementBanner';
import { SubscriptionHeader } from '@/components/subscription/SubscriptionHeader';
import { SubscriptionGrid } from '@/components/subscription/SubscriptionGrid';
import { GroupDiscountCalculator } from '@/components/conversion/GroupDiscountCalculator';
import { useSubscriptionData } from '@/hooks/useSubscriptionData';
import { useSubscriptionActions } from '@/hooks/useSubscriptionActions';
import Loader from '@/components/ui/loader';
import Header from '@/components/Header';

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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center px-4">
        <div className="text-center space-y-4">
          <Loader size="lg" className="mx-auto" />
          <p className="text-gray-600 font-medium">Loading your wellness programs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <Header title="Subscriptions" showBack={true} />
      <div className="container mx-auto py-6 sm:py-8 md:py-12 px-4 sm:px-6 lg:px-8">
        {/* Achievement Banner */}
        {showAchievementBanner && completedSubscription && (
          <div className="mb-8 sm:mb-12">
            <AchievementBanner
              completedSubscription={completedSubscription}
              onClose={() => setShowAchievementBanner(false)}
            />
          </div>
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

        {/* Group Discount Section */}
        {programs.length > 0 && (
          <div className="mt-12 max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-foreground mb-4">
                🎯 Get Friends & Save More!
              </h3>
              <p className="text-muted-foreground">
                Start a group purchase and unlock progressive discounts based on group size.
              </p>
            </div>
            <GroupDiscountCalculator
              basePrice={isIndiaUser ? programs[0]?.price_inr || 0 : programs[0]?.price || 0}
              currency={isIndiaUser ? 'INR' : 'USD'}
              onStartGroup={() => alert('Group purchase feature coming soon! Contact support to arrange group discounts.')}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Subscriptions;
