import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
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

const AUTH_CACHE_KEY = 'auth_user_cache';
const PROFILE_CACHE_KEY = 'auth_profile_cache';

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

    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!mounted) return;

        if (error) {
          console.error('Session retrieval error:', error);
          localStorage.removeItem(AUTH_CACHE_KEY);
          localStorage.removeItem(PROFILE_CACHE_KEY);
          setUser(null);
          setSession(null);
          setUserProfile(null);
          return;
        }

        if (session?.user) {
          try {
            const profile = await fetchUserProfile(session.user.id);
            if (mounted) {
              setUser(session.user);
              setSession(session);
              setUserProfile(profile);
              // Cache the user and profile data
              localStorage.setItem(AUTH_CACHE_KEY, JSON.stringify(session.user));
              localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(profile));
            }
          } catch (profileError) {
            console.error('Profile fetch error:', profileError);
            // Still set user even if profile fails
            if (mounted) {
              setUser(session.user);
              setSession(session);
              setUserProfile({
                name: 'User',
                profile_photo_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${session.user.id}`
              });
            }
          }
        } else {
          setUser(null);
          setSession(null);
          setUserProfile(null);
          localStorage.removeItem(AUTH_CACHE_KEY);
          localStorage.removeItem(PROFILE_CACHE_KEY);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (mounted) {
          setUser(null);
          setSession(null);
          setUserProfile(null);
          localStorage.removeItem(AUTH_CACHE_KEY);
          localStorage.removeItem(PROFILE_CACHE_KEY);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      console.log('Auth state changed:', event);
      
      // Only handle meaningful auth events to prevent double loading
      if (event === 'INITIAL_SESSION') {
        // Skip INITIAL_SESSION as it's already handled by getSession()
        return;
      }
      
      // Always set loading to false when auth state changes
      setLoading(false);
      
      switch (event) {
        case 'SIGNED_IN':
          if (session?.user && mounted) {
            // Immediately set user data to prevent race condition
            setUser(session.user);
            setSession(session);
            localStorage.setItem(AUTH_CACHE_KEY, JSON.stringify(session.user));
            
            // Fetch profile asynchronously without blocking
            try {
              const profile = await fetchUserProfile(session.user.id);
              if (mounted) {
                setUserProfile(profile);
                localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(profile));
              }
            } catch (error) {
              console.error('Profile fetch error on sign in:', error);
              if (mounted) {
                setUserProfile({
                  name: 'User',
                  profile_photo_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${session.user.id}`
                });
              }
            }
          }
          break;
          
        case 'SIGNED_OUT':
          if (mounted) {
            setUser(null);
            setSession(null);
            setUserProfile(null);
            localStorage.removeItem(AUTH_CACHE_KEY);
            localStorage.removeItem(PROFILE_CACHE_KEY);
            localStorage.removeItem('user-preferences');
            sessionStorage.clear();
          }
          break;
          
        case 'TOKEN_REFRESHED':
          if (mounted && session) {
            setSession(session);
            setUser(session.user);
            if (session.user) {
              localStorage.setItem(AUTH_CACHE_KEY, JSON.stringify(session.user));
            }
          }
          break;
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
      
      if (error) {
        console.error('Sign out error:', error);
        toast({
          title: "Sign Out Error",
          description: "Failed to sign out. Please try again.",
          variant: "destructive",
        });
        return false;
      }

      // State will be updated by the auth state change listener
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
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error('Session refresh error:', error);
        return false;
      }

      setSession(data.session);
      setUser(data.session?.user ?? null);
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

  const value: AuthContextType = {
    user,
    session,
    userProfile,
    loading,
    isAuthenticated,
    signOut,
    refreshSession,
    requireAuth,
  };

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