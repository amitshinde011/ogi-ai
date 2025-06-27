
import React from 'react';
import { Home, CookingPot, Users, TrendingUp, Settings } from 'lucide-react';
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
    { icon: Home, path: '/home', label: 'Home' },
    { icon: CookingPot, path: '/recipes', label: 'Recipes' },
    { icon: Users, path: '/community', label: 'Community' },
    { icon: TrendingUp, path: '/progress', label: 'Progress' },
    { icon: Settings, path: '/settings', label: 'Settings' },
  ];

  const isActive = (path: string) => {
    if (path === '/home') {
      return location.pathname === '/home' || location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gradient-peaceful">
      <main className="pb-16 sm:pb-20 md:pb-0 md:pl-64">
        {children}
      </main>
      
      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200/80 backdrop-blur-xl bg-white/95 z-50 md:hidden">
        <div className="max-w-md mx-auto px-2 sm:px-4 py-2">
          <div className="flex justify-around items-center">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 min-w-[60px] ${
                    active
                      ? 'text-sage bg-sage/10'
                      : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Icon size={20} strokeWidth={1.5} />
                  <span className="text-xs mt-1 font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Desktop Sidebar Navigation */}
      <nav className="hidden md:flex fixed left-0 top-0 h-full w-64 bg-white border-r border-slate-200/80 backdrop-blur-xl bg-white/95 z-50 flex-col">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-sage">Yogi</h1>
        </div>
        
        <div className="flex-1 px-4">
          <div className="space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-left ${
                    active
                      ? 'text-sage bg-sage/10 font-medium'
                      : 'text-slate-600 hover:text-slate-800 hover:bg-slate-100'
                  }`}
                >
                  <Icon size={20} strokeWidth={1.5} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Layout;
