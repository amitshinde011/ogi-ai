import React, { useState, useEffect } from 'react';
import { User, Bell, Shield, HelpCircle, LogOut, ChevronRight, Edit } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import Layout from '@/components/Layout';
import Header from '@/components/Header';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

const Settings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userProfile, setUserProfile] = useState<any>(null);
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

    fetchUserProfile();
  }, []);

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
      items: [
        {
          icon: Bell,
          label: 'Meal Reminders',
          component: (
            <Switch
              checked={notifications.mealReminders}
              onCheckedChange={(checked) =>
                setNotifications(prev => ({ ...prev, mealReminders: checked }))
              }
            />
          )
        },
        {
          icon: Bell,
          label: 'Community Activity',
          component: (
            <Switch
              checked={notifications.communityActivity}
              onCheckedChange={(checked) =>
                setNotifications(prev => ({ ...prev, communityActivity: checked }))
              }
            />
          )
        },
        {
          icon: Bell,
          label: 'Weekly Progress',
          component: (
            <Switch
              checked={notifications.weeklyProgress}
              onCheckedChange={(checked) =>
                setNotifications(prev => ({ ...prev, weeklyProgress: checked }))
              }
            />
          )
        },
        {
          icon: Bell,
          label: 'New Recipes',
          component: (
            <Switch
              checked={notifications.newRecipes}
              onCheckedChange={(checked) =>
                setNotifications(prev => ({ ...prev, newRecipes: checked }))
              }
            />
          )
        }
      ]
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
        <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <img
                  src={userProfile.avatar}
                  alt="Profile"
                  className="w-20 h-20 rounded-2xl shadow-md object-cover"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/profile-edit')}
                  className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg"
                >
                  <Edit size={14} />
                </Button>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-xl text-slate-900 truncate">{userProfile.name}</h3>
                <p className="text-slate-600 text-sm truncate">{userProfile.email}</p>
                {userProfile.age && userProfile.gender && (
                  <p className="text-slate-500 text-sm mt-1">
                    {userProfile.age} years • {userProfile.gender}
                  </p>
                )}
                {userProfile.weight && userProfile.height && (
                  <p className="text-slate-500 text-sm">
                    {userProfile.weight}kg • {userProfile.height}cm
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Settings Sections */}
        {settingsSections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="space-y-3">
            <h4 className="font-bold text-lg text-slate-900 px-1">{section.title}</h4>
            <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-200">
              <CardContent className="p-0">
                {section.items.map((item, itemIndex) => (
                  <div key={itemIndex}>
                    <div
                      className={`flex items-center justify-between p-4 transition-colors ${
                        item.action ? 'cursor-pointer hover:bg-slate-50 active:bg-slate-100' : ''
                      }`}
                      onClick={item.action}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                          <item.icon className="text-indigo-600" size={20} />
                        </div>
                        <span className="font-semibold text-slate-900">{item.label}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {item.component}
                        {item.hasArrow && (
                          <ChevronRight className="text-slate-400" size={20} />
                        )}
                      </div>
                    </div>
                    {itemIndex < section.items.length - 1 && (
                      <div className="border-b border-slate-100 ml-16" />
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
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
