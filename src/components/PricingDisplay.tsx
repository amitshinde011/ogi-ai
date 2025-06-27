
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
      <div className="flex items-center space-x-2">
        <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        <span className="text-sm text-gray-600">Detecting your location...</span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-center space-x-4 text-sm">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
          <span className="text-gray-600">Pricing for:</span>
          <span className="font-medium text-gray-800">{userLocation}</span>
        </div>
        
        <div className="w-px h-4 bg-gray-300"></div>
        
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
          <span className="text-gray-600">Currency:</span>
          <span className="font-medium text-primary">{isIndiaUser ? 'INR (₹)' : 'USD ($)'}</span>
        </div>
      </div>
      
      <div className="text-xs text-gray-500">
        Secure payments via {isIndiaUser ? 'Razorpay' : 'Braintree'}
      </div>
    </div>
  );
};
