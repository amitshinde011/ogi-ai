import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  Purchases,
  PurchasesOffering,
  PurchasesPackage,
  CustomerInfo,
} from '@revenuecat/purchases-capacitor';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext'; // Import useAuth to get the user
import { getLocalDateString } from '@/utils/dateUtils'; // Import date utility

export type ProgramLike = {
  id: string;
  name: string;
  duration_days: number;
};

const isIOSCapacitor = (): boolean => {
  try {
    const cap = (window as any).Capacitor;
    const platform = cap?.getPlatform?.();
    return !!cap && platform === 'ios';
  } catch {
    return false;
  }
};

export const useYogiSubscriptions = (programs: ProgramLike[]) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth(); // Get the authenticated user
  const isIOSNative = useMemo(() => isIOSCapacitor(), []);

  const [offering, setOffering] = useState<PurchasesOffering | null>(null);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const offeringRef = useRef<PurchasesOffering | null>(null);

  useEffect(() => {
    if (!isIOSNative) {
      setIsLoading(false);
      return;
    }
    const setup = async () => {
      try {
        const info = await Purchases.getCustomerInfo();
        setCustomerInfo(info.customerInfo);

        const offerings = await Purchases.getOfferings();
        if (offerings.current) {
          setOffering(offerings.current);
          offeringRef.current = offerings.current;
        }
      } catch (e) {
        console.error('RevenueCat setup failed', e);
        toast({ title: 'Error Loading Plans', variant: 'destructive' });
      } finally {
        setIsLoading(false);
      }
    };
    setup();
  }, [isIOSNative, toast]);

  useEffect(() => {
    const premiumEntitlement = customerInfo?.entitlements.active.premium;
    setIsSubscribed(typeof premiumEntitlement !== 'undefined');
  }, [customerInfo]);

  const getPackageForProgram = useCallback(
    (program: ProgramLike | undefined): PurchasesPackage | undefined => {
      const currentOffering = offeringRef.current;
      if (!program || !currentOffering) return undefined;
      const identifier = program.duration_days === 30 ? 'monthly' 
                       : program.duration_days === 60 ? '2month' 
                       : program.duration_days === 90 ? 'quarterly' 
                       : null;
      if (!identifier) return undefined;
      return currentOffering.availablePackages.find(
        (pkg) => pkg.product.identifier.toLowerCase().includes(identifier)
      );
    },
    [],
  );

  const purchaseProgram = useCallback(
    async (program: ProgramLike) => {
      if (!user) {
        toast({ title: "Authentication Required", variant: "destructive" });
        navigate('/login');
        return;
      }

      const packageToPurchase = getPackageForProgram(program);
      if (!packageToPurchase) {
        toast({ title: 'Plan Not Available', variant: 'destructive' });
        return;
      }

      try {
        const { customerInfo: updatedCustomerInfo } = await Purchases.purchasePackage({ aPackage: packageToPurchase });
        setCustomerInfo(updatedCustomerInfo);

        // --- START: Post-Purchase Logic (from useSubscriptionActions) ---
        
        // 1. Mark existing active subscriptions as completed
        await supabase
          .from('user_subscriptions')
          .update({ status: 'completed' })
          .eq('user_id', user.id)
          .eq('status', 'active');

        // 2. Create the new subscription record
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(startDate.getDate() + program.duration_days);
        await supabase
          .from('user_subscriptions')
          .insert({
            user_id: user.id,
            program_id: program.id,
            start_date: getLocalDateString(startDate),
            end_date: getLocalDateString(endDate),
            status: 'active',
            payment_status: 'paid'
          });

        // 3. Update onboarding state
        const { data: onboardingState } = await supabase
          .from('onboarding_state')
          .update({ 
            subscription_selected: true,
            intro_video_watched: false,
            before_assessment_completed: false,
            journey_started: false
          })
          .eq('user_id', user.id)
          .select('profile_completed')
          .single();

        // 4. Invalidate caches to refresh UI
        await queryClient.invalidateQueries({ queryKey: ['user-current-program'] });
        await queryClient.invalidateQueries({ queryKey: ['onboarding-state'] });

        toast({ title: 'Subscription Active!', description: 'Your purchase was successful.' });

        // 5. Navigate to the correct next step
        if (onboardingState?.profile_completed) {
          navigate('/intro-video');
        } else {
          navigate('/profile-setup');
        }
        // --- END: Post-Purchase Logic ---

      } catch (e: any) {
        if (!e.userCancelled) {
          console.error('RevenueCat purchase failed', e);
          toast({ title: 'Purchase Failed', variant: 'destructive' });
        }
      }
    },
    [user, toast, getPackageForProgram, navigate, queryClient],
  );

  const restorePurchases = useCallback(async () => {
    // ... (restorePurchases logic remains the same)
  }, [toast]);

  return {
    isIOSNative,
    isLoading,
    isSubscribed,
    offering,
    programs,
    getPackageForProgram,
    purchaseProgram,
    restorePurchases,
  };
};