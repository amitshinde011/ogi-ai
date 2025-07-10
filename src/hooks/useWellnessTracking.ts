import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface WellnessData {
  meditation_completed?: boolean;
  meditation_minutes?: number;
  surya_namaskar_count?: number;
  water_litres?: number;
}

export const useWellnessTracking = (date: string = new Date().toISOString().split('T')[0]) => {
  const [wellnessData, setWellnessData] = useState<WellnessData>({});
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchWellnessData = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('daily_wellness')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', date)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setWellnessData(data || {});
    } catch (error) {
      console.error('Error fetching wellness data:', error);
      toast({
        title: "Error",
        description: "Failed to load wellness data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateWellnessData = async (updates: Partial<WellnessData>) => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('daily_wellness')
        .upsert({
          user_id: user.id,
          date: date,
          ...updates,
        })
        .select()
        .single();

      if (error) throw error;

      setWellnessData(data);
      return data;
    } catch (error) {
      console.error('Error updating wellness data:', error);
      toast({
        title: "Error",
        description: "Failed to update wellness data",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchWellnessData();
  }, [user?.id, date]);

  return {
    wellnessData,
    isLoading,
    updateWellnessData,
    refetch: fetchWellnessData,
  };
};