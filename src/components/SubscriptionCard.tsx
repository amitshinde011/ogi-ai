
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Star } from 'lucide-react';
import { PricingBreakdown } from '@/components/subscription/PricingBreakdown';
import { CouponCodeInput } from '@/components/CouponCodeInput';
import { usePricingConfig } from '@/hooks/usePricingConfig';
import { useCouponCode } from '@/hooks/useCouponCode';
import { calculatePricing } from '@/utils/pricingUtils';

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

interface SubscriptionCardProps {
  program: Program;
  isIndiaUser: boolean;
  onSubscribe: (programId: string, couponDiscountPercentage?: number, finalPrice?: number) => void;
}

export const SubscriptionCard: React.FC<SubscriptionCardProps> = ({
  program,
  isIndiaUser,
  onSubscribe
}) => {
  const pricingConfig = usePricingConfig();
  const { 
    appliedCoupon, 
    isValidating, 
    validateCoupon, 
    removeCoupon, 
    getDiscountPercentage 
  } = useCouponCode();

  const getDisplayPrice = () => {
    if (isIndiaUser && program.price_inr) {
      return program.price_inr;
    }
    return program.price;
  };

  const getCurrency = () => {
    return isIndiaUser ? 'INR' : 'USD';
  };

  const getCurrencySymbol = () => {
    return isIndiaUser ? '₹' : '$';
  };

  const isPopular = program.duration_days === 49;
  const couponDiscountPercentage = getDiscountPercentage();
  const isFree = couponDiscountPercentage === 100;

  // Calculate the final price including all discounts and taxes
  const originalPrice = getDisplayPrice();
  const pricing = calculatePricing(
    originalPrice,
    pricingConfig.discountPercentage,
    pricingConfig.taxPercentage,
    couponDiscountPercentage
  );

  const handleSubscribe = () => {
    onSubscribe(program.id, couponDiscountPercentage, pricing.finalPrice);
  };

  const currency = getCurrency();
  const currencySymbol = getCurrencySymbol();

  return (
    <Card className={`relative h-full flex flex-col bg-white border-2 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 w-full ${
      isPopular ? 'border-yellow-400 shadow-lg' : 'border-gray-200'
    }`}>
      {isPopular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
          <Badge className="bg-yellow-400 text-yellow-900 px-2 sm:px-4 py-1 rounded-full font-semibold flex items-center gap-1 text-xs sm:text-sm">
            <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-current" />
            Most Popular
            <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-current" />
          </Badge>
        </div>
      )}

      <CardHeader className="text-center pb-3 sm:pb-4 pt-6 sm:pt-8">
        <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
          {program.name}
        </h3>
        
          <div className="space-y-2">
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
                {currencySymbol}{originalPrice}
              </span>
              <span className="text-xs sm:text-sm text-gray-500">
                /<span className="font-semibold">{program.duration_days} days</span>
              </span>
            </div>
            
            <p className="text-gray-600 text-xs sm:text-sm px-2 sm:px-4 leading-relaxed">
              {program.description}
            </p>
            
            <div className="text-xs text-gray-400 bg-gray-50 px-2 sm:px-3 py-1 rounded-full inline-block">
              Payment via <span className="font-medium">{isIndiaUser ? 'Razorpay' : 'Braintree'}</span>
            </div>
          </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col space-y-4 sm:space-y-6 px-4 sm:px-6 pb-4 sm:pb-6">
        {/* Coupon Code Section */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
          <CouponCodeInput
            onApplyCoupon={validateCoupon}
            appliedCoupon={appliedCoupon}
            onRemoveCoupon={removeCoupon}
            isValidating={isValidating}
          />
        </div>

        {/* Pricing Breakdown */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 sm:p-4">
          <PricingBreakdown
            originalPrice={originalPrice}
            currency={currency}
            discountPercentage={pricingConfig.discountPercentage}
            taxPercentage={pricingConfig.taxPercentage}
            isSpecialOccasion={pricingConfig.isSpecialOccasion}
            occasionName={pricingConfig.occasionName}
            couponDiscountPercentage={couponDiscountPercentage}
          />
        </div>

        {/* What's Included */}
        <div className="space-y-3 sm:space-y-4">
          <div>
            <h4 className="font-semibold text-gray-900 mb-2 sm:mb-3 flex items-center text-sm sm:text-base">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              What's Included
            </h4>
            <div className="space-y-1 sm:space-y-2">
              {program.features.map((feature, index) => {
                // Highlight important words in features
                const highlightedFeature = feature
                  .replace(/(\d+[\s-]*(?:Day|Days|Minute|Minutes|Hour|Hours))/gi, '<strong>$1</strong>')
                  .replace(/(Daily|Morning|Evening|Weekly|Monthly|Guided|Personal|Complete|Ultimate|Premium|Advanced|Basic|Fundamental)/gi, '<strong>$1</strong>')
                  .replace(/(Yoga|Meditation|Diet|Recipes|Routine|Plan|Tracker|Community)/gi, '<strong>$1</strong>');
                
                return (
                  <div key={index} className="flex items-start text-xs sm:text-sm text-gray-700">
                    <Check className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span dangerouslySetInnerHTML={{ __html: highlightedFeature }} />
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-2 sm:mb-3 flex items-center text-sm sm:text-base">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
              Benefits You'll Get
            </h4>
            <div className="space-y-1 sm:space-y-2">
              {program.benefits.map((benefit, index) => {
                // Highlight important words in benefits
                const highlightedBenefit = benefit
                  .replace(/(Mental|Physical|Emotional|Spiritual|Health|Wellness|Energy|Strength|Flexibility|Balance|Focus|Clarity|Peace|Calm|Confidence|Vitality|Recovery)/gi, '<strong>$1</strong>')
                  .replace(/(Improved|Enhanced|Increased|Reduced|Better|Optimal|Maximum|Complete|Total|Deep|Profound|Significant)/gi, '<strong>$1</strong>')
                  .replace(/(\d+%|\d+x|dramatically|significantly|substantially)/gi, '<strong>$1</strong>');
                
                return (
                  <div key={index} className="flex items-start text-xs sm:text-sm text-gray-700">
                    <Check className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span dangerouslySetInnerHTML={{ __html: highlightedBenefit }} />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <div className="mt-auto pt-4 sm:pt-6">
          <Button 
            className={`w-full h-10 sm:h-12 text-sm sm:text-base md:text-lg font-semibold rounded-lg transition-all duration-200 text-white ${
              isPopular 
                ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 shadow-lg hover:shadow-xl' 
                : 'bg-gray-900 hover:bg-gray-800'
            }`}
            style={{ color: 'white !important' }}
            onClick={handleSubscribe}
          >
            <span className="truncate text-white">
              {isFree ? '🎉 Get Free Access' : `Pay ${currencySymbol}${Math.round(pricing.finalPrice)}`}
            </span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
