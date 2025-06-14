import React from 'react';
import { Home, Users, ChefHat, BarChart, Settings, Trophy } from 'lucide-react';
import { useLocation, Link } from 'react-router-dom';
import { useProgramCompletion } from '@/hooks/useProgramCompletion';
import { useAnalytics } from '@/hooks/useAnalytics';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const { isCompleted, hasFinalAssessment } = useProgramCompletion();
  const { trackButtonClick } = useAnalytics();

  const navItems = isCompleted && hasFinalAssessment ? [
    { path: '/subscriptions', icon: Trophy, label: 'Programs' },
    { path: '/community', icon: Users, label: 'Community' },
    { path: '/recipes', icon: ChefHat, label: 'Recipes' },
    { path: '/progress', icon: BarChart, label: 'Progress' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ] : [
    { path: '/home', icon: Home, label: 'Home' },
    { path: '/community', icon: Users, label: 'Community' },
    { path: '/recipes', icon: ChefHat, label: 'Recipes' },
    { path: '/progress', icon: BarChart, label: 'Progress' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ];

  const isActive = (path: string) => {
    if (path === '/home') return location.pathname === '/home';
    if (path === '/subscriptions') return location.pathname === '/subscriptions';
    if (path === '/recipes') return location.pathname.startsWith('/recipes') || location.pathname.startsWith('/saved-recipes');
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 pb-20">
      <div className="animate-fade-in">
        {children}
      </div>
      
      {/* Enhanced Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200/80 backdrop-blur-xl bg-white/95">
        <div className="flex justify-around items-center max-w-md mx-auto px-4 py-2">
          {navItems.map(({ path, icon: Icon, label }) => (
            <Link
              key={path}
              to={path}
              onClick={() => trackButtonClick(label, 'Bottom Navigation')}
              className={`nav-item flex flex-col items-center px-3 py-2 transition-all duration-200 ${
                isActive(path) ? 'active' : ''
              }`}
            >
              <Icon 
                size={22} 
                className={`transition-colors ${
                  isActive(path) 
                    ? 'text-indigo-600' 
                    : 'text-slate-600 group-hover:text-indigo-600'
                }`} 
              />
              <span className={`text-xs mt-1 font-medium transition-colors ${
                isActive(path) 
                  ? 'text-indigo-600' 
                  : 'text-slate-600'
              }`}>
                {label}
              </span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default Layout;
