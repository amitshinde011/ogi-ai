
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useUserProgram = () => {
  return useQuery({
    queryKey: ['user-current-program'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const today = new Date().toISOString().split('T')[0];
      
      const { data: subscriptions } = await supabase
        .from('user_subscriptions')
        .select('*, programs(*)')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .gte('end_date', today)
        .order('created_at', { ascending: false });

      // Return the most recent active subscription
      return subscriptions && subscriptions.length > 0 ? subscriptions[0] : null;
    },
  });
};
