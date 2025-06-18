
import React from 'react';

interface PricingDisplayProps {
  isIndiaUser: boolean;
  userLocation: string;
}

export const PricingDisplay: React.FC<PricingDisplayProps> = ({
  isIndiaUser,
  userLocation
}) => {
  if (!userLocation) return null;

  return (
    <p className="text-sm text-gray-600 mt-2">
      Pricing for: {userLocation} ({isIndiaUser ? 'INR' : 'USD'})
    </p>
  );
};
