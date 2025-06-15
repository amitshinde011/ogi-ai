
import React from 'react';
import { Bell } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

interface NotificationSettingsProps {
  notifications: {
    mealReminders: boolean;
    communityActivity: boolean;
    weeklyProgress: boolean;
    newRecipes: boolean;
  };
  setNotifications: React.Dispatch<React.SetStateAction<{
    mealReminders: boolean;
    communityActivity: boolean;
    weeklyProgress: boolean;
    newRecipes: boolean;
  }>>;
}

const NotificationSettings = ({ notifications, setNotifications }: NotificationSettingsProps) => {
  const notificationItems = [
    {
      icon: Bell,
      label: 'Meal Reminders',
      key: 'mealReminders' as const,
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
      key: 'communityActivity' as const,
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
      key: 'weeklyProgress' as const,
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
      key: 'newRecipes' as const,
      component: (
        <Switch
          checked={notifications.newRecipes}
          onCheckedChange={(checked) =>
            setNotifications(prev => ({ ...prev, newRecipes: checked }))
          }
        />
      )
    }
  ];

  return notificationItems;
};

export default NotificationSettings;
