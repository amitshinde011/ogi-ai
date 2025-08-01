import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useUserRole } from '@/hooks/useUserRole';
import { Badge } from '@/components/ui/badge';
import { Settings, BarChart3, Users } from 'lucide-react';

const AdminNavigation: React.FC = () => {
  const { isAdmin, isModerator, userRole } = useUserRole();
  const location = useLocation();

  // Don't show admin navigation if user doesn't have permissions
  if (!isAdmin() && !isModerator()) {
    return null;
  }

  const adminItems = [
    {
      name: 'Automation Admin',
      href: '/automation-admin',
      icon: Settings,
      description: 'Manage automation system',
      adminOnly: true
    }
  ];

  const isActive = (href: string) => location.pathname === href;

  return (
    <div className="bg-card/50 backdrop-blur-sm border rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Admin Panel
        </h3>
        <Badge variant="secondary" className="text-xs">
          {userRole}
        </Badge>
      </div>
      
      <nav className="space-y-2">
        {adminItems.map((item) => {
          // Check if user has permission for this item
          if (item.adminOnly && !isAdmin()) {
            return null;
          }

          const Icon = item.icon;
          
          return (
            <Link
              key={item.href}
              to={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                isActive(item.href)
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-muted'
              }`}
            >
              <Icon className="h-4 w-4" />
              <div className="flex-1">
                <div className="font-medium">{item.name}</div>
                <div className="text-sm text-muted-foreground">{item.description}</div>
              </div>
            </Link>
          );
        })}
      </nav>
      
      {adminItems.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No admin functions available for your role.
        </p>
      )}
    </div>
  );
};

export default AdminNavigation;