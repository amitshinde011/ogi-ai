import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { getAppleProductIdForProgram, type ProgramLike } from '@/utils/iapProductMap';

declare global {
  interface Window {
    CdvPurchase?: {
      log?: { setLevel?: (lvl: number) => void };
      LogLevel?: { ERROR: number; WARNING: number; INFO: number; DEBUG: number };
      Platform?: { APPLE_APPSTORE: string };
      ProductType?: { PAID_SUBSCRIPTION: string };
      store?: any;
    };
    store?: any; // legacy global for old API shapes
    Capacitor?: { getPlatform?: () => string };
  }
}

/* ------------------------------------------------------------- */
/* Helpers & diagnostics                                         */
/* ------------------------------------------------------------- */
const isIOSCapacitor = (): boolean => {
  try {
    const cap = window.Capacitor;
    const platform = cap?.getPlatform?.();
    const isiOSUA = /iPad|iPhone|iPod/.test(navigator.userAgent || '');
    return !!cap && (platform === 'ios' || isiOSUA);
  } catch {
    return false;
  }
};

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

const waitDeviceReady = () =>
  new Promise<void>((resolve) => {
    const done = () => resolve();
    document.addEventListener('deviceready', done, { once: true });
    // Don’t hang forever when testing in web/Simulator without cordova event
    setTimeout(done, 2000);
  });

const cdv = () => window.CdvPurchase;
const store = () => cdv()?.store ?? (window as any).store;
const PLATFORM_IOS = () => cdv()?.Platform?.APPLE_APPSTORE ?? 'ios-appstore';
const SUBS_TYPE = () => cdv()?.ProductType?.PAID_SUBSCRIPTION ?? 'paid subscription';

const snapProducts = (tag = 'snapshot') => {
  try {
    const s = store();
    const list = (s?.products ?? []).map((p: any) => ({
      id: p?.id,
      platform: p?.platform,
      type: p?.type,
      title: p?.title,
      price: p?.price,
      state: p?.state,
      canPurchase: p?.canPurchase,
      loaded: p?.loaded,
      valid: p?.valid,
      owned: p?.owned,
    }));
    console.log(`[IAP] product ${tag}:`, list);
  } catch (e) {
    console.log('[IAP] product snapshot error:', e);
  }
};

const logEnv = () => {
  try {
    console.log('[IAP] ENV', {
      hasCapacitor: !!window.Capacitor,
      capPlatform: window.Capacitor?.getPlatform?.(),
      ua: navigator.userAgent,
      hasCdv: !!window.CdvPurchase,
      platformConst: PLATFORM_IOS(),
      subsTypeConst: SUBS_TYPE(),
    });
  } catch {}
};

/* ------------------------------------------------------------- */

