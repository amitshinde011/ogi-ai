
import { createContext, useContext, useEffect, useState, ReactNode, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { User, Session } from '@supabase/supabase-js';

interface UserProfile {
  name: string;
  profile_photo_url: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isAuthenticated: boolean;
  signOut: () => Promise<boolean>;
  refreshSession: () => Promise<boolean>;
  requireAuth: () => boolean;
  refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const isAuthenticated = !!user;

  const fetchUserProfile = async (userId: string): Promise<UserProfile> => {
    try {
      console.log('🔍 AuthContext: Fetching profile for user:', userId);
      
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('name, profile_photo_url')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('❌ AuthContext: Supabase error fetching profile:', error);
        throw error;
      }

      console.log('📋 AuthContext: Raw profile data received:', profile);

      // Validate and process the profile data
      const processedProfile = {
        name: profile?.name || 'User',
        profile_photo_url: profile?.profile_photo_url || null
      };

      console.log('✅ AuthContext: Processed profile:', processedProfile);
      return processedProfile;
    } catch (error) {
      console.error('💥 AuthContext: Error fetching user profile:', error);
      return {
        name: 'User',
        profile_photo_url: null
      };
    }
  };

  const refreshUserProfile = async (): Promise<void> => {
    if (!user?.id) {
      console.log('⚠️ AuthContext: No user ID available for profile refresh');
      return;
    }

    console.log('🔄 AuthContext: Manually refreshing user profile');
    try {
      const profile = await fetchUserProfile(user.id);
      setUserProfile(profile);
      console.log('✅ AuthContext: Profile refreshed successfully');
    } catch (error) {
      console.error('❌ AuthContext: Failed to refresh profile:', error);
    }
  };

  useEffect(() => {
    let mounted = true;
    console.log('🚀 AuthContext: Setting up auth state listener');

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) {
        console.log('🚫 AuthContext: Component unmounted, skipping auth state change');
        return;
      }

      console.log('🔐 AuthContext: Auth state changed:', event, session ? 'with session' : 'no session');

      // Set the user and session state from the event
      setUser(session?.user ?? null);
      setSession(session);

      // Handle profile fetching for authenticated sessions
      if (session?.user?.id) {
        console.log('👤 AuthContext: User authenticated, fetching profile...');
        
        // Use setTimeout to avoid blocking the auth state change
        setTimeout(async () => {
          if (mounted) {
            try {
              const profile = await fetchUserProfile(session.user.id);
              if (mounted) {
                setUserProfile(profile);
                console.log('✅ AuthContext: Profile set in state:', profile);
              }
            } catch (error) {
              console.error('❌ AuthContext: Failed to fetch profile during auth change:', error);
              if (mounted) {
                setUserProfile({
                  name: 'User',
                  profile_photo_url: null
                });
              }
            }
          }
        }, 100);
      } else {
        console.log('🚪 AuthContext: No user, clearing profile');
        setUserProfile(null);
      }

      // Set loading to false after processing
      setLoading(false);
    });

    // Check for existing session on mount
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('❌ AuthContext: Error getting initial session:', error);
      }
      
      if (mounted) {
        console.log('🔍 AuthContext: Initial session check:', session ? 'found session' : 'no session');
        setUser(session?.user ?? null);
        setSession(session);
        
        if (session?.user?.id) {
          fetchUserProfile(session.user.id).then(profile => {
            if (mounted) {
              setUserProfile(profile);
              console.log('✅ AuthContext: Initial profile loaded:', profile);
            }
          }).catch(error => {
            console.error('❌ AuthContext: Failed to fetch initial profile:', error);
            if (mounted) {
              setUserProfile({
                name: 'User',
                profile_photo_url: null
              });
            }
          });
        }
        
        setLoading(false);
      }
    });

    return () => {
      console.log('🧹 AuthContext: Cleaning up auth listener');
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async (): Promise<boolean> => {
    try {
      console.log('🚪 AuthContext: Signing out user');
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Clear profile data
      setUserProfile(null);
      
      toast({
        title: "Signed Out",
        description: "You have been successfully signed out.",
      });
      return true;
    } catch (error) {
      console.error('❌ AuthContext: Sign out error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred during sign out.",
        variant: "destructive",
      });
      return false;
    }
  };

  const refreshSession = async (): Promise<boolean> => {
    try {
      console.log('🔄 AuthContext: Refreshing session');
      const { error } = await supabase.auth.refreshSession();
      if (error) {
        console.error('❌ AuthContext: Session refresh error:', error);
        return false;
      }
      return true;
    } catch (error) {
      console.error('❌ AuthContext: Unexpected session refresh error:', error);
      return false;
    }
  };

  const requireAuth = (): boolean => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to access this feature.",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const value: AuthContextType = useMemo(() => ({
    user,
    session,
    userProfile,
    loading,
    isAuthenticated,
    signOut,
    refreshSession,
    requireAuth,
    refreshUserProfile,
  }), [user, session, userProfile, loading, isAuthenticated]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
