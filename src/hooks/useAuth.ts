
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { User, Session } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAuthenticated: boolean;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    isAuthenticated: false
  });
  const { toast } = useToast();

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session retrieval error:', error);
          // Clear any potentially corrupted session data
          await supabase.auth.signOut();
          setAuthState({
            user: null,
            session: null,
            loading: false,
            isAuthenticated: false
          });
          return;
        }

        setAuthState({
          user: session?.user ?? null,
          session,
          loading: false,
          isAuthenticated: !!session?.user
        });
      } catch (error) {
        console.error('Auth initialization error:', error);
        setAuthState({
          user: null,
          session: null,
          loading: false,
          isAuthenticated: false
        });
      }
    };

    getInitialSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event);
      
      // Handle different auth events
      switch (event) {
        case 'SIGNED_IN':
          setAuthState({
            user: session?.user ?? null,
            session,
            loading: false,
            isAuthenticated: !!session?.user
          });
          break;
          
        case 'SIGNED_OUT':
          setAuthState({
            user: null,
            session: null,
            loading: false,
            isAuthenticated: false
          });
          // Clear any cached data
          localStorage.removeItem('user-preferences');
          sessionStorage.clear();
          break;
          
        case 'TOKEN_REFRESHED':
          setAuthState(prev => ({
            ...prev,
            session,
            user: session?.user ?? null,
            isAuthenticated: !!session?.user
          }));
          break;
          
        case 'USER_UPDATED':
          setAuthState(prev => ({
            ...prev,
            user: session?.user ?? prev.user,
            session
          }));
          break;
          
        default:
          setAuthState({
            user: session?.user ?? null,
            session,
            loading: false,
            isAuthenticated: !!session?.user
          });
      }
    });

    return () => {
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

      // Clear local state immediately
      setAuthState({
        user: null,
        session: null,
        loading: false,
        isAuthenticated: false
      });

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

      setAuthState(prev => ({
        ...prev,
        session: data.session,
        user: data.session?.user ?? null,
        isAuthenticated: !!data.session?.user
      }));

      return true;
    } catch (error) {
      console.error('Unexpected session refresh error:', error);
      return false;
    }
  };

  // Helper function to check if user is authenticated
  const requireAuth = (): boolean => {
    if (!authState.isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to access this feature.",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  return {
    ...authState,
    signOut,
    refreshSession,
    requireAuth
  };
};
