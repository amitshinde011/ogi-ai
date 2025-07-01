import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, ArrowRight, Clock, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import Layout from '@/components/Layout';
import Header from '@/components/Header';
import { supabase } from '@/integrations/supabase/client';
import { useOnboarding } from '@/hooks/useOnboarding';
import ComfortQuestionsSection from '@/components/assessment/ComfortQuestionsSection';
import HealthConditionsSection from '@/components/assessment/HealthConditionsSection';
import PhotoUploadSection from '@/components/assessment/PhotoUploadSection';

const BeforeAssessment = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { updateOnboardingState } = useOnboarding();
  const [loading, setLoading] = useState(false);
  const [currentSubscription, setCurrentSubscription] = useState<any>(null);
  const [selectedStartDate, setSelectedStartDate] = useState('');
  const [showDateSelection, setShowDateSelection] = useState(false);
  const [assessmentCompleted, setAssessmentCompleted] = useState(false);
  
  // Assessment form data
  const [formData, setFormData] = useState({
    walk_10km_comfort: '',
    run_10km_comfort: '',
    climb_mountain_comfort: '',
    current_health_conditions: '',
    comments: '',
    full_body_photo_url: ''
  });

  useEffect(() => {
    checkSubscriptionAndAssessment();
  }, []);

  const checkSubscriptionAndAssessment = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }

      const today = new Date().toISOString().split('T')[0];

      // Get active subscription
      const { data: subscription } = await supabase
        .from('user_subscriptions')
        .select('*, programs(*)')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .gte('end_date', today)
        .maybeSingle();

      if (!subscription) {
        navigate('/subscriptions');
        return;
      }

      setCurrentSubscription(subscription);

      // Check if assessment already exists
      const { data: existingAssessment } = await supabase
        .from('journey_assessments')
        .select('*')
        .eq('user_id', user.id)
        .eq('subscription_id', subscription.id)
        .eq('assessment_type', 'before')
        .maybeSingle();

      if (existingAssessment) {
        setAssessmentCompleted(true);
        setFormData(existingAssessment);
        
        // If start_date is not set, show date selection
        if (!subscription.start_date) {
          setShowDateSelection(true);
        } else {
          // Check if start date has arrived
          const startDate = new Date(subscription.start_date);
          const todayDate = new Date(today);
          
          if (todayDate >= startDate) {
            navigate('/journey-start');
          } else {
            setShowDateSelection(true);
            setSelectedStartDate(subscription.start_date);
          }
        }
      }
    } catch (error) {
      console.error('Error checking subscription and assessment:', error);
      toast({
        title: "Error",
        description: "Failed to load assessment data.",
        variant: "destructive",
      });
    }
  };

  const handleSubmitAssessment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.walk_10km_comfort || !formData.run_10km_comfort || !formData.climb_mountain_comfort) {
      toast({
        title: "Missing Information",
        description: "Please complete all comfort level questions.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !currentSubscription) return;

      const { error } = await supabase
        .from('journey_assessments')
        .insert({
          user_id: user.id,
          subscription_id: currentSubscription.id,
          assessment_type: 'before',
          ...formData
        });

      if (error) throw error;

      await updateOnboardingState({ before_assessment_completed: true });
      setAssessmentCompleted(true);
      setShowDateSelection(true);

      toast({
        title: "Assessment Completed!",
        description: "Now select your journey start date.",
      });
    } catch (error) {
      console.error('Error saving assessment:', error);
      toast({
        title: "Error",
        description: "Failed to save assessment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDateSubmit = async () => {
    if (!selectedStartDate) {
      toast({
        title: "Date Required",
        description: "Please select a start date for your journey.",
        variant: "destructive",
      });
      return;
    }

    const selectedDate = new Date(selectedStartDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      toast({
        title: "Invalid Date",
        description: "Start date cannot be in the past.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !currentSubscription) return;

      // Calculate end date
      const endDate = new Date(selectedDate);
      endDate.setDate(endDate.getDate() + currentSubscription.programs.duration_days);

      const { error } = await supabase
        .from('user_subscriptions')
        .update({
          start_date: selectedStartDate,
          end_date: endDate.toISOString().split('T')[0]
        })
        .eq('id', currentSubscription.id);

      if (error) throw error;

      toast({
        title: "Journey Scheduled!",
        description: `Your journey will start on ${new Date(selectedStartDate).toLocaleDateString()}.`,
      });

      // Check if start date is today
      const todayStr = new Date().toISOString().split('T')[0];
      if (selectedStartDate === todayStr) {
        navigate('/journey-start');
      } else {
        // Stay on this page until start date arrives
        window.location.reload();
      }
    } catch (error) {
      console.error('Error setting start date:', error);
      toast({
        title: "Error",
        description: "Failed to set start date. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getDaysUntilStart = () => {
    if (!selectedStartDate) return 0;
    const startDate = new Date(selectedStartDate);
    const today = new Date();
    const diffTime = startDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  if (showDateSelection && assessmentCompleted) {
    const daysUntil = getDaysUntilStart();
    
    return (
      <Layout>
        <Header title="Schedule Your Journey" />
        
        <div className="p-4 space-y-6 max-w-md mx-auto bg-light-gray min-h-screen">
          <Card className="text-center">
            <CardHeader>
              <CardTitle className="flex items-center justify-center gap-2">
                <Calendar className="w-6 h-6 text-primary" />
                Choose Your Start Date
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-gray-600">
                Your assessment is complete! Now select when you'd like to begin your 
                {currentSubscription?.programs?.duration_days}-day {currentSubscription?.programs?.name} journey.
              </p>

              <div className="space-y-4">
                <input
                  type="date"
                  value={selectedStartDate}
                  onChange={(e) => setSelectedStartDate(e.target.value)}
                  min={getMinDate()}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />

                {selectedStartDate && daysUntil > 0 && (
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 text-blue-700">
                      <Clock className="w-5 h-5" />
                      <span className="font-medium">
                        {daysUntil} {daysUntil === 1 ? 'day' : 'days'} until your journey begins
                      </span>
                    </div>
                  </div>
                )}

                {selectedStartDate && daysUntil === 0 && (
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2 text-green-700">
                      <ArrowRight className="w-5 h-5" />
                      <span className="font-medium">Your journey starts today!</span>
                    </div>
                  </div>
                )}

                <Button 
                  onClick={handleDateSubmit} 
                  disabled={loading || !selectedStartDate}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 mr-2 animate-spin rounded-full border-b-2 border-white" />
                      Setting Date...
                    </>
                  ) : (
                    <>
                      Confirm Start Date
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <div className="flex items-start gap-2 text-yellow-800">
                  <Info className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium mb-1">Important:</p>
                    <p>You can change your start date anytime before it arrives. Once your journey begins, the date cannot be modified.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  if (assessmentCompleted) {
    return (
      <Layout>
        <Header title="Assessment Complete" />
        
        <div className="p-4 space-y-6 max-w-md mx-auto bg-light-gray min-h-screen">
          <Card className="text-center">
            <CardContent className="p-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ArrowRight className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Assessment Complete!</h2>
              <p className="text-gray-600 mb-4">
                Your journey will begin soon. Please wait for your start date.
              </p>
              {currentSubscription?.start_date && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-700">
                    Journey starts: {new Date(currentSubscription.start_date).toLocaleDateString()}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Header title="Before Assessment" />
      
      <div className="p-4 space-y-6 max-w-md mx-auto bg-light-gray min-h-screen">
        <Card>
          <CardHeader>
            <CardTitle>Pre-Journey Assessment</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-6">
              Let's establish your baseline before starting your wellness journey. 
              This helps us track your amazing progress!
            </p>

            <form onSubmit={handleSubmitAssessment} className="space-y-6">
              <ComfortQuestionsSection 
                formData={formData} 
                setFormData={setFormData} 
              />
              
              <HealthConditionsSection 
                formData={formData} 
                setFormData={setFormData} 
              />

              <PhotoUploadSection 
                formData={formData} 
                setFormData={setFormData} 
              />

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Additional Comments (Optional)
                </label>
                <textarea
                  value={formData.comments}
                  onChange={(e) => setFormData(prev => ({ ...prev, comments: e.target.value }))}
                  placeholder="Share any thoughts, goals, or concerns about your wellness journey..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                  rows={4}
                />
              </div>

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? (
                  <>
                    <div className="w-4 h-4 mr-2 animate-spin rounded-full border-b-2 border-white" />
                    Saving Assessment...
                  </>
                ) : (
                  <>
                    Complete Assessment
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default BeforeAssessment;
