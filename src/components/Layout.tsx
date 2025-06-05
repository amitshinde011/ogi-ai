
import React from 'react';
import { Home, Users, ChefHat, BarChart, Settings, Trophy } from 'lucide-react';
import { useLocation, Link } from 'react-router-dom';
import { useProgramCompletion } from '@/hooks/useProgramCompletion';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const { isCompleted, hasFinalAssessment } = useProgramCompletion();

  // Show different navigation based on program completion status
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
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-50 pb-20">
      {children}
      
      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t-2 border-gray-200 px-4 py-3 z-50">
        <div className="flex justify-around items-center max-w-md mx-auto">
          {navItems.map(({ path, icon: Icon, label }) => (
            <Link
              key={path}
              to={path}
              className={`flex flex-col items-center px-3 py-2 rounded-xl transition-all duration-200 nav-item ${
                isActive(path) ? 'active bg-primary/10 scale-105' : 'hover:bg-gray-100'
              }`}
            >
              <Icon size={22} className={isActive(path) ? 'text-primary' : 'text-medium'} />
              <span className={`text-xs mt-1 font-semibold ${isActive(path) ? 'text-primary' : 'text-medium'}`}>
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
