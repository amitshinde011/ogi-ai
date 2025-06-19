
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { calculatePricing, formatCurrency, PricingCalculation } from '@/utils/pricingUtils';

interface PricingBreakdownProps {
  originalPrice: number;
  currency: string;
  discountPercentage: number;
  taxPercentage: number;
  isSpecialOccasion: boolean;
  occasionName?: string;
}

export const PricingBreakdown: React.FC<PricingBreakdownProps> = ({
  originalPrice,
  currency,
  discountPercentage,
  taxPercentage,
  isSpecialOccasion,
  occasionName
}) => {
  const pricing: PricingCalculation = calculatePricing(originalPrice, discountPercentage, taxPercentage);

  return (
    <div className="space-y-3">
      {isSpecialOccasion && (
        <Badge className="bg-red-100 text-red-800 hover:bg-red-200">
          🎉 {occasionName} - {discountPercentage}% OFF!
        </Badge>
      )}
      
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Original Price:</span>
          <span className={`${discountPercentage > 0 ? 'line-through text-gray-500' : 'font-semibold'}`}>
            {formatCurrency(pricing.originalPrice, currency)}
          </span>
        </div>

        {discountPercentage > 0 && (
          <>
            <div className="flex justify-between items-center text-green-600">
              <span className="text-sm">Discount ({discountPercentage}%):</span>
              <span className="text-sm">-{formatCurrency(pricing.discountAmount, currency)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">After Discount:</span>
              <span className="font-semibold">{formatCurrency(pricing.discountedPrice, currency)}</span>
            </div>
          </>
        )}

        {taxPercentage > 0 && (
          <div className="flex justify-between items-center text-gray-600">
            <span className="text-sm">Tax ({taxPercentage}%):</span>
            <span className="text-sm">+{formatCurrency(pricing.taxAmount, currency)}</span>
          </div>
        )}

        <hr className="my-2" />
        
        <div className="flex justify-between items-center">
          <span className="font-semibold text-lg">Total:</span>
          <span className="font-bold text-xl text-primary">
            {formatCurrency(pricing.finalPrice, currency)}
          </span>
        </div>
      </div>
    </div>
  );
};
