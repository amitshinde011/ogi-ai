
import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface WellnessData {
  id?: string;
  water_litres: number;
  surya_namaskar_count: number;
  meditation_completed: boolean;
}

export const useOptimizedWellness = (initialData: WellnessData) => {
  const [wellnessData, setWellnessData] = useState<WellnessData>(initialData);
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();
  const updateTimeoutRef = useRef<NodeJS.Timeout>();
  const pendingUpdatesRef = useRef<Partial<WellnessData>>({});
  const isUpdateInProgressRef = useRef(false);

  const debouncedUpdate = useCallback(async (updates: Partial<WellnessData>) => {
    // Clear existing timeout
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }

    // Accumulate pending updates
    pendingUpdatesRef.current = {
      ...pendingUpdatesRef.current,
      ...updates
    };

    // Update local state immediately for UI responsiveness
    setWellnessData(prev => ({ ...prev, ...updates }));

    // If an update is already in progress, just accumulate the changes
    if (isUpdateInProgressRef.current) {
      return;
    }

    // Debounce the actual API call
    updateTimeoutRef.current = setTimeout(async () => {
      if (isUpdateInProgressRef.current) {
        return;
      }

      isUpdateInProgressRef.current = true;
      setIsUpdating(true);

      // Get all pending updates and clear them
      const allPendingUpdates = { ...pendingUpdatesRef.current };
      pendingUpdatesRef.current = {};

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const today = new Date().toISOString().split('T')[0];
        const updatedData = { ...wellnessData, ...allPendingUpdates };

        if (updatedData.id) {
          // Update existing record with accumulated values
          const { error } = await supabase
            .from('daily_wellness')
            .update({
              water_litres: updatedData.water_litres,
              surya_namaskar_count: updatedData.surya_namaskar_count,
              meditation_completed: updatedData.meditation_completed
            })
            .eq('id', updatedData.id);

          if (error) throw error;
        } else {
          // Create new record with accumulated values
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

          if (error) throw error;
          if (data) {
            setWellnessData(prev => ({ ...prev, id: data.id }));
          }
        }

        // If there are new pending updates that came in during the API call, schedule another update
        if (Object.keys(pendingUpdatesRef.current).length > 0) {
          isUpdateInProgressRef.current = false;
          debouncedUpdate({});
        }
      } catch (error) {
        console.error('Error updating wellness data:', error);
        
        toast({
          title: "Error",
          description: "Failed to update wellness data.",
          variant: "destructive",
        });
      } finally {
        if (Object.keys(pendingUpdatesRef.current).length === 0) {
          isUpdateInProgressRef.current = false;
          setIsUpdating(false);
        }
      }
    }, 1000); // 1 second debounce delay
  }, [wellnessData, toast]);

  const updateWater = useCallback((delta: number) => {
    const newValue = Math.max(0, wellnessData.water_litres + delta);
    debouncedUpdate({ water_litres: newValue });
  }, [wellnessData.water_litres, debouncedUpdate]);

  const updateSuryaNamaskar = useCallback((delta: number) => {
    const newValue = Math.max(0, wellnessData.surya_namaskar_count + delta);
    debouncedUpdate({ surya_namaskar_count: newValue });
  }, [wellnessData.surya_namaskar_count, debouncedUpdate]);

  const toggleMeditation = useCallback(() => {
    debouncedUpdate({ meditation_completed: !wellnessData.meditation_completed });
  }, [wellnessData.meditation_completed, debouncedUpdate]);

  return {
    wellnessData,
    isUpdating,
    updateWater,
    updateSuryaNamaskar,
    toggleMeditation
  };
};
