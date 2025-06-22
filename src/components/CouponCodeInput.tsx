
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Tag, Loader2 } from 'lucide-react';

interface CouponCodeInputProps {
  onApplyCoupon: (code: string) => Promise<boolean>;
  appliedCoupon: any;
  onRemoveCoupon: () => void;
  isValidating: boolean;
}

export const CouponCodeInput: React.FC<CouponCodeInputProps> = ({
  onApplyCoupon,
  appliedCoupon,
  onRemoveCoupon,
  isValidating
}) => {
  const [couponCode, setCouponCode] = useState('');

  const handleApply = async () => {
    const success = await onApplyCoupon(couponCode);
    if (success) {
      setCouponCode('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleApply();
    }
  };

  if (appliedCoupon) {
    return (
      <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center space-x-2">
          <Tag className="w-4 h-4 text-green-600" />
          <span className="text-sm font-medium text-green-800">
            Coupon "{appliedCoupon.code}" applied
          </span>
          <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
            {appliedCoupon.discount_percentage}% OFF
          </Badge>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onRemoveCoupon}
          className="text-green-600 hover:text-green-800 hover:bg-green-100"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">
        Have a coupon code?
      </label>
      <div className="flex space-x-2">
        <Input
          type="text"
          placeholder="Enter coupon code"
          value={couponCode}
          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
          onKeyPress={handleKeyPress}
          className="flex-1"
        />
        <Button
          onClick={handleApply}
          disabled={!couponCode.trim() || isValidating}
          variant="outline"
        >
          {isValidating ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            'Apply'
          )}
        </Button>
      </div>
    </div>
  );
};
