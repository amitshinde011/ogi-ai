
import React from 'react';
import { MapPin, CreditCard } from 'lucide-react';
import Loader from '@/components/ui/loader';

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
        <Loader size="sm" />
        <span className="text-gray-600 font-medium text-sm sm:text-base">Detecting your location...</span>
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Mobile Layout - Stacked */}
      <div className="flex flex-col space-y-3 sm:hidden">
        <div className="flex items-center justify-center space-x-2">
          <MapPin className="w-4 h-4 text-green-500 flex-shrink-0" />
          <span className="text-gray-600 text-sm">Pricing for:</span>
          <span className="font-semibold text-gray-900 text-sm">{userLocation}</span>
        </div>
        
        <div className="flex items-center justify-center space-x-2">
          <CreditCard className="w-4 h-4 text-blue-500 flex-shrink-0" />
          <span className="text-gray-600 text-sm">Currency:</span>
          <span className="font-semibold text-blue-600 text-sm">{isIndiaUser ? 'INR (₹)' : 'USD ($)'}</span>
        </div>
      </div>

      {/* Desktop Layout - Side by Side */}
      <div className="hidden sm:flex items-center justify-center space-x-6 lg:space-x-8">
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
      
      <div className="text-xs sm:text-sm text-gray-500 bg-gray-50 px-3 sm:px-4 py-2 rounded-lg text-center">
        🔒 Secure payments via Razorpay
      </div>
    </div>
  );
};
