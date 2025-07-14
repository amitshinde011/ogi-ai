import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Calendar, ArrowRight, Clock, Info, Compass, Heart, Sparkles, Hammer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { useToast } from '@/components/ui/use-toast';
import Layout from '@/components/Layout';
import Header from '@/components/Header';
import Loader from '@/components/ui/loader';
import PhotoUpload from '@/components/PhotoUpload';
import { supabase } from '@/integrations/supabase/client';
import { useOnboarding } from '@/hooks/useOnboarding';
import ComfortQuestionsSection from '@/components/assessment/ComfortQuestionsSection';
import HealthConditionsSection from '@/components/assessment/HealthConditionsSection';
import { useR2Upload } from '@/hooks/useR2Upload';
import { useAuth } from '@/contexts/AuthContext';

interface AssessmentFormData {
  walk_10km_comfort: number;
  run_10km_comfort: number;
  climb_mountain_comfort: number;
  current_health_conditions: string;
  comments: string;
}

const BeforeAssessment = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { updateOnboardingState } = useOnboarding();
  const [loading, setLoading] = useState(false);
  const [currentSubscription, setCurrentSubscription] = useState<any>(null);
  const [selectedStartDate, setSelectedStartDate] = useState('');
  const [showDateSelection, setShowDateSelection] = useState(false);
  const [assessmentCompleted, setAssessmentCompleted] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [fieldMessages, setFieldMessages] = useState<{[key: string]: string}>({});
  const { uploadToR2, uploading } = useR2Upload();
  const { user } = useAuth();

  const form = useForm<AssessmentFormData>({
    defaultValues: {
      walk_10km_comfort: 3,
      run_10km_comfort: 3,
      climb_mountain_comfort: 3,
      current_health_conditions: '',
      comments: ''
    }
  });

  useEffect(() => {
    checkSubscriptionAndAssessment();
  }, []);

  useEffect(() => {
    if (showDateSelection && assessmentCompleted) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [showDateSelection, assessmentCompleted]);

  const checkSubscriptionAndAssessment = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    try {
      console.log('In BA page');
      const today = new Date().toISOString().split('T')[0];
      console.log('In BA pager: ',today);
      // Get active subscription
      const { data: subscription } = await supabase
        .from('user_subscriptions')
        .select('*, programs(*)')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .or('end_date.is.null,end_date.gte.' + today)
        .maybeSingle();
      console.log('Subscription ',subscription);
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
        form.reset({
          walk_10km_comfort: parseInt(existingAssessment.walk_10km_comfort),
          run_10km_comfort: parseInt(existingAssessment.run_10km_comfort),
          climb_mountain_comfort: parseInt(existingAssessment.climb_mountain_comfort),
          current_health_conditions: existingAssessment.current_health_conditions,
          comments: existingAssessment.comments
        });
        setImagePreview(existingAssessment.full_body_photo_url || '');
        
        // If start_date is not set, show date selection
        if (!subscription.start_date) {
          setShowDateSelection(true);
        } else {
          // Check if start date has arrived
          const startDate = new Date(subscription.start_date + 'T00:00:00');
          const todayDate = new Date(today + 'T00:00:00');
          
          if (todayDate >= startDate) {
            // Update onboarding and navigate to journey start
            await updateOnboardingState({ before_assessment_completed: true });
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

  const handleImageSelect = (file: File) => {
    setSelectedImage(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
    
    if (!fieldMessages.photo) {
      setFieldMessages(prev => ({
        ...prev,
        photo: "Great! This photo will help track your amazing transformation journey."
      }));
    }
  };

  const handleImageRemove = () => {
    setSelectedImage(null);
    setImagePreview('');
    setFieldMessages(prev => {
      const { photo, ...rest } = prev;
      return rest;
    });
  };

  const handleSliderChange = (field: string, value: number) => {
    form.setValue(field as any, value);
    
    if (!fieldMessages[field]) {
      const messages = {
        walk_10km_comfort: "Perfect! This baseline will help us see your amazing progress.",
        run_10km_comfort: "Excellent! We'll track how your confidence grows throughout the journey.",
        climb_mountain_comfort: "Wonderful! This will be a great reference point for your improvement."
      };
      
      if (messages[field as keyof typeof messages]) {
        setFieldMessages(prev => ({
          ...prev,
          [field]: messages[field as keyof typeof messages]
        }));
      }
    }
  };

  const handleHealthConditionsChange = (field: string, value: string) => {
    if (value.trim() && !fieldMessages[field]) {
      const messages = {
        current_health_conditions: "Thank you for sharing. This information helps us personalize your journey.",
        comments: "Your thoughts are valuable and will help us support you better throughout this journey!"
      };
      
      if (messages[field as keyof typeof messages]) {
        setFieldMessages(prev => ({
          ...prev,
          [field]: messages[field as keyof typeof messages]
        }));
      }
    }
  };

  const handleSubmitAssessment = async (data: AssessmentFormData) => {
    if (!user || !currentSubscription) return;
    
    setLoading(true);
    try {

      let imageUrl = null;
      if (selectedImage) {
        const uploadResult = await uploadToR2(selectedImage, 'community');
        if (!uploadResult) {
          setLoading(false);
          return;
        }
        imageUrl = uploadResult.imageUrl;
      } else if (imagePreview) {
        imageUrl = imagePreview;
      }

      const { error } = await supabase
        .from('journey_assessments')
        .insert({
          user_id: user.id,
          subscription_id: currentSubscription.id,
          assessment_type: 'before',
          walk_10km_comfort: data.walk_10km_comfort.toString(),
          run_10km_comfort: data.run_10km_comfort.toString(),
          climb_mountain_comfort: data.climb_mountain_comfort.toString(),
          current_health_conditions: data.current_health_conditions,
          comments: data.comments,
          full_body_photo_url: imageUrl
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

    const selectedDate = new Date(selectedStartDate + 'T00:00:00');
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

    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 7);
    if (selectedDate > maxDate) {
      toast({
        title: "Invalid Date",
        description: "Start date must be within the next 7 days.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      if (!user || !currentSubscription) return;

      // Calculate end date (inclusive - so duration_days from start date)
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

      // Update onboarding state
      await updateOnboardingState({ before_assessment_completed: true });

      toast({
        title: "Journey Scheduled!",
        description: `Your journey will start on ${new Date(selectedStartDate).toLocaleDateString()} and end on ${endDate.toLocaleDateString()} (inclusive).`,
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
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 7);
    return maxDate.toISOString().split('T')[0];
  };

  if (showDateSelection && assessmentCompleted) {
    const daysUntil = getDaysUntilStart();
    
    return (
      <Layout>
        <Header title="Schedule Your Journey" />
        
        <div className="p-4 space-y-6 max-w-md mx-auto bg-light-gray min-h-screen">
          {/* Sacred Journey Message */}
          <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 border border-emerald-200/60 rounded-2xl p-8 shadow-lg backdrop-blur-sm">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-md">
                <Compass className="w-10 h-10 text-emerald-700" />
              </div>
              <h2 className="text-3xl font-bold text-emerald-900 mb-4 tracking-tight">A Sacred Threshold</h2>
              <div className="w-24 h-1 bg-gradient-to-r from-emerald-400 to-teal-400 mx-auto rounded-full"></div>
            </div>
            
              <div className="space-y-6">
                <div className="p-6 bg-white/70 rounded-xl border border-emerald-100/80 backdrop-blur-sm text-center">
                  <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Compass className="w-6 h-6 text-emerald-600" />
                  </div>
                  <p className="text-base leading-relaxed text-emerald-800 font-medium">
                    Before you begin this journey, take a moment. Stand at the threshold and quiet your mind. 
                    The path you are about to walk is powerful—it holds the potential to rejuvenate your body, 
                    clarify your mind, and restore a youthful energy you may have thought was lost.
                  </p>
                </div>
                
                <div className="p-6 bg-white/70 rounded-xl border border-emerald-100/80 backdrop-blur-sm text-center">
                  <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Heart className="w-6 h-6 text-emerald-600" />
                  </div>
                  <p className="text-base leading-relaxed text-emerald-800 font-medium">
                    We ask for your patience and your persistence, but more than that, we ask for your commitment. 
                    It is perfectly okay to take your time before you say 'yes.' But once you begin, make a sacred 
                    contract with yourself: to see this through to completion, without looking back.
                  </p>
                </div>
                
                <div className="p-6 bg-white/70 rounded-xl border border-emerald-100/80 backdrop-blur-sm text-center">
                  <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-6 h-6 text-emerald-600" />
                  </div>
                  <p className="text-base leading-relaxed text-emerald-800 font-medium">
                    A new world of vibrant health, energy, and joy is waiting for you on the other side.
                  </p>
                </div>
              
              <div className="p-6 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-xl border border-emerald-200 text-center">
                <div className="w-12 h-12 bg-emerald-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Hammer className="w-6 h-6 text-emerald-700" />
                </div>
                <p className="text-lg font-bold text-emerald-900 leading-relaxed tracking-wide">
                  You have the power to build it.
                </p>
              </div>
            </div>
          </div>

          <Card className="text-center">
            <CardHeader>
              <CardTitle className="flex items-center justify-center gap-2">
                <Calendar className="w-6 h-6 text-primary" />
                Choose Your Start Date
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-gray-600">
                Your assessment is complete! Now select when you'd like to begin your {currentSubscription?.programs?.name} journey.
              </p>

              {/* Week restriction message */}
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                <div className="text-orange-800 text-sm">
                  <p className="font-medium mb-1 flex items-center gap-1">
                    <Info className="w-4 h-4" />
                    Important:
                  </p>
                  <p>You must start your journey within the next 7 days to maintain your subscription. Please select a date from today to next week.</p>
                </div>
              </div>

              <div className="space-y-4">
                <input
                  type="date"
                  value={selectedStartDate}
                  onChange={(e) => setSelectedStartDate(e.target.value)}
                  min={getMinDate()}
                  max={getMaxDate()}
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
                      <Loader size="sm" className="border-white border-t-transparent mr-2" />
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
                <div className="text-yellow-800 text-sm">
                  <p className="font-medium mb-1 flex items-center gap-1">
                    <Info className="w-4 h-4" />
                    Important:
                  </p>
                  <p>You can change your start date anytime before it arrives. Once your journey begins, the date cannot be modified. The end date is inclusive - your program runs through the final day.</p>
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Header title="Before Assessment" />
      
      <div className="min-h-screen bg-gradient-peaceful p-4">
        <div className="max-w-md mx-auto">
          <Card className="bg-white shadow-xl border-0">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl font-bold text-primary mb-2">How do you feel right now?</CardTitle>
              <p className="text-gray-600">
                Let's establish your baseline to track your amazing progress!
              </p>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmitAssessment)} className="space-y-8">
                  {/* Photo Upload */}
                  <div>
                    <PhotoUpload
                      selectedImage={imagePreview}
                      onImageSelect={handleImageSelect}
                      onImageRemove={handleImageRemove}
                      uploading={uploading}
                      title="Starting Photo"
                      description="Capture your beginning to see your transformation!"
                    />
                    {fieldMessages.photo && (
                      <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm text-green-700 flex items-center">
                          <span className="mr-2">✓</span>
                          {fieldMessages.photo}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Comfort Level Questions with Sliders */}
                  <ComfortQuestionsSection 
                    control={form.control} 
                    onSliderChange={handleSliderChange}
                    fieldMessages={fieldMessages}
                  />

                  {/* Health Conditions and Comments */}
                  <HealthConditionsSection 
                    control={form.control}
                    onFieldChange={handleHealthConditionsChange}
                    fieldMessages={fieldMessages}
                  />

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-primary to-sage text-white py-3 text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                    disabled={loading || uploading}
                  >
                    {loading ? 'Saving Assessment...' : uploading ? 'Uploading Photo...' : 'Complete Assessment'}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BeforeAssessment;
