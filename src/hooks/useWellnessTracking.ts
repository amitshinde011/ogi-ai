
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface WellnessData {
  id?: string;
  date: string;
  water_litres: number;
  surya_namaskar_count: number;
  meditation_minutes: number;
  meditation_completed: boolean;
}

export const useWellnessTracking = () => {
  const [wellnessData, setWellnessData] = useState<WellnessData>({
    date: new Date().toISOString().split('T')[0],
    water_litres: 0,
    surya_namaskar_count: 0,
    meditation_minutes: 0,
    meditation_completed: false
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();
  const lastFetchRef = useRef<string>('');

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    // Only fetch if date changed or first load
    if (lastFetchRef.current !== today) {
      fetchTodayWellness();
      lastFetchRef.current = today;
    }
  }, []);

  const fetchTodayWellness = async () => {
    try {
      if (!user) return;

      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('daily_wellness')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setWellnessData({
          id: data.id,
          date: data.date,
          water_litres: data.water_litres || 0,
          surya_namaskar_count: data.surya_namaskar_count || 0,
          meditation_minutes: data.meditation_minutes || 0,
          meditation_completed: data.meditation_completed || false
        });
      }
    } catch (error) {
      console.error('Error fetching wellness data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateWellnessData = async (updates: Partial<WellnessData>) => {
    try {
      if (!user) return;

      const updatedData = { ...wellnessData, ...updates };
      const today = new Date().toISOString().split('T')[0];

      // Optimistic update
      setWellnessData(updatedData);

      if (wellnessData.id) {
        // Update existing record
        const { error } = await supabase
          .from('daily_wellness')
          .update({
            water_litres: updatedData.water_litres,
            surya_namaskar_count: updatedData.surya_namaskar_count,
            meditation_minutes: updatedData.meditation_minutes,
            meditation_completed: updatedData.meditation_completed
          })
          .eq('id', wellnessData.id);

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
              meditation_minutes: updatedData.meditation_minutes,
              meditation_completed: updatedData.meditation_completed
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
      // Revert optimistic update on error
      setWellnessData(wellnessData);
      toast({
        title: "Error",
        description: "Failed to update wellness data.",
        variant: "destructive",
      });
    }
  };

  return {
    wellnessData,
    loading,
    updateWellnessData
  };
};
