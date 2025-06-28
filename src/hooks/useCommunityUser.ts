
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useCommunityUser = () => {
  const [currentUser, setCurrentUser] = useState<any>(null);

  const fetchCurrentUser = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      
      if (user) {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('name, profile_photo_url')
          .eq('user_id', user.id)
          .single();

        setCurrentUser({
          id: user.id,
          email: user.email,
          name: profile?.name || user.email?.split('@')[0] || 'Anonymous',
          profile_photo_url: profile?.profile_photo_url
        });
      }
    } catch (error) {
      console.error('Error fetching current user:', error);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  return { currentUser, fetchCurrentUser };
};
