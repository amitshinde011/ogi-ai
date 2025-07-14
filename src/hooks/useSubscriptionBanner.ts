
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useSubscriptionBanner = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    checkSubscriptionStatus();
  }, []);

  const checkSubscriptionStatus = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    try {

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
