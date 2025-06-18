
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { usePayment } from '@/hooks/usePayment';
import { ProgramDetailsCard } from '@/components/payment/ProgramDetailsCard';
import { LocationGatewayInfo } from '@/components/payment/LocationGatewayInfo';
import { PaymentButton } from '@/components/payment/PaymentButton';
import { createPaymentSession, handleBraintreePayment, handleRazorpayPayment } from '@/utils/paymentGateway';

const Payment = () => {
  const navigate = useNavigate();
  const {
    loading,
    setLoading,
    program,
    gateway,
    userLocation,
    isIndiaUser,
    trackButtonClick,
    trackEvent,
    toast,
    verifyPayment
  } = usePayment();

  const createPaymentSessionHandler = async () => {
    if (!program) return;

    trackButtonClick('Pay Now', 'Payment Page');
    setLoading(true);
    
    try {
      const sessionData = await createPaymentSession(program, gateway);

      if (gateway === 'braintree') {
        trackEvent('payment_initiated', 'Payment', 'Braintree');
        await handleBraintreePayment(sessionData, verifyPayment);
      } else {
        trackEvent('payment_initiated', 'Payment', 'Razorpay');
        await handleRazorpayPayment(sessionData, program, verifyPayment);
      }
    } catch (error) {
      console.error('Payment session creation error:', error);
      trackEvent('payment_error', 'Payment', 'Session Creation Failed');
      toast({
        title: "Payment Error",
        description: "Failed to initialize payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!program) {
    return (
      <div className="min-h-screen bg-gradient-peaceful flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sage"></div>
      </div>
    );
  }

  const currencySymbol = program.currency === 'INR' ? '₹' : '$';

  return (
    <div className="min-h-screen bg-gradient-peaceful p-4">
      <div className="max-w-2xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => {
            trackButtonClick('Back to Subscriptions', 'Payment Page');
            navigate('/subscriptions');
          }}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Subscriptions
        </Button>

        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Complete Your Payment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <ProgramDetailsCard 
              program={program} 
              currencySymbol={currencySymbol} 
            />

            <LocationGatewayInfo 
              userLocation={userLocation} 
              gateway={gateway} 
            />

            <PaymentButton
              onClick={createPaymentSessionHandler}
              loading={loading}
              currencySymbol={currencySymbol}
              displayPrice={program.displayPrice}
            />

            <p className="text-sm text-gray-500 text-center">
              Your payment is secured and encrypted. You will be redirected after successful payment.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Payment;
