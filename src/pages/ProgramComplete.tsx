
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, Star, Sparkles, ArrowRight } from 'lucide-react';
import Layout from '@/components/Layout';
import Header from '@/components/Header';
import { supabase } from '@/integrations/supabase/client';

const ProgramComplete = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if final assessment is already completed
    const checkFinalAssessmentStatus = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate('/login');
          return;
        }

        const today = new Date().toISOString().split('T')[0];
        
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
  }, [navigate]);

  return (
    <Layout>
      <Header title="Congratulations!" />
      
      <div className="min-h-screen bg-gradient-peaceful p-4">
        <div className="max-w-md mx-auto">
          <Card className="text-center bg-gradient-sage text-white animate-scale-in">
            <CardContent className="p-8">
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <Trophy className="w-24 h-24 text-yellow-300 animate-pastel-float" />
                  <Sparkles className="w-8 h-8 text-yellow-200 absolute -top-2 -right-2 animate-pulse" />
                </div>
              </div>
              
              <h1 className="text-3xl font-bold mb-4">You Did It!</h1>
              <p className="text-lg mb-6 text-white/90">
                Congratulations on completing your wellness journey! 
                You've made incredible progress and should be proud of your dedication.
              </p>
              
              <div className="flex items-center justify-center space-x-1 mb-8">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-6 h-6 text-yellow-300 fill-current" />
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
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default ProgramComplete;
