
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';
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
      console.log('Using INR price:', program.price_inr);
      return program.price_inr;
    }
    console.log('Using USD price:', program.price);
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
    console.log('Subscribing with:', {
      programId: program.id,
      isIndiaUser,
      currency: getCurrency(),
      price: getDisplayPrice(),
      discountPercentage: getDiscountPercentage()
    });
    onSubscribe(program.id, getDiscountPercentage());
  };

  const displayPrice = getDisplayPrice();
  const currency = getCurrency();
  const currencySymbol = getCurrencySymbol();

  return (
    <Card className={`relative transition-all hover:shadow-lg bg-white text-black ${
      isPopular ? 'ring-2 ring-primary scale-105' : ''
    }`}>
      {isPopular && (
        <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-primary">
          Most Popular
        </Badge>
      )}
      <CardHeader>
        <CardTitle className="text-xl text-center text-black">{program.name}</CardTitle>
        <div className="text-center">
          <div className="text-2xl font-bold text-primary">
            {currencySymbol}{displayPrice}
          </div>
          <span className="text-black">/{program.duration_days} days</span>
          <div className="text-xs text-gray-500 mt-1">
            Payment via {isIndiaUser ? 'Razorpay' : 'Braintree'}
          </div>
        </div>
        <p className="text-sm text-black text-center">{program.description}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Coupon Code Input */}
        <CouponCodeInput
          onApplyCoupon={validateCoupon}
          appliedCoupon={appliedCoupon}
          onRemoveCoupon={removeCoupon}
          isValidating={isValidating}
        />

        {/* Pricing Breakdown */}
        <PricingBreakdown
          originalPrice={displayPrice}
          currency={currency}
          discountPercentage={pricingConfig.discountPercentage}
          taxPercentage={pricingConfig.taxPercentage}
          isSpecialOccasion={pricingConfig.isSpecialOccasion}
          occasionName={pricingConfig.occasionName}
          couponDiscountPercentage={getDiscountPercentage()}
        />

        <div>
          <h4 className="font-semibold mb-2 text-black">Features:</h4>
          <ul className="space-y-1">
            {program.features.map((feature, index) => (
              <li key={index} className="flex items-center text-sm text-black">
                <Check className="w-4 h-4 text-green-500 mr-2" />
                {feature}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-2 text-black">Benefits:</h4>
          <ul className="space-y-1">
            {program.benefits.map((benefit, index) => (
              <li key={index} className="flex items-center text-sm text-black">
                <Check className="w-4 h-4 text-green-500 mr-2" />
                {benefit}
              </li>
            ))}
          </ul>
        </div>
        <Button 
          className="w-full" 
          onClick={handleSubscribe}
          variant={isPopular ? "default" : "secondary"}
        >
          {isFree ? 'Get Free Access' : `Subscribe & Pay ${currencySymbol}${displayPrice}`}
        </Button>
      </CardContent>
    </Card>
  );
};
