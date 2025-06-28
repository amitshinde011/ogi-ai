
import React from 'react';
import { Search, MessageSquare, Bell } from 'lucide-react';
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
    { icon: MessageSquare, label: 'Messages', path: '/messages', hasNotification: unreadCount > 0 },
    { icon: Search, label: 'Discover', path: '/discover' },
    { icon: Bell, label: 'Notifications', path: '/notifications', hasNotification: unreadCount > 0 },
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
                className="flex items-center w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
              >
                <div className="relative">
                  <Icon size={18} strokeWidth={1.5} className="mr-3 text-slate-500" />
                  {item.hasNotification && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>
                  )}
                </div>
                {item.label}
                {item.hasNotification && item.path === '/messages' && unreadCount > 0 && (
                  <span className="ml-auto text-xs bg-red-500 text-white rounded-full px-1.5 py-0.5">
                    {unreadCount > 9 ? '9+' : unreadCount}
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
