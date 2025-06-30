
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Shield } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useOnboarding } from '@/hooks/useOnboarding';
import { useAnalytics } from '@/hooks/useAnalytics';
import { ProgramDetailsCard } from '@/components/payment/ProgramDetailsCard';
import { LocationGatewayInfo } from '@/components/payment/LocationGatewayInfo';
import { PaymentButton } from '@/components/payment/PaymentButton';
import { CouponCodeInput } from '@/components/CouponCodeInput';
import { useCouponCode } from '@/hooks/useCouponCode';
import { Link } from 'react-router-dom';

const Payment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { updateOnboardingState } = useOnboarding();
  const { trackPayment, trackEvent } = useAnalytics();
  
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  const {
    appliedCoupon,
    isValidating,
    validateCoupon,
    removeCoupon,
    getDiscountPercentage
  } = useCouponCode();

  // Get data from location state
  const program = location.state?.program;
  const pricing = location.state?.pricing;
  const isIndiaUser = location.state?.isIndiaUser || false;
  const userLocation = location.state?.userLocation || '';

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (!authUser) {
          navigate('/login');
          return;
        }

        const { data: profile } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', authUser.id)
          .single();

        setUser({ ...authUser, profile });
      } catch (error) {
        console.error('Error fetching user:', error);
        toast({
          title: "Error",
          description: "Failed to load user information",
          variant: "destructive"
        });
        navigate('/login');
      }
    };

    fetchUser();
  }, [navigate, toast]);

  // Redirect if no program data
  useEffect(() => {
    if (!program || !pricing) {
      console.error('No program or pricing data found in location state');
      navigate('/subscriptions');
      return;
    }
  }, [program, pricing, navigate]);

  if (loading || !program || !pricing || !user) {
    return (
      <div className="min-h-screen bg-gradient-peaceful flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sage"></div>
      </div>
    );
  }

  const currencySymbol = isIndiaUser ? '₹' : '$';
  
  // Use the final price that was calculated and passed from the subscription page
  const finalPrice = Math.round(pricing.finalPrice || program.finalPrice || program.displayPrice);

  const handlePayment = async () => {
    if (!program) return;

    setLoading(true);
    try {
      // For demo purposes, simulate payment success
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Track payment with the actual final price
      trackPayment(program.name, finalPrice, program.currency, isIndiaUser ? 'razorpay' : 'braintree');

      // Update onboarding state
      await updateOnboardingState({ subscription_selected: true });

      // Create subscription
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(startDate.getDate() + program.duration_days);

      const { error: subscriptionError } = await supabase
        .from('user_subscriptions')
        .insert({
          user_id: user.id,
          program_id: program.id,
          start_date: startDate.toISOString().split('T')[0],
          end_date: endDate.toISOString().split('T')[0],
          status: 'active',
          payment_status: 'paid'
        });

      if (subscriptionError) {
        throw subscriptionError;
      }

      toast({
        title: "Payment Successful!",
        description: `You've successfully subscribed to ${program.name}`,
      });

      navigate('/intro-video');
    } catch (error) {
      console.error('Payment error:', error);
      trackEvent('payment_error', 'Payment', 'Payment Failed');
      toast({
        title: "Payment Failed",
        description: "Please try again or contact support.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-peaceful p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mr-4 p-2 hover:bg-white/20"
          >
            <ArrowLeft size={20} />
          </Button>
          <h1 className="text-2xl font-bold text-slate-900">Complete Payment</h1>
        </div>

        <div className="space-y-6">
          {/* Program Details */}
          <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">Program Details</CardTitle>
            </CardHeader>
            <CardContent>
              <ProgramDetailsCard program={program} currencySymbol={currencySymbol} />
            </CardContent>
          </Card>

          {/* Location and Gateway Info */}
          <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">Payment Information</CardTitle>
            </CardHeader>
            <CardContent>
              <LocationGatewayInfo 
                userLocation={userLocation} 
                gateway={isIndiaUser ? 'razorpay' : 'braintree'} 
              />
            </CardContent>
          </Card>

          {/* Coupon Code */}
          <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">Coupon Code</CardTitle>
            </CardHeader>
            <CardContent>
              <CouponCodeInput
                onApplyCoupon={validateCoupon}
                appliedCoupon={appliedCoupon}
                onRemoveCoupon={removeCoupon}
                isValidating={isValidating}
              />
            </CardContent>
          </Card>

          {/* Pricing Summary */}
          <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">Payment Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Base Price</span>
                  <span>{currencySymbol}{program.displayPrice}</span>
                </div>
                {pricing.discountPercentage > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount ({pricing.discountPercentage}%)</span>
                    <span>-{currencySymbol}{Math.round((program.displayPrice * pricing.discountPercentage) / 100)}</span>
                  </div>
                )}
                {pricing.couponDiscountPercentage > 0 && (
                  <div className="flex justify-between text-blue-600">
                    <span>Coupon Discount ({pricing.couponDiscountPercentage}%)</span>
                    <span>-{currencySymbol}{Math.round((program.displayPrice * pricing.couponDiscountPercentage) / 100)}</span>
                  </div>
                )}
                {pricing.taxPercentage > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>Tax ({pricing.taxPercentage}%)</span>
                    <span>+{currencySymbol}{Math.round((program.displayPrice * pricing.taxPercentage) / 100)}</span>
                  </div>
                )}
                <div className="border-t pt-3 flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>{currencySymbol}{finalPrice}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Button */}
          <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <PaymentButton
                onClick={handlePayment}
                loading={loading}
                currencySymbol={currencySymbol}
                displayPrice={finalPrice}
              />
              
              {/* Legal Notice */}
              <div className="mt-4 text-center text-xs text-slate-600 space-y-2">
                <p>
                  By completing your payment, you agree to our{' '}
                  <Link to="/terms-and-conditions" className="text-sage hover:underline">
                    Terms & Conditions
                  </Link>
                  {' '}and{' '}
                  <Link to="/privacy-policy" className="text-sage hover:underline">
                    Privacy Policy
                  </Link>
                </p>
                <p>
                  Your data is protected and payment information is secure. View our{' '}
                  <Link to="/cancellations-refunds" className="text-sage hover:underline">
                    Cancellation & Refund Policy
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Security Notice */}
          <div className="flex items-center justify-center gap-2 text-sm text-slate-600">
            <Shield size={16} />
            <span>Payments are processed securely</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
