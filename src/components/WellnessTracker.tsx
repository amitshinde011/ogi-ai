
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Minus, Droplets, Zap, Om } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import MeditationAudioPlayer from './MeditationAudioPlayer';

const WellnessTracker = () => {
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
      
      const { error } = await supabase
        .from('daily_wellness')
        .upsert({
          user_id: user.id,
          date: today,
          water_litres: waterLitres,
          surya_namaskar_count: suryaNamaskarCount,
          meditation_completed: meditationCompleted,
          ...updates
        });

      if (error) throw error;
      
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
        {/* Water Intake */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Droplets className="w-5 h-5 text-blue-500" />
            <div>
              <Label className="font-medium">Water Intake</Label>
              <p className="text-sm text-gray-600">{waterLitres} litres</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => handleWaterChange(-0.25)}
              disabled={loading || waterLitres <= 0}
            >
              <Minus className="w-4 h-4" />
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => handleWaterChange(0.25)}
              disabled={loading}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Surya Namaskar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Om className="w-5 h-5 text-orange-500" />
            <div>
              <Label className="font-medium">Surya Namaskar</Label>
              <p className="text-sm text-gray-600">{suryaNamaskarCount} rounds</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => handleSuryaNamaskarChange(-1)}
              disabled={loading || suryaNamaskarCount <= 0}
            >
              <Minus className="w-4 h-4" />
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => handleSuryaNamaskarChange(1)}
              disabled={loading}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Meditation */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="font-medium flex items-center gap-2">
              <Om className="w-5 h-5 text-purple-500" />
              Meditation
            </Label>
            <Checkbox 
              checked={meditationCompleted}
              onCheckedChange={handleMeditationToggle}
              disabled={loading}
            />
          </div>
          
          {/* Meditation Audio Player */}
          <MeditationAudioPlayer />
        </div>
      </CardContent>
    </Card>
  );
};

export default WellnessTracker;
