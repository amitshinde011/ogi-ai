import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useOnboarding } from '@/hooks/useOnboarding';
import { useProgramCompletion } from '@/hooks/useProgramCompletion';
import { useLocationDetection } from '@/hooks/useLocationDetection';
import { usePricingConfig } from '@/hooks/usePricingConfig';
import { calculatePricing } from '@/utils/pricingUtils';
import { AchievementBanner } from '@/components/AchievementBanner';
import { PricingDisplay } from '@/components/PricingDisplay';
import { SubscriptionCard } from '@/components/SubscriptionCard';

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

const Subscriptions = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { updateOnboardingState } = useOnboarding();
  const { completedSubscription, markSubscriptionCompleted } = useProgramCompletion();
  const { isIndiaUser, userLocation } = useLocationDetection();
  const pricingConfig = usePricingConfig();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAchievementBanner, setShowAchievementBanner] = useState(false);

  // Check if user arrived here after completing a program
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const completed = urlParams.get('completed');
    if (completed === 'true' && completedSubscription) {
      setShowAchievementBanner(true);
    }
  }, [location.search, completedSubscription]);

  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    try {
      const { data, error } = await supabase
        .from('programs')
        .select('*')
        .order('duration_days');

      if (error) {
        console.error('Error fetching programs:', error);
        throw error;
      }
      
      console.log('Programs fetched:', data);
      setPrograms(data || []);
    } catch (error) {
      console.error('Error fetching programs:', error);
      toast({
        title: "Error",
        description: "Failed to load programs. Please refresh the page.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getDisplayPrice = (program: Program) => {
    return isIndiaUser && program.price_inr ? program.price_inr : program.price;
  };

  const handleSubscribe = async (programId: string) => {
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

      // Mark previous subscription as completed if it exists
      if (completedSubscription) {
        await markSubscriptionCompleted(completedSubscription.id);
      }

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

      // Hide achievement banner when navigating to payment
      setShowAchievementBanner(false);
      
      const originalPrice = getDisplayPrice(program);
      const pricing = calculatePricing(
        originalPrice,
        pricingConfig.discountPercentage,
        pricingConfig.taxPercentage
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
            occasionName: pricingConfig.occasionName
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-peaceful flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sage"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-peaceful p-4">
      <div className="max-w-6xl mx-auto">
        {/* Achievement Banner */}
        {showAchievementBanner && completedSubscription && (
          <AchievementBanner
            completedSubscription={completedSubscription}
            onClose={() => setShowAchievementBanner(false)}
          />
        )}

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">
            {showAchievementBanner ? "Choose Your Next Journey" : "Choose Your Transformation Journey"}
          </h1>
          <p className="text-black">Select the program that best fits your wellness goals</p>
          <PricingDisplay isIndiaUser={isIndiaUser} userLocation={userLocation} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {programs.map((program) => (
            <SubscriptionCard
              key={program.id}
              program={program}
              isIndiaUser={isIndiaUser}
              onSubscribe={handleSubscribe}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Subscriptions;
