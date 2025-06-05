
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useProgramCompletion = () => {
  const [isCompleted, setIsCompleted] = useState(false);
  const [completedSubscription, setCompletedSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkProgramCompletion();
  }, []);

  const checkProgramCompletion = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const today = new Date().toISOString().split('T')[0];
      
      // Get active subscription that has ended
      const { data: subscription } = await supabase
        .from('user_subscriptions')
        .select('*, programs(*)')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .lte('end_date', today)
        .maybeSingle();

      if (subscription) {
        // Check if final assessment is already completed
        const { data: finalAssessment } = await supabase
          .from('final_assessments')
          .select('id')
          .eq('user_id', user.id)
          .eq('subscription_id', subscription.id)
          .maybeSingle();

        if (!finalAssessment) {
          setIsCompleted(true);
          setCompletedSubscription(subscription);
        }
      }
    } catch (error) {
      console.error('Error checking program completion:', error);
    } finally {
      setLoading(false);
    }
  };

  return { isCompleted, completedSubscription, loading, checkProgramCompletion };
};
