
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Share2, MessageCircle, ArrowLeft } from 'lucide-react';
import Layout from '@/components/Layout';
import Header from '@/components/Header';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface BeforeAfterData {
  before: any;
  after: any;
  comparison: any;
}

const Comparison = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [data, setData] = useState<BeforeAfterData | null>(null);
  const [loading, setLoading] = useState(true);
  const [sharing, setSharing] = useState(false);

  useEffect(() => {
    fetchComparisonData();
  }, []);

  const fetchComparisonData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const finalAssessmentId = location.state?.finalAssessmentId;
      if (!finalAssessmentId) {
        navigate('/home');
        return;
      }

      // Get final assessment
      const { data: finalAssessment } = await supabase
        .from('final_assessments')
        .select('*')
        .eq('id', finalAssessmentId)
        .single();

      if (!finalAssessment) throw new Error('Final assessment not found');

      // Get before assessment
      const { data: beforeAssessment } = await supabase
        .from('journey_assessments')
        .select('*')
        .eq('user_id', user.id)
        .eq('subscription_id', finalAssessment.subscription_id)
        .eq('assessment_type', 'before')
        .maybeSingle();

      // Create or get comparison record
      let { data: comparison } = await supabase
        .from('assessment_comparisons')
        .select('*')
        .eq('user_id', user.id)
        .eq('final_assessment_id', finalAssessmentId)
        .maybeSingle();

      if (!comparison) {
        const { data: newComparison } = await supabase
          .from('assessment_comparisons')
          .insert({
            user_id: user.id,
            subscription_id: finalAssessment.subscription_id,
            before_assessment_id: beforeAssessment?.id,
            final_assessment_id: finalAssessmentId
          })
          .select()
          .single();
        comparison = newComparison;
      }

      setData({
        before: beforeAssessment,
        after: finalAssessment,
        comparison
      });
    } catch (error) {
      console.error('Error fetching comparison data:', error);
      toast({
        title: "Error",
        description: "Failed to load comparison data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const shareToSocial = async () => {
    if (!data) return;
    
    try {
      setSharing(true);
      
      // Update comparison record
      await supabase
        .from('assessment_comparisons')
        .update({ shared_to_social: true })
        .eq('id', data.comparison.id);

      const shareText = "Check out my amazing wellness transformation! 🌟";
      const shareUrl = window.location.origin;

      if (navigator.share) {
        await navigator.share({
          title: 'My Wellness Journey',
          text: shareText,
          url: shareUrl,
        });
      } else {
        // Fallback for browsers that don't support Web Share API
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
        window.open(twitterUrl, '_blank');
      }

      toast({
        title: "Shared Successfully!",
        description: "Your transformation has been shared.",
      });
    } catch (error) {
      console.error('Error sharing:', error);
      toast({
        title: "Error",
        description: "Failed to share. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSharing(false);
    }
  };

  const shareToCommunity = async () => {
    if (!data) return;

    try {
      setSharing(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      // Create community post
      await supabase
        .from('community_posts')
        .insert({
          user_id: user.id,
          title: 'My Wellness Transformation Journey! 🌟',
          content: 'I just completed my wellness program and wanted to share my amazing progress with the community! The journey has been incredible and I feel so much better than when I started.',
          image_url: data.after.full_body_photo_url
        });

      // Update comparison record
      await supabase
        .from('assessment_comparisons')
        .update({ shared_to_community: true })
        .eq('id', data.comparison.id);

      toast({
        title: "Posted to Community!",
        description: "Your transformation has been shared with the community.",
      });

      navigate('/community');
    } catch (error) {
      console.error('Error sharing to community:', error);
      toast({
        title: "Error",
        description: "Failed to post to community. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSharing(false);
    }
  };

  const getComfortLevelText = (level: string) => {
    const levels = {
      'very_comfortable': 'Very Comfortable',
      'comfortable': 'Comfortable',
      'somewhat_comfortable': 'Somewhat Comfortable',
      'uncomfortable': 'Uncomfortable',
      'very_uncomfortable': 'Very Uncomfortable'
    };
    return levels[level as keyof typeof levels] || level;
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

  if (!data) {
    return (
      <Layout>
        <Header title="Your Transformation" />
        <div className="min-h-screen bg-light-gray p-4">
          <div className="max-w-md mx-auto text-center mt-8">
            <p className="text-gray-600">No comparison data available.</p>
            <Button onClick={() => navigate('/home')} className="mt-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Header title="Your Amazing Transformation!" />
      
      <div className="min-h-screen bg-light-gray p-4">
        <div className="max-w-md mx-auto space-y-6">
          {/* Photos Comparison */}
          {(data.before?.full_body_photo_url || data.after.full_body_photo_url) && (
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="text-center text-primary">Photo Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-600 mb-2">Before</p>
                    {data.before?.full_body_photo_url ? (
                      <img 
                        src={data.before.full_body_photo_url} 
                        alt="Before" 
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                        <p className="text-gray-400 text-sm">No photo</p>
                      </div>
                    )}
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-600 mb-2">After</p>
                    {data.after.full_body_photo_url ? (
                      <img 
                        src={data.after.full_body_photo_url} 
                        alt="After" 
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                        <p className="text-gray-400 text-sm">No photo</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Comfort Levels Comparison */}
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="text-center text-primary">Progress Comparison</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="font-medium">Walking 10km Comfort</p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Before: </span>
                    <span>{data.before ? getComfortLevelText(data.before.walk_10km_comfort) : 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">After: </span>
                    <span className="text-green-600 font-medium">{getComfortLevelText(data.after.walk_10km_comfort)}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <p className="font-medium">Running 10km Comfort</p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Before: </span>
                    <span>{data.before ? getComfortLevelText(data.before.run_10km_comfort) : 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">After: </span>
                    <span className="text-green-600 font-medium">{getComfortLevelText(data.after.run_10km_comfort)}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <p className="font-medium">Mountain Climbing Comfort</p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Before: </span>
                    <span>{data.before ? getComfortLevelText(data.before.climb_mountain_comfort) : 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">After: </span>
                    <span className="text-green-600 font-medium">{getComfortLevelText(data.after.climb_mountain_comfort)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Comments */}
          {data.after.comments && (
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="text-center text-primary">Your Reflection</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 italic">"{data.after.comments}"</p>
              </CardContent>
            </Card>
          )}

          {/* Share Buttons */}
          <div className="space-y-3">
            <Button
              onClick={shareToCommunity}
              className="w-full bg-gradient-sage text-white"
              disabled={sharing}
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              {sharing ? 'Sharing...' : 'Share with Community'}
            </Button>

            <Button
              onClick={shareToSocial}
              variant="outline"
              className="w-full"
              disabled={sharing}
            >
              <Share2 className="w-4 h-4 mr-2" />
              {sharing ? 'Sharing...' : 'Share on Social Media'}
            </Button>

            <Button
              onClick={() => navigate('/home')}
              variant="ghost"
              className="w-full"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Comparison;
