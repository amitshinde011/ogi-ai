
import { useState, useEffect, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface StepData {
  steps: number;
  lastUpdated: Date;
}

export const useStepTracking = () => {
  const [stepData, setStepData] = useState<StepData>({ steps: 0, lastUpdated: new Date() });
  const [isTracking, setIsTracking] = useState(false);
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
    initializeStepTracking();
    fetchTodaySteps();
  }, []);

  const initializeStepTracking = async () => {
    console.log('🚀 Initializing step tracking for platform:', Capacitor.getPlatform());
    
    // Always start tracking immediately
    if (Capacitor.isNativePlatform()) {
      startNativeStepTracking();
    } else {
      // For web, use device motion if available
      if ('DeviceMotionEvent' in window) {
        startAccelerometerStepTracking();
      } else {
        console.log('Device motion not supported on web');
      }
    }
  };

  const startNativeStepTracking = () => {
    console.log('📱 Starting native step tracking');
    
    // For Android and iOS, try to use device sensors directly
    if (Capacitor.getPlatform() === 'android') {
      startAndroidStepTracking();
    } else if (Capacitor.getPlatform() === 'ios') {
      startIOSStepTracking();
    } else {
      // Fallback to accelerometer
      startAccelerometerStepTracking();
    }
  };

  const startAndroidStepTracking = () => {
    console.log('🤖 Starting Android step tracking');
    
    // Try to access Android step counter sensor
    if ('DeviceMotionEvent' in window) {
      startAccelerometerStepTracking();
    }
    
    // Set tracking to true for Android
    setIsTracking(true);
  };

  const startIOSStepTracking = () => {
    console.log('🍎 Starting iOS step tracking');
    
    // For iOS, try to use DeviceMotion
    if ('DeviceMotionEvent' in window) {
      startAccelerometerStepTracking();
    }
    
    // Set tracking to true for iOS
    setIsTracking(true);
  };

  const startAccelerometerStepTracking = () => {
    console.log('📱 Starting accelerometer-based step tracking');
    
    let lastAcceleration = { x: 0, y: 0, z: 0 };
    let stepCount = stepData.steps;
    let lastStepTime = 0;
    const stepThreshold = 12; // Lowered threshold for better sensitivity
    const timeThreshold = 300; // Reduced time threshold

    const handleDeviceMotion = (event: DeviceMotionEvent) => {
      if (!event.accelerationIncludingGravity) return;

      const { x, y, z } = event.accelerationIncludingGravity;
      if (x === null || y === null || z === null) return;

      const deltaX = Math.abs(x - lastAcceleration.x);
      const deltaY = Math.abs(y - lastAcceleration.y);
      const deltaZ = Math.abs(z - lastAcceleration.z);
      const magnitude = Math.sqrt(deltaX * deltaX + deltaY * deltaY + deltaZ * deltaZ);

      const currentTime = Date.now();
      
      if (magnitude > stepThreshold && currentTime - lastStepTime > timeThreshold) {
        stepCount++;
        lastStepTime = currentTime;
        console.log('👣 Step detected! Total steps:', stepCount);
        updateStepData(stepCount);
        
        // Save to database every 10 steps
        if (stepCount % 10 === 0) {
          saveStepsToDatabase(stepCount);
        }
      }

      lastAcceleration = { x, y, z };
    };

    // Request permission for iOS 13+ devices
    if (Capacitor.getPlatform() === 'ios' && typeof DeviceMotionEvent !== 'undefined' && typeof (DeviceMotionEvent as any).requestPermission === 'function') {
      (DeviceMotionEvent as any).requestPermission()
        .then((permission: string) => {
          if (permission === 'granted') {
            window.addEventListener('devicemotion', handleDeviceMotion);
            setIsTracking(true);
            console.log('✅ iOS motion permission granted');
          } else {
            console.log('❌ iOS motion permission denied');
            // Still set tracking to true to show manual buttons
            setIsTracking(true);
          }
        })
        .catch((error: any) => {
          console.log('iOS motion permission error:', error);
          setIsTracking(true);
        });
    } else {
      // For Android and older iOS, start listening immediately
      window.addEventListener('devicemotion', handleDeviceMotion);
      setIsTracking(true);
      console.log('✅ Motion tracking started');
    }

    // Auto-save interval every 30 seconds
    const autoSaveInterval = setInterval(() => {
      if (stepCount > 0) {
        saveStepsToDatabase(stepCount);
      }
    }, 30000);

    return () => {
      window.removeEventListener('devicemotion', handleDeviceMotion);
      clearInterval(autoSaveInterval);
      setIsTracking(false);
    };
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
        console.log('📊 Fetched today steps from database:', data.steps_count);
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
      console.log('💾 Steps saved to database:', steps);
    } catch (error) {
      console.error('Error saving steps:', error);
    }
  };

  const manuallyAddSteps = async (additionalSteps: number) => {
    const newStepCount = stepData.steps + additionalSteps;
    console.log('➕ Adding manual steps:', additionalSteps, 'New total:', newStepCount);
    updateStepData(newStepCount);
    await saveStepsToDatabase(newStepCount);
  };

  return {
    stepData,
    isTracking,
    manuallyAddSteps,
    saveStepsToDatabase: () => saveStepsToDatabase(stepData.steps)
  };
};
