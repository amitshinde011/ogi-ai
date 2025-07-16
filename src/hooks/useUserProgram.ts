
import { useUserData } from '@/contexts/UserDataContext';

export const useUserProgram = () => {
  const { currentSubscription, loading } = useUserData();
  
  return {
    data: currentSubscription,
    isLoading: loading,
    isError: false,
    error: null
  };
};
