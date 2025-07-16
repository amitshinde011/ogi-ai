
import React, { useState, useEffect } from 'react';
import { Shield, CreditCard } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Loader from '@/components/ui/loader';
import { useToast } from '@/components/ui/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOnboarding } from '@/hooks/useOnboarding';
import { useAnalytics } from '@/hooks/useAnalytics';
import { Link } from 'react-router-dom';
import { createPaymentSession, handleRazorpayPayment } from '@/utils/paymentGateway';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import ContentContainer from '@/components/ContentContainer';
import Header from '@/components/Header';

const Payment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { updateOnboardingState } = useOnboarding();
  const { trackPayment, trackEvent } = useAnalytics();
  
  const [loading, setLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const { user } = useAuth();
  const [userWithProfile, setUserWithProfile] = useState<any>(null);


  // Get data from location state
  const program = location.state?.program;
  const pricing = location.state?.pricing;
  const isIndiaUser = location.state?.isIndiaUser || false;
  const userLocation = location.state?.userLocation || '';

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) {
        navigate('/login');
        return;
      }

      try {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        setUserWithProfile({ ...user, profile });
      } catch (error) {
        console.error('Error fetching user profile:', error);
        toast({
          title: "Error",
          description: "Failed to load user information",
          variant: "destructive"
        });
        navigate('/login');
      }
    };

    fetchUserProfile();
  }, [user, navigate, toast]);

  // Redirect if no program data
  useEffect(() => {
    if (!program || !pricing) {
      console.error('No program or pricing data found in location state');
      navigate('/subscriptions');
      return;
    }
  }, [program, pricing, navigate]);

  if (loading || !program || !pricing || !userWithProfile) {
    return (
      <div className="min-h-screen bg-gradient-peaceful flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  if (paymentSuccess) {
    return (
      <div className="min-h-screen bg-gradient-peaceful flex items-center justify-center">
        <div className="text-center">
          <Loader size="lg" />
          <p className="mt-4 text-lg font-medium">Redirecting to your intro video...</p>
        </div>
      </div>
    );
  }

  const currencySymbol = isIndiaUser ? '₹' : '$';
  const finalPrice = Math.round(pricing.finalPrice || program.finalPrice || program.displayPrice);
  // Use the coupon discount from the subscription page, not the local state
  const couponDiscountPercentage = pricing.couponDiscountPercentage || 0;

  const handlePaymentSuccess = async (orderId: string, transactionId: string) => {
    setPaymentSuccess(true);
    try {
      // Verify payment with backend
      const { error: verifyError } = await supabase.functions.invoke('process-payment', {
        body: {
          action: 'verify_payment',
          orderId,
          transactionId,
          gateway: 'razorpay'
        }
      });

      if (verifyError) {
        throw verifyError;
      }

      // Track payment success
      trackPayment(program.name, finalPrice, program.currency, 'razorpay');

      // Reset onboarding state for new subscription - all sequences restart
      await updateOnboardingState({ 
        subscription_selected: true,
        intro_video_watched: false,
        before_assessment_completed: false,
        journey_started: false
      });

      // Invalidate user program cache to refresh subscription data
      queryClient.invalidateQueries({ queryKey: ['user-current-program'] });

      toast({
        title: "Payment Successful!",
        description: `You've successfully subscribed to ${program.name}`,
      });

      navigate('/intro-video');
    } catch (error) {
      console.error('Payment verification error:', error);
      setPaymentSuccess(false);
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
        gateway: 'razorpay',
        currency: program.currency
      });

      // Check if this is a free subscription (100% discount)
      if (finalPrice <= 0.01) {
        // First, mark any existing active subscriptions as completed
        const { error: updateError } = await supabase
          .from('user_subscriptions')
          .update({ status: 'completed' })
          .eq('user_id', user.id)
          .eq('status', 'active');

        if (updateError) {
          console.error('Error updating existing subscriptions:', updateError);
        }

        // Handle free subscription directly - create without dates
        const { error: subscriptionError } = await supabase
          .from('user_subscriptions')
          .insert({
            user_id: userWithProfile.id,
            program_id: program.id,
            start_date: null,
            end_date: null,
            status: 'active',
            payment_status: 'paid'
          });

        if (subscriptionError) {
          throw subscriptionError;
        }

        await updateOnboardingState({ 
          subscription_selected: true,
          intro_video_watched: false,
          before_assessment_completed: false,
          journey_started: false
        });

        // Invalidate user program cache to refresh subscription data
        queryClient.invalidateQueries({ queryKey: ['user-current-program'] });
        
        toast({
          title: "Free Access Granted!",
          description: `You've successfully got free access to ${program.name}`,
        });

        setPaymentSuccess(true);
        setTimeout(() => navigate('/intro-video'), 500);
        return;
      }

      // Create payment session
      const sessionData = await createPaymentSession(program, userWithProfile, 'razorpay');
      
      console.log('Payment session created:', sessionData);

      // Use Razorpay for payment
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
    <Layout noContainer>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Header title="Complete Your Purchase" showBack />
        <ContentContainer variant="legal">
          <div className="min-h-screen bg-gradient-peaceful py-4">

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
                    <p className="font-medium">Razorpay</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Applied Coupon Display Section */}
            {couponDiscountPercentage > 0 && (
              <div>
                <h3 className="font-semibold text-lg mb-3">Applied Coupon</h3>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="font-medium text-green-800">Coupon Applied</span>
                    </div>
                    <span className="text-green-700 font-semibold">
                      {couponDiscountPercentage}% OFF
                    </span>
                  </div>
                  <p className="text-sm text-green-600 mt-2">
                    You're saving {currencySymbol}{Math.round((program.displayPrice * couponDiscountPercentage) / 100)} with this coupon!
                  </p>
                </div>
              </div>
            )}

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
                    <Loader size="sm" className="border-white border-t-transparent mr-2" />
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
              <span>Payments are processed securely via Razorpay</span>
            </div>
          </CardContent>
        </Card>
          </div>
        </ContentContainer>
      </div>
    </Layout>
  );
};

export default Payment;
