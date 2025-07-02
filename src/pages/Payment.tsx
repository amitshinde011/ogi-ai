import React, { useState, useEffect } from 'react';
import { ArrowLeft, Shield, CreditCard } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useOnboarding } from '@/hooks/useOnboarding';
import { useAnalytics } from '@/hooks/useAnalytics';
import { CouponCodeInput } from '@/components/CouponCodeInput';
import { useCouponCode } from '@/hooks/useCouponCode';
import { Link } from 'react-router-dom';
import { createPaymentSession, handleBraintreePayment, handleRazorpayPayment } from '@/utils/paymentGateway';

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
  const finalPrice = Math.round(pricing.finalPrice || program.finalPrice || program.displayPrice);
  const gateway = 'razorpay'; // Always use Razorpay (supports both INR and USD via PayPal)
  const couponDiscountPercentage = getDiscountPercentage();

  const handlePaymentSuccess = async (orderId: string, transactionId: string) => {
    try {
      // Verify payment with backend
      const { error: verifyError } = await supabase.functions.invoke('process-payment', {
        body: {
          action: 'verify_payment',
          orderId,
          transactionId,
          gateway
        }
      });

      if (verifyError) {
        throw verifyError;
      }

      // Track payment success
      trackPayment(program.name, finalPrice, program.currency, gateway);

      // Update onboarding state - reset intro video for new subscription
      await updateOnboardingState({ 
        subscription_selected: true,
        intro_video_watched: false 
      });

      // Create subscription record
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
        console.error('Subscription creation error:', subscriptionError);
        // Don't throw here as payment was successful
      }

      toast({
        title: "Payment Successful!",
        description: `You've successfully subscribed to ${program.name}`,
      });

      navigate('/intro-video');
    } catch (error) {
      console.error('Payment verification error:', error);
      toast({
        title: "Payment Verification Failed",
        description: "Your payment was processed but there was an issue verifying it. Please contact support.",
        variant: "destructive",
      });
    }
  };

  const handlePayment = async () => {
    if (!program) return;

    setLoading(true);
    try {
      console.log('Starting payment process for:', {
        programId: program.id,
        finalPrice,
        gateway,
        currency: program.currency
      });

      // Check if this is a free subscription (100% discount)
      if (finalPrice <= 0.01) {
        // Handle free subscription directly
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

        await updateOnboardingState({ 
          subscription_selected: true,
          intro_video_watched: false 
        });
        
        toast({
          title: "Free Access Granted!",
          description: `You've successfully got free access to ${program.name}`,
        });

        navigate('/intro-video');
        return;
      }

      // Create payment session
      const sessionData = await createPaymentSession(program, gateway);
      
      console.log('Payment session created:', sessionData);

      // Always use Razorpay for all payments
      await handleRazorpayPayment(sessionData, program, handlePaymentSuccess);
    } catch (error) {
      console.error('Payment error:', error);
      
      if (error.message === 'FREE_SUBSCRIPTION') {
        // This shouldn't happen as we check above, but handle it gracefully
        toast({
          title: "Free Subscription",
          description: "This subscription is free. Processing directly...",
        });
        // Handle as free subscription
        return;
      }
      
      trackEvent('payment_error', 'Payment', 'Payment Failed');
      toast({
        title: "Payment Failed",
        description: error.message || "Please try again or contact support.",
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

        {/* Single Combined Card */}
        <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">Payment Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Program Details Section */}
            <div>
              <h3 className="font-semibold text-lg mb-3">Program Details</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-medium text-base">{program.name}</h4>
                    <p className="text-sm text-gray-600">Duration: {program.duration_days} days</p>
                  </div>
                  <span className="text-xl font-bold text-primary">
                    {currencySymbol}{program.displayPrice}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Information Section */}
            <div>
              <h3 className="font-semibold text-lg mb-3">Payment Information</h3>
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-600">Detected Location:</p>
                    <p className="font-medium">{userLocation || 'Detecting...'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Payment Method:</p>
                    <p className="font-medium capitalize">{gateway}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Coupon Code Section */}
            <div>
              <h3 className="font-semibold text-lg mb-3">Coupon Code</h3>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <CouponCodeInput
                  onApplyCoupon={validateCoupon}
                  appliedCoupon={appliedCoupon}
                  onRemoveCoupon={removeCoupon}
                  isValidating={isValidating}
                />
              </div>
            </div>

            {/* Payment Summary Section */}
            <div>
              <h3 className="font-semibold text-lg mb-3">Payment Summary</h3>
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
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
                {couponDiscountPercentage > 0 && (
                  <div className="flex justify-between text-blue-600">
                    <span>Coupon Discount ({couponDiscountPercentage}%)</span>
                    <span>-{currencySymbol}{Math.round((program.displayPrice * couponDiscountPercentage) / 100)}</span>
                  </div>
                )}
                {pricing.taxPercentage > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>Tax ({pricing.taxPercentage}%)</span>
                    <span>+{currencySymbol}{Math.round((program.displayPrice * pricing.taxPercentage) / 100)}</span>
                  </div>
                )}
                <div className="border-t pt-3 flex justify-between font-bold text-xl">
                  <span>Total</span>
                  <span>{currencySymbol}{finalPrice}</span>
                </div>
              </div>
            </div>

            {/* Payment Button */}
            <div className="pt-4">
              <Button
                onClick={handlePayment}
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
                    Pay {currencySymbol}{finalPrice}
                  </>
                )}
              </Button>
              
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
            </div>

            {/* Security Notice */}
            <div className="flex items-center justify-center gap-2 text-sm text-slate-600 pt-2">
              <Shield size={16} />
              <span>Payments are processed securely</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Payment;
