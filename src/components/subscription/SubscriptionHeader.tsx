
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
    <div className="text-center mb-12 max-w-4xl mx-auto px-4">
      <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
        {showAchievementBanner ? "Choose Your Next Journey" : "Choose Your Transformation Journey"}
      </h1>
      <p className="text-xl text-gray-600 mb-6 leading-relaxed">
        Select the program that best fits your wellness goals and start your personalized transformation
      </p>
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 inline-block">
        <PricingDisplay isIndiaUser={isIndiaUser} userLocation={userLocation} />
      </div>
    </div>
  );
};
