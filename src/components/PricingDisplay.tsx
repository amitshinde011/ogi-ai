
import React from 'react';
import { MapPin, CreditCard } from 'lucide-react';

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
      <div className="flex items-center justify-center space-x-3 py-2">
        <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-gray-600 font-medium">Detecting your location...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center space-x-8">
        <div className="flex items-center space-x-2">
          <MapPin className="w-5 h-5 text-green-500" />
          <span className="text-gray-600">Pricing for:</span>
          <span className="font-semibold text-gray-900">{userLocation}</span>
        </div>
        
        <div className="w-px h-6 bg-gray-200"></div>
        
        <div className="flex items-center space-x-2">
          <CreditCard className="w-5 h-5 text-blue-500" />
          <span className="text-gray-600">Currency:</span>
          <span className="font-semibold text-blue-600">{isIndiaUser ? 'INR (₹)' : 'USD ($)'}</span>
        </div>
      </div>
      
      <div className="text-sm text-gray-500 bg-gray-50 px-4 py-2 rounded-lg">
        🔒 Secure payments via {isIndiaUser ? 'Razorpay' : 'Braintree'}
      </div>
    </div>
  );
};
