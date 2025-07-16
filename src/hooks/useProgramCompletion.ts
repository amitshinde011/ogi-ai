
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useUserData } from '@/contexts/UserDataContext';
import { getLocalDateString } from '@/utils/dateUtils';

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
  const [checkingAssessment, setCheckingAssessment] = useState(false);
  const { user } = useAuth();
  const { userSubscriptions, loading: userDataLoading } = useUserData();
  const isInitialLoad = useRef(true);

  useEffect(() => {
    checkProgramCompletion();
  }, [userSubscriptions, user]);

  const checkProgramCompletion = async () => {
    if (!user || userDataLoading) {
      return;
    }
    
    // Only set loading state for initial load
    if (isInitialLoad.current) {
      setCheckingAssessment(true);
    }
    
    try {
      const today = getLocalDateString();
      
      // Find completed subscription from context data
      const completedSub = userSubscriptions.find(sub => {
        return sub.status === 'active' && sub.end_date < today;
      });

      if (completedSub) {
        // Check if final assessment is already completed
        const { data: finalAssessment } = await supabase
          .from('final_assessments')
          .select('id')
          .eq('user_id', user.id)
          .eq('subscription_id', completedSub.id)
          .maybeSingle();

        setIsCompleted(true);
        setCompletedSubscription(completedSub as CompletedSubscription);
        setHasFinalAssessment(!!finalAssessment);
      } else {
        setIsCompleted(false);
        setCompletedSubscription(null);
        setHasFinalAssessment(false);
      }
    } catch (error) {
      console.error('Error checking program completion:', error);
    } finally {
      // Only update loading state if it was an initial load
      if (isInitialLoad.current) {
        setCheckingAssessment(false);
        isInitialLoad.current = false;
      }
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
    loading: userDataLoading || checkingAssessment, 
    checkProgramCompletion,
    markSubscriptionCompleted
  };
};
