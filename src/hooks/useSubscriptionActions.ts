
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useOnboarding } from '@/hooks/useOnboarding';
import { useProgramCompletion } from '@/hooks/useProgramCompletion';
import { useLocationDetection } from '@/hooks/useLocationDetection';
import { usePricingConfig } from '@/hooks/usePricingConfig';
import { calculatePricing } from '@/utils/pricingUtils';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';

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
  const queryClient = useQueryClient();
  const { updateOnboardingState } = useOnboarding();
  const { completedSubscription, markSubscriptionCompleted } = useProgramCompletion();
  const { isIndiaUser, userLocation } = useLocationDetection();
  const pricingConfig = usePricingConfig();
  const { user } = useAuth();

  const getDisplayPrice = (program: Program) => {
    if (isIndiaUser && program.price_inr) {
      console.log('Using INR price for program:', program.name, program.price_inr);
      return program.price_inr;
    }
    console.log('Using USD price for program:', program.name, program.price);
    return program.price;
  };

  const getCurrency = () => {
    return isIndiaUser ? 'INR' : 'USD';
  };

  const createFreeSubscription = async (program: Program) => {
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    try {

      // First, mark any existing active subscriptions as completed
      const { error: updateError } = await supabase
        .from('user_subscriptions')
        .update({ status: 'completed' })
        .eq('user_id', user.id)
        .eq('status', 'active');

      if (updateError) {
        console.error('Error updating existing subscriptions:', updateError);
        // Don't throw here, continue with creating the new subscription
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

  const handleSubscribe = async (programId: string, couponDiscountPercentage: number = 0, finalPrice?: number) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to subscribe.",
        variant: "destructive",
      });
      navigate('/login');
      return;
    }
    
    try {

      console.log('Current user:', user.id);
      console.log('Location data:', { isIndiaUser, userLocation });

      const program = programs.find(p => p.id === programId);
      if (!program) {
        throw new Error('Program not found');
      }

      console.log('Selected program:', program);

      console.log('Proceeding to payment...');

      // If 100% discount coupon is applied, create free subscription
      if (couponDiscountPercentage === 100) {
        await createFreeSubscription(program);
        return;
      }

      const originalPrice = getDisplayPrice(program);
      const currency = getCurrency();
      
      // Use the final price passed from the component, or calculate it if not provided
      let calculatedFinalPrice = finalPrice;
      if (!calculatedFinalPrice) {
        const pricing = calculatePricing(
          originalPrice,
          pricingConfig.discountPercentage,
          pricingConfig.taxPercentage,
          couponDiscountPercentage
        );
        calculatedFinalPrice = pricing.finalPrice;
      }
      
      console.log('Final price for payment:', calculatedFinalPrice);
      
      // Navigate to payment page with program data, pricing info, and location info
      navigate('/payment', { 
        state: { 
          program: {
            ...program,
            displayPrice: originalPrice,
            finalPrice: calculatedFinalPrice,
            currency: currency
          },
          pricing: {
            originalPrice,
            finalPrice: calculatedFinalPrice,
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
