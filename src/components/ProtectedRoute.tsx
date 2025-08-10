
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUserData } from '@/contexts/UserDataContext';
import { useProgramCompletion } from '@/hooks/useProgramCompletion';
import Loader from '@/components/ui/loader';
import SubscriptionBlurOverlay from './SubscriptionBlurOverlay';
import { IMAGES } from '@/constants/images';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiresActiveSubscription?: boolean;
  showBlurOverlay?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiresActiveSubscription = false,
  showBlurOverlay = false
}) => {
  const { currentSubscription, hasActiveSubscription, loading: userDataLoading } = useUserData();
  const { isCompleted, loading: completionLoading } = useProgramCompletion();

  // Reduce console logging to prevent performance issues
  if (process.env.NODE_ENV === 'development') {
    console.log('ProtectedRoute - currentSubscription:', currentSubscription?.id);
    console.log('ProtectedRoute - hasActiveSubscription:', hasActiveSubscription);
    console.log('ProtectedRoute - isCompleted:', isCompleted);
    console.log('ProtectedRoute - requiresActiveSubscription:', requiresActiveSubscription);
    console.log('ProtectedRoute - showBlurOverlay:', showBlurOverlay);
  }

  // Show loading while checking subscription status
  if (userDataLoading || completionLoading) {
    return (
      <div className="min-h-screen bg-gradient-peaceful flex items-center justify-center">
        <div className="text-center">
          <div className="w-28 h-28 mx-auto flex items-center justify-center mb-6 animate-scale-in">
            <img 
              src={IMAGES.LOGO_VARIANT} 
              alt="Yogi Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          <div className="mt-6">
            <Loader size="lg" />
          </div>
        </div>
      </div>
    );
  }

  // If route requires active subscription
  if (requiresActiveSubscription) {
    // If program is completed, either show blur overlay or redirect
    if (isCompleted) {
      if (showBlurOverlay) {
        return <SubscriptionBlurOverlay>{children}</SubscriptionBlurOverlay>;
      }
      return <Navigate to="/progress" replace />;
    }
    
    // If no active program, either show blur overlay or redirect
    if (!hasActiveSubscription) {
      if (showBlurOverlay) {
        return <SubscriptionBlurOverlay>{children}</SubscriptionBlurOverlay>;
      }
      return <Navigate to="/progress" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
