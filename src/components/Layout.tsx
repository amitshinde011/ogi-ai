
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
    <div className="min-h-screen bg-gradient-to-br from-cream to-sage/10 pb-20">
      {children}
      
      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-sage/20 px-4 py-2 z-50">
        <div className="flex justify-around items-center max-w-md mx-auto">
          {navItems.map(({ path, icon: Icon, label }) => (
            <Link
              key={path}
              to={path}
              className={`flex flex-col items-center px-3 py-2 rounded-xl transition-all duration-200 ${
                isActive(path)
                  ? 'text-primary bg-sage/10 scale-105'
                  : 'text-muted-foreground hover:text-primary hover:bg-sage/5'
              }`}
            >
              <Icon size={20} />
              <span className="text-xs mt-1 font-medium">{label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default Layout;
