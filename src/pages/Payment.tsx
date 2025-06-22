
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { usePayment } from '@/hooks/usePayment';
import { ProgramDetailsCard } from '@/components/payment/ProgramDetailsCard';
import { LocationGatewayInfo } from '@/components/payment/LocationGatewayInfo';
import { PaymentButton } from '@/components/payment/PaymentButton';
import { PricingBreakdown } from '@/components/subscription/PricingBreakdown';
import { createPaymentSession, handleBraintreePayment, handleRazorpayPayment } from '@/utils/paymentGateway';

const Payment = () => {
  const navigate = useNavigate();
  const {
    loading,
    setLoading,
    program,
    pricing,
    gateway,
    userLocation,
    isIndiaUser,
    trackButtonClick,
    trackEvent,
    toast,
    verifyPayment
  } = usePayment();

  const createPaymentSessionHandler = async () => {
    if (!program || !pricing) return;

    trackButtonClick('Pay Now', 'Payment Page');
    setLoading(true);
    
    try {
      // Check if this is a free subscription (100% discount)
      if (pricing.finalPrice <= 0.01) {
        toast({
          title: "Free Access",
          description: "This appears to be a free subscription. Redirecting you back to complete the process.",
        });
        navigate('/subscriptions');
        return;
      }

      // Use final price including tax and discount
      const sessionData = await createPaymentSession({
        ...program,
        displayPrice: pricing.finalPrice
      }, gateway);

      if (gateway === 'braintree') {
        trackEvent('payment_initiated', 'Payment', 'Braintree');
        await handleBraintreePayment(sessionData, verifyPayment);
      } else {
        trackEvent('payment_initiated', 'Payment', 'Razorpay');
        await handleRazorpayPayment(sessionData, {
          ...program,
          finalPrice: pricing.finalPrice
        }, verifyPayment);
      }
    } catch (error) {
      console.error('Payment session creation error:', error);
      
      if (error.message === 'FREE_SUBSCRIPTION') {
        toast({
          title: "Free Subscription Detected",
          description: "This subscription is free. Please go back and complete the free subscription process.",
        });
        navigate('/subscriptions');
        return;
      }
      
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

  if (!program || !pricing) {
    return (
      <div className="min-h-screen bg-gradient-peaceful flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sage"></div>
      </div>
    );
  }

  const currencySymbol = program.currency === 'INR' ? '₹' : '$';

  // If final price is 0 or very close to 0, show a message and redirect
  if (pricing.finalPrice <= 0.01) {
    return (
      <div className="min-h-screen bg-gradient-peaceful p-4">
        <div className="max-w-2xl mx-auto">
          <Card className="bg-white">
            <CardContent className="p-6 text-center">
              <h2 className="text-2xl font-bold mb-4">Free Subscription Detected</h2>
              <p className="mb-6">This subscription is completely free with your coupon. No payment is required.</p>
              <Button onClick={() => navigate('/subscriptions')}>
                Go Back to Complete Free Subscription
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

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

            {/* Pricing Breakdown */}
            <Card className="bg-gray-50">
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-3">Pricing Details</h3>
                <PricingBreakdown
                  originalPrice={pricing.originalPrice}
                  currency={program.currency}
                  discountPercentage={pricing.discountPercentage}
                  taxPercentage={pricing.taxPercentage}
                  isSpecialOccasion={pricing.isSpecialOccasion}
                  occasionName={pricing.occasionName}
                  couponDiscountPercentage={pricing.couponDiscountPercentage || 0}
                />
              </CardContent>
            </Card>

            <LocationGatewayInfo 
              userLocation={userLocation} 
              gateway={gateway} 
            />

            <PaymentButton
              onClick={createPaymentSessionHandler}
              loading={loading}
              currencySymbol={currencySymbol}
              displayPrice={pricing.finalPrice}
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
