
import React from 'react';
import { Settings, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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

  const menuItems = [
    { icon: TrendingUp, label: 'Progress', path: '/progress' },
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
                className="flex items-center w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
              >
                <Icon className="w-4 h-4 mr-3 text-slate-500" />
                {item.label}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default ProfileMenu;
