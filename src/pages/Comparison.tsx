
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Share2, Users, ExternalLink, ArrowRight, Trophy } from 'lucide-react';
import Layout from '@/components/Layout';
import Header from '@/components/Header';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useProgramCompletion } from '@/hooks/useProgramCompletion';

interface AssessmentData {
  id?: string;
  walk_10km_comfort: string;
  run_10km_comfort: string;
  climb_mountain_comfort: string;
  current_health_conditions: string;
  full_body_photo_url?: string;
  comments?: string;
}

const Comparison = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { completedSubscription, markSubscriptionCompleted } = useProgramCompletion();
  const [beforeAssessment, setBeforeAssessment] = useState<AssessmentData | null>(null);
  const [finalAssessment, setFinalAssessment] = useState<AssessmentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [sharing, setSharing] = useState(false);

  useEffect(() => {
    const checkAccessAndFetchAssessments = async () => {
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

        // Check if final assessment exists
        const { data: finalAssessmentCheck } = await supabase
          .from('final_assessments')
          .select('id')
          .eq('user_id', user.id)
          .eq('subscription_id', subscription.id)
          .maybeSingle();

        if (!finalAssessmentCheck) {
          // Final assessment not done, redirect to program complete
          console.log('Final assessment not completed, redirecting to program complete');
          navigate('/program-complete');
          return;
        }

        // Fetch assessments
        await fetchAssessments();
      } catch (error) {
        console.error('Error checking access:', error);
        navigate('/home');
      }
    };

    checkAccessAndFetchAssessments();
  }, [navigate]);

  const fetchAssessments = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }

      // Get the most recent assessments
      const { data: beforeData } = await supabase
        .from('journey_assessments')
        .select('*')
        .eq('user_id', user.id)
        .eq('assessment_type', 'before')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      const { data: finalData } = await supabase
        .from('final_assessments')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      setBeforeAssessment(beforeData);
      setFinalAssessment(finalData);
    } catch (error) {
      console.error('Error fetching assessments:', error);
      toast({
        title: "Error",
        description: "Failed to load assessment data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async (platform: 'community' | 'social') => {
    if (!finalAssessment?.id) return;

    try {
      setSharing(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const updateData = platform === 'community' 
        ? { shared_to_community: true }
        : { shared_to_social: true };

      const { error } = await supabase
        .from('assessment_comparisons')
        .upsert({
          user_id: user.id,
          final_assessment_id: finalAssessment.id,
          subscription_id: completedSubscription?.id,
          ...updateData
        });

      if (error) throw error;

      toast({
        title: "Shared Successfully!",
        description: `Your transformation has been shared to ${platform}.`,
      });

      const { data: comparison } = await supabase
        .from('assessment_comparisons')
        .select('shared_to_community, shared_to_social')
        .eq('user_id', user.id)
        .eq('final_assessment_id', finalAssessment.id)
        .maybeSingle();

      if (comparison?.shared_to_community && comparison?.shared_to_social) {
        if (completedSubscription) {
          await markSubscriptionCompleted(completedSubscription.id);
        }
        
        setTimeout(() => {
          navigate('/subscriptions?completed=true');
        }, 2000);
      }
    } catch (error) {
      console.error('Error sharing:', error);
      toast({
        title: "Sharing Failed",
        description: "There was an error sharing your transformation.",
        variant: "destructive",
      });
    } finally {
      setSharing(false);
    }
  };

  const handleContinueToPrograms = async () => {
    // Mark subscription as completed
    if (completedSubscription) {
      await markSubscriptionCompleted(completedSubscription.id);
    }
    
    navigate('/subscriptions?completed=true');
  };

  const comfortLevelMap: { [key: string]: string } = {
    'very_uncomfortable': 'Very Uncomfortable',
    'uncomfortable': 'Uncomfortable',
    'neutral': 'Neutral',
    'comfortable': 'Comfortable',
    'very_comfortable': 'Very Comfortable',
  };

  const renderComfortLevel = (level: string | undefined) => {
    if (!level) return 'No data';
    return comfortLevelMap[level] || 'Unknown';
  };

  if (loading) {
    return (
      <Layout>
        <Header title="Your Transformation" />
        <div className="min-h-screen bg-light-gray flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sage"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Header title="Your Amazing Transformation!" />
      
      <div className="p-4 space-y-6 max-w-md mx-auto bg-light-gray min-h-screen">
        {/* Celebration Header */}
        <Card className="bg-gradient-sage text-white text-center">
          <CardContent className="p-6">
            <Trophy className="w-16 h-16 text-yellow-300 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Incredible Transformation!</h1>
            <p className="text-white/90">Look how far you've come on your wellness journey</p>
          </CardContent>
        </Card>

        {/* Before & After Photos */}
        {beforeAssessment?.full_body_photo_url && finalAssessment?.full_body_photo_url && (
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="text-center text-primary">Before & After</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <Badge variant="outline" className="mb-2">Before</Badge>
                  <img 
                    src={beforeAssessment.full_body_photo_url} 
                    alt="Before" 
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </div>
                <div className="text-center">
                  <Badge className="mb-2 bg-primary">After</Badge>
                  <img 
                    src={finalAssessment.full_body_photo_url} 
                    alt="After" 
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Sharing Section */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-primary flex items-center">
              <Share2 className="w-5 h-5 mr-2" />
              Share Your Success
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600 text-sm">
              Inspire others by sharing your amazing transformation!
            </p>
            
            <div className="space-y-3">
              <Button 
                onClick={() => handleShare('community')}
                disabled={sharing}
                className="w-full bg-primary hover:bg-primary/90"
              >
                <Users className="w-4 h-4 mr-2" />
                Share to Community
              </Button>
              
              <Button 
                onClick={() => handleShare('social')}
                disabled={sharing}
                variant="outline"
                className="w-full"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Share to Social Media
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Continue Button */}
        <Card className="bg-white">
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-semibold text-primary mb-2">Ready for Your Next Journey?</h3>
            <p className="text-gray-600 mb-4 text-sm">
              Continue your wellness transformation with a new program!
            </p>
            <Button 
              onClick={handleContinueToPrograms}
              className="w-full bg-gradient-sage text-white hover:opacity-90"
            >
              Explore New Programs
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Comparison;
