
import React, { useState } from 'react';
import { User, Bell, Shield, HelpCircle, LogOut, ChevronRight, Edit } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import Layout from '@/components/Layout';
import Header from '@/components/Header';
import { useNavigate } from 'react-router-dom';

const Settings = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState({
    mealReminders: true,
    communityActivity: true,
    weeklyProgress: false,
    newRecipes: true
  });

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
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

  return (
    <Layout>
      <Header title="Settings" />
      
      <div className="p-4 space-y-6 max-w-md mx-auto">
        {/* Profile Section */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <img
                src={user.avatar}
                alt="Profile"
                className="w-16 h-16 rounded-full mr-4"
              />
              <div className="flex-1">
                <h3 className="font-semibold text-primary text-lg">{user.name}</h3>
                <p className="text-muted-foreground">{user.email}</p>
                <p className="text-sm text-muted-foreground mt-1">{user.dietaryGoals}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/profile-edit')}
                className="text-primary"
              >
                <Edit size={16} />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Settings Sections */}
        {settingsSections.map((section, sectionIndex) => (
          <div key={sectionIndex}>
            <h4 className="font-semibold text-primary mb-3 px-1">{section.title}</h4>
            <Card>
              <CardContent className="p-0">
                {section.items.map((item, itemIndex) => (
                  <div key={itemIndex}>
                    <div
                      className={`flex items-center justify-between p-4 ${
                        item.action ? 'cursor-pointer hover:bg-sage/5' : ''
                      }`}
                      onClick={item.action}
                    >
                      <div className="flex items-center">
                        <item.icon className="text-muted-foreground mr-3" size={20} />
                        <span className="font-medium">{item.label}</span>
                      </div>
                      <div className="flex items-center">
                        {item.component}
                        {item.hasArrow && (
                          <ChevronRight className="text-muted-foreground" size={16} />
                        )}
                      </div>
                    </div>
                    {itemIndex < section.items.length - 1 && (
                      <div className="border-b border-gray-100 ml-11" />
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
          className="w-full rounded-xl border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
        >
          <LogOut size={16} className="mr-2" />
          Sign Out
        </Button>

        {/* App Version */}
        <div className="text-center text-sm text-muted-foreground">
          Yogi-ai v1.0.0
        </div>
      </div>
    </Layout>
  );
};

export default Settings;
