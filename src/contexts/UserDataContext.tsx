import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { getLocalDateString } from '@/utils/dateUtils';

interface UserProfile {
  id: string;
  name: string | null;
  profile_photo_url: string | null;
  age: number | null;
  gender: string | null;
  height: number | null;
  weight: number | null;
  health_issues: string | null;
  physical_activity_basic: string | null;
  physical_activity_medium: string | null;
  physical_activity_intense: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
}

interface UserSubscription {
  id: string;
  user_id: string;
  program_id: string;
  status: string;
  payment_status: string;
  start_date: string;
  end_date: string;
  created_at: string;
  updated_at: string;
  programs?: {
    id: string;
    name: string;
    duration_days: number;
    price: number;
    price_inr: number;
    features: string[];
    benefits: string[];
    description: string;
  };
}

interface UserDataContextType {
  userProfile: UserProfile | null;
  userSubscriptions: UserSubscription[];
  currentSubscription: UserSubscription | null;
  hasActiveSubscription: boolean;
  loading: boolean;
  refreshUserData: () => Promise<void>;
  refreshSubscriptions: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const UserDataContext = createContext<UserDataContextType | undefined>(undefined);

interface UserDataProviderProps {
  children: ReactNode;
}

export const UserDataProvider = ({ children }: UserDataProviderProps) => {
  const { user, isAuthenticated } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userSubscriptions, setUserSubscriptions] = useState<UserSubscription[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchUserProfile = useCallback(async () => {
    if (!user || loading) return;
    
    setLoading(true);
    try {
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      setUserProfile(profile);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setLoading(false);
    }
  }, [user, loading]);

  const fetchUserSubscriptions = useCallback(async () => {
    if (!user) return;
    
    try {
      const { data: subscriptions } = await supabase
        .from('user_subscriptions')
        .select(`
          *,
          programs (
            id,
            name,
            duration_days,
            price,
            price_inr,
            features,
            benefits,
            description
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      setUserSubscriptions(subscriptions || []);
    } catch (error) {
      console.error('Error fetching user subscriptions:', error);
    }
  }, [user]);

  const refreshUserData = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      await Promise.all([
        fetchUserProfile(),
        fetchUserSubscriptions()
      ]);
    } catch (error) {
      console.error('Error refreshing user data:', error);
    } finally {
      setLoading(false);
    }
  }, [user, fetchUserProfile, fetchUserSubscriptions]);

  const refreshSubscriptions = useCallback(async () => {
    await fetchUserSubscriptions();
  }, [fetchUserSubscriptions]);

  const refreshProfile = useCallback(async () => {
    await fetchUserProfile();
  }, [fetchUserProfile]);

  // Load user data when user becomes authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      refreshUserData();
    } else {
      // Clear data when user logs out
      setUserProfile(null);
      setUserSubscriptions([]);
    }
  }, [isAuthenticated, user, refreshUserData]);

  // Calculate current subscription and active status
  const currentSubscription = userSubscriptions.find(sub => {
    const today = getLocalDateString();
    return sub.status === 'active' && sub.end_date >= today;
  }) || null;

  const hasActiveSubscription = !!currentSubscription;

  const value: UserDataContextType = {
    userProfile,
    userSubscriptions,
    currentSubscription,
    hasActiveSubscription,
    loading,
    refreshUserData,
    refreshSubscriptions,
    refreshProfile,
  };

  return (
    <UserDataContext.Provider value={value}>
      {children}
    </UserDataContext.Provider>
  );
};

export const useUserData = (): UserDataContextType => {
  const context = useContext(UserDataContext);
  if (context === undefined) {
    throw new Error('useUserData must be used within a UserDataProvider');
  }
  return context;
};