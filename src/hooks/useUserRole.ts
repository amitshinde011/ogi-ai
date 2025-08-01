import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export type UserRole = 'admin' | 'moderator' | 'user' | null;

export const useUserRole = () => {
  const { user, isAuthenticated } = useAuth();
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user || !isAuthenticated) {
        setUserRole(null);
        setLoading(false);
        return;
      }

      try {
        // Call the get_current_user_role function
        const { data, error } = await supabase.rpc('get_current_user_role');
        
        if (error) {
          console.error('Error fetching user role:', error);
          setUserRole('user'); // Default to user role
        } else {
          setUserRole(data || 'user');
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
        setUserRole('user'); // Default to user role
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, [user, isAuthenticated]);

  const hasRole = (requiredRole: UserRole): boolean => {
    if (!userRole || !requiredRole) return false;
    
    // Admin has access to everything
    if (userRole === 'admin') return true;
    
    // Moderator has access to moderator and user
    if (userRole === 'moderator' && (requiredRole === 'moderator' || requiredRole === 'user')) return true;
    
    // User only has access to user
    return userRole === requiredRole;
  };

  const isAdmin = () => userRole === 'admin';
  const isModerator = () => userRole === 'moderator' || userRole === 'admin';

  return {
    userRole,
    loading,
    hasRole,
    isAdmin,
    isModerator
  };
};