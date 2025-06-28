
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
    <div className="text-center mb-16 max-w-4xl mx-auto px-4">
      <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
        {showAchievementBanner ? "Choose Your Next Journey" : "Transform Your Life"}
      </h1>
      <p className="text-xl text-gray-600 mb-8 leading-relaxed max-w-2xl mx-auto">
        Select the program that best fits your wellness goals and start your personalized transformation journey today
      </p>
      
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 inline-block">
        <PricingDisplay isIndiaUser={isIndiaUser} userLocation={userLocation} />
      </div>
    </div>
  );
};
