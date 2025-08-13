
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useProgramCompletion } from '@/hooks/useProgramCompletion';
import { AchievementBanner } from '@/components/AchievementBanner';
import { SubscriptionHeader } from '@/components/subscription/SubscriptionHeader';
import { SubscriptionGrid } from '@/components/subscription/SubscriptionGrid';
import { GroupDiscountCalculator } from '@/components/conversion/GroupDiscountCalculator';
import { useSubscriptionData } from '@/hooks/useSubscriptionData';
import { useSubscriptionActions } from '@/hooks/useSubscriptionActions';
import { useIOSSubscriptions } from '@/hooks/useIOSSubscriptions';
import Loader from '@/components/ui/loader';
import Header from '@/components/Header';
import { LongerAccessNote } from '@/components/subscription/LongerAccessNote';

const Subscriptions = () => {
  const location = useLocation();
  const { completedSubscription } = useProgramCompletion();
  const { programs, loading } = useSubscriptionData();
  const { handleSubscribe, isIndiaUser, userLocation } = useSubscriptionActions(programs);
  const { isIOSNative, purchaseIOS, restorePurchases } = useIOSSubscriptions(programs);
  const [showAchievementBanner, setShowAchievementBanner] = useState(false);

  const onSubscribe = async (programId: string, couponDiscountPercentage?: number, finalPrice?: number) => {
    const result = await purchaseIOS(programId);
    if (result && 'usedIOS' in result && result.usedIOS) {
      // When iOS flow is enabled, stop here (either success or handled error)
      return;
    }
    // Fallback to existing web/Android payment flow
    return handleSubscribe(programId, couponDiscountPercentage, finalPrice);
  };

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
          isIOSNative={isIOSNative}
          onRestore={restorePurchases}
        />

        <LongerAccessNote />

        <SubscriptionGrid
          programs={programs}
          isIndiaUser={isIndiaUser}
          onSubscribe={onSubscribe}
        />
        
      </div>
    </div>
  );
};

export default Subscriptions;
