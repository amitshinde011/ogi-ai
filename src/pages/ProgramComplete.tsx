
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, Star, Sparkles, ArrowRight } from 'lucide-react';
import Layout from '@/components/Layout';
import Header from '@/components/Header';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { getLocalDateString } from '@/utils/dateUtils';

const ProgramComplete = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    // Check if final assessment is already completed
    const checkFinalAssessmentStatus = async () => {
      try {
        if (!user) {
          navigate('/login');
          return;
        }

        const today = getLocalDateString();
        
        // Get active subscription that has ended (completed program)
        const { data: subscription } = await supabase
          .from('user_subscriptions')
          .select('id')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .lte('end_date', today)
          .maybeSingle();

        if (!subscription) {
          // No completed program, redirect to home
          console.log('No completed program found, redirecting to home');
          navigate('/home');
          return;
        }

        // Check if final assessment already exists
        const { data: finalAssessment } = await supabase
          .from('final_assessments')
          .select('id')
          .eq('user_id', user.id)
          .eq('subscription_id', subscription.id)
          .maybeSingle();

        if (finalAssessment) {
          // Final assessment already done, redirect to comparison
          console.log('Final assessment already completed, redirecting to comparison');
          navigate('/comparison');
          return;
        }
      } catch (error) {
        console.error('Error checking final assessment status:', error);
      }
    };

    checkFinalAssessmentStatus();
  }, [navigate, user]);

  return (
    <Layout noContainer>
      <Header title="Congratulations!" />
      
      <div className="min-h-screen bg-gradient-peaceful py-4">
        <div className="max-w-md mx-auto px-4">
          <Card className="text-center bg-gradient-sage text-white animate-scale-in">
            <CardContent className="p-8">
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <Trophy size={96} strokeWidth={1.5} className="text-yellow-300 animate-pastel-float" />
                  <Sparkles size={32} strokeWidth={1.5} className="text-yellow-200 absolute -top-2 -right-2 animate-pulse" />
                </div>
              </div>
              
              <h1 className="text-3xl font-bold mb-4">You Did It!</h1>
              <p className="text-lg mb-6 text-white/90">
                Congratulations on completing your wellness journey! 
                You've made incredible progress and should be proud of your dedication.
              </p>
              
              <div className="flex items-center justify-center space-x-1 mb-8">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={24} strokeWidth={1.5} className="text-yellow-300 fill-current" />
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6 bg-white">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold text-center mb-4 text-primary">
                Complete Your Final Assessment
              </h2>
              <p className="text-center text-gray-600 mb-6">
                Help us track your amazing transformation by completing a final assessment. 
                You'll be able to see your before and after comparison and share your success!
              </p>
              
              <Button 
                className="w-full bg-gradient-sage text-white hover:opacity-90 transition-opacity"
                onClick={() => navigate('/final-assessment')}
              >
                Start Final Assessment
                <ArrowRight size={16} strokeWidth={1.5} className="ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default ProgramComplete;
