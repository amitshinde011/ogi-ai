
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useOnboarding } from '@/hooks/useOnboarding';

interface Program {
  id: string;
  name: string;
  duration_days: number;
  price: number;
  features: string[];
  benefits: string[];
  description: string;
}

const Subscriptions = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { updateOnboardingState } = useOnboarding();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState<string | null>(null);

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

  const handleSubscribe = async (programId: string) => {
    try {
      setSubscribing(programId);
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

      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(startDate.getDate() + program.duration_days);

      console.log('Creating subscription with data:', {
        user_id: user.id,
        program_id: programId,
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
        status: 'active',
        payment_status: 'paid'
      });

      const { error } = await supabase
        .from('user_subscriptions')
        .insert({
          user_id: user.id,
          program_id: programId,
          start_date: startDate.toISOString().split('T')[0],
          end_date: endDate.toISOString().split('T')[0],
          status: 'active',
          payment_status: 'paid' // Simulating successful payment
        });

      if (error) {
        console.error('Subscription insert error:', error);
        throw error;
      }

      await updateOnboardingState({ subscription_selected: true });

      toast({
        title: "Subscription Successful!",
        description: `You've subscribed to ${program.name}`,
      });

      navigate('/intro-video');
    } catch (error) {
      console.error('Error subscribing:', error);
      toast({
        title: "Subscription Failed",
        description: `There was an error processing your subscription: ${error.message || 'Unknown error'}`,
        variant: "destructive",
      });
    } finally {
      setSubscribing(null);
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
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">Choose Your Transformation Journey</h1>
          <p className="text-black">Select the program that best fits your wellness goals</p>
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
                  <span className="text-3xl font-bold text-primary">${program.price}</span>
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
                  variant={program.duration_days === 49 ? "default" : "outline"}
                  disabled={subscribing === program.id}
                >
                  {subscribing === program.id ? 'Processing...' : 'Subscribe & Pay'}
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
