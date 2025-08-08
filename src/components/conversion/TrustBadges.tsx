import React from 'react';
import { Shield, Award, Verified, Lock, Star } from 'lucide-react';

export const TrustBadges: React.FC = () => {
  return (
    <div className="flex flex-wrap justify-center items-center gap-4 py-6">
      <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-4 py-2">
        <Shield className="w-5 h-5 text-green-600" />
        <span className="text-sm font-medium text-green-800">7-Day Money Back</span>
      </div>
      
      <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
        <Lock className="w-5 h-5 text-blue-600" />
        <span className="text-sm font-medium text-blue-800">Secure Payments</span>
      </div>
      
      <div className="flex items-center gap-2 bg-purple-50 border border-purple-200 rounded-lg px-4 py-2">
        <Verified className="w-5 h-5 text-purple-600" />
        <span className="text-sm font-medium text-purple-800">Certified Experts</span>
      </div>
      
      <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-2">
        <Star className="w-5 h-5 text-yellow-600 fill-current" />
        <span className="text-sm font-medium text-yellow-800">4.8/5 Rating</span>
      </div>
    </div>
  );
};