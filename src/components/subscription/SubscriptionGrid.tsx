import React from 'react';
import { SubscriptionCard } from '@/components/SubscriptionCard'; // Ensure this path is correct
import { PurchasesPackage } from '@revenuecat/purchases-capacitor';

// This Program interface should match the one in your Subscriptions.tsx page
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

// --- START: Updated Props ---
interface SubscriptionGridProps {
  programs: Program[];
  isIndiaUser: boolean;
  isIOSNative: boolean;
  getPackageForProgram: (program: Program) => PurchasesPackage | undefined;
  onSubscribe: (data: {
    programId: string;
    rcPackage?: PurchasesPackage;
    couponDiscountPercentage?: number;
    finalPrice?: number;
  }) => void;
}
// --- END: Updated Props ---

export const SubscriptionGrid: React.FC<SubscriptionGridProps> = ({
  programs,
  isIndiaUser,
  isIOSNative,
  getPackageForProgram,
  onSubscribe,
}) => {
  return (
    <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6 lg:gap-8 items-stretch">
          {programs.map((program) => {
            // Find the corresponding RevenueCat package for this program
            const rcPackage = isIOSNative ? getPackageForProgram(program) : undefined;
            return (
              <div key={program.id} className="flex w-full min-h-0">
                <SubscriptionCard
                  program={program}
                  isIndiaUser={isIndiaUser}
                  // --- START: Pass new props down ---
                  isIOSNative={isIOSNative}
                  rcPackage={rcPackage}
                  onSubscribe={onSubscribe}
                  // --- END: Pass new props down ---
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};