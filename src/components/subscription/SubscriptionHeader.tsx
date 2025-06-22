
import React from 'react';
import { PricingDisplay } from '@/components/PricingDisplay';

interface SubscriptionHeaderProps {
  showAchievementBanner: boolean;
  isIndiaUser: boolean;
  userLocation: string;
}

export const SubscriptionHeader: React.FC<SubscriptionHeaderProps> = ({
  showAchievementBanner,
  isIndiaUser,
  userLocation
}) => {
  return (
    <div className="text-center mb-8">
      <h1 className="text-3xl font-bold text-primary mb-2">
        {showAchievementBanner ? "Choose Your Next Journey" : "Choose Your Transformation Journey"}
      </h1>
      <p className="text-black">Select the program that best fits your wellness goals</p>
      <PricingDisplay isIndiaUser={isIndiaUser} userLocation={userLocation} />
    </div>
  );
};
