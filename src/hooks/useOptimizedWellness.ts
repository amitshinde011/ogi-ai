
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

  const debouncedUpdate = useCallback(async (updates: Partial<WellnessData>) => {
    // Clear existing timeout
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }

    // Store the previous state for potential rollback
    const previousState = { ...wellnessData };

    // Update local state immediately for UI responsiveness
    setWellnessData(prev => ({ ...prev, ...updates }));

    // Debounce the actual API call
    updateTimeoutRef.current = setTimeout(async () => {
      setIsUpdating(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const today = new Date().toISOString().split('T')[0];
        const updatedData = { ...wellnessData, ...updates };

        if (updatedData.id) {
          // Update existing record
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
          // Create new record
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
      } catch (error) {
        console.error('Error updating wellness data:', error);
        // Revert to previous state on error
        setWellnessData(previousState);
        
        toast({
          title: "Error",
          description: "Failed to update wellness data.",
          variant: "destructive",
        });
      } finally {
        setIsUpdating(false);
      }
    }, 500); // 500ms debounce
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
