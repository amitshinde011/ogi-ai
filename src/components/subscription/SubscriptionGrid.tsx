
import React from 'react';
import { SubscriptionCard } from '@/components/SubscriptionCard';

interface Program {
  id: string;
  name: string;
  duration_days: number;
  price: number;
  price_inr: number;
  features: string[];
  benefits: string[];
  description: string;
}

interface SubscriptionGridProps {
  programs: Program[];
  isIndiaUser: boolean;
  onSubscribe: (programId: string, couponDiscountPercentage?: number, finalPrice?: number) => void;
}

export const SubscriptionGrid: React.FC<SubscriptionGridProps> = ({
  programs,
  isIndiaUser,
  onSubscribe
}) => {
  return (
    <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6 lg:gap-8 items-stretch">
          {programs.map((program) => (
            <div key={program.id} className="flex w-full min-h-0">
              <SubscriptionCard
                program={program}
                isIndiaUser={isIndiaUser}
                onSubscribe={onSubscribe}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
