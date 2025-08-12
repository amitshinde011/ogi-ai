

import { useCallback, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import { getAppleProductIdForProgram, type ProgramLike } from '@/utils/iapProductMap';

// Lightweight wrapper. Real IAP requires adding a native IAP plugin and syncing platforms.
// This hook gracefully no-ops on web/Android and informs users.
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
      toast({
        title: 'Continue on Web',
        description: 'Apple subscriptions are only available in the iOS app. Using web/Android payment instead.',
      });
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

    // Placeholder: Here we would call the IAP plugin to purchase productId.
    // We show a friendly message for now until native plugin is added and synced.
    toast({
      title: 'iOS Purchase Not Yet Enabled',
      description: 'Please update native platforms (npx cap sync) to enable Apple subscriptions. Falling back to web payment.',
    });
    return { usedIOS: false } as const;
  }, [findProgramById, isIOSNative, toast]);

  const restorePurchases = useCallback(async () => {
    if (!isIOSNative) {
      toast({
        title: 'Restore not available',
        description: 'Restoring purchases is only available in the iOS app.',
      });
      return false;
    }
    // Placeholder: IAP plugin restore logic goes here
    toast({ title: 'Restore Purchases', description: 'Restoring purchases will be available after enabling iOS IAP plugin.' });
    return false;
  }, [isIOSNative, toast]);

  return { isIOSNative, purchaseIOS, restorePurchases };
};
