import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { WaterTracker } from './wellness/WaterTracker';
import { SuryaNamaskarTracker } from './wellness/SuryaNamaskarTracker';
import { MeditationTracker } from './wellness/MeditationTracker';

const WellnessTracker = () => {
  const [wellnessId, setWellnessId] = useState<string | null>(null);
  const [waterLitres, setWaterLitres] = useState(0);
  const [suryaNamaskarCount, setSuryaNamaskarCount] = useState(0);
  const [meditationCompleted, setMeditationCompleted] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadTodayData();
  }, []);

  const loadTodayData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const today = new Date().toISOString().split('T')[0];
      
      const { data } = await supabase
        .from('daily_wellness')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .maybeSingle();

      if (data) {
        setWellnessId(data.id);
        setWaterLitres(data.water_litres || 0);
        setSuryaNamaskarCount(data.surya_namaskar_count || 0);
        setMeditationCompleted(data.meditation_completed || false);
      }
    } catch (error) {
      console.error('Error loading wellness data:', error);
    }
  };

  const updateWellnessData = async (updates: any) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const today = new Date().toISOString().split('T')[0];
      
      if (wellnessId) {
        const { error } = await supabase
          .from('daily_wellness')
          .update({
            water_litres: waterLitres,
            surya_namaskar_count: suryaNamaskarCount,
            meditation_completed: meditationCompleted,
            ...updates
          })
          .eq('id', wellnessId);

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('daily_wellness')
          .insert({
            user_id: user.id,
            date: today,
            water_litres: waterLitres,
            surya_namaskar_count: suryaNamaskarCount,
            meditation_completed: meditationCompleted,
            ...updates
          })
          .select()
          .single();

        if (error) throw error;
        if (data) {
          setWellnessId(data.id);
        }
      }
      
      toast({
        title: "Updated successfully",
        description: "Your wellness data has been saved.",
      });
    } catch (error) {
      console.error('Error updating wellness data:', error);
      toast({
        title: "Error",
        description: "Failed to update wellness data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleWaterChange = (delta: number) => {
    const newValue = Math.max(0, waterLitres + delta);
    setWaterLitres(newValue);
    updateWellnessData({ water_litres: newValue });
  };

  const handleSuryaNamaskarChange = (delta: number) => {
    const newValue = Math.max(0, suryaNamaskarCount + delta);
    setSuryaNamaskarCount(newValue);
    updateWellnessData({ surya_namaskar_count: newValue });
  };

  const handleMeditationToggle = () => {
    const newValue = !meditationCompleted;
    setMeditationCompleted(newValue);
    updateWellnessData({ meditation_completed: newValue });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-orange-500" />
          Daily Wellness
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <WaterTracker
          waterLitres={waterLitres}
          onWaterChange={handleWaterChange}
          loading={loading}
        />
        
        <SuryaNamaskarTracker
          suryaNamaskarCount={suryaNamaskarCount}
          onSuryaNamaskarChange={handleSuryaNamaskarChange}
          loading={loading}
        />
        
        <MeditationTracker
          meditationCompleted={meditationCompleted}
          onMeditationToggle={handleMeditationToggle}
          loading={loading}
        />
      </CardContent>
    </Card>
  );
};

export default WellnessTracker;
