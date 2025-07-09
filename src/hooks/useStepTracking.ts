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

    // --- NEW: State to ensure a valley is detected before a peak ---
    let isPeakPhase = false;
    
    // --- Tuned for realistic step detection, preventing hand-tremor counts ---
    const minStepThreshold = 12.5;
    const maxStepThreshold = 40;
    const minTimeBetweenSteps = 300;
    const maxTimeBetweenSteps = 2500;
    const windowSize = 10;

    const calculateMagnitude = (acc: { x: number, y: number, z: number }) => {
      return Math.sqrt(acc.x * acc.x + acc.y * acc.y + acc.z * acc.z);
    };

    try {
      const handleDeviceMotion = (event: DeviceMotionEvent) => {
        if (!event.accelerationIncludingGravity) return;
        const { x, y, z } = event.accelerationIncludingGravity;
        if (x === null || y === null || z === null) return;
        
        const currentTime = Date.now();
        
        accelerationHistory.push({ x, y, z, timestamp: currentTime });
        if (accelerationHistory.length > windowSize) {
          accelerationHistory.shift();
        }

        if (accelerationHistory.length < 3) return;

        const magnitude = calculateMagnitude({ x, y, z });
        magnitudeHistory.push(magnitude);
        if (magnitudeHistory.length > windowSize) {
          magnitudeHistory.shift();
        }

        // --- IMPROVED "VALLEY-THEN-PEAK" STEP DETECTION LOGIC ---
        if (magnitudeHistory.length >= 3) {
          const latest = magnitudeHistory[magnitudeHistory.length - 1];
          const previous = magnitudeHistory[magnitudeHistory.length - 2];
          
          // Phase 1: Look for a "valley" (a dip in acceleration before the step's main impact).
          if (!isPeakPhase && previous < latest) {
              isPeakPhase = true; // Valley found, now we can look for a peak.
          }
          
          // Phase 2: If we are in the peak phase, look for an actual peak.
          if (isPeakPhase && previous > latest) {
            // Check if the detected peak is strong enough and well-timed.
            if (previous > minStepThreshold && currentTime - lastStepTime > minTimeBetweenSteps) {
                stepCount++;
                lastStepTime = currentTime;
                console.log('👣 Step detected! Total:', stepCount);
                updateStepData(stepCount);

                if (stepCount % 2 === 0) {
                    saveStepsToDatabase(stepCount);
                }
            }
            // Reset to look for the next valley, completing the step cycle.
            isPeakPhase = false;
          }
        }
      };

      // Start motion detection
      if (typeof DeviceMotionEvent !== 'undefined') {
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

      // Auto-save interval
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
      startWebStepTracking();
    }
  };

  const startEnhancedWebStepTracking = () => {
    console.log('🚀 Starting Google Fit-like step tracking with advanced algorithms');
    
    let stepCount = stepData.steps;
    let lastStepTime = 0;
    let accelerationHistory: { x: number, y: number, z: number, timestamp: number }[] = [];
    let magnitudeHistory: number[] = [];

    // --- NEW: State for valley-then-peak detection ---
    let isPeakPhase = false;
    
    // --- Tuned for reliable web-based tracking ---
    const minStepThreshold = 12.0;
    const maxStepThreshold = 35;
    const minTimeBetweenSteps = 300;
    const maxTimeBetweenSteps = 2800;
    const windowSize = 10;

    const calculateMagnitude = (acc: { x: number, y: number, z: number }) => {
      return Math.sqrt(acc.x * acc.x + acc.y * acc.y + acc.z * acc.z);
    };

    const handleDeviceMotion = (event: DeviceMotionEvent) => {
        if (!event.accelerationIncludingGravity) return;
        const { x, y, z } = event.accelerationIncludingGravity;
        if (x === null || y === null || z === null) return;
        
        const currentTime = Date.now();
        
        accelerationHistory.push({ x, y, z, timestamp: currentTime });
        if (accelerationHistory.length > windowSize) {
          accelerationHistory.shift();
        }

        if (accelerationHistory.length < 3) return;

        const magnitude = calculateMagnitude({ x, y, z });
        magnitudeHistory.push(magnitude);
        if (magnitudeHistory.length > windowSize) {
          magnitudeHistory.shift();
        }

        // --- IMPROVED "VALLEY-THEN-PEAK" STEP DETECTION LOGIC ---
        if (magnitudeHistory.length >= 3) {
          const latest = magnitudeHistory[magnitudeHistory.length - 1];
          const previous = magnitudeHistory[magnitudeHistory.length - 2];
          
          if (!isPeakPhase && previous < latest) {
              isPeakPhase = true;
          }
          
          if (isPeakPhase && previous > latest) {
            if (previous > minStepThreshold && currentTime - lastStepTime > minTimeBetweenSteps) {
                stepCount++;
                lastStepTime = currentTime;
                console.log('👣 Web step detected! Total:', stepCount);
                updateStepData(stepCount);

                if (stepCount % 5 === 0) {
                    saveStepsToDatabase(stepCount);
                }
            }
            isPeakPhase = false;
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

    // Auto-save interval
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
    // This basic fallback remains unchanged.
    console.log('🌐 Starting basic web step tracking (compatibility mode)');
    
    let lastAcceleration = { x: 0, y: 0, z: 0 };
    let stepCount = stepData.steps;
    let lastStepTime = 0;
    const stepThreshold = 8;
    const timeThreshold = 300;

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
        
        if (stepCount % 10 === 0) {
          saveStepsToDatabase(stepCount);
        }
      }

      lastAcceleration = { x, y, z };
    };
    
    if (Capacitor.getPlatform() === 'ios' && typeof DeviceMotionEvent !== 'undefined' && typeof (DeviceMotionEvent as any).requestPermission === 'function') {
        (DeviceMotionEvent as any).requestPermission()
          .then((permission: string) => {
            if (permission === 'granted') {
              window.addEventListener('devicemotion', handleDeviceMotion);
              setIsTracking(true);
            } else {
              setIsTracking(true);
            }
          })
          .catch(() => setIsTracking(true));
      } else {
        window.addEventListener('devicemotion', handleDeviceMotion);
        setIsTracking(true);
      }
      
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