
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useOnboarding } from '@/hooks/useOnboarding';
import { useAnalytics } from '@/hooks/useAnalytics';

interface Program {
  id: string;
  name: string;
  price: number;
  duration_days: number;
  displayPrice: number;
  currency: string;
}

export const usePayment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { updateOnboardingState } = useOnboarding();
  const { trackButtonClick, trackPayment, trackEvent } = useAnalytics();
  const [loading, setLoading] = useState(false);
  const [program, setProgram] = useState<Program | null>(null);
  const [gateway, setGateway] = useState<'braintree' | 'razorpay'>('braintree');
  const [userLocation, setUserLocation] = useState<string>('');
  const [isIndiaUser, setIsIndiaUser] = useState(false);

  useEffect(() => {
    const programData = location.state?.program;
    const locationData = location.state?.isIndiaUser;
    const userLocationData = location.state?.userLocation;
    
    if (!programData) {
      navigate('/subscriptions');
      return;
    }
    
    setProgram(programData);
    setIsIndiaUser(locationData || false);
    setUserLocation(userLocationData || '');
    
    // Set gateway based on location
    if (locationData) {
      setGateway('razorpay');
    } else {
      setGateway('braintree');
    }
  }, [location.state, navigate]);

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

      if (program) {
        trackPayment(program.name, program.displayPrice, program.currency, gateway);
      }

      await updateOnboardingState({ subscription_selected: true });

      toast({
        title: "Payment Successful!",
        description: `You've successfully subscribed to ${program?.name}`,
      });

      navigate('/intro-video');
    } catch (error) {
      console.error('Payment verification error:', error);
      trackEvent('payment_error', 'Payment', 'Verification Failed');
      toast({
        title: "Payment Verification Failed",
        description: "Please contact support for assistance.",
        variant: "destructive",
      });
    }
  };

  return {
    loading,
    setLoading,
    program,
    gateway,
    userLocation,
    isIndiaUser,
    trackButtonClick,
    trackEvent,
    navigate,
    toast,
    verifyPayment
  };
};
