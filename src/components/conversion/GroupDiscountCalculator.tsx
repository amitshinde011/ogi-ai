import React, { useState } from 'react';
import { Users, Calculator, ArrowRight, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GroupPurchaseModal } from '@/components/group/GroupPurchaseModal';

interface GroupDiscountCalculatorProps {
  basePrice: number;
  currency: string;
  program?: {
    id: string;
    name: string;
    price: number;
    price_inr: number;
    duration_days: number;
  };
  isIndiaUser?: boolean;
  onStartGroup?: () => void;
}

const getGroupDiscount = (size: number): number => {
  if (size >= 6) return 50;
  if (size >= 5) return 45;
  if (size >= 4) return 40;
  if (size >= 3) return 35;
  if (size >= 2) return 30;
  return 0;
};

export const GroupDiscountCalculator: React.FC<GroupDiscountCalculatorProps> = ({
  basePrice,
  currency,
  program,
  isIndiaUser = false,
  onStartGroup
}) => {
  const [selectedSize, setSelectedSize] = useState(2);
  const [showModal, setShowModal] = useState(false);

  const discount = getGroupDiscount(selectedSize);
  const discountedPrice = basePrice * (1 - discount / 100);
  const savings = basePrice - discountedPrice;
  const symbol = currency === 'INR' ? '₹' : '$';

  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-purple/5">
      <CardContent className="p-6">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Users className="w-6 h-6 text-primary" />
            <h3 className="text-xl font-bold text-foreground">Get Friends & Save More!</h3>
          </div>
          <p className="text-muted-foreground">The more friends you bring, the bigger your discount!</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Number of Friends (including you):
            </label>
            <div className="flex gap-2 flex-wrap">
              {[2, 3, 4, 5, 6].map((size) => (
                <Button
                  key={size}
                  variant={selectedSize === size ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedSize(size)}
                  className="flex-1 min-w-0"
                >
                  {size === 6 ? '6+' : size}
                </Button>
              ))}
            </div>
          </div>

          <div className="bg-card rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Group Size:</span>
              <span className="font-semibold">{selectedSize === 6 ? '6+' : selectedSize} people</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Discount:</span>
              <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                {discount}% OFF
              </Badge>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Original Price:</span>
              <span className="line-through text-muted-foreground">
                {symbol}{basePrice.toFixed(2)}
              </span>
            </div>
            
            <div className="flex justify-between items-center text-lg font-bold">
              <span>Your Price:</span>
              <span className="text-primary">
                {symbol}{discountedPrice.toFixed(2)}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">You Save:</span>
              <span className="font-semibold text-green-600">
                {symbol}{savings.toFixed(2)}
              </span>
            </div>
          </div>

          <Button 
            onClick={() => program ? setShowModal(true) : onStartGroup?.()}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            size="lg"
          >
            <Gift className="w-5 h-5 mr-2" />
            Start Group Purchase
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          
          <p className="text-xs text-center text-muted-foreground">
            Share a unique link with friends and everyone pays the discounted price once your group is complete!
          </p>
        </div>

        {program && (
          <GroupPurchaseModal
            open={showModal}
            onClose={() => setShowModal(false)}
            program={program}
            isIndiaUser={isIndiaUser}
          />
        )}
      </CardContent>
    </Card>
  );
};