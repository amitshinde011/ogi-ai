import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { getLocalDateString } from '@/utils/dateUtils';
import { offlineQueue } from '@/utils/offlineQueue';
import { localCache } from '@/utils/localCache';

interface StepData {
  steps: number;
  lastUpdated: Date;
}

export const useStepTracking = () => {
  const [stepData, setStepData] = useState<StepData>({ steps: 0, lastUpdated: new Date() });
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Load persisted data from localStorage
  const loadPersistedData = useCallback(() => {
    if (!user) return 0;
    
    try {
      const today = getLocalDateString();
      const savedData = localStorage.getItem(`steps_${user.id}_${today}`);
      if (savedData) {
        const parsed = JSON.parse(savedData);
        return parsed.steps || 0;
      }
      return 0;
    } catch (error) {
      console.error('Error loading persisted data:', error);
      return 0;
    }
  }, [user]);

  // Persist data to IndexedDB via localCache
  const persistData = useCallback((steps: number) => {
    if (!user) return;
    const today = getLocalDateString();
    // fire and forget
    localCache.setLocalSteps(user.id, today, steps);
  }, [user]);

  // This function is available if needed (e.g., on logout), but not called automatically
  const clearUserCache = useCallback(() => {
    if (!user) return;
    
    const today = getLocalDateString();
    const keysToRemove = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (
        key.startsWith('steps_') ||
        key.startsWith('step_goal_achieved_') ||
        (key.includes('step') && key !== `steps_${user.id}_${today}`)
      )) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => {
      console.log('🧹 Clearing stale step cache:', key);
      localStorage.removeItem(key);
    });
  }, [user]);

  // Fetch today's steps from database (with updated_at)
  const fetchTodaySteps = useCallback(async (): Promise<{ steps: number; updatedAt?: number }> => {
    if (!user) return { steps: 0 };

    try {
      const today = getLocalDateString();

      // Offline? Return IndexedDB value immediately to avoid failed network calls
      if (!navigator.onLine) {
        const localSteps = await localCache.getLocalSteps(user.id, today);
        return { steps: localSteps };
      }

      const { data, error } = await supabase
        .from('steps_tracking')
        .select('steps_count, updated_at')
        .eq('user_id', user.id)
        .eq('date', today)
        .maybeSingle();

      if (error) throw error;
      return { steps: data?.steps_count || 0, updatedAt: data?.updated_at ? new Date(data.updated_at as any).getTime() : undefined };
    } catch (error) {
      console.error('Error fetching today steps:', error);
      const today = getLocalDateString();
      const localSteps = await localCache.getLocalSteps(user.id, today);
      return { steps: localSteps };
    }
  }, [user]);

  // Sync steps to database
  const syncToDatabase = useCallback(async (steps: number) => {
    if (!user) return;

    try {
      const today = getLocalDateString();

      if (!navigator.onLine) {
        await offlineQueue.enqueue('steps_upsert', { user_id: user.id, date: today, steps });
        persistData(steps);
        return;
      }
      
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
      
      console.log('🔄 Steps saved to database:', steps);
      persistData(steps);
    } catch (error) {
      console.error('Error syncing to database:', error);
      const today = getLocalDateString();
      await offlineQueue.enqueue('steps_upsert', { user_id: user!.id, date: today, steps });
      persistData(steps);
    }
  }, [user, persistData]);

  // Initialize step tracking
  useEffect(() => {
    const initializeTracking = async () => {
      if (!user) return;

      console.log('🎯 Initializing step tracking for user:', user.id);
      
      // FIX: Do not clear the cache on every initialization.
      // This was deleting the 'step_goal_achieved' flag.
      // clearUserCache();

      setIsLoading(true);
      try {
        // Show local cache immediately (offline-first UI)
        const today = getLocalDateString();
        const { steps: localSteps, timestamp: localTs } = await localCache.getLocalStepsMeta(user.id, today);
        setStepData({ steps: localSteps, lastUpdated: new Date() });

        // Fetch DB and resolve conflicts by timestamp
        const { steps: dbSteps, updatedAt: dbTs } = await fetchTodaySteps();
        const dbTimestamp = dbTs || 0;

        if ((localTs || 0) > dbTimestamp) {
          // Local is newer → keep local and sync to DB (if possible)
          if (navigator.onLine) {
            await syncToDatabase(localSteps);
          } else {
            await offlineQueue.enqueue('steps_upsert', { user_id: user.id, date: today, steps: localSteps });
          }
          persistData(localSteps);
          console.log('📌 Using newer local steps:', localSteps);
        } else {
          // DB is newer or equal
          setStepData({ steps: dbSteps, lastUpdated: new Date() });
          persistData(dbSteps);
          console.log('📌 Using DB steps:', dbSteps);
        }
      } catch (error) {
        console.error('Error initializing step tracking:', error);
        setStepData({ steps: 0, lastUpdated: new Date() });
        persistData(0);
      } finally {
        setIsLoading(false);
      }
    };

    initializeTracking();
  }, [user, fetchTodaySteps, persistData]);

  // Setup sync on app visibility change and before unload
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && stepData.steps > 0) {
        console.log('📱 App foregrounded - syncing step data');
        syncToDatabase(stepData.steps);
      }
    };

    const handleBeforeUnload = () => {
      if (stepData.steps > 0) {
        syncToDatabase(stepData.steps);
      }
    };
    
    // As requested, the on-focus reload is disabled.
    // document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      // document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [stepData.steps, syncToDatabase]);

  // Manual step addition
  const manuallyAddSteps = useCallback(async (additionalSteps: number) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to track steps",
        variant: "destructive"
      });
      return;
    }

    const newTotal = stepData.steps + additionalSteps;
    const newStepData = { steps: newTotal, lastUpdated: new Date() };
    
    setStepData(newStepData);
    await syncToDatabase(newTotal);
    
    console.log('➕ Adding manual steps:', additionalSteps, 'New total:', newTotal);
    
    const event = new CustomEvent('stepsUpdated', {
      detail: { steps: newTotal }
    });
    window.dispatchEvent(event);
    console.log('📢 StepTracker: stepsUpdated event dispatched with:', newTotal);
    
    toast({
      title: "Steps added!",
      description: `Added ${additionalSteps} steps. Total: ${newTotal}`,
    });
  }, [user, stepData.steps, syncToDatabase, toast]);

  // Force sync with database
  const saveStepsToDatabase = useCallback(async () => {
    if (!user) return;

    try {
      await syncToDatabase(stepData.steps);
      toast({
        title: "Steps synced!",
        description: "Your step data has been saved successfully.",
      });
    } catch (error) {
      console.error('Error saving steps:', error);
      toast({
        title: "Sync failed",
        description: "Failed to sync steps. Data saved locally.",
        variant: "destructive"
      });
    }
  }, [user, stepData.steps, syncToDatabase, toast]);

  return {
    stepData,
    isLoading,
    isTracking: false, // Manual only, no automatic tracking
    manuallyAddSteps,
    saveStepsToDatabase,
    clearUserCache // Exposing this function in case it's needed on logout
  };
};