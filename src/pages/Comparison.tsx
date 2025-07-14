
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Share2, Users, ExternalLink, ArrowRight, Trophy, TrendingUp } from 'lucide-react';
import Layout from '@/components/Layout';
import Loader from '@/components/ui/loader';
import Header from '@/components/Header';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useProgramCompletion } from '@/hooks/useProgramCompletion';
import { useR2Upload } from '@/hooks/useR2Upload';
import html2canvas from 'html2canvas';
import { useAuth } from '@/contexts/AuthContext';

interface AssessmentData {
  id?: string;
  walk_10km_comfort: string;
  run_10km_comfort: string;
  climb_mountain_comfort: string;
  current_health_conditions: string;
  full_body_photo_url?: string;
  comments?: string;
  created_at?: string;
}

const Comparison = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { completedSubscription, markSubscriptionCompleted } = useProgramCompletion();
  const { uploadToR2 } = useR2Upload();
  const photoComparisonRef = useRef<HTMLDivElement>(null);
  const [beforeAssessment, setBeforeAssessment] = useState<AssessmentData | null>(null);
  const [finalAssessment, setFinalAssessment] = useState<AssessmentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [sharing, setSharing] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const checkAccessAndFetchAssessments = async () => {
      try {
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
  }, [navigate, user]);

  const fetchAssessments = async () => {
    try {
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

  const capturePhotoComparison = async (): Promise<File | null> => {
    if (!photoComparisonRef.current) return null;

    try {
      const canvas = await html2canvas(photoComparisonRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        allowTaint: true,
        height: photoComparisonRef.current.scrollHeight,
        width: photoComparisonRef.current.scrollWidth
      });

      return new Promise((resolve) => {
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], `transformation-${Date.now()}.png`, {
              type: 'image/png'
            });
            resolve(file);
          } else {
            resolve(null);
          }
        }, 'image/png', 0.9);
      });
    } catch (error) {
      console.error('Error capturing photo comparison:', error);
      return null;
    }
  };

  const createCommunityPost = async (imageUrl: string) => {
    try {
      if (!user) throw new Error('No authenticated user');

      const programName = completedSubscription?.programs?.name || 'Wellness Program';
      
      // Create before/after data comparison text
      const getComfortText = (level: string) => {
        const comfortMap: { [key: string]: string } = {
          'very_uncomfortable': 'Very Uncomfortable',
          'uncomfortable': 'Uncomfortable', 
          'neutral': 'Neutral',
          'somewhat_comfortable': 'Somewhat Comfortable',
          'comfortable': 'Comfortable',
          'very_comfortable': 'Very Comfortable'
        };
        return comfortMap[level] || level;
      };

      let progressText = '';
      if (beforeAssessment && finalAssessment) {
        progressText = `

📈 My Progress Results:
• Walking 10km: ${getComfortText(beforeAssessment.walk_10km_comfort || '')} → ${getComfortText(finalAssessment.walk_10km_comfort || '')}
• Running 10km: ${getComfortText(beforeAssessment.run_10km_comfort || '')} → ${getComfortText(finalAssessment.run_10km_comfort || '')}
• Mountain Climbing: ${getComfortText(beforeAssessment.climb_mountain_comfort || '')} → ${getComfortText(finalAssessment.climb_mountain_comfort || '')}`;
      }
      
      const caption = `🎉 Amazing transformation completed! 💪

Just finished the ${programName} and look at this incredible journey!${progressText}

Before vs After Progress - Your dedication and consistency can create amazing results! 

#WellnessJourney #ProgressAndPersistence #BeforeAndAfter #WellnessTransformed #${programName.replace(/\s+/g, '')}`;

      const { error } = await supabase
        .from('posts')
        .insert({
          author_id: user.id,
          image_url: imageUrl,
          caption: caption,
          category: 'transformation'
        });

      if (error) throw error;

      console.log('Community post created successfully');
      return true;
    } catch (error) {
      console.error('Error creating community post:', error);
      throw error;
    }
  };

  const handleShare = async (platform: 'community' | 'social') => {
    if (!finalAssessment?.id) return;

    try {
      setSharing(true);

      if (!user) return;

      // Capture the before/after photos comparison
      const comparisonImage = await capturePhotoComparison();
      if (!comparisonImage) {
        toast({
          title: "Error",
          description: "Failed to capture comparison image.",
          variant: "destructive",
        });
        return;
      }

      // Upload the image to R2
      const uploadResult = await uploadToR2(comparisonImage, 'community');
      if (!uploadResult) {
        toast({
          title: "Error",
          description: "Failed to upload comparison image.",
          variant: "destructive",
        });
        return;
      }

      if (platform === 'community') {
        // Create community post
        await createCommunityPost(uploadResult.imageUrl);
      } else {
        // For social media, we could open a share dialog or copy the image URL
        // For now, we'll just show a success message
        console.log('Social media share with image URL:', uploadResult.imageUrl);
      }

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
    if (completedSubscription) {
      await markSubscriptionCompleted(completedSubscription.id);
    }
    
    navigate('/subscriptions?completed=true');
  };

  const comfortLevelMap: { [key: string]: { label: string; color: string } } = {
    'very_uncomfortable': { label: 'Very Uncomfortable', color: 'bg-red-100 text-red-800' },
    'uncomfortable': { label: 'Uncomfortable', color: 'bg-orange-100 text-orange-800' },
    'neutral': { label: 'Neutral', color: 'bg-gray-100 text-gray-800' },
    'somewhat_comfortable': { label: 'Somewhat Comfortable', color: 'bg-yellow-100 text-yellow-800' },
    'comfortable': { label: 'Comfortable', color: 'bg-blue-100 text-blue-800' },
    'very_comfortable': { label: 'Very Comfortable', color: 'bg-green-100 text-green-800' },
  };

  const renderComfortLevel = (level: string | undefined, isFinal: boolean = false) => {
    if (!level) return <span className="text-gray-500">No data</span>;
    const comfort = comfortLevelMap[level] || { label: 'Unknown', color: 'bg-gray-100 text-gray-800' };
    return (
      <Badge className={`${comfort.color} ${isFinal ? 'ring-2 ring-green-300' : ''}`}>
        {comfort.label}
      </Badge>
    );
  };

  const getImprovementIcon = (beforeLevel: string, afterLevel: string) => {
    const levels = ['very_uncomfortable', 'uncomfortable', 'neutral', 'somewhat_comfortable', 'comfortable', 'very_comfortable'];
    const beforeIndex = levels.indexOf(beforeLevel);
    const afterIndex = levels.indexOf(afterLevel);
    
    if (afterIndex > beforeIndex) {
      return <TrendingUp className="w-4 h-4 text-green-600 ml-2" />;
    }
    return null;
  };

  if (loading) {
    return (
      <Layout>
        <Header title="Your Transformation" />
        <div className="min-h-screen bg-light-gray flex items-center justify-center">
          <Loader size="lg" />
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

        {/* Before & After Photos - This will be captured for sharing */}
        {beforeAssessment?.full_body_photo_url && finalAssessment?.full_body_photo_url && (
          <div ref={photoComparisonRef}>
            <Card className="bg-white">
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-xl font-bold text-gray-800 mb-2">Before & After Transformation</CardTitle>
                {completedSubscription?.programs?.name && (
                  <p className="text-sm text-gray-600">{completedSubscription.programs.name} - Completed!</p>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="relative mb-3">
                      <span className="inline-flex items-center justify-center px-4 py-2 rounded-full text-sm font-medium bg-gray-100 text-gray-700 border-2 border-gray-300">
                        Before
                      </span>
                    </div>
                    <img 
                      src={beforeAssessment.full_body_photo_url} 
                      alt="Before" 
                      className="w-full h-48 object-cover rounded-lg border-2 border-gray-200"
                      crossOrigin="anonymous"
                    />
                    <p className="text-xs text-gray-500 mt-2">Start of journey</p>
                  </div>
                  <div className="text-center">
                    <div className="relative mb-3">
                      <span className="inline-flex items-center justify-center px-4 py-2 rounded-full text-sm font-medium bg-green-500 text-white border-2 border-green-400">
                        After
                      </span>
                    </div>
                    <img 
                      src={finalAssessment.full_body_photo_url} 
                      alt="After" 
                      className="w-full h-48 object-cover rounded-lg border-2 border-green-300"
                      crossOrigin="anonymous"
                    />
                    <p className="text-xs text-green-600 mt-2">Journey complete!</p>
                  </div>
                </div>
                <div className="text-center mt-6 space-y-2">
                  <p className="text-lg font-bold text-gray-800">Amazing Progress! 🎉</p>
                  <p className="text-sm text-gray-600">Your dedication has paid off!</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Comfort Level Comparisons */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-primary flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Your Progress Comparison
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Walking 10km Comfort */}
            <div className="space-y-2">
              <h4 className="font-medium text-gray-800">Walking 10km Comfort Level</h4>
              <div className="flex items-center justify-between">
                <div className="text-center flex-1">
                  <p className="text-xs text-gray-500 mb-1">Before</p>
                  {renderComfortLevel(beforeAssessment?.walk_10km_comfort)}
                </div>
                <div className="mx-2 text-gray-400">→</div>
                <div className="text-center flex-1">
                  <p className="text-xs text-gray-500 mb-1">After</p>
                  <div className="flex items-center justify-center">
                    {renderComfortLevel(finalAssessment?.walk_10km_comfort, true)}
                    {beforeAssessment?.walk_10km_comfort && finalAssessment?.walk_10km_comfort && 
                     getImprovementIcon(beforeAssessment.walk_10km_comfort, finalAssessment.walk_10km_comfort)}
                  </div>
                </div>
              </div>
            </div>

            {/* Running 10km Comfort */}
            <div className="space-y-2">
              <h4 className="font-medium text-gray-800">Running 10km Comfort Level</h4>
              <div className="flex items-center justify-between">
                <div className="text-center flex-1">
                  <p className="text-xs text-gray-500 mb-1">Before</p>
                  {renderComfortLevel(beforeAssessment?.run_10km_comfort)}
                </div>
                <div className="mx-2 text-gray-400">→</div>
                <div className="text-center flex-1">
                  <p className="text-xs text-gray-500 mb-1">After</p>
                  <div className="flex items-center justify-center">
                    {renderComfortLevel(finalAssessment?.run_10km_comfort, true)}
                    {beforeAssessment?.run_10km_comfort && finalAssessment?.run_10km_comfort && 
                     getImprovementIcon(beforeAssessment.run_10km_comfort, finalAssessment.run_10km_comfort)}
                  </div>
                </div>
              </div>
            </div>

            {/* Mountain Climbing Comfort */}
            <div className="space-y-2">
              <h4 className="font-medium text-gray-800">Mountain Climbing Comfort Level</h4>
              <div className="flex items-center justify-between">
                <div className="text-center flex-1">
                  <p className="text-xs text-gray-500 mb-1">Before</p>
                  {renderComfortLevel(beforeAssessment?.climb_mountain_comfort)}
                </div>
                <div className="mx-2 text-gray-400">→</div>
                <div className="text-center flex-1">
                  <p className="text-xs text-gray-500 mb-1">After</p>
                  <div className="flex items-center justify-center">
                    {renderComfortLevel(finalAssessment?.climb_mountain_comfort, true)}
                    {beforeAssessment?.climb_mountain_comfort && finalAssessment?.climb_mountain_comfort && 
                     getImprovementIcon(beforeAssessment.climb_mountain_comfort, finalAssessment.climb_mountain_comfort)}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Health Conditions Comparison */}
        {(beforeAssessment?.current_health_conditions || finalAssessment?.current_health_conditions) && (
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="text-primary">Health Conditions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-800 mb-2">Before Journey</h4>
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                  {beforeAssessment?.current_health_conditions || 'No conditions reported'}
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-800 mb-2">After Journey</h4>
                <p className="text-sm text-gray-600 bg-green-50 p-3 rounded-lg border border-green-200">
                  {finalAssessment?.current_health_conditions || 'No conditions reported'}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Comments Comparison */}
        {(beforeAssessment?.comments || finalAssessment?.comments) && (
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="text-primary">Your Journey Reflections</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {beforeAssessment?.comments && (
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">Initial Thoughts</h4>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg italic">
                    "{beforeAssessment.comments}"
                  </p>
                </div>
              )}
              {finalAssessment?.comments && (
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">Final Reflections</h4>
                  <p className="text-sm text-gray-600 bg-green-50 p-3 rounded-lg border border-green-200 italic">
                    "{finalAssessment.comments}"
                  </p>
                </div>
              )}
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
              Inspire others by sharing your amazing before & after transformation!
            </p>
            
            <div className="space-y-3">
              <Button 
                onClick={() => handleShare('community')}
                disabled={sharing}
                className="w-full bg-primary hover:bg-primary/90"
              >
                <Users className="w-4 h-4 mr-2" />
                {sharing ? 'Sharing...' : 'Share to Community'}
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
