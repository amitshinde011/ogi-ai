import { useCallback, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import { getAppleProductIdForProgram, type ProgramLike } from '@/utils/iapProductMap';
import { supabase } from '@/integrations/supabase/client';

// Lightweight wrapper. Real IAP requires adding a native IAP plugin and syncing platforms.
// This hook now attempts native iOS IAP using cordova-plugin-purchase when available.
export const useIOSSubscriptions = (programs: ProgramLike[]) => {
  const { toast } = useToast();

  const isIOSNative = useMemo(() => {
    try {
      const isCapacitor = typeof (window as any).Capacitor !== 'undefined';
      const platform = isCapacitor ? (window as any).Capacitor.getPlatform?.() : undefined;
      const isiOSByCap = platform === 'ios';
      const ua = navigator.userAgent || '';
      const isiOSUA = /iPad|iPhone|iPod/.test(ua);
      return isCapacitor && (isiOSByCap || isiOSUA);
    } catch {
      return false;
    }
  }, []);

  const findProgramById = useCallback((programId: string) => {
    return programs.find(p => p.id === programId);
  }, [programs]);

  const purchaseIOS = useCallback(async (programId: string) => {
    const program = findProgramById(programId);
    const productId = getAppleProductIdForProgram(program);

    if (!isIOSNative) {
      // Silent fallback to web/Android payment flow
      return { usedIOS: false } as const;
    }

    if (!productId) {
      toast({
        title: 'Product not available',
        description: 'This plan is not available for iOS purchase yet.',
        variant: 'destructive',
      });
      return { usedIOS: true, success: false } as const;
    }

    try {
      const store: any = (window as any).store;
      if (!store) {
        toast({
          title: 'iOS IAP Not Available',
          description: 'Please run npx cap sync and enable In-App Purchases in Xcode.',
          variant: 'destructive',
        });
        return { usedIOS: false } as const;
      }

      const iosProductId = productId;
      const SUBS_TYPE = store?.ProductType?.PAID_SUBSCRIPTION ?? store?.PAID_SUBSCRIPTION ?? 'paid subscription';

      // Register and kick off purchase flow
      store.register({ id: iosProductId, type: SUBS_TYPE });

      const result = await new Promise<{ success: boolean; receipt?: string }>((resolve) => {
        store.once(iosProductId).approved((order: any) => {
          const receipt = order?.transaction?.appStoreReceipt || store?.getReceipt?.();
          resolve({ success: true, receipt });
          try { order.finish(); } catch {}
        });

        store.once(iosProductId).error((err: any) => {
          console.error('IAP error', err);
          resolve({ success: false });
        });

        try { store.refresh(); } catch {}
        try { store.order(iosProductId); } catch (e: any) {
          console.error('order failed', e);
        }
      });

      if (!result.success) {
        toast({ title: 'Purchase failed', description: 'Please try again.' });
        return { usedIOS: true, success: false } as const;
      }

      const receiptData = result.receipt;
      if (!receiptData) {
        toast({ title: 'Missing Receipt', description: 'Could not retrieve App Store receipt.' });
        return { usedIOS: true, success: false } as const;
      }

      const { data, error } = await supabase.functions.invoke('ios-subscription-entitlement', {
        body: { action: 'verify_receipt', receiptData, productId: iosProductId },
      });

      if (error || !data?.success) {
        console.error('Receipt verification failed', error, data);
        toast({ title: 'Verification failed', description: 'Contact support if this persists.', variant: 'destructive' });
        return { usedIOS: true, success: false } as const;
      }

      toast({ title: 'Subscription Active', description: 'Your Apple subscription was activated.' });
      return { usedIOS: true, success: true } as const;
    } catch (err) {
      console.error('iOS purchase flow error', err);
      toast({ title: 'Purchase error', description: 'Something went wrong. Try again later.', variant: 'destructive' });
      return { usedIOS: true, success: false } as const;
    }
  }, [findProgramById, isIOSNative, toast]);

  const restorePurchases = useCallback(async () => {
    if (!isIOSNative) {
      toast({
        title: 'Restore not available',
        description: 'Restoring purchases is only available in the iOS app.',
      });
      return false;
    }

    try {
      const store: any = (window as any).store;
      if (!store) {
        toast({ title: 'Not available', description: 'Install IAP plugin and sync native platforms.' });
        return false;
      }

      try { store.refresh(); } catch {}
      const receipt = store?.getReceipt?.();
      if (!receipt) {
        toast({ title: 'No purchases found', description: 'No valid Apple receipts found for this device.' });
        return false;
      }

      const { data, error } = await supabase.functions.invoke('ios-subscription-entitlement', {
        body: { action: 'verify_receipt', receiptData: receipt, productId: 'restore' },
      });

      if (error || !data?.success) {
        toast({ title: 'Restore failed', description: 'We could not restore purchases.', variant: 'destructive' });
        return false;
      }

      toast({ title: 'Restored', description: 'Your purchases have been restored.' });
      return true;
    } catch (e) {
      console.error('restorePurchases error', e);
      toast({ title: 'Error', description: 'Could not restore purchases.', variant: 'destructive' });
      return false;
    }
  }, [isIOSNative, toast]);

  return { isIOSNative, purchaseIOS, restorePurchases };
};
