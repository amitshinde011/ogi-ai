
import React, { useState, useEffect } from 'react';
import { User, Shield, HelpCircle, LogOut, FileText, Scale, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Layout from '@/components/Layout';
import { PageContainer } from '@/components/Layout/PageContainer';
import Loader from '@/components/ui/loader';
import Header from '@/components/Header';
import ProfileCard from '@/components/settings/ProfileCard';
import SubscriptionHistoryCard from '@/components/settings/SubscriptionHistoryCard';
import SettingsSection from '@/components/settings/SettingsSection';

import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useUserData } from '@/contexts/UserDataContext';

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
  const { user, signOut } = useAuth();
  const { userProfile, userSubscriptions, loading } = useUserData();
  
  // Transform user data for the profile card
  const transformedProfile = userProfile && user ? {
    id: user.id,
    name: userProfile.name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
    email: user.email,
    avatar: userProfile.profile_photo_url || user.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`,
    age: userProfile.age,
    gender: userProfile.gender,
    weight: userProfile.weight,
    height: userProfile.height,
    health_issues: userProfile.health_issues,
    physical_activity_basic: userProfile.physical_activity_basic,
    physical_activity_medium: userProfile.physical_activity_medium,
    physical_activity_intense: userProfile.physical_activity_intense
  } : null;

  // Transform subscription data for the history card
  const subscriptionHistory: SubscriptionHistory[] = userSubscriptions.map(sub => ({
    id: sub.id,
    program_name: sub.programs?.name || 'Unknown Program',
    start_date: sub.start_date || '',
    end_date: sub.end_date || '',
    status: sub.status || 'unknown',
    payment_status: sub.payment_status || 'unknown',
    created_at: sub.created_at || ''
  }));

  const handleLogout = async () => {
    try {
      const success = await signOut();
      
      if (!success) {
        toast({
          title: "Error signing out",
          description: "Failed to sign out. Please try again.",
          variant: "destructive"
        });
        return;
      }

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
          icon: KeyRound,
          label: 'Change Password',
          action: () => navigate('/password-change'),
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
      title: 'Legal',
      items: [
        {
          icon: FileText,
          label: 'Privacy Policy',
          action: () => navigate('/privacy-policy'),
          hasArrow: true
        },
        {
          icon: Scale,
          label: 'Terms & Conditions',
          action: () => navigate('/terms-and-conditions'),
          hasArrow: true
        },
        {
          icon: FileText,
          label: 'Cancellations & Refunds',
          action: () => navigate('/cancellations-refunds'),
          hasArrow: true
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
        }
      ]
    }
  ];


  return (
    <Layout noContainer>
      <div className="bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
        <PageContainer>
          <Header title="Settings" />
          
          <div className="space-y-8 py-6">
        {!userProfile ? (
          <div className="flex items-center justify-center py-12">
            <Loader size="lg" />
          </div>
        ) : (
          <>
        {/* Profile Card */}
        <ProfileCard userProfile={transformedProfile} />

        {/* Subscription History */}
        <SubscriptionHistoryCard 
          subscriptionHistory={subscriptionHistory} 
          loadingHistory={loading} 
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
          Yogi v1.0.0
        </div>
          </>
        )}
          </div>
        </PageContainer>
      </div>
    </Layout>
  );
};

export default Settings;
