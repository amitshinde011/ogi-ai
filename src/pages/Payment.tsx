
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CreditCard, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useOnboarding } from '@/hooks/useOnboarding';

interface Program {
  id: string;
  name: string;
  price: number;
  duration_days: number;
}

const Payment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { updateOnboardingState } = useOnboarding();
  const [loading, setLoading] = useState(false);
  const [program, setProgram] = useState<Program | null>(null);
  const [gateway, setGateway] = useState<'braintree' | 'razorpay'>('braintree');
  const [userLocation, setUserLocation] = useState<string>('');

  useEffect(() => {
    const programData = location.state?.program;
    if (!programData) {
      navigate('/subscriptions');
      return;
    }
    setProgram(programData);
    detectUserLocation();
  }, [location.state, navigate]);

  const detectUserLocation = async () => {
    try {
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      setUserLocation(data.country_name);
      
      // Set gateway based on location
      if (data.country_code === 'IN') {
        setGateway('razorpay');
      } else {
        setGateway('braintree');
      }
    } catch (error) {
      console.error('Failed to detect location:', error);
      // Default to Braintree for global
      setGateway('braintree');
    }
  };

  const createPaymentSession = async () => {
    if (!program) return;

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please log in to continue.",
          variant: "destructive",
        });
        navigate('/login');
        return;
      }

      const currency = gateway === 'razorpay' ? 'INR' : 'USD';
      
      const { data, error } = await supabase.functions.invoke('process-payment', {
        body: {
          action: 'create_payment_session',
          userId: user.id,
          programId: program.id,
          gateway,
          amount: program.price,
          currency
        }
      });

      if (error) throw error;

      if (gateway === 'braintree') {
        await handleBraintreePayment(data);
      } else {
        await handleRazorpayPayment(data);
      }
    } catch (error) {
      console.error('Payment session creation error:', error);
      toast({
        title: "Payment Error",
        description: "Failed to initialize payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBraintreePayment = async (sessionData: any) => {
    // Load Braintree script
    if (!window.braintree) {
      const script = document.createElement('script');
      script.src = 'https://js.braintreegateway.com/web/3.103.0/js/client.min.js';
      document.head.appendChild(script);
      
      await new Promise((resolve) => {
        script.onload = resolve;
      });
    }

    // For demo purposes, simulate successful payment
    // In a real implementation, you'd integrate with Braintree Drop-in UI
    setTimeout(async () => {
      await verifyPayment(sessionData.orderId, 'braintree_txn_' + Date.now());
    }, 2000);
  };

  const handleRazorpayPayment = async (sessionData: any) => {
    // Load Razorpay script
    if (!window.Razorpay) {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      document.head.appendChild(script);
      
      await new Promise((resolve) => {
        script.onload = resolve;
      });
    }

    const options = {
      key: sessionData.sessionData.keyId,
      amount: sessionData.sessionData.amount,
      currency: sessionData.sessionData.currency,
      name: 'Yogi-ai',
      description: `Payment for ${program?.name}`,
      order_id: sessionData.sessionData.orderId,
      handler: async (response: any) => {
        await verifyPayment(sessionData.orderId, response.razorpay_payment_id);
      },
      prefill: {
        name: '',
        email: '',
        contact: ''
      },
      theme: {
        color: '#3399cc'
      }
    };

    const razorpay = new window.Razorpay(options);
    razorpay.open();
  };

  const verifyPayment = async (orderId: string, transactionId: string) => {
    try {
      const { error } = await supabase.functions.invoke('process-payment', {
        body: {
          action: 'verify_payment',
          orderId,
          transactionId,
          gateway
        }
      });

      if (error) throw error;

      await updateOnboardingState({ subscription_selected: true });

      toast({
        title: "Payment Successful!",
        description: `You've successfully subscribed to ${program?.name}`,
      });

      navigate('/intro-video');
    } catch (error) {
      console.error('Payment verification error:', error);
      toast({
        title: "Payment Verification Failed",
        description: "Please contact support for assistance.",
        variant: "destructive",
      });
    }
  };

  if (!program) {
    return (
      <div className="min-h-screen bg-gradient-peaceful flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sage"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-peaceful p-4">
      <div className="max-w-2xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate('/subscriptions')}
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
            {/* Program Details */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-lg mb-2">{program.name}</h3>
              <div className="flex justify-between items-center">
                <span>Duration: {program.duration_days} days</span>
                <span className="text-2xl font-bold text-primary">
                  {gateway === 'razorpay' ? '₹' : '$'}{program.price}
                </span>
              </div>
            </div>

            {/* Location & Gateway Info */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
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

            {/* Payment Button */}
            <Button
              onClick={createPaymentSession}
              disabled={loading}
              className="w-full h-12 text-lg"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4 mr-2" />
                  Pay {gateway === 'razorpay' ? '₹' : '$'}{program.price}
                </>
              )}
            </Button>

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
