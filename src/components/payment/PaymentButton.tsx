
import React from 'react';
import { Button } from '@/components/ui/button';
import { CreditCard } from 'lucide-react';

interface PaymentButtonProps {
  onClick: () => void;
  loading: boolean;
  currencySymbol: string;
  displayPrice: number;
}

export const PaymentButton: React.FC<PaymentButtonProps> = ({
  onClick,
  loading,
  currencySymbol,
  displayPrice
}) => {
  return (
    <Button
      onClick={onClick}
      disabled={loading}
      className="w-full h-12 text-lg"
      size="lg"
    >
      {loading ? (
        <>
          <div className="w-4 h-4 mr-2 animate-spin rounded-full border-b-2 border-white" />
          Processing...
        </>
      ) : (
        <>
          <CreditCard size={18} strokeWidth={1.5} className="mr-2" />
          Pay {currencySymbol}{displayPrice}
        </>
      )}
    </Button>
  );
};
