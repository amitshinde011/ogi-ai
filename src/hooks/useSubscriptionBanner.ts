
import { useUserData } from '@/contexts/UserDataContext';

export const useSubscriptionBanner = () => {
  const { hasActiveSubscription, loading } = useUserData();

  return { 
    showBanner: !hasActiveSubscription, 
    loading 
  };
};
