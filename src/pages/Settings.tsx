
import React, { useState, useEffect } from 'react';
import { User, Shield, HelpCircle, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Layout from '@/components/Layout';
import Header from '@/components/Header';
import ProfileCard from '@/components/settings/ProfileCard';
import SubscriptionHistoryCard from '@/components/settings/SubscriptionHistoryCard';
import SettingsSection from '@/components/settings/SettingsSection';
import NotificationSettings from '@/components/settings/NotificationSettings';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface SubscriptionHistory {
  id: string;
  program_name: string;
  start_date: string;
  end_date: string;
  status: string;
  payment_status: string;
  created_at: string;
}

const Settings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [subscriptionHistory, setSubscriptionHistory] = useState<SubscriptionHistory[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [notifications, setNotifications] = useState({
    mealReminders: true,
    communityActivity: true,
    weeklyProgress: false,
    newRecipes: true
  });

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('user_id', user.id)
            .maybeSingle();

          setUserProfile({
            id: user.id,
            name: profile?.name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
            email: user.email,
            avatar: profile?.profile_photo_url || user.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`,
            age: profile?.age,
            gender: profile?.gender,
            weight: profile?.weight,
            height: profile?.height,
            health_issues: profile?.health_issues,
            physical_activity_basic: profile?.physical_activity_basic,
            physical_activity_medium: profile?.physical_activity_medium,
            physical_activity_intense: profile?.physical_activity_intense
          });
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };

    const fetchSubscriptionHistory = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: subscriptions, error } = await supabase
            .from('user_subscriptions')
            .select(`
              id,
              start_date,
              end_date,
              status,
              payment_status,
              created_at,
              programs (
                name
              )
            `)
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

          if (error) throw error;

          const formattedHistory: SubscriptionHistory[] = subscriptions?.map(sub => ({
            id: sub.id,
            program_name: sub.programs?.name || 'Unknown Program',
            start_date: sub.start_date || '',
            end_date: sub.end_date || '',
            status: sub.status || 'unknown',
            payment_status: sub.payment_status || 'unknown',
            created_at: sub.created_at || ''
          })) || [];

          setSubscriptionHistory(formattedHistory);
        }
      } catch (error) {
        console.error('Error fetching subscription history:', error);
        toast({
          title: "Error",
          description: "Failed to load subscription history.",
          variant: "destructive"
        });
      } finally {
        setLoadingHistory(false);
      }
    };

    fetchUserProfile();
    fetchSubscriptionHistory();
  }, [toast]);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Error signing out:', error);
        toast({
          title: "Error signing out",
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      localStorage.removeItem('user');
      
      toast({
        title: "Signed out successfully",
        description: "You have been logged out of your account."
      });
      
      navigate('/login');
    } catch (error) {
      console.error('Unexpected error during logout:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred during logout.",
        variant: "destructive"
      });
    }
  };

  const notificationItems = NotificationSettings({ notifications, setNotifications });

  const settingsSections = [
    {
      title: 'Account',
      items: [
        {
          icon: User,
          label: 'Edit Profile',
          action: () => navigate('/profile-edit'),
          hasArrow: true
        },
        {
          icon: Shield,
          label: 'Privacy & Security',
          action: () => navigate('/privacy'),
          hasArrow: true
        }
      ]
    },
    {
      title: 'Notifications',
      items: notificationItems
    },
    {
      title: 'Support',
      items: [
        {
          icon: HelpCircle,
          label: 'Help & FAQ',
          action: () => navigate('/help'),
          hasArrow: true
        },
        {
          icon: Shield,
          label: 'Privacy Policy',
          action: () => navigate('/privacy-policy'),
          hasArrow: true
        },
        {
          icon: Shield,
          label: 'Terms of Use',
          action: () => navigate('/terms'),
          hasArrow: true
        }
      ]
    }
  ];

  if (!userProfile) {
    return (
      <Layout>
        <Header title="Settings" />
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Header title="Settings" />
      
      <div className="p-6 space-y-8 max-w-lg mx-auto bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
        {/* Profile Card */}
        <ProfileCard userProfile={userProfile} />

        {/* Subscription History */}
        <SubscriptionHistoryCard 
          subscriptionHistory={subscriptionHistory} 
          loadingHistory={loadingHistory} 
        />

        {/* Settings Sections */}
        {settingsSections.map((section, sectionIndex) => (
          <SettingsSection
            key={sectionIndex}
            title={section.title}
            items={section.items}
          />
        ))}

        {/* Logout Button */}
        <Button
          onClick={handleLogout}
          variant="outline"
          className="w-full h-14 rounded-2xl border-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 bg-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <LogOut size={20} className="mr-3" />
          Sign Out
        </Button>

        {/* Version */}
        <div className="text-center text-sm text-slate-500 font-medium">
          Yogi-ai v1.0.0
        </div>
      </div>
    </Layout>
  );
};

export default Settings;
