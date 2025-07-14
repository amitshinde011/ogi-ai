
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface CompletedSubscription {
  id: string;
  start_date: string;
  end_date: string;
  status: string;
  programs: {
    name: string;
    duration_days: number;
  };
}

export const useProgramCompletion = () => {
  const [isCompleted, setIsCompleted] = useState(false);
  const [completedSubscription, setCompletedSubscription] = useState<CompletedSubscription | null>(null);
  const [hasFinalAssessment, setHasFinalAssessment] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    checkProgramCompletion();
  }, []);

  const checkProgramCompletion = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    try {

      const today = new Date().toISOString().split('T')[0];
      const todayDate = new Date(today);
      
      // Get active subscription that has ended (end date is inclusive, so program ends the day after)
      const { data: subscription } = await supabase
        .from('user_subscriptions')
        .select('*, programs(*)')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .lt('end_date', today) // Program completes the day after end date
        .maybeSingle();

      if (subscription) {
        // Check if final assessment is already completed
        const { data: finalAssessment } = await supabase
          .from('final_assessments')
          .select('id')
          .eq('user_id', user.id)
          .eq('subscription_id', subscription.id)
          .maybeSingle();

        setIsCompleted(true);
        setCompletedSubscription(subscription);
        setHasFinalAssessment(!!finalAssessment);
      }
    } catch (error) {
      console.error('Error checking program completion:', error);
    } finally {
      setLoading(false);
    }
  };

  const markSubscriptionCompleted = async (subscriptionId: string) => {
    try {
      const { error } = await supabase
        .from('user_subscriptions')
        .update({ status: 'completed' })
        .eq('id', subscriptionId);

      if (error) {
        console.error('Error marking subscription as completed:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error marking subscription as completed:', error);
      return false;
    }
  };

  return { 
    isCompleted, 
    completedSubscription, 
    hasFinalAssessment, 
    loading, 
    checkProgramCompletion,
    markSubscriptionCompleted
  };
};
