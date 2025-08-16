import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useProgramCompletion } from '@/hooks/useProgramCompletion';
import { AchievementBanner } from '@/components/AchievementBanner';
import { SubscriptionHeader } from '@/components/subscription/SubscriptionHeader';
import { SubscriptionGrid } from '@/components/subscription/SubscriptionGrid';
import { useYogiSubscriptions, ProgramLike } from '@/hooks/useYogiSubscriptions';
import Loader from '@/components/ui/loader';
import Header from '@/components/Header';
import { LongerAccessNote } from '@/components/subscription/LongerAccessNote';
import { supabase } from '@/integrations/supabase/client';

interface Program extends ProgramLike {
  price: number;
  price_inr: number;
  features: string[];
  benefits: string[];
  description: string;
}

const Subscriptions = () => {
  const location = useLocation();
  const { completedSubscription } = useProgramCompletion();
  const [showAchievementBanner, setShowAchievementBanner] = useState(false);
  const [programsFromDB, setProgramsFromDB] = useState<Program[]>([]);
  const [isFetchingPrograms, setIsFetchingPrograms] = useState(true);

  useEffect(() => {
    const fetchPrograms = async () => {
      setIsFetchingPrograms(true);
      const { data, error } = await supabase
        .from('programs')
        .select('*')
        .order('duration_days', { ascending: true });

      if (error) {
        console.error('Error fetching programs:', error);
      } else {
        setProgramsFromDB(data as Program[]);
      }
      setIsFetchingPrograms(false);
    };
    fetchPrograms();
  }, []);

  const {
    isLoading: isIAPLoading,
    isIOSNative,
    isSubscribed,
    getPackageForProgram,
    purchaseProgram,
    restorePurchases,
  } = useYogiSubscriptions(programsFromDB);

  // --- START: CORRECTED onSubscribe LOGIC ---
  const onSubscribe = useCallback(async (data: { programId: string; rcPackage?: any; finalPrice?: number }) => {
    // On native iOS, rcPackage is required to proceed.
    if (isIOSNative) {
      if (data.rcPackage) {
        const programToBuy = programsFromDB.find(p => p.id === data.programId);
        if (programToBuy) {
          await purchaseProgram(programToBuy);
        } else {
          console.error("Could not find the program to buy:", data.programId);
        }
      } else {
        console.error("iOS purchase attempted without a RevenueCat package>>.");
      }
    } else {
      // This is the fallback for web/non-iOS platforms
      console.log('Initiating WEB payment for:', { programId: data.programId, finalPrice: data.finalPrice });
      // Your Stripe or other web payment logic would go here.
    }
  }, [isIOSNative, programsFromDB, purchaseProgram]);
  // --- END: CORRECTED onSubscribe LOGIC ---


  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const completed = urlParams.get('completed');
    if (completed === 'true' && completedSubscription) {
      setShowAchievementBanner(true);
    }
  }, [location.search, completedSubscription]);

  if (isIAPLoading || isFetchingPrograms) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center px-4">
        <div className="text-center space-y-4">
          <Loader size="lg" className="mx-auto" />
          <p className="text-gray-600 font-medium">Loading your wellness programs...</p>
        </div>
      </div>
    );
  }
  
  if (isSubscribed) {
     return (
       <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
         <Header title="Subscriptions" showBack={true} />
         <div className="container mx-auto py-20 text-center">
            <h1 className="text-2xl font-bold">You are already subscribed!</h1>
            <p className="text-gray-600 mt-2">Welcome to your premium wellness journey.</p>
         </div>
       </div>
     );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <Header title="Subscriptions" showBack={true} />
      <div className="container mx-auto py-6 sm:py-8 md:py-12 px-4 sm:px-6 lg:px-8">
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
          isIndiaUser={false} 
          userLocation={"Your Location"} 
          isIOSNative={isIOSNative}
          onRestore={restorePurchases}
        />

        <LongerAccessNote />

        <SubscriptionGrid
          programs={programsFromDB}
          isIndiaUser={false}
          isIOSNative={isIOSNative}
          getPackageForProgram={getPackageForProgram}
          onSubscribe={onSubscribe}
        />
      </div>
    </div>
  );
};

export default Subscriptions;