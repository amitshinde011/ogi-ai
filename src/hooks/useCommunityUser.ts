
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useCommunityUser = () => {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const { user } = useAuth();

  const fetchCurrentUser = async () => {
    try {
      if (!user) return;
      
      // First try to get from user_profiles
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('name, profile_photo_url')
        .eq('user_id', user.id)
        .maybeSingle();
      
      // If not found, try to get from automation_users
      if (!profile) {
        const { data: automationUser } = await supabase
          .from('automation_users')
          .select('name, profile_photo_url')
          .eq('user_id', user.id)
          .maybeSingle();
          
        if (automationUser) {
          setCurrentUser({
            id: user.id,
            email: user.email,
            name: automationUser.name,
            profile_photo_url: automationUser.profile_photo_url
          });
          return;
        }
      }

      setCurrentUser({
        id: user.id,
        email: user.email,
        name: profile?.name || user.email?.split('@')[0] || 'Anonymous',
        profile_photo_url: profile?.profile_photo_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`
      });
    } catch (error) {
      console.error('Error fetching current user:', error);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, [user]);

  return { currentUser, fetchCurrentUser };
};
