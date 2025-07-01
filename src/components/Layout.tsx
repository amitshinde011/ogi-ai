
import React from 'react';
import { Home, CookingPot, Users, TrendingUp, Settings } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useNotifications } from '@/hooks/useNotifications';
import { useProgramCompletion } from '@/hooks/useProgramCompletion';
import PostCompletionBanner from './PostCompletionBanner';
import Footer from './Footer';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { unreadCount } = useNotifications();
  const { isCompleted, completedSubscription } = useProgramCompletion();

  // Define pages that should show navigation
  const pagesWithNavigation = ['/home', '/', '/recipes', '/community', '/progress', '/settings'];
  const shouldShowNavigation = pagesWithNavigation.some(path => {
    if (path === '/home' || path === '/') {
      return location.pathname === '/home' || location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  });

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

  const handleNavigation = (path: string) => {
    // Restrict access to Home and Recipes if program is completed
    if (isCompleted && (path === '/home' || path === '/recipes')) {
      navigate('/subscriptions');
      return;
    }
    navigate(path);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex flex-col">
      {/* Post-completion banner */}
      {isCompleted && completedSubscription && (
        <PostCompletionBanner completedProgramName={completedSubscription.programs?.name} />
      )}
      
      <main className={`flex-1 ${shouldShowNavigation ? 'pb-16 sm:pb-20 md:pb-0 md:pl-64' : ''} ${isCompleted ? 'pt-20 sm:pt-24 md:pt-32' : ''}`}>
        {children}
      </main>
      
      {/* Mobile Bottom Navigation - Only show on specified pages */}
      {shouldShowNavigation && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t-2 border-purple-200 shadow-2xl z-50 md:hidden">
          <div className="max-w-md mx-auto px-2 sm:px-4 py-3">
            <div className="flex justify-around items-center">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                const isRestricted = isCompleted && (item.path === '/home' || item.path === '/recipes');
                
                return (
                  <button
                    key={item.path}
                    onClick={() => handleNavigation(item.path)}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-300 min-w-[60px] ${
                      active
                        ? 'text-white bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg scale-105'
                        : isRestricted
                        ? 'text-slate-300 cursor-not-allowed'
                        : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50 hover:scale-105'
                    }`}
                    disabled={isRestricted}
                  >
                    <Icon size={22} strokeWidth={2} />
                    <span className="text-xs mt-1 font-semibold">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </nav>
      )}

      {/* Desktop Sidebar Navigation - Only show on specified pages */}
      {shouldShowNavigation && (
        <nav className="hidden md:flex fixed left-0 top-0 h-full w-64 bg-white/95 backdrop-blur-xl border-r-2 border-purple-200 shadow-2xl z-40 flex-col">
          <div className="p-6 flex justify-center bg-gradient-to-r from-blue-500 to-purple-600">
            <img 
              src="/lovable-uploads/5a8e66be-fe3c-4a0b-a827-6a2e891e4d04.png" 
              alt="Yogi Logo" 
              className="h-12 w-auto brightness-0 invert"
            />
          </div>
          
          <div className="flex-1 px-4 py-6">
            <div className="space-y-3">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                const isRestricted = isCompleted && (item.path === '/home' || item.path === '/recipes');
                
                return (
                  <button
                    key={item.path}
                    onClick={() => handleNavigation(item.path)}
                    className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 text-left ${
                      active
                        ? 'text-white bg-gradient-to-r from-blue-500 to-purple-600 font-semibold shadow-lg transform scale-105'
                        : isRestricted
                        ? 'text-slate-300 cursor-not-allowed'
                        : 'text-slate-700 hover:text-blue-600 hover:bg-blue-50 hover:transform hover:scale-105'
                    }`}
                    disabled={isRestricted}
                  >
                    <Icon size={22} strokeWidth={2} />
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer in Sidebar */}
          <div className="mt-auto">
            <Footer />
          </div>
        </nav>
      )}
    </div>
  );
};

export default Layout;
