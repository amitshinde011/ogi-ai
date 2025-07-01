
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useSubscriptionBanner = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkSubscriptionStatus();
  }, []);

  const checkSubscriptionStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const today = new Date().toISOString().split('T')[0];

      // Check if user has any active subscription
      const { data: activeSubscription } = await supabase
        .from('user_subscriptions')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .gte('end_date', today)
        .maybeSingle();

      setShowBanner(!activeSubscription);
    } catch (error) {
      console.error('Error checking subscription status:', error);
      setShowBanner(true); // Show banner on error to be safe
    } finally {
      setLoading(false);
    }
  };

  return { showBanner, loading };
};
