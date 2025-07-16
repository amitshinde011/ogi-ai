
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Star, Target, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Loader from '@/components/ui/loader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import Layout from '@/components/Layout';
import ContentContainer from '@/components/ContentContainer';
import Header from '@/components/Header';
import { supabase } from '@/integrations/supabase/client';
import { useOnboarding } from '@/hooks/useOnboarding';
import { getLocalDateString, createLocalDate } from '@/utils/dateUtils';
import { useAuth } from '@/contexts/AuthContext';

const JourneyStart = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { updateOnboardingState } = useOnboarding();
  const [loading, setLoading] = useState(false);
  const [subscription, setSubscription] = useState<any>(null);
  const { user } = useAuth();

  useEffect(() => {
    checkJourneyStart();
  }, [user]);

  const checkJourneyStart = async () => {
    try {
      if (!user) {
        navigate('/login');
        return;
      }

      const today = getLocalDateString();
      console.log('Today ', today);
      const { data: planData, error: planError } = await supabase
        .from('user_subscriptions')
        .select('*, programs(*)')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .lte('start_date', today)
        .gte('end_date', today)
        .explain();

      if (planError) {
        console.error('Error fetching query plan:', planError);
      } else {
        console.log('--- Supabase Query Plan ---');

        const planObject = planData?.[0];

        if (typeof planObject === 'object' && planObject !== null && 'Plan' in planObject) {
          console.log(planObject.Plan);
        } else {
          console.log('Could not find the .Plan property. Inspect the full response instead:');
          console.log(planData);
        }
      }
      
      // Get active subscription that should start today
      const { data: currentSub } = await supabase
        .from('user_subscriptions')
        .select('*, programs(*)')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .or('start_date.is.null,start_date.lte.' + today)
        .or('end_date.is.null,end_date.gte.' + today)
        .maybeSingle();

      // Check if start date is today or has passed (only if dates exist)
      if (currentSub && currentSub.start_date && currentSub.end_date) {
        const startDate = createLocalDate(currentSub.start_date);
        const todayDate = createLocalDate(today);

        if (todayDate < startDate) {
          // Start date hasn't arrived yet
          navigate('/before-assessment');
          return;
        }
      } else if (currentSub) {
        // If dates are null, subscription is not yet started - redirect to before-assessment
        navigate('/before-assessment');
        return;
      }

      setSubscription(currentSub);
    } catch (error) {
      console.error('Error checking journey start:', error);
      navigate('/subscriptions');
    }
  };

  const handleStartJourney = async () => {
    setLoading(true);
    try {
      await updateOnboardingState({ journey_started: true });

      toast({
        title: "Journey Started! 🎉",
        description: "Welcome to your wellness transformation!",
      });

      navigate('/home');
    } catch (error) {
      console.error('Error starting journey:', error);
      toast({
        title: "Error",
        description: "Failed to start journey. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!subscription) {
    return (
      <Layout>
        <Header title="Journey Start" />
        <div className="min-h-screen bg-light-gray flex items-center justify-center">
          <Loader size="lg" />
        </div>
      </Layout>
    );
  }

  const getDaysRemaining = () => {
    const today = getLocalDateString();
    const endDate = subscription.end_date;
    const start = createLocalDate(subscription.start_date);
    const end = createLocalDate(endDate);
    const todayDate = createLocalDate(today);
    
    // If today is before start, return full duration
    if (todayDate < start) {
      return subscription.programs?.duration_days || 0;
    }
    
    // If today is after end, return 0
    if (todayDate > end) {
      return 0;
    }
    
    // Calculate remaining days (inclusive of end date)
    const diffTime = end.getTime() - todayDate.getTime();
    const remainingDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include today
    return Math.max(0, remainingDays);
  };

  return (
    <Layout noContainer>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Header title="Your Journey Starts Today!" />
        <ContentContainer variant="wide">
          <div className="space-y-6 py-4 bg-light-gray min-h-screen">
        {/* Welcome Card */}
        <Card className="text-center bg-primary text-primary-foreground">
          <CardContent className="p-8">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Star className="w-10 h-10 text-yellow-300" />
            </div>
            <h1 className="text-2xl font-bold mb-4">
              Welcome to Your Wellness Journey!
            </h1>
            <p className="text-primary-foreground/90 text-lg">
              Today marks the beginning of your transformation with {subscription.programs?.name}
            </p>
          </CardContent>
        </Card>

        {/* Program Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Your Program Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <span className="font-medium">Program:</span>
              <span className="text-primary font-semibold">{subscription.programs?.name}</span>
            </div>

            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <span className="font-medium">Duration:</span>
              <span className="text-primary font-semibold">
                {subscription.programs?.duration_days} days
              </span>
            </div>

            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <span className="font-medium">Days Remaining:</span>
              <span className="text-primary font-semibold">
                {getDaysRemaining()} days
              </span>
            </div>

            <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg border border-blue-200">
              <span className="font-medium flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Journey End Date:
              </span>
              <span className="text-blue-700 font-semibold">
                {createLocalDate(subscription.end_date).toLocaleDateString()} (Inclusive)
              </span>
            </div>
          </CardContent>
        </Card>

        {/* What to Expect */}
        <Card>
          <CardHeader>
            <CardTitle>What to Expect</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-gray-700">Daily wellness activities and tracking</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-gray-700">Personalized recipes and meal guidance. Please make sure, you will not eat anything other than this.</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-gray-700">Community support and sharing</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-gray-700">Progress tracking and insights</p>
            </div>
          </CardContent>
        </Card>

        {/* Start Journey Button */}
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-600 mb-6">
              Are you ready to begin your wellness transformation?
              Let's make every day count towards a healthier, happier you!
            </p>

            <Button
              onClick={handleStartJourney}
              disabled={loading}
              className="w-full h-12 text-lg bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {loading ? (
                <>
                  <Loader size="sm" className="border-white border-t-transparent mr-2" />
                  Starting Journey...
                </>
              ) : (
                <>
                  Start My Journey
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
          </CardContent>
        </Card>
          </div>
        </ContentContainer>
      </div>
    </Layout>
  );
};

export default JourneyStart;
