
import { useState, useEffect, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
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

  const requestAndroidPermissions = async () => {
    // For Android, we need to request ACTIVITY_RECOGNITION permission
    if (Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android') {
      try {
        // Check if permissions are already granted
        const result = await (navigator as any).permissions?.query({ name: 'activity-recognition' });
        
        if (result?.state === 'granted') {
          return 'granted';
        } else if (result?.state === 'denied') {
          return 'denied';
        }
        
        // Request permission if not determined
        const permissionResult = await (navigator as any).permissions?.request({ name: 'activity-recognition' });
        return permissionResult?.state === 'granted' ? 'granted' : 'denied';
      } catch (error) {
        console.log('Android permission request error:', error);
        // Fallback: assume permission is needed and try to use the API
        return 'prompt';
      }
    }
    return 'granted'; // For web, assume granted
  };

  const requestiOSPermissions = async () => {
    // For iOS, we need to request DeviceMotion permission
    if (Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'ios') {
      try {
        // Check if DeviceMotionEvent.requestPermission exists (iOS 13+)
        if (typeof DeviceMotionEvent !== 'undefined' && typeof (DeviceMotionEvent as any).requestPermission === 'function') {
          const permission = await (DeviceMotionEvent as any).requestPermission();
          return permission;
        }
        
        // For older iOS versions, assume permission is granted
        return 'granted';
      } catch (error) {
        console.log('iOS motion permission request error:', error);
        return 'denied';
      }
    }
    return 'granted';
  };

  const checkPermissionAndStartTracking = async () => {
    // Handle iOS permission request
    if (Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'ios') {
      const iosPermission = await requestiOSPermissions();
      setPermission(iosPermission as 'granted' | 'denied' | 'prompt');
      
      if (iosPermission === 'granted') {
        startStepTracking();
      } else if (iosPermission === 'denied') {
        toast({
          title: "Motion Permission Required",
          description: "Please enable Motion & Fitness permission in iOS Settings > Privacy & Security > Motion & Fitness to track steps.",
          variant: "destructive",
        });
      }
    } 
    // Handle Android permission request
    else if (Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android') {
      const androidPermission = await requestAndroidPermissions();
      setPermission(androidPermission as 'granted' | 'denied' | 'prompt');
      if (androidPermission === 'granted') {
        startStepTracking();
      } else if (androidPermission === 'denied') {
        toast({
          title: "Permission Required",
          description: "Please enable Activity Recognition permission in your device settings to track steps.",
          variant: "destructive",
        });
      }
    }
    // Handle web browsers
    else {
      setPermission('granted');
      startStepTracking();
    }
  };

  const startStepTracking = () => {
    // Try to use native step counter API first (iOS and Android)
    if (Capacitor.isNativePlatform()) {
      try {
        startNativeStepTracking();
        return;
      } catch (error) {
        console.log('Native step tracking not available, falling back to accelerometer');
      }
    }

    // Fallback to accelerometer-based step detection
    if ('DeviceMotionEvent' in window) {
      startAccelerometerStepTracking();
    } else {
      console.log('Device motion not supported');
      toast({
        title: "Step tracking not available",
        description: "Your device doesn't support step tracking.",
        variant: "destructive",
      });
    }
  };

  const startNativeStepTracking = () => {
    // This would use native step counter APIs
    // For now, we'll use the accelerometer fallback
    console.log('Native step tracking would be implemented here');
    startAccelerometerStepTracking();
  };

  const startAccelerometerStepTracking = () => {
    let lastAcceleration = { x: 0, y: 0, z: 0 };
    let stepCount = stepData.steps;
    let lastStepTime = 0;
    const stepThreshold = 15;
    const timeThreshold = 400;

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
        updateStepData(stepCount);
        
        if (stepCount % 5 === 0) {
          saveStepsToDatabase(stepCount);
        }
      }

      lastAcceleration = { x, y, z };
    };

    window.addEventListener('devicemotion', handleDeviceMotion);
    setIsTracking(true);

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
