
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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

  useEffect(() => {
    fetchTodayWellness();
  }, []);

  const fetchTodayWellness = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const updatedData = { ...wellnessData, ...updates };
      const today = new Date().toISOString().split('T')[0];

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
          .insert({
            user_id: user.id,
            date: today,
            water_litres: updatedData.water_litres,
            surya_namaskar_count: updatedData.surya_namaskar_count,
            meditation_minutes: updatedData.meditation_minutes,
            meditation_completed: updatedData.meditation_completed
          })
          .select()
          .single();

        if (error) throw error;
        if (data) {
          updatedData.id = data.id;
        }
      }

      setWellnessData(updatedData);
      toast({
        title: "Progress updated!",
        description: "Your wellness data has been saved.",
      });
    } catch (error) {
      console.error('Error updating wellness data:', error);
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
