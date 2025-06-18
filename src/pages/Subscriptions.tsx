
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Trophy, Star, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useOnboarding } from '@/hooks/useOnboarding';
import { useProgramCompletion } from '@/hooks/useProgramCompletion';

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
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAchievementBanner, setShowAchievementBanner] = useState(false);
  const [isIndiaUser, setIsIndiaUser] = useState(false);
  const [userLocation, setUserLocation] = useState<string>('');

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
    detectUserLocation();
  }, []);

  const detectUserLocation = async () => {
    try {
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      console.log('Location detected:', data.country_name, data.country_code);
      setUserLocation(data.country_name);
      setIsIndiaUser(data.country_code === 'IN');
    } catch (error) {
      console.error('Failed to detect location:', error);
      setIsIndiaUser(false);
    }
  };

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

  const getCurrencySymbol = () => {
    return isIndiaUser ? '₹' : '$';
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
      
      // Navigate to payment page with program data and location info
      navigate('/payment', { 
        state: { 
          program: {
            ...program,
            displayPrice: getDisplayPrice(program),
            currency: isIndiaUser ? 'INR' : 'USD'
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
          <Card className="mb-6 bg-gradient-sage text-white border-none">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Trophy className="w-8 h-8 text-yellow-300" />
                    <div className="flex space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-yellow-300 fill-current" />
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Congratulations! 🎉</h3>
                    <p className="text-white/90">
                      You've successfully completed your {completedSubscription.programs?.name} journey! 
                      Ready to start your next transformation?
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAchievementBanner(false)}
                  className="text-white hover:bg-white/20"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">
            {showAchievementBanner ? "Choose Your Next Journey" : "Choose Your Transformation Journey"}
          </h1>
          <p className="text-black">Select the program that best fits your wellness goals</p>
          {userLocation && (
            <p className="text-sm text-gray-600 mt-2">
              Pricing for: {userLocation} ({isIndiaUser ? 'INR' : 'USD'})
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {programs.map((program) => (
            <Card key={program.id} className={`relative transition-all hover:shadow-lg bg-white text-black ${
              program.duration_days === 49 ? 'ring-2 ring-primary scale-105' : ''
            }`}>
              {program.duration_days === 49 && (
                <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-primary">
                  Most Popular
                </Badge>
              )}
              <CardHeader>
                <CardTitle className="text-xl text-center text-black">{program.name}</CardTitle>
                <div className="text-center">
                  <span className="text-3xl font-bold text-primary">
                    {getCurrencySymbol()}{getDisplayPrice(program)}
                  </span>
                  <span className="text-black">/{program.duration_days} days</span>
                </div>
                <p className="text-sm text-black text-center">{program.description}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2 text-black">Features:</h4>
                  <ul className="space-y-1">
                    {program.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-sm text-black">
                        <Check className="w-4 h-4 text-green-500 mr-2" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 text-black">Benefits:</h4>
                  <ul className="space-y-1">
                    {program.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-center text-sm text-black">
                        <Check className="w-4 h-4 text-green-500 mr-2" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
                <Button 
                  className="w-full" 
                  onClick={() => handleSubscribe(program.id)}
                  variant={program.duration_days === 49 ? "default" : "secondary"}
                >
                  Subscribe & Pay
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Subscriptions;
