
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
  onSubscribe: (programId: string, couponDiscountPercentage?: number) => void;
}

export const SubscriptionGrid: React.FC<SubscriptionGridProps> = ({
  programs,
  isIndiaUser,
  onSubscribe
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {programs.map((program) => (
        <SubscriptionCard
          key={program.id}
          program={program}
          isIndiaUser={isIndiaUser}
          onSubscribe={onSubscribe}
        />
      ))}
    </div>
  );
};
