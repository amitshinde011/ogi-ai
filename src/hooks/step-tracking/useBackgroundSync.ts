import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SyncConfig {
  batchSize: number; // steps before forced sync
  syncInterval: number; // ms between automatic syncs
  maxRetries: number;
}

interface SyncState {
  lastSyncTime: number;
  pendingSteps: number;
  isOnline: boolean;
  isSyncing: boolean;
  syncError: string | null;
}

export const useBackgroundSync = (config: SyncConfig) => {
  const [syncState, setSyncState] = useState<SyncState>({
    lastSyncTime: 0,
    pendingSteps: 0,
    isOnline: navigator.onLine,
    isSyncing: false,
    syncError: null
  });

  const syncTimeoutRef = useRef<NodeJS.Timeout>();
  const retryCountRef = useRef(0);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setSyncState(prev => ({ ...prev, isOnline: true }));
    const handleOffline = () => setSyncState(prev => ({ ...prev, isOnline: false }));

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Save steps to database
  const syncStepsToDatabase = useCallback(async (steps: number, force = false): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      setSyncState(prev => ({ ...prev, isSyncing: true, syncError: null }));

      const today = new Date().toISOString().split('T')[0];
      
      const { error } = await supabase
        .from('steps_tracking')
        .upsert({
          user_id: user.id,
          date: today,
          steps_count: steps
        }, {
          onConflict: 'user_id,date'
        });

      if (error) throw error;

      const now = Date.now();
      setSyncState(prev => ({
        ...prev,
        lastSyncTime: now,
        pendingSteps: 0,
        isSyncing: false,
        syncError: null
      }));

      retryCountRef.current = 0;
      console.log('💾 Steps synced to database:', steps);
      return true;

    } catch (error) {
      console.error('❌ Sync failed:', error);
      setSyncState(prev => ({
        ...prev,
        isSyncing: false,
        syncError: error instanceof Error ? error.message : 'Sync failed'
      }));

      // Retry logic
      if (retryCountRef.current < config.maxRetries) {
        retryCountRef.current++;
        const retryDelay = Math.pow(2, retryCountRef.current) * 1000; // Exponential backoff
        console.log(`🔄 Retrying sync in ${retryDelay/1000}s (attempt ${retryCountRef.current})`);
        
        setTimeout(() => {
          syncStepsToDatabase(steps, force);
        }, retryDelay);
      }

      return false;
    }
  }, [config.maxRetries]);

  // Load steps from database
  const loadStepsFromDatabase = useCallback(async (): Promise<number> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return 0;

      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('steps_tracking')
        .select('steps_count')
        .eq('user_id', user.id)
        .eq('date', today)
        .maybeSingle();

      if (error) throw error;

      const steps = data?.steps_count || 0;
      console.log('📊 Loaded steps from database:', steps);
      return steps;

    } catch (error) {
      console.error('❌ Failed to load steps:', error);
      return 0;
    }
  }, []);

  // Schedule background sync
  const scheduleSync = useCallback((currentSteps: number) => {
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }

    setSyncState(prev => ({ ...prev, pendingSteps: currentSteps }));

    // Force sync if batch size reached
    if (currentSteps > 0 && currentSteps % config.batchSize === 0) {
      console.log('📊 Batch size reached, forcing sync');
      syncStepsToDatabase(currentSteps, true);
      return;
    }

    // Schedule next sync
    syncTimeoutRef.current = setTimeout(() => {
      if (syncState.isOnline && currentSteps > 0) {
        syncStepsToDatabase(currentSteps);
      }
    }, config.syncInterval);

  }, [config.batchSize, config.syncInterval, syncState.isOnline, syncStepsToDatabase]);

  // Background sync when app becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && syncState.pendingSteps > 0 && syncState.isOnline) {
        console.log('👁️ App visible, syncing pending steps');
        syncStepsToDatabase(syncState.pendingSteps);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [syncState.pendingSteps, syncState.isOnline, syncStepsToDatabase]);

  // Auto-sync when coming back online
  useEffect(() => {
    if (syncState.isOnline && syncState.pendingSteps > 0) {
      console.log('🌐 Back online, syncing pending steps');
      syncStepsToDatabase(syncState.pendingSteps);
    }
  }, [syncState.isOnline, syncState.pendingSteps, syncStepsToDatabase]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, []);

  return {
    syncState,
    syncStepsToDatabase,
    loadStepsFromDatabase,
    scheduleSync
  };
};