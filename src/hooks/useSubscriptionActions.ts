
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useOnboarding } from '@/hooks/useOnboarding';
import { useProgramCompletion } from '@/hooks/useProgramCompletion';
import { useLocationDetection } from '@/hooks/useLocationDetection';
import { usePricingConfig } from '@/hooks/usePricingConfig';
import { calculatePricing } from '@/utils/pricingUtils';

interface Program {
  id: string;
  name: string;
  duration_days: number;
  price: number;
  price_inr: number;
  features: string[];
  benefits: string[];
  description: string;
}

export const useSubscriptionActions = (programs: Program[]) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { updateOnboardingState } = useOnboarding();
  const { completedSubscription, markSubscriptionCompleted } = useProgramCompletion();
  const { isIndiaUser, userLocation } = useLocationDetection();
  const pricingConfig = usePricingConfig();

  const getDisplayPrice = (program: Program) => {
    return isIndiaUser && program.price_inr ? program.price_inr : program.price;
  };

  const createFreeSubscription = async (program: Program) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Mark previous subscription as completed if it exists
      if (completedSubscription) {
        await markSubscriptionCompleted(completedSubscription.id);
      }

      // Create the subscription directly with 'paid' status since it's processed (even though free)
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
          payment_status: 'paid' // Use 'paid' instead of 'free' to match database constraints
        });

      if (subscriptionError) {
        throw subscriptionError;
      }

      await updateOnboardingState({ subscription_selected: true });

      toast({
        title: "Free Access Granted!",
        description: `You've successfully got free access to ${program.name}`,
      });

      navigate('/intro-video');
    } catch (error) {
      console.error('Error creating free subscription:', error);
      toast({
        title: "Subscription Failed",
        description: `There was an error processing your free subscription: ${error.message || 'Unknown error'}`,
        variant: "destructive",
      });
    }
  };

  const handleSubscribe = async (programId: string, couponDiscountPercentage: number = 0) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please log in to subscribe.",
          variant: "destructive",
        });
        navigate('/login');
        return;
      }

      console.log('Current user:', user.id);

      const program = programs.find(p => p.id === programId);
      if (!program) {
        throw new Error('Program not found');
      }

      console.log('Selected program:', program);

      // Check if user already has an active subscription
      const { data: existingSub, error: existingError } = await supabase
        .from('user_subscriptions')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .maybeSingle();

      console.log('Existing subscription check:', existingSub, existingError);

      if (existingError && existingError.code !== 'PGRST116') {
        console.error('Error checking existing subscription:', existingError);
        throw existingError;
      }

      if (existingSub) {
        toast({
          title: "Already Subscribed",
          description: "You already have an active subscription.",
          variant: "destructive",
        });
        return;
      }

      // If 100% discount coupon is applied, create free subscription
      if (couponDiscountPercentage === 100) {
        await createFreeSubscription(program);
        return;
      }

      const originalPrice = getDisplayPrice(program);
      const pricing = calculatePricing(
        originalPrice,
        pricingConfig.discountPercentage,
        pricingConfig.taxPercentage,
        couponDiscountPercentage
      );
      
      // Navigate to payment page with program data, pricing info, and location info
      navigate('/payment', { 
        state: { 
          program: {
            ...program,
            displayPrice: originalPrice,
            finalPrice: pricing.finalPrice,
            currency: isIndiaUser ? 'INR' : 'USD'
          },
          pricing: {
            ...pricing,
            discountPercentage: pricingConfig.discountPercentage,
            taxPercentage: pricingConfig.taxPercentage,
            isSpecialOccasion: pricingConfig.isSpecialOccasion,
            occasionName: pricingConfig.occasionName,
            couponDiscountPercentage
          },
          isIndiaUser,
          userLocation
        } 
      });
    } catch (error) {
      console.error('Error subscribing:', error);
      toast({
        title: "Subscription Failed",
        description: `There was an error processing your subscription: ${error.message || 'Unknown error'}`,
        variant: "destructive",
      });
    }
  };

  return {
    handleSubscribe,
    isIndiaUser,
    userLocation
  };
};
