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
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('name, profile_photo_url')
        .eq('user_id', userId)
        .maybeSingle();

      return {
        name: profile?.name || 'User',
        profile_photo_url: profile?.profile_photo_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`
      };
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return {
        name: 'User',
        profile_photo_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`
      };
    }
  };

  useEffect(() => {
    let mounted = true;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;

      // Reduce console noise - only log significant events
      if (event !== 'TOKEN_REFRESHED') {
        console.log('Auth state changed:', event);
      }

      // Set the user and session state from the event
      setUser(session?.user ?? null);
      setSession(session);

      // Handle profile fetching for any authenticated session
      if (session?.user) {
        // Fetch profile for any authenticated user
        setTimeout(() => {
          fetchUserProfile(session.user.id).then(profile => {
            if (mounted) {
              setUserProfile(profile);
            }
          }).catch(error => {
            console.error('Error fetching user profile:', error);
            if (mounted) {
              setUserProfile(null);
            }
          });
        }, 0);
      } else {
        setUserProfile(null);
      }

      // Always set loading to false after auth state change
      setLoading(false);
    });

    // Check for existing session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (mounted) {
        setUser(session?.user ?? null);
        setSession(session);
        
        // Also fetch profile on initial session check
        if (session?.user) {
          fetchUserProfile(session.user.id).then(profile => {
            if (mounted) {
              setUserProfile(profile);
            }
          }).catch(error => {
            console.error('Error fetching user profile:', error);
            if (mounted) {
              setUserProfile(null);
            }
          });
        }
        
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async (): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast({
        title: "Signed Out",
        description: "You have been successfully signed out.",
      });
      return true;
    } catch (error) {
      console.error('Unexpected sign out error:', error);
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
      const { error } = await supabase.auth.refreshSession();
      if (error) {
        console.error('Session refresh error:', error);
        return false;
      }
      // The onAuthStateChange listener will handle the state update automatically
      return true;
    } catch (error) {
      console.error('Unexpected session refresh error:', error);
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