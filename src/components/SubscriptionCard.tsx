
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';
import { PricingBreakdown } from '@/components/subscription/PricingBreakdown';
import { usePricingConfig } from '@/hooks/usePricingConfig';

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
  onSubscribe: (programId: string) => void;
}

export const SubscriptionCard: React.FC<SubscriptionCardProps> = ({
  program,
  isIndiaUser,
  onSubscribe
}) => {
  const pricingConfig = usePricingConfig();

  const getDisplayPrice = () => {
    return isIndiaUser && program.price_inr ? program.price_inr : program.price;
  };

  const getCurrency = () => {
    return isIndiaUser ? 'INR' : 'USD';
  };

  const isPopular = program.duration_days === 49;

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
          <span className="text-black">/{program.duration_days} days</span>
        </div>
        <p className="text-sm text-black text-center">{program.description}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Pricing Breakdown */}
        <PricingBreakdown
          originalPrice={getDisplayPrice()}
          currency={getCurrency()}
          discountPercentage={pricingConfig.discountPercentage}
          taxPercentage={pricingConfig.taxPercentage}
          isSpecialOccasion={pricingConfig.isSpecialOccasion}
          occasionName={pricingConfig.occasionName}
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
          onClick={() => onSubscribe(program.id)}
          variant={isPopular ? "default" : "secondary"}
        >
          Subscribe & Pay
        </Button>
      </CardContent>
    </Card>
  );
};
