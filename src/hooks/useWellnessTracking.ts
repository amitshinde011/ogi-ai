
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { getLocalDateString } from '@/utils/dateUtils';
import { offlineQueue } from '@/utils/offlineQueue';
import { localCache } from '@/utils/localCache';

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
    date: getLocalDateString(),
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
    const today = getLocalDateString();
    // Only fetch if date changed or first load
    if (lastFetchRef.current !== today) {
      fetchTodayWellness();
      lastFetchRef.current = today;
    }
  }, []);

  const fetchTodayWellness = async () => {
    try {
      if (!user) return;

      const today = getLocalDateString();

      // Offline-first: use cached wellness if offline
      if (!navigator.onLine) {
        const cached = localCache.getTodayWellness(user.id, today);
        if (cached) {
          setWellnessData({
            date: today,
            water_litres: cached.water_litres || 0,
            surya_namaskar_count: cached.surya_namaskar_count || 0,
            meditation_minutes: cached.meditation_minutes || 0,
            meditation_completed: !!cached.meditation_completed,
          });
        }
        return;
      }

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

        // Cache latest wellness locally for offline use
        localCache.setTodayWellness(user.id, today, {
          water_litres: data.water_litres || 0,
          surya_namaskar_count: data.surya_namaskar_count || 0,
          meditation_completed: data.meditation_completed || false,
          meditation_minutes: data.meditation_minutes || 0,
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
      const today = getLocalDateString();

      // Optimistic update + cache locally
      setWellnessData(updatedData);
      localCache.setTodayWellness(user.id, today, {
        water_litres: updatedData.water_litres,
        surya_namaskar_count: updatedData.surya_namaskar_count,
        meditation_completed: updatedData.meditation_completed,
        meditation_minutes: updatedData.meditation_minutes,
      });

      // If offline, enqueue for background sync
      if (!navigator.onLine) {
        await offlineQueue.enqueue('wellness_upsert', {
          user_id: user.id,
          date: today,
          water_litres: updatedData.water_litres,
          surya_namaskar_count: updatedData.surya_namaskar_count,
          meditation_completed: updatedData.meditation_completed,
          meditation_minutes: updatedData.meditation_minutes || 0,
        });
        toast({ title: 'Saved offline', description: "We'll sync when you're back online." });
        return;
      }

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
        // Create/upsert record
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
            { onConflict: 'user_id,date', ignoreDuplicates: false }
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
      // Queue for background sync instead of reverting
      const today = getLocalDateString();
      await offlineQueue.enqueue('wellness_upsert', {
        user_id: user?.id,
        date: today,
        water_litres: updates.water_litres ?? wellnessData.water_litres,
        surya_namaskar_count: updates.surya_namaskar_count ?? wellnessData.surya_namaskar_count,
        meditation_completed: updates.meditation_completed ?? wellnessData.meditation_completed,
        meditation_minutes: updates.meditation_minutes ?? wellnessData.meditation_minutes,
      });
      toast({ title: 'Saved offline', description: "We'll sync when your connection returns." });
    }
  };

  return {
    wellnessData,
    loading,
    updateWellnessData
  };
};
