
import { useState, useEffect, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { Motion } from '@capacitor/motion';
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
    
    // Add background operation support
    const handleVisibilityChange = () => {
      if (document.hidden) {
        console.log('📱 App backgrounded - maintaining step tracking');
      } else {
        console.log('📱 App foregrounded - continuing step tracking');
        // Sync data when app comes back to foreground
        fetchTodaySteps();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const initializeStepTracking = async () => {
    console.log('🚀 Initializing enhanced software step tracking for platform:', Capacitor.getPlatform());
    
    if (Capacitor.isNativePlatform()) {
      await startNativeMotionTracking();
    } else {
      // For web, use enhanced motion tracking
      startEnhancedWebStepTracking();
    }
  };


  const startNativeMotionTracking = async () => {
    console.log('🔬 Starting Android/iOS optimized motion tracking');
    
    let stepCount = stepData.steps;
    let lastStepTime = 0;
    let accelerationHistory: { x: number, y: number, z: number, timestamp: number }[] = [];
    let magnitudeHistory: number[] = [];
    
    // Ultra-sensitive parameters for Android devices
    const minStepThreshold = 2.5;  // Extremely low threshold
    const maxStepThreshold = 40;
    const minTimeBetweenSteps = 80;   // Allow very fast steps
    const maxTimeBetweenSteps = 3000; // Allow very slow walking
    const windowSize = 4; // Smaller window for instant response

    const calculateMagnitude = (acc: { x: number, y: number, z: number }) => {
      return Math.sqrt(acc.x * acc.x + acc.y * acc.y + acc.z * acc.z);
    };

    const smoothAcceleration = (history: { x: number, y: number, z: number, timestamp: number }[]) => {
      if (history.length === 0) return { x: 0, y: 0, z: 0 };
      
      const sum = history.reduce((acc, curr) => ({
        x: acc.x + curr.x,
        y: acc.y + curr.y,
        z: acc.z + curr.z
      }), { x: 0, y: 0, z: 0 });
      
      return {
        x: sum.x / history.length,
        y: sum.y / history.length,
        z: sum.z / history.length
      };
    };

    const detectPeaks = (magnitudes: number[], threshold: number) => {
      const peaks: number[] = [];
      for (let i = 1; i < magnitudes.length - 1; i++) {
        if (magnitudes[i] > magnitudes[i - 1] && 
            magnitudes[i] > magnitudes[i + 1] && 
            magnitudes[i] > threshold) {
          peaks.push(i);
        }
      }
      return peaks;
    };

    try {
      // For Android/iOS, use direct DeviceMotionEvent for better compatibility
      const handleDeviceMotion = (event: DeviceMotionEvent) => {
        if (!event.accelerationIncludingGravity) return;
        const { x, y, z } = event.accelerationIncludingGravity;
        if (x === null || y === null || z === null) return;
        
        const currentTime = Date.now();
        
        // Add to acceleration history
        accelerationHistory.push({ x, y, z, timestamp: currentTime });
        if (accelerationHistory.length > windowSize) {
          accelerationHistory.shift();
        }

        // Wait for enough data
        if (accelerationHistory.length < 3) return;

        // Calculate magnitude with smoothing
        const magnitude = calculateMagnitude({ x, y, z });
        magnitudeHistory.push(magnitude);
        if (magnitudeHistory.length > windowSize) {
          magnitudeHistory.shift();
        }

        // Simple but effective step detection for Android
        if (magnitudeHistory.length >= 3) {
          const latest = magnitudeHistory[magnitudeHistory.length - 1];
          const previous = magnitudeHistory[magnitudeHistory.length - 2];
          const beforePrevious = magnitudeHistory[magnitudeHistory.length - 3];
          
          // Detect peak: current value is higher than previous and next
          const isPeak = latest > previous && previous > beforePrevious && latest > minStepThreshold;
          
          if (isPeak && currentTime - lastStepTime >= minTimeBetweenSteps) {
            stepCount++;
            lastStepTime = currentTime;
            console.log('👣 Android step detected! Total steps:', stepCount, 'Magnitude:', latest.toFixed(2));
            updateStepData(stepCount);
            
            // Save to database every 2 steps for Android
            if (stepCount % 2 === 0) {
              saveStepsToDatabase(stepCount);
            }
          }
        }
      };

      // Start motion detection
      if (typeof DeviceMotionEvent !== 'undefined') {
        // Request permission for iOS 13+
        if (Capacitor.getPlatform() === 'ios' && typeof (DeviceMotionEvent as any).requestPermission === 'function') {
          const permission = await (DeviceMotionEvent as any).requestPermission();
          if (permission === 'granted') {
            window.addEventListener('devicemotion', handleDeviceMotion);
            setIsTracking(true);
            console.log('✅ iOS motion permission granted');
          } else {
            throw new Error('Motion permission denied');
          }
        } else {
          // Android and older iOS
          window.addEventListener('devicemotion', handleDeviceMotion);
          setIsTracking(true);
          console.log('✅ Android motion tracking started');
        }
      } else {
        throw new Error('DeviceMotionEvent not supported');
      }

      // Auto-save interval every 10 seconds for Android
      const autoSaveInterval = setInterval(() => {
        if (stepCount > 0) {
          saveStepsToDatabase(stepCount);
        }
      }, 10000);

      return () => {
        window.removeEventListener('devicemotion', handleDeviceMotion);
        clearInterval(autoSaveInterval);
        setIsTracking(false);
        console.log('🛑 Android motion tracking stopped');
      };
    } catch (error) {
      console.error('❌ Android motion tracking failed:', error);
      // Fallback to basic web tracking
      startWebStepTracking();
    }
  };

  const startEnhancedWebStepTracking = () => {
    console.log('🚀 Starting Google Fit-like step tracking with advanced algorithms');
    
    let stepCount = stepData.steps;
    let lastStepTime = 0;
    let accelerationHistory: { x: number, y: number, z: number, timestamp: number }[] = [];
    let magnitudeHistory: number[] = [];
    let peakHistory: { magnitude: number, timestamp: number }[] = [];
    
    // Google Fit-like parameters optimized for maximum sensitivity - background operation
    const minStepThreshold = 4.0;   // Very low threshold for maximum sensitivity
    const maxStepThreshold = 35;
    const minTimeBetweenSteps = 100;  // 600 steps/min max - ultra sensitive
    const maxTimeBetweenSteps = 2800; // 21 steps/min min - capture very slow walking
    const windowSize = 8; // Balanced window for responsiveness
    const peakWindowSize = 4; // for peak detection

    const calculateMagnitude = (acc: { x: number, y: number, z: number }) => {
      return Math.sqrt(acc.x * acc.x + acc.y * acc.y + acc.z * acc.z);
    };

    const smoothAcceleration = (history: { x: number, y: number, z: number, timestamp: number }[]) => {
      if (history.length === 0) return { x: 0, y: 0, z: 0 };
      
      const sum = history.reduce((acc, curr) => ({
        x: acc.x + curr.x,
        y: acc.y + curr.y,
        z: acc.z + curr.z
      }), { x: 0, y: 0, z: 0 });
      
      return {
        x: sum.x / history.length,
        y: sum.y / history.length,
        z: sum.z / history.length
      };
    };

    const detectPeaks = (magnitudes: number[], threshold: number) => {
      const peaks: number[] = [];
      for (let i = 1; i < magnitudes.length - 1; i++) {
        if (magnitudes[i] > magnitudes[i - 1] && 
            magnitudes[i] > magnitudes[i + 1] && 
            magnitudes[i] > threshold) {
          peaks.push(i);
        }
      }
      return peaks;
    };

    const handleDeviceMotion = (event: DeviceMotionEvent) => {
      if (!event.accelerationIncludingGravity) return;

      const { x, y, z } = event.accelerationIncludingGravity;
      if (x === null || y === null || z === null) return;

      const currentTime = Date.now();
      
      // Add to acceleration history
      accelerationHistory.push({ x, y, z, timestamp: currentTime });
      if (accelerationHistory.length > windowSize) {
        accelerationHistory.shift();
      }

      // Wait for enough data
      if (accelerationHistory.length < windowSize) return;

      // Smooth the acceleration data
      const smoothed = smoothAcceleration(accelerationHistory);
      const magnitude = calculateMagnitude(smoothed);
      
      // Add to magnitude history
      magnitudeHistory.push(magnitude);
      if (magnitudeHistory.length > windowSize) {
        magnitudeHistory.shift();
      }

      // Detect peaks in magnitude
      const peaks = detectPeaks(magnitudeHistory, minStepThreshold);
      
      if (peaks.length > 0) {
        const latestPeak = peaks[peaks.length - 1];
        const peakMagnitude = magnitudeHistory[latestPeak];
        
        // Check if this is a valid step
        if (peakMagnitude >= minStepThreshold && 
            peakMagnitude <= maxStepThreshold &&
            currentTime - lastStepTime >= minTimeBetweenSteps &&
            currentTime - lastStepTime <= maxTimeBetweenSteps) {
          
          // Add to peak history for pattern validation
          peakHistory.push({ magnitude: peakMagnitude, timestamp: currentTime });
          if (peakHistory.length > peakWindowSize) {
            peakHistory.shift();
          }
          
          // Validate step pattern (Google Fit-like rhythm detection)
          if (peakHistory.length >= 3) {
            const intervals = [];
            for (let i = 1; i < peakHistory.length; i++) {
              intervals.push(peakHistory[i].timestamp - peakHistory[i-1].timestamp);
            }
            
            // Check for consistent rhythm
            const avgInterval = intervals.reduce((a, b) => a + b) / intervals.length;
            const variance = intervals.reduce((acc, interval) => 
              acc + Math.pow(interval - avgInterval, 2), 0) / intervals.length;
            const stdDev = Math.sqrt(variance);
            
            // Accept step if rhythm is consistent (very permissive for maximum sensitivity)
            if (stdDev < avgInterval * 0.6 && avgInterval > minTimeBetweenSteps) {
              stepCount++;
              lastStepTime = currentTime;
              console.log('👣 Google Fit-like step detected! Total steps:', stepCount, 
                         'Peak magnitude:', peakMagnitude.toFixed(2),
                         'Rhythm consistency:', (100 - (stdDev / avgInterval * 100)).toFixed(1) + '%');
              updateStepData(stepCount);
              
              // Save to database every 5 steps
              if (stepCount % 5 === 0) {
                saveStepsToDatabase(stepCount);
              }
            }
          } else {
            // For first few steps, use basic validation
            stepCount++;
            lastStepTime = currentTime;
            console.log('👣 Initial step detected! Total steps:', stepCount);
            updateStepData(stepCount);
          }
        }
      }
    };

    // Request motion permissions and start tracking
    if (Capacitor.getPlatform() === 'ios' && typeof DeviceMotionEvent !== 'undefined' && typeof (DeviceMotionEvent as any).requestPermission === 'function') {
      (DeviceMotionEvent as any).requestPermission()
        .then((permission: string) => {
          if (permission === 'granted') {
            window.addEventListener('devicemotion', handleDeviceMotion);
            setIsTracking(true);
            console.log('✅ iOS enhanced motion permission granted');
          } else {
            console.log('❌ iOS motion permission denied');
            setIsTracking(true); // Still allow manual tracking
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
      console.log('✅ Enhanced motion tracking started');
    }

    // Auto-save interval every 20 seconds
    const autoSaveInterval = setInterval(() => {
      if (stepCount > 0) {
        saveStepsToDatabase(stepCount);
      }
    }, 20000);

    return () => {
      window.removeEventListener('devicemotion', handleDeviceMotion);
      clearInterval(autoSaveInterval);
      setIsTracking(false);
      console.log('🛑 Enhanced step tracking stopped');
    };
  };

  const startWebStepTracking = () => {
    console.log('🌐 Starting basic web step tracking (compatibility mode)');
    
    let lastAcceleration = { x: 0, y: 0, z: 0 };
    let stepCount = stepData.steps;
    let lastStepTime = 0;
    const stepThreshold = 8;    // Lower threshold for better sensitivity
    const timeThreshold = 300;  // Shorter time threshold

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
            setIsTracking(true); // Still allow manual tracking
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
