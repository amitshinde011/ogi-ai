import React from 'react';
import { Home, CookingPot, Users, TrendingUp } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useNotifications } from '@/hooks/useNotifications';
import { useProgramCompletion } from '@/hooks/useProgramCompletion';
import PostCompletionBanner from './PostCompletionBanner';
import Footer from './Footer';
import AdminNavigation from './admin/AdminNavigation';
import { IMAGES } from '@/constants/images';
import { useAuth } from '@/contexts/AuthContext';
import { UserAvatar } from '@/components/ui/user-avatar';
import ProfileMenu from './ProfileMenu';

interface LayoutProps {
  children: React.ReactNode;
  containerVariant?: 'narrow' | 'wide' | 'full';
  noContainer?: boolean;
}

const Layout = ({ children, containerVariant = 'narrow', noContainer = false }: LayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { unreadCount } = useNotifications();
  const { isCompleted, completedSubscription } = useProgramCompletion();
  const { user, userProfile } = useAuth();

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
  ];

  const isActive = (path: string) => {
    if (path === '/home') {
      return location.pathname === '/home' || location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const handleNavigation = (path: string) => {
    if (isCompleted && (path === '/home' || path === '/recipes')) {
      navigate('/subscriptions');
      return;
    }
    navigate(path);
  };

  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';

  return (
    <div className="min-h-screen bg-background flex flex-col pb-[env(safe-area-inset-bottom)]">
      {isCompleted && completedSubscription && (
        <PostCompletionBanner completedProgramName={completedSubscription.programs?.name} />
      )}

      <main
        className={`flex-1 pt-[calc(env(safe-area-inset-top)_+_45px)] md:pt-[60px] ${shouldShowNavigation ? 'pb-16 sm:pb-20 md:pb-0 md:pl-64' : ''}`}
      >
        <div className="w-full h-full overflow-y-auto">
          {noContainer ? (
            children
          ) : (
            <div className={`w-full mx-auto px-4 sm:px-6 ${containerVariant === 'narrow' ? 'max-w-md' : containerVariant === 'wide' ? 'max-w-2xl' : 'max-w-6xl'}`}>
              {!isAuthPage && <AdminNavigation />}
              {children}
            </div>
          )}
        </div>
      </main>

      {shouldShowNavigation && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200/80 backdrop-blur-xl z-50 md:hidden">
          <div className="max-w-md mx-auto px-2 sm:px-4 py-2">
            <div className="flex justify-around items-center">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                const isRestricted = isCompleted && (item.path === '/home' || item.path === '/recipes');

                return (
                  <button
                    key={item.path}
                    onClick={() => handleNavigation(item.path)}
                    className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 min-w-[60px] ${active ? 'text-primary bg-primary/10' : isRestricted ? 'text-slate-300 cursor-not-allowed' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'}`}
                    disabled={isRestricted}
                  >
                    <Icon size={20} strokeWidth={1.5} />
                    <span className="text-xs mt-1 font-medium">{item.label}</span>
                  </button>
                );
              })}

              <ProfileMenu>
                <button className="flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 min-w-[60px] text-slate-500 hover:text-slate-700 hover:bg-slate-100">
                  <UserAvatar
                    src={userProfile?.profile_photo_url}
                    alt={userProfile?.name || user?.email || 'User'}
                    fallbackText={userProfile?.name?.charAt(0) || user?.email?.charAt(0)?.toUpperCase()}
                    userId={user?.id}
                    size="sm"
                    className="border border-slate-300"
                  />
                  <span className="text-xs mt-1 font-medium">Profile</span>
                </button>
              </ProfileMenu>
            </div>
          </div>
        </nav>
      )}

      {shouldShowNavigation && (
        <nav className="hidden md:flex fixed left-0 top-0 h-full w-64 bg-white border-r border-slate-200/80 backdrop-blur-xl z-40 flex-col">
          <div className="p-6 flex justify-center">
            <img
              src={IMAGES.LOGO_MAIN}
              alt="Yogi Logo"
              className="h-12 w-auto"
            />
          </div>

          <div className="flex-1 px-4">
            <div className="space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                const isRestricted = isCompleted && (item.path === '/home' || item.path === '/recipes');

                return (
                  <button
                    key={item.path}
                    onClick={() => handleNavigation(item.path)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-left ${active ? 'text-primary bg-primary/10 font-medium' : isRestricted ? 'text-slate-300 cursor-not-allowed' : 'text-slate-600 hover:text-slate-800 hover:bg-slate-100'}`}
                    disabled={isRestricted}
                  >
                    <Icon size={20} strokeWidth={1.5} />
                    <span>{item.label}</span>
                  </button>
                );
              })}

              <ProfileMenu>
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-left text-slate-600 hover:text-slate-800 hover:bg-slate-100">
                  <UserAvatar
                    src={userProfile?.profile_photo_url}
                    alt={userProfile?.name || user?.email || 'User'}
                    fallbackText={userProfile?.name?.charAt(0) || user?.email?.charAt(0)?.toUpperCase()}
                    userId={user?.id}
                    size="sm"
                    className="border border-slate-300"
                  />
                  <span>Profile</span>
                </button>
              </ProfileMenu>
            </div>
          </div>

          <div className="mt-auto">
            <Footer />
          </div>
        </nav>
      )}
    </div>
  );
};

export default Layout;
