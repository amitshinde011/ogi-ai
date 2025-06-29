
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface StepData {
  steps: number;
  lastUpdated: Date;
}

// Extend the DeviceMotionEvent interface for iOS permission
declare global {
  interface DeviceMotionEvent {
    requestPermission?: () => Promise<'granted' | 'denied'>;
  }
}

export const useStepTracking = () => {
  const [stepData, setStepData] = useState<StepData>({ steps: 0, lastUpdated: new Date() });
  const [isTracking, setIsTracking] = useState(false);
  const [permission, setPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  const { toast } = useToast();

  // Callback to update step data and sync with parent components
  const updateStepData = useCallback((newSteps: number) => {
    const newData = { steps: newSteps, lastUpdated: new Date() };
    setStepData(newData);
    
    // Trigger a custom event to notify other components
    window.dispatchEvent(new CustomEvent('stepsUpdated', { 
      detail: { steps: newSteps, lastUpdated: new Date() } 
    }));
  }, []);

  useEffect(() => {
    checkPermissionAndStartTracking();
    fetchTodaySteps();
  }, []);

  const checkPermissionAndStartTracking = async () => {
    // Check if device motion is available and requires permission (iOS)
    if (typeof DeviceMotionEvent !== 'undefined' && typeof (DeviceMotionEvent as any).requestPermission === 'function') {
      try {
        const permission = await (DeviceMotionEvent as any).requestPermission();
        setPermission(permission);
        if (permission === 'granted') {
          startStepTracking();
        }
      } catch (error) {
        console.log('Device motion permission error:', error);
        setPermission('denied');
        // Fallback for browsers that don't support permission request
        startStepTracking();
      }
    } else {
      // For browsers that don't require permission (Android)
      setPermission('granted');
      startStepTracking();
    }
  };

  const startStepTracking = () => {
    if ('DeviceMotionEvent' in window) {
      let lastAcceleration = { x: 0, y: 0, z: 0 };
      let stepCount = stepData.steps;
      let lastStepTime = 0;
      const stepThreshold = 15; // Increased threshold for better accuracy
      const timeThreshold = 400; // Minimum time between steps (ms)

      const handleDeviceMotion = (event: DeviceMotionEvent) => {
        if (!event.accelerationIncludingGravity) return;

        const { x, y, z } = event.accelerationIncludingGravity;
        if (x === null || y === null || z === null) return;

        // Calculate magnitude of acceleration change
        const deltaX = Math.abs(x - lastAcceleration.x);
        const deltaY = Math.abs(y - lastAcceleration.y);
        const deltaZ = Math.abs(z - lastAcceleration.z);
        const magnitude = Math.sqrt(deltaX * deltaX + deltaY * deltaY + deltaZ * deltaZ);

        const currentTime = Date.now();
        
        // Detect step if magnitude exceeds threshold and enough time has passed
        if (magnitude > stepThreshold && currentTime - lastStepTime > timeThreshold) {
          stepCount++;
          lastStepTime = currentTime;
          updateStepData(stepCount);
          
          // Save to database every 5 steps to reduce API calls but maintain sync
          if (stepCount % 5 === 0) {
            saveStepsToDatabase(stepCount);
          }
        }

        lastAcceleration = { x, y, z };
      };

      window.addEventListener('devicemotion', handleDeviceMotion);
      setIsTracking(true);

      // Auto-save every 30 seconds to ensure data persistence
      const autoSaveInterval = setInterval(() => {
        if (stepCount > 0) {
          saveStepsToDatabase(stepCount);
        }
      }, 30000);

      // Cleanup function
      return () => {
        window.removeEventListener('devicemotion', handleDeviceMotion);
        clearInterval(autoSaveInterval);
        setIsTracking(false);
      };
    } else {
      console.log('Device motion not supported');
      toast({
        title: "Step tracking not available",
        description: "Your device doesn't support step tracking.",
        variant: "destructive",
      });
    }
  };

  const fetchTodaySteps = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('steps_tracking')
        .select('steps_count')
        .eq('user_id', user.id)
        .eq('date', today)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        updateStepData(data.steps_count);
      }
    } catch (error) {
      console.error('Error fetching today steps:', error);
    }
  };

  const saveStepsToDatabase = async (steps: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const today = new Date().toISOString().split('T')[0];
      
      const { error } = await supabase
        .from('steps_tracking')
        .upsert({
          user_id: user.id,
          date: today,
          steps_count: steps
        }, {
          onConflict: 'user_id,date'
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error saving steps:', error);
    }
  };

  const manuallyAddSteps = async (additionalSteps: number) => {
    const newStepCount = stepData.steps + additionalSteps;
    updateStepData(newStepCount);
    await saveStepsToDatabase(newStepCount);
  };

  const requestPermission = async () => {
    await checkPermissionAndStartTracking();
  };

  return {
    stepData,
    isTracking,
    permission,
    manuallyAddSteps,
    requestPermission,
    saveStepsToDatabase: () => saveStepsToDatabase(stepData.steps)
  };
};
