
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Star } from 'lucide-react';
import { PricingBreakdown } from '@/components/subscription/PricingBreakdown';
import { CouponCodeInput } from '@/components/CouponCodeInput';
import { usePricingConfig } from '@/hooks/usePricingConfig';
import { useCouponCode } from '@/hooks/useCouponCode';

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
  onSubscribe: (programId: string, couponDiscountPercentage?: number) => void;
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
  const isFree = getDiscountPercentage() === 100;

  const handleSubscribe = () => {
    onSubscribe(program.id, getDiscountPercentage());
  };

  const displayPrice = getDisplayPrice();
  const currency = getCurrency();
  const currencySymbol = getCurrencySymbol();

  return (
    <Card className={`relative h-full flex flex-col bg-white border-2 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
      isPopular ? 'border-yellow-400 shadow-lg' : 'border-gray-200'
    }`}>
      {isPopular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
          <Badge className="bg-yellow-400 text-yellow-900 px-4 py-1 rounded-full font-semibold flex items-center gap-1">
            <Star className="w-4 h-4 fill-current" />
            Most Popular
            <Star className="w-4 h-4 fill-current" />
          </Badge>
        </div>
      )}

      <CardHeader className="text-center pb-4 pt-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          {program.name}
        </h3>
        
        <div className="space-y-2">
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-4xl font-bold text-gray-900">
              {currencySymbol}{displayPrice}
            </span>
            <span className="text-sm text-gray-500">
              /{program.duration_days} days
            </span>
          </div>
          
          <p className="text-gray-600 text-sm px-4">
            {program.description}
          </p>
          
          <div className="text-xs text-gray-400 bg-gray-50 px-3 py-1 rounded-full inline-block">
            Payment via {isIndiaUser ? 'Razorpay' : 'Braintree'}
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col space-y-6 px-6 pb-6">
        {/* Coupon Code Section */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <CouponCodeInput
            onApplyCoupon={validateCoupon}
            appliedCoupon={appliedCoupon}
            onRemoveCoupon={removeCoupon}
            isValidating={isValidating}
          />
        </div>

        {/* Pricing Breakdown */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <PricingBreakdown
            originalPrice={displayPrice}
            currency={currency}
            discountPercentage={pricingConfig.discountPercentage}
            taxPercentage={pricingConfig.taxPercentage}
            isSpecialOccasion={pricingConfig.isSpecialOccasion}
            occasionName={pricingConfig.occasionName}
            couponDiscountPercentage={getDiscountPercentage()}
          />
        </div>

        {/* What's Included */}
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              What's Included
            </h4>
            <div className="space-y-2">
              {program.features.map((feature, index) => (
                <div key={index} className="flex items-start text-sm text-gray-700">
                  <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
              Benefits You'll Get
            </h4>
            <div className="space-y-2">
              {program.benefits.map((benefit, index) => (
                <div key={index} className="flex items-start text-sm text-gray-700">
                  <Check className="w-4 h-4 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <div className="mt-auto pt-6">
          <Button 
            className={`w-full h-12 text-lg font-semibold rounded-lg transition-all duration-200 ${
              isPopular 
                ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-yellow-900 shadow-lg hover:shadow-xl' 
                : 'bg-gray-900 hover:bg-gray-800 text-white'
            }`}
            onClick={handleSubscribe}
          >
            {isFree ? '🎉 Get Free Access' : `Start Your Journey - ${currencySymbol}${displayPrice}`}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
