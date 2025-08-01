import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUserRole } from '@/hooks/useUserRole';
import Loader from '@/components/ui/loader';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface AdminRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'moderator';
}

const AdminRoute: React.FC<AdminRouteProps> = ({ 
  children, 
  requiredRole = 'admin' 
}) => {
  const { userRole, loading, hasRole } = useUserRole();

  // Show loading while checking role
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-peaceful flex items-center justify-center">
        <div className="text-center">
          <div className="mt-6">
            <Loader size="lg" />
          </div>
          <p className="mt-4 text-muted-foreground">Checking permissions...</p>
        </div>
      </div>
    );
  }

  // Check if user has required role
  if (!hasRole(requiredRole)) {
    return (
      <div className="min-h-screen bg-gradient-peaceful flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="mt-2">
              Access denied. You don't have the required permissions to view this page.
              {userRole ? ` Your current role: ${userRole}` : ' Please contact an administrator.'}
            </AlertDescription>
          </Alert>
          <div className="mt-4 text-center">
            <button 
              onClick={() => window.history.back()}
              className="text-primary hover:underline"
            >
              Go back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AdminRoute;