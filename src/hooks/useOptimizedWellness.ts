
import { useState, useCallback, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useAnalytics } from '@/hooks/useAnalytics';
import { getLocalDateString } from '@/utils/dateUtils';
import { offlineQueue } from '@/utils/offlineQueue';
import { localCache } from '@/utils/localCache';

interface WellnessData {
  id?: string;
  water_litres: number;
  surya_namaskar_count: number;
  meditation_completed: boolean;
}

export const useOptimizedWellness = (initialData: WellnessData) => {
  const { user } = useAuth();
  console.log('🌟 useOptimizedWellness: Hook initialized with data:', initialData);
  
  const [wellnessData, setWellnessData] = useState<WellnessData>(initialData);
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();
  const { trackEvent } = useAnalytics();
  const updateTimeoutRef = useRef<NodeJS.Timeout>();
  const pendingUpdatesRef = useRef<Partial<WellnessData>>({});
  const isUpdateInProgressRef = useRef(false);
  const lastUpdateRef = useRef<number>(0);

  // Sync with initial data when it changes
  useEffect(() => {
    // Only update if data is different to prevent loops
    const hasChanges = 
      initialData.id !== wellnessData.id ||
      initialData.water_litres !== wellnessData.water_litres ||
      initialData.surya_namaskar_count !== wellnessData.surya_namaskar_count ||
      initialData.meditation_completed !== wellnessData.meditation_completed;

    if (hasChanges) {
      console.log('🔄 useOptimizedWellness: Syncing with new initial data:', {
        oldData: wellnessData,
        newData: initialData
      });
      setWellnessData(initialData);
    }
  }, [initialData.id, initialData.water_litres, initialData.surya_namaskar_count, initialData.meditation_completed]);

  const debouncedUpdate = useCallback(async (updates: Partial<WellnessData>) => {
    const now = Date.now();
    
    // Prevent too frequent updates
    if (now - lastUpdateRef.current < 1000) {
      console.log('🚫 useOptimizedWellness: Throttling update request');
      return;
    }

    console.log('⏱️ useOptimizedWellness: Debounced update triggered with:', updates);
    
    // Clear existing timeout
    if (updateTimeoutRef.current) {
      console.log('🔄 useOptimizedWellness: Clearing existing timeout');
      clearTimeout(updateTimeoutRef.current);
    }

    // Accumulate pending updates
    pendingUpdatesRef.current = {
      ...pendingUpdatesRef.current,
      ...updates
    };
    console.log('📝 useOptimizedWellness: Accumulated pending updates:', pendingUpdatesRef.current);

    // Update local state immediately for UI responsiveness
    setWellnessData(prev => {
      const newData = { ...prev, ...updates };
      console.log('🎯 useOptimizedWellness: Local state updated immediately:', { prev, updates, newData });
      return newData;
    });

    // If offline, cache and enqueue immediately
    if (!navigator.onLine && user) {
      const today = getLocalDateString();
      const newData = { ...wellnessData, ...pendingUpdatesRef.current };
      localCache.setTodayWellness(user.id, today, {
        water_litres: newData.water_litres,
        surya_namaskar_count: newData.surya_namaskar_count,
        meditation_completed: newData.meditation_completed,
      });
      const payload: any = { user_id: user.id, date: today };
      if (Object.prototype.hasOwnProperty.call(pendingUpdatesRef.current, 'water_litres')) payload.water_litres = newData.water_litres;
      if (Object.prototype.hasOwnProperty.call(pendingUpdatesRef.current, 'surya_namaskar_count')) payload.surya_namaskar_count = newData.surya_namaskar_count;
      if (Object.prototype.hasOwnProperty.call(pendingUpdatesRef.current, 'meditation_completed')) payload.meditation_completed = newData.meditation_completed;
      await offlineQueue.enqueue('wellness_upsert', payload);
      toast({ title: 'Saved offline', description: "We'll sync when you're back online." });
      return;
    }

    // If an update is already in progress, just accumulate the changes
    if (isUpdateInProgressRef.current) {
      console.log('⏳ useOptimizedWellness: Update already in progress, accumulating changes');
      return;
    }

    // Debounce the actual API call
    updateTimeoutRef.current = setTimeout(async () => {
      if (isUpdateInProgressRef.current) {
        console.log('⚠️ useOptimizedWellness: Update still in progress, skipping');
        return;
      }

      isUpdateInProgressRef.current = true;
      setIsUpdating(true);
      lastUpdateRef.current = Date.now();
      console.log('🚀 useOptimizedWellness: Starting API update process');

      // Get all pending updates and clear them
      const allPendingUpdates = { ...pendingUpdatesRef.current };
      pendingUpdatesRef.current = {};
      console.log('📦 useOptimizedWellness: Processing accumulated updates:', allPendingUpdates);

      try {
        if (!user) {
          console.error('❌ useOptimizedWellness: No authenticated user found');
          trackEvent('wellness_update_error', 'Error', 'No User');
          return;
        }

        const today = getLocalDateString();
        const updatedData = { ...wellnessData, ...allPendingUpdates };
        console.log('📊 useOptimizedWellness: Prepared data for API update:', { 
          today, 
          updatedData, 
          hasId: !!updatedData.id 
        });

        // Use optimized upsert function
        console.log('🚀 useOptimizedWellness: Using optimized upsert function');
        const { data, error } = await supabase.rpc('upsert_wellness_data', {
          p_user_id: user.id,
          p_date: today,
          p_water_litres: allPendingUpdates.water_litres !== undefined ? updatedData.water_litres : null,
          p_surya_namaskar_count: allPendingUpdates.surya_namaskar_count !== undefined ? updatedData.surya_namaskar_count : null,
          p_meditation_completed: allPendingUpdates.meditation_completed !== undefined ? updatedData.meditation_completed : null,
          p_meditation_minutes: 0
        });

        if (error) {
          console.error('❌ useOptimizedWellness: Error with upsert function:', error);
          throw error;
        }

        if (data && data.length > 0) {
          const result = data[0];
          console.log('✅ useOptimizedWellness: Successfully upserted wellness data:', result);
          setWellnessData(prev => ({ 
            ...prev, 
            id: result.id,
            water_litres: result.water_litres,
            surya_namaskar_count: result.surya_namaskar_count,
            meditation_completed: result.meditation_completed
          }));

          // Notify the app so other pages refresh immediately
          window.dispatchEvent(new CustomEvent('wellnessUpdated', {
            detail: {
              water_litres: result.water_litres,
              surya_namaskar_count: result.surya_namaskar_count,
              meditation_completed: result.meditation_completed,
            }
          }));

          trackEvent('wellness_upsert_success', 'Wellness', 'Optimized Upsert');
        }

        // Track specific wellness actions
        if (allPendingUpdates.water_litres !== undefined) {
          trackEvent('water_intake_update', 'Wellness', 'Water', updatedData.water_litres);
        }
        if (allPendingUpdates.surya_namaskar_count !== undefined) {
          trackEvent('surya_namaskar_update', 'Wellness', 'Yoga', updatedData.surya_namaskar_count);
        }
        if (allPendingUpdates.meditation_completed !== undefined) {
          trackEvent('meditation_toggle', 'Wellness', 'Meditation', updatedData.meditation_completed ? 1 : 0);
        }

      } catch (error) {
        console.error('❌ useOptimizedWellness: Error updating wellness data:', error);
        trackEvent('wellness_update_error', 'Error', 'API Failure');
        
        toast({
          title: "Error",
          description: "Failed to update wellness data.",
          variant: "destructive",
        });
      } finally {
        isUpdateInProgressRef.current = false;
        setIsUpdating(false);
        console.log('🏁 useOptimizedWellness: Update process completed');
      }
    }, 2000); // Increased debounce delay to 2 seconds
  }, [wellnessData, toast, user]);

  const updateWater = useCallback((delta: number) => {
    const newValue = Math.max(0, wellnessData.water_litres + delta);
    console.log('💧 useOptimizedWellness: Water update requested:', { 
      current: wellnessData.water_litres, 
      delta, 
      newValue 
    });
    trackEvent('water_intake_action', 'UI', delta > 0 ? 'Increase' : 'Decrease', Math.abs(delta));
    debouncedUpdate({ water_litres: newValue });
  }, [wellnessData.water_litres, debouncedUpdate, trackEvent]);

  const updateSuryaNamaskar = useCallback((delta: number) => {
    const newValue = Math.max(0, wellnessData.surya_namaskar_count + delta);
    console.log('🧘 useOptimizedWellness: Surya Namaskar update requested:', { 
      current: wellnessData.surya_namaskar_count, 
      delta, 
      newValue 
    });
    trackEvent('surya_namaskar_action', 'UI', delta > 0 ? 'Increase' : 'Decrease', Math.abs(delta));
    debouncedUpdate({ surya_namaskar_count: newValue });
  }, [wellnessData.surya_namaskar_count, debouncedUpdate, trackEvent]);

  const toggleMeditation = useCallback(() => {
    const newValue = !wellnessData.meditation_completed;
    console.log('🧘‍♀️ useOptimizedWellness: Meditation toggle requested:', { 
      current: wellnessData.meditation_completed, 
      newValue 
    });
    trackEvent('meditation_action', 'UI', newValue ? 'Complete' : 'Incomplete');
    debouncedUpdate({ meditation_completed: newValue });
  }, [wellnessData.meditation_completed, debouncedUpdate, trackEvent]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (updateTimeoutRef.current) {
        console.log('🧹 useOptimizedWellness: Cleaning up timeout on unmount');
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, []);

  console.log('📊 useOptimizedWellness: Current state:', { 
    wellnessData, 
    isUpdating, 
    hasPendingUpdates: Object.keys(pendingUpdatesRef.current).length > 0 
  });

  return {
    wellnessData,
    isUpdating,
    updateWater,
    updateSuryaNamaskar,
    toggleMeditation
  };
};
