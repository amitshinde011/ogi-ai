
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useUserProgram = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['user-current-program', user?.id],
    queryFn: async () => {
      if (!user) return null;

      const today = new Date().toISOString().split('T')[0];
      
      const { data: subscriptions } = await supabase
        .from('user_subscriptions')
        .select('*, programs(*)')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      // Return the most recent active subscription
      return subscriptions && subscriptions.length > 0 ? subscriptions[0] : null;
    },
  });
};
