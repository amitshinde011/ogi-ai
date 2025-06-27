
import React from 'react';
import { Home, Search, MessageCircle, Bell, ChefHat, Users } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useNotifications } from '@/hooks/useNotifications';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { unreadCount } = useNotifications();

  const navigationItems = [
    { 
      icon: Home, 
      path: '/home', 
      label: 'Home',
      activeIcon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6'
    },
    { 
      icon: Search, 
      path: '/discover', 
      label: 'Discover'
    },
    { 
      icon: ChefHat, 
      path: '/recipes', 
      label: 'Recipes'
    },
    { 
      icon: Users, 
      path: '/community', 
      label: 'Community'
    },
    { 
      icon: MessageCircle, 
      path: '/messages', 
      label: 'Messages'
    },
  ];

  const isActive = (path: string) => {
    if (path === '/home') {
      return location.pathname === '/home' || location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gradient-peaceful">
      <main className="pb-20">
        {children}
      </main>
      
      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200/80 backdrop-blur-xl bg-white/95 z-50">
        <div className="max-w-md mx-auto px-4 py-2">
          <div className="flex justify-around items-center">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 ${
                    active
                      ? 'text-sage bg-sage/10'
                      : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="relative">
                    <Icon 
                      size={20} 
                      fill={active ? 'currentColor' : 'none'}
                      className={active ? 'stroke-sage' : ''}
                    />
                    {item.path === '/messages' && unreadCount > 0 && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                        <span className="text-xs text-white font-medium">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      </div>
                    )}
                  </div>
                  <span className="text-xs mt-1 font-medium">{item.label}</span>
                </button>
              );
            })}
            
            {/* Notifications */}
            <button
              onClick={() => navigate('/notifications')}
              className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 ${
                isActive('/notifications')
                  ? 'text-sage bg-sage/10'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="relative">
                <Bell 
                  size={20} 
                  fill={isActive('/notifications') ? 'currentColor' : 'none'}
                  className={isActive('/notifications') ? 'stroke-sage' : ''}
                />
                {unreadCount > 0 && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>
                )}
              </div>
              <span className="text-xs mt-1 font-medium">Alerts</span>
            </button>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Layout;
