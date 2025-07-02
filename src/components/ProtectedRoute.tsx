
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUserProgram } from '@/hooks/useUserProgram';
import { useProgramCompletion } from '@/hooks/useProgramCompletion';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiresActiveSubscription?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiresActiveSubscription = false 
}) => {
  const { data: userProgram, isLoading: programLoading } = useUserProgram();
  const { isCompleted, loading: completionLoading } = useProgramCompletion();

  // Show loading while checking subscription status
  if (programLoading || completionLoading) {
    return (
      <div className="min-h-screen bg-gradient-peaceful flex items-center justify-center">
        <div className="text-center">
          <div className="w-32 h-32 mx-auto flex items-center justify-center mb-6 animate-scale-in">
            <img 
              src="/lovable-uploads/6cf2c839-5326-4219-9033-549deb1fb03c.png" 
              alt="Yogi Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          <div className="mt-6">
            <Loader2 size={32} strokeWidth={1.5} className="text-sage mx-auto animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  // If route requires active subscription
  if (requiresActiveSubscription) {
    // If program is completed, redirect to progress page
    if (isCompleted) {
      return <Navigate to="/progress" replace />;
    }
    
    // If no active program, redirect to progress page
    if (!userProgram) {
      return <Navigate to="/progress" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
