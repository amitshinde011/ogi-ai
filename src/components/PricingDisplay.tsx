
import React from 'react';

interface PricingDisplayProps {
  isIndiaUser: boolean;
  userLocation: string;
}

export const PricingDisplay: React.FC<PricingDisplayProps> = ({
  isIndiaUser,
  userLocation
}) => {
  if (!userLocation) {
    return (
      <p className="text-sm text-gray-600 mt-2">
        Detecting location...
      </p>
    );
  }

  return (
    <div className="text-center mt-2">
      <p className="text-sm text-gray-600">
        Pricing for: {userLocation}
      </p>
      <p className="text-sm font-medium text-primary">
        Currency: {isIndiaUser ? 'INR (₹)' : 'USD ($)'}
      </p>
      <p className="text-xs text-gray-500">
        Payment via: {isIndiaUser ? 'Razorpay' : 'Braintree'}
      </p>
    </div>
  );
};
