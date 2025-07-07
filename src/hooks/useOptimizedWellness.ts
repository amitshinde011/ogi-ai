
import { useState, useCallback, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAnalytics } from '@/hooks/useAnalytics';

interface WellnessData {
  id?: string;
  water_litres: number;
  surya_namaskar_count: number;
  meditation_completed: boolean;
}

export const useOptimizedWellness = (initialData: WellnessData) => {
  console.log('🌟 useOptimizedWellness: Hook initialized with data:', initialData);
  
  const [wellnessData, setWellnessData] = useState<WellnessData>(initialData);
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();
  const { trackEvent } = useAnalytics();
  const updateTimeoutRef = useRef<NodeJS.Timeout>();
  const pendingUpdatesRef = useRef<Partial<WellnessData>>({});
  const isUpdateInProgressRef = useRef(false);

  // Sync with initial data when it changes (e.g., when returning to the page)
  useEffect(() => {
    console.log('🔄 useOptimizedWellness: Syncing with new initial data:', {
      oldData: wellnessData,
      newData: initialData
    });
    setWellnessData(initialData);
    trackEvent('wellness_data_sync', 'Data Management', 'Initial Data Updated');
  }, [initialData.id, initialData.water_litres, initialData.surya_namaskar_count, initialData.meditation_completed, trackEvent]);

  const debouncedUpdate = useCallback(async (updates: Partial<WellnessData>) => {
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
      console.log('🚀 useOptimizedWellness: Starting API update process');

      // Get all pending updates and clear them
      const allPendingUpdates = { ...pendingUpdatesRef.current };
      pendingUpdatesRef.current = {};
      console.log('📦 useOptimizedWellness: Processing accumulated updates:', allPendingUpdates);

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          console.error('❌ useOptimizedWellness: No authenticated user found');
          trackEvent('wellness_update_error', 'Error', 'No User');
          return;
        }

        const today = new Date().toISOString().split('T')[0];
        const updatedData = { ...wellnessData, ...allPendingUpdates };
        console.log('📊 useOptimizedWellness: Prepared data for API update:', { 
          today, 
          updatedData, 
          hasId: !!updatedData.id 
        });

        if (updatedData.id) {
          // Update existing record with accumulated values
          console.log('🔄 useOptimizedWellness: Updating existing record with ID:', updatedData.id);
          const { error } = await supabase
            .from('daily_wellness')
            .update({
              water_litres: updatedData.water_litres,
              surya_namaskar_count: updatedData.surya_namaskar_count,
              meditation_completed: updatedData.meditation_completed
            })
            .eq('id', updatedData.id);

          if (error) {
            console.error('❌ useOptimizedWellness: Error updating record:', error);
            throw error;
          }

          console.log('✅ useOptimizedWellness: Successfully updated existing record');
          trackEvent('wellness_update_success', 'Wellness', 'Update Existing');
        } else {
          // Create new record with accumulated values
          console.log('➕ useOptimizedWellness: Creating new wellness record');
          const { data, error } = await supabase
            .from('daily_wellness')
            .upsert(
              {
                user_id: user.id,
                date: today,
                water_litres: updatedData.water_litres,
                surya_namaskar_count: updatedData.surya_namaskar_count,
                meditation_completed: updatedData.meditation_completed,
                meditation_minutes: 0
              },
              { 
                onConflict: 'user_id,date',
                ignoreDuplicates: false 
              }
            )
            .select()
            .single();

          if (error) {
            console.error('❌ useOptimizedWellness: Error creating record:', error);
            throw error;
          }

          if (data) {
            console.log('✅ useOptimizedWellness: Successfully created new record with ID:', data.id);
            setWellnessData(prev => ({ ...prev, id: data.id }));
            trackEvent('wellness_create_success', 'Wellness', 'Create New');
          }
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

        // If there are new pending updates that came in during the API call, schedule another update
        if (Object.keys(pendingUpdatesRef.current).length > 0) {
          console.log('🔄 useOptimizedWellness: New updates pending, scheduling another update');
          isUpdateInProgressRef.current = false;
          debouncedUpdate({});
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
        if (Object.keys(pendingUpdatesRef.current).length === 0) {
          isUpdateInProgressRef.current = false;
          setIsUpdating(false);
          console.log('🏁 useOptimizedWellness: Update process completed');
        }
      }
    }, 1000); // 1 second debounce delay
  }, [wellnessData, toast, trackEvent]);

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
