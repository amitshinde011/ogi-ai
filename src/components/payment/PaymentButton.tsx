
import React from 'react';
import { Button } from '@/components/ui/button';
import Loader from '@/components/ui/loader';
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
          <Loader size="sm" className="border-white border-t-transparent mr-2" />
          Processing...
        </>
      ) : (
        <>
          <CreditCard size={18} strokeWidth={1.5} className="mr-2" />
          Pay via Razorpay {currencySymbol}{displayPrice}
        </>
      )}
    </Button>
  );
};