export const useIOSSubscriptions = (programs: ProgramLike[]) => {
  const { toast } = useToast();
  const isIOSNative = useMemo(() => isIOSCapacitor(), []);
  const initializedRef = useRef(false);

  /* --------- Init: register all known product IDs once ---------- */
  useEffect(() => {
    if (!isIOSNative || initializedRef.current) return;

    (async () => {
      await waitDeviceReady();
      logEnv();

      // Turn on plugin debug logs (v13+)
      try {
        if (cdv()?.log?.setLevel && cdv()?.LogLevel?.DEBUG !== undefined) {
          cdv()?.log?.setLevel(cdv()!.LogLevel!.DEBUG);
          console.log('[IAP] cordova-plugin-purchase log level: DEBUG');
        }
      } catch (e) {
        console.log('[IAP] cannot set log level:', e);
      }

      const s = store();
      if (!s) {
        console.log('[IAP] store not found on device (cordova-plugin-purchase missing?)');
        return;
      }

      // Initialize the store (v13+)
      try {
        if (typeof s.initialize === 'function') {
          console.log('[IAP] calling store.initialize([APPLE_APPSTORE])');
          s.initialize([PLATFORM_IOS()]);
        }
      } catch (e) {
        console.log('[IAP] initialize threw:', e);
      }

      // Global listeners
      try {
        const on = (ev: string, cb: (e?: any) => void) => {
          try { if (typeof s.on === 'function') s.on(ev, cb); } catch {}
        };
        on('ready', () => { console.log('[IAP] GLOBAL ready'); snapProducts('ready'); });
        on('refreshed', () => { console.log('[IAP] GLOBAL refreshed'); snapProducts('refreshed'); });
        on('error', (e: any) => console.log('[IAP] GLOBAL error:', e));

        if (typeof s.when === 'function') {
          s.when().productUpdated?.((p: any) => {
            console.log('[IAP][productUpdated]', {
              id: p?.id, state: p?.state, valid: p?.valid, price: p?.price, canPurchase: p?.canPurchase
            });
          });
        }
      } catch (e) {
        console.log('[IAP] global listeners error:', e);
      }

      const mappedIds = Array.from(
        new Set(programs.map((p) => getAppleProductIdForProgram(p)).filter(Boolean) as string[]),
      );
      const defaultIds = [
        'care.yogi.app.membership.monthly',
        'care.yogi.app.membership.2month',
        'care.yogi.app.membership.quarterly',
      ];
      const ids = mappedIds.length ? mappedIds : defaultIds;

      console.log('[IAP] registering product IDs:', ids, {
        platform: PLATFORM_IOS(),
        type: SUBS_TYPE(),
      });

      ids.forEach((id) => {
        try {
          s.register?.({ id, type: SUBS_TYPE(), platform: PLATFORM_IOS() });
        } catch (e) {
          console.log('[IAP] register error for', id, e);
        }
      });

      // Load products
      try {
        console.log('[IAP] calling store.refresh()');
        s.refresh?.();
      } catch (e) {
        console.log('[IAP] refresh threw:', e);
      }

      // Re-snapshot after short delays
      setTimeout(() => snapProducts('post-refresh-2s'), 2000);
      setTimeout(() => snapProducts('post-refresh-5s'), 5000);

      // If still empty on Simulator, log the StoreKit hint
      setTimeout(() => {
        try {
          const empty = !Array.isArray(s.products) || s.products.length === 0;
          if (empty) {
            console.log(
              '[IAP] No products loaded. On Simulator, attach a StoreKit Configuration file (.storekit) to the active scheme.'
            );
          }
        } catch {}
      }, 5500);

      initializedRef.current = true;
    })();
  }, [isIOSNative, programs]);

  const findProgramById = useCallback(
    (programId: string) => programs.find((p) => p.id === programId),
    [programs],
  );

  /* ------------------------- Purchase -------------------------- */
  const purchaseIOS = useCallback(
    async (programId: string) => {
      const program = findProgramById(programId);
      const productId = getAppleProductIdForProgram(program);

      if (!isIOSNative) return { usedIOS: false } as const;

      if (!productId) {
        toast({
          title: 'Product not available',
          description: 'This plan is not available for iOS purchase yet.',
          variant: 'destructive',
        });
        return { usedIOS: true, success: false } as const;
      }

      try {
        await waitDeviceReady();
        const s = store();
        if (!s) {
          toast({
            title: 'iOS IAP not available',
            description: 'Install cordova-plugin-purchase & run `npx cap sync`.',
            variant: 'destructive',
          });
          return { usedIOS: false } as const;
        }

        // Ensure initialized & registered (if programs arrived later)
        try {
          if (typeof s.initialize === 'function') s.initialize([PLATFORM_IOS()]);
        } catch {}
        try {
          s.register?.({ id: productId, type: SUBS_TYPE(), platform: PLATFORM_IOS() });
        } catch {}

        console.log('[IAP] attempt purchase for', productId);
        snapProducts('before-order');

        // Give StoreKit a brief moment if needed, then re-check
        await wait(250);
        const p =
          s.get?.(productId) ??
          (s.products || []).find((x: any) => x?.id === productId);

        const looksInvalid =
          !p || p.valid === false || p.loaded === false || p.canPurchase === false;

        if (looksInvalid) {
          console.log('[IAP] product not valid/loaded yet:', p);
          toast({
            title: 'Product not available yet',
            description:
              'App Store hasn’t returned this product. Verify Product ID, that the subscription is “Ready to Submit”, pricing is set, the app has the In-App Purchase capability, and you’re in a Sandbox/TestFlight environment (or attach a .storekit file when using the Simulator).',
            variant: 'destructive',
          });
          return { usedIOS: true, success: false } as const;
        }

        // Attach per-product listeners
        const attachPerProduct = (
          evt: 'approved' | 'owned' | 'cancelled' | 'rejected' | 'error',
          cb: (arg: any) => void
        ) => {
          try {
            if (typeof s.once === 'function') {
              const b = s.once(productId);
              if (typeof (b as any)?.[evt] === 'function') (b as any)[evt](cb);
              return;
            }
          } catch {}
          try {
            if (typeof s.when === 'function') {
              const b = s.when(productId);
              if (typeof (b as any)?.[evt] === 'function') (b as any)[evt](cb);
            }
          } catch {}
        };

        const result = await new Promise<{ success: boolean; receipt?: string }>((resolve) => {
          let settled = false;

          attachPerProduct('approved', (order: any) => {
            console.log('[IAP] approved event:', {
              id: order?.id, state: order?.state, tx: order?.transaction
            });
            if (settled) return;
            settled = true;
            const receipt = order?.transaction?.appStoreReceipt || s?.getReceipt?.();
            try { order?.finish?.(); } catch {}
            resolve({ success: true, receipt });
          });

          attachPerProduct('cancelled', (e: any) => {
            console.log('[IAP] cancelled event:', e);
            if (settled) return;
            settled = true;
            resolve({ success: false });
          });

          attachPerProduct('rejected', (e: any) => {
            console.log('[IAP] rejected event:', e);
            if (settled) return;
            settled = true;
            resolve({ success: false });
          });

          attachPerProduct('error', (e: any) => {
            console.log('[IAP] product error event:', e);
            if (settled) return;
            settled = true;
            resolve({ success: false });
          });

          try {
            console.log('[IAP] calling store.order()', productId);
            s.order?.(productId);
          } catch (e) {
            console.log('[IAP] order threw:', e);
          }

          // Safety timeout
          setTimeout(() => {
            if (!settled) {
              console.log('[IAP] timeout waiting for approval/cancel/reject');
              resolve({ success: false });
            }
          }, 30000);
        });

        if (!result.success) {
          toast({ title: 'Purchase failed', description: 'Please try again.' });
          return { usedIOS: true, success: false } as const;
        }

        const receiptData = result.receipt;
        if (!receiptData) {
          toast({ title: 'Missing receipt', description: 'Could not retrieve App Store receipt.', variant: 'destructive' });
          return { usedIOS: true, success: false } as const;
        }

        console.log('[IAP] verifying receipt with edge function…');
        const { data, error } = await supabase.functions.invoke('ios-subscription-entitlement', {
          body: { action: 'verify_receipt', receiptData, productId },
        });

        if (error || !data?.success) {
          console.log('[IAP] verification failed:', { error, data });
          toast({ title: 'Verification failed', description: 'Contact support if this persists.', variant: 'destructive' });
          return { usedIOS: true, success: false } as const;
        }

        console.log('[IAP] verification success:', data);
        toast({ title: 'Subscription Active', description: 'Your Apple subscription was activated.' });
        return { usedIOS: true, success: true } as const;
      } catch (err) {
        console.log('[IAP] purchase flow error:', err);
        toast({ title: 'Purchase error', description: 'Something went wrong. Try again later.', variant: 'destructive' });
        return { usedIOS: true, success: false } as const;
      }
    },
    [findProgramById, isIOSNative, toast],
  );

  /* ------------------------- Restore --------------------------- */
  const restorePurchases = useCallback(async () => {
    if (!isIOSNative) {
      toast({ title: 'Restore not available', description: 'Restoring purchases is only available in the iOS app.' });
      return false;
    }
    try {
      await waitDeviceReady();
      const s = store();
      if (!s) {
        toast({ title: 'Not available', description: 'Install IAP plugin and sync native platforms.' });
        return false;
      }
      try {
        if (typeof s.initialize === 'function') s.initialize([PLATFORM_IOS()]);
      } catch {}
      try { console.log('[IAP] restore: calling refresh()'); s.refresh?.(); } catch {}
      const receipt = s?.getReceipt?.();
      console.log('[IAP] restore: receipt present?', !!receipt);
      if (!receipt) {
        toast({ title: 'No purchases found', description: 'No valid Apple receipts found for this device.' });
        return false;
      }
      const { data, error } = await supabase.functions.invoke('ios-subscription-entitlement', {
        body: { action: 'verify_receipt', receiptData: receipt, productId: 'restore' },
      });
      if (error || !data?.success) {
        console.log('[IAP] restore verification failed:', { error, data });
        toast({ title: 'Restore failed', description: 'We could not restore purchases.', variant: 'destructive' });
        return false;
      }
      console.log('[IAP] restore success');
      toast({ title: 'Restored', description: 'Your purchases have been restored.' });
      return true;
    } catch (e) {
      console.log('[IAP] restorePurchases error:', e);
      toast({ title: 'Error', description: 'Could not restore purchases.', variant: 'destructive' });
      return false;
    }
  }, [isIOSNative, toast]);

  return { isIOSNative, purchaseIOS, restorePurchases };
};
