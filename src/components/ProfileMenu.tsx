
import React from 'react';
import { Search, User, Settings, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '@/hooks/useNotifications';

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface ProfileMenuProps {
  children: React.ReactNode;
}

const ProfileMenu = ({ children }: ProfileMenuProps) => {
  const navigate = useNavigate();
  const { unreadCount } = useNotifications();

  const menuItems = [
    { icon: User, label: 'My Posts', path: '/my-posts' },
    { icon: Search, label: 'Discover', path: '/discover' },
    { icon: Bell, label: 'Notifications', path: '/notifications', showBadge: unreadCount > 0, badgeCount: unreadCount },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  return (
    <Popover>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent className="w-48 p-2" align="end">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="flex items-center justify-between w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
              >
                <div className="flex items-center">
                  <Icon size={18} strokeWidth={1.5} className="mr-3 text-slate-500" />
                  {item.label}
                </div>
                {'showBadge' in item && item.showBadge && (
                  <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5 min-w-[20px] text-center">
                    {item.badgeCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default ProfileMenu;
