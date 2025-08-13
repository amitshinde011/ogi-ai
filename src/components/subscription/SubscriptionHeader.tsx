

import React from 'react';
import { PricingDisplay } from '@/components/PricingDisplay';
import { Button } from '@/components/ui/button';

interface SubscriptionHeaderProps {
  showAchievementBanner: boolean;
  isIndiaUser: boolean;
  userLocation: string;
  isIOSNative?: boolean;
  onRestore?: () => void;
}

export const SubscriptionHeader: React.FC<SubscriptionHeaderProps> = ({
  showAchievementBanner,
  isIndiaUser,
  userLocation,
  isIOSNative,
  onRestore
}) => {
  return (
    <div className="text-center mb-8 sm:mb-12 lg:mb-16 mx-auto px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto space-y-4 sm:space-y-6">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
          {showAchievementBanner ? (
            <>Choose Your <span className="text-primary">Next Journey</span></>
          ) : (
            <>Transform Your <span className="text-primary">Life</span></>
          )}
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto px-4">
          Select the program that best fits your <span className="font-semibold text-gray-800">wellness goals</span> and start your personalized <span className="font-semibold text-gray-800">transformation journey</span> today
        </p>

        {/* iOS Restore Purchases */}
        {isIOSNative && (
          <div className="flex justify-center">
            <Button variant="outline" onClick={onRestore}>
              Restore Purchases
            </Button>
          </div>
        )}
        
        
      </div>
    </div>
  );
};
