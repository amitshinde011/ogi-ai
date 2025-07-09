import { useState, useEffect, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { Motion } from '@capacitor/motion';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface StepData {
  steps: number;
  lastUpdated: Date;
}

interface MotionState {
  isActive: boolean;
  lastMotionTime: number;
  inactivityThreshold: number;
}

export const useStepTracking = () => {
  const [stepData, setStepData] = useState<StepData>({ steps: 0, lastUpdated: new Date() });
  const [isTracking, setIsTracking] = useState(false);
  const [motionState, setMotionState] = useState<MotionState>({
    isActive: false,
    lastMotionTime: 0,
    inactivityThreshold: 30000 // 30 seconds of inactivity before going idle
  });
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

  // Intelligent sync logic - batch updates every 100 steps or 15 minutes
  const intelligentSync = useCallback((steps: number, forceSync: boolean = false) => {
    const lastSyncSteps = localStorage.getItem('lastSyncSteps');
    const lastSyncTime = localStorage.getItem('lastSyncTime');
    
    const stepsSinceLastSync = steps - (lastSyncSteps ? parseInt(lastSyncSteps) : 0);
    const timeSinceLastSync = Date.now() - (lastSyncTime ? parseInt(lastSyncTime) : 0);
    
    const shouldSync = forceSync || 
                      stepsSinceLastSync >= 100 || 
                      timeSinceLastSync >= 900000; // 15 minutes
    
    if (shouldSync) {
      console.log('🔄 Intelligent sync triggered:', { steps, stepsSinceLastSync, timeSinceLastSync });
      saveStepsToDatabase(steps);
      localStorage.setItem('lastSyncSteps', steps.toString());
      localStorage.setItem('lastSyncTime', Date.now().toString());
    }
  }, []);

  // Motion detection for idle/active state management
  const updateMotionState = useCallback((hasMotion: boolean) => {
    const currentTime = Date.now();
    
    setMotionState(prev => {
      const newState = {
        ...prev,
        lastMotionTime: hasMotion ? currentTime : prev.lastMotionTime,
        isActive: hasMotion || (currentTime - prev.lastMotionTime < prev.inactivityThreshold)
      };
      
      if (prev.isActive !== newState.isActive) {
        console.log(`🎯 Motion state changed: ${newState.isActive ? 'ACTIVE' : 'IDLE'}`);
      }
      
      return newState;
    });
  }, []);

  useEffect(() => {
    initializeStepTracking();
    fetchTodaySteps();
    
    // Enhanced background operation support
    const handleVisibilityChange = () => {
      if (document.hidden) {
        console.log('📱 App backgrounded - maintaining intelligent step tracking');
        // Force sync when app goes to background
        intelligentSync(stepData.steps, true);
      } else {
        console.log('📱 App foregrounded - syncing latest data');
        // Fetch latest data and force sync when app comes back to foreground
        fetchTodaySteps().then(() => {
          intelligentSync(stepData.steps, true);
        });
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Motion state monitoring for idle detection
    const motionMonitor = setInterval(() => {
      const timeSinceMotion = Date.now() - motionState.lastMotionTime;
      if (timeSinceMotion > motionState.inactivityThreshold && motionState.isActive) {
        console.log('💤 Entering idle state due to inactivity');
        updateMotionState(false);
      }
    }, 5000); // Check every 5 seconds
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(motionMonitor);
    };
  }, [intelligentSync, stepData.steps, motionState.lastMotionTime, motionState.inactivityThreshold, motionState.isActive, updateMotionState]);

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
    console.log('🔬 Starting intelligent Android/iOS motion tracking');
    
    let stepCount = stepData.steps;
    let lastStepTime = 0;
    let accelerationHistory: { x: number, y: number, z: number, timestamp: number }[] = [];
    let magnitudeHistory: number[] = [];
    let lastActivityCheck = Date.now();

    // --- Enhanced state management ---
    let isPeakPhase = false;
    let isCurrentlyActive = false;
    
    // --- Tuned for realistic step detection with motion-based activation ---
    const minStepThreshold = 12.5;
    const maxStepThreshold = 40;
    const minTimeBetweenSteps = 300;
    const maxTimeBetweenSteps = 2500;
    const windowSize = 10;
    const motionThreshold = 8.0; // Threshold for detecting general motion

    const calculateMagnitude = (acc: { x: number, y: number, z: number }) => {
      return Math.sqrt(acc.x * acc.x + acc.y * acc.y + acc.z * acc.z);
    };

    const checkMotionActivity = (magnitudeHistory: number[]) => {
      if (magnitudeHistory.length < 5) return false;
      
      const recent = magnitudeHistory.slice(-5);
      const average = recent.reduce((a, b) => a + b, 0) / recent.length;
      const variance = recent.reduce((sum, val) => sum + Math.pow(val - average, 2), 0) / recent.length;
      
      return variance > motionThreshold;
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

        // Motion-based activation check (every 2 seconds)
        if (currentTime - lastActivityCheck > 2000) {
          const hasMotion = checkMotionActivity(magnitudeHistory);
          if (hasMotion !== isCurrentlyActive) {
            isCurrentlyActive = hasMotion;
            updateMotionState(hasMotion);
            console.log(`🎯 Motion detected: ${hasMotion ? 'WALKING' : 'STATIONARY'}`);
          }
          lastActivityCheck = currentTime;
        }

        // Only process steps if motion is detected (energy efficient)
        if (isCurrentlyActive && magnitudeHistory.length >= 3) {
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
                console.log('👣 Intelligent step detected! Total:', stepCount);
                updateStepData(stepCount);

                // Use intelligent sync instead of fixed intervals
                intelligentSync(stepCount);
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

      // Smart background sync - only sync when necessary
      const backgroundSyncInterval = setInterval(() => {
        if (stepCount > 0) {
          intelligentSync(stepCount);
        }
      }, 60000); // Check every minute, but only sync if criteria met

      return () => {
        window.removeEventListener('devicemotion', handleDeviceMotion);
        clearInterval(backgroundSyncInterval);
        setIsTracking(false);
        // Force final sync when stopping
        intelligentSync(stepCount, true);
        console.log('🛑 Intelligent motion tracking stopped');
      };
    } catch (error) {
      console.error('❌ Android motion tracking failed:', error);
      startWebStepTracking();
    }
  };

  const startEnhancedWebStepTracking = () => {
    console.log('🚀 Starting intelligent web step tracking with motion detection');
    
    let stepCount = stepData.steps;
    let lastStepTime = 0;
    let accelerationHistory: { x: number, y: number, z: number, timestamp: number }[] = [];
    let magnitudeHistory: number[] = [];
    let lastActivityCheck = Date.now();

    // --- Enhanced state for motion-activated tracking ---
    let isPeakPhase = false;
    let isCurrentlyActive = false;
    
    // --- Tuned for reliable web-based tracking ---
    const minStepThreshold = 12.0;
    const maxStepThreshold = 35;
    const minTimeBetweenSteps = 300;
    const maxTimeBetweenSteps = 2800;
    const windowSize = 10;
    const motionThreshold = 6.0; // Lower threshold for web

    const calculateMagnitude = (acc: { x: number, y: number, z: number }) => {
      return Math.sqrt(acc.x * acc.x + acc.y * acc.y + acc.z * acc.z);
    };

    const checkMotionActivity = (magnitudeHistory: number[]) => {
      if (magnitudeHistory.length < 5) return false;
      
      const recent = magnitudeHistory.slice(-5);
      const average = recent.reduce((a, b) => a + b, 0) / recent.length;
      const variance = recent.reduce((sum, val) => sum + Math.pow(val - average, 2), 0) / recent.length;
      
      return variance > motionThreshold;
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

        // Motion-based activation check (every 3 seconds for web)
        if (currentTime - lastActivityCheck > 3000) {
          const hasMotion = checkMotionActivity(magnitudeHistory);
          if (hasMotion !== isCurrentlyActive) {
            isCurrentlyActive = hasMotion;
            updateMotionState(hasMotion);
            console.log(`🎯 Web motion detected: ${hasMotion ? 'WALKING' : 'STATIONARY'}`);
          }
          lastActivityCheck = currentTime;
        }

        // Only process steps if motion is detected (energy efficient)
        if (isCurrentlyActive && magnitudeHistory.length >= 3) {
          const latest = magnitudeHistory[magnitudeHistory.length - 1];
          const previous = magnitudeHistory[magnitudeHistory.length - 2];
          
          if (!isPeakPhase && previous < latest) {
              isPeakPhase = true;
          }
          
          if (isPeakPhase && previous > latest) {
            if (previous > minStepThreshold && currentTime - lastStepTime > minTimeBetweenSteps) {
                stepCount++;
                lastStepTime = currentTime;
                console.log('👣 Intelligent web step detected! Total:', stepCount);
                updateStepData(stepCount);

                // Use intelligent sync instead of fixed intervals
                intelligentSync(stepCount);
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

    // Smart background sync for web
    const backgroundSyncInterval = setInterval(() => {
      if (stepCount > 0) {
        intelligentSync(stepCount);
      }
    }, 90000); // Check every 1.5 minutes for web

    return () => {
      window.removeEventListener('devicemotion', handleDeviceMotion);
      clearInterval(backgroundSyncInterval);
      setIsTracking(false);
      // Force final sync when stopping
      intelligentSync(stepCount, true);
      console.log('🛑 Intelligent web step tracking stopped');
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
        console.log('📊 Real-time sync: Fetched today steps from database:', data.steps_count);
        updateStepData(data.steps_count);
        
        // Update local sync tracking
        localStorage.setItem('lastSyncSteps', data.steps_count.toString());
        localStorage.setItem('lastSyncTime', Date.now().toString());
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
      console.log('💾 Intelligent sync: Steps saved to database:', steps);
    } catch (error) {
      console.error('Error saving steps:', error);
    }
  };

  const manuallyAddSteps = async (additionalSteps: number) => {
    const newStepCount = stepData.steps + additionalSteps;
    console.log('➕ Adding manual steps:', additionalSteps, 'New total:', newStepCount);
    updateStepData(newStepCount);
    // Force sync for manual additions
    intelligentSync(newStepCount, true);
  };

  return {
    stepData,
    isTracking,
    motionState,
    manuallyAddSteps,
    saveStepsToDatabase: () => saveStepsToDatabase(stepData.steps),
    intelligentSync: (force?: boolean) => intelligentSync(stepData.steps, force)
  };
};