import { useState, useEffect, useCallback } from 'react';

interface MotionState {
  isMoving: boolean;
  motionIntensity: number;
  lastMotionTime: number;
}

interface MotionDetectionConfig {
  motionThreshold: number;
  stillnessTimeout: number; // ms to wait before considering user still
  sampleRate: number; // ms between samples
}

export const useMotionDetection = (config: MotionDetectionConfig) => {
  const [motionState, setMotionState] = useState<MotionState>({
    isMoving: false,
    motionIntensity: 0,
    lastMotionTime: 0
  });

  const [isSupported, setIsSupported] = useState(false);

  // Motion detection algorithm
  const detectMotion = useCallback((acceleration: { x: number; y: number; z: number }) => {
    const magnitude = Math.sqrt(
      acceleration.x * acceleration.x + 
      acceleration.y * acceleration.y + 
      acceleration.z * acceleration.z
    );

    const currentTime = Date.now();
    const isMotionDetected = magnitude > config.motionThreshold;

    setMotionState(prev => {
      const timeSinceLastMotion = currentTime - prev.lastMotionTime;
      const shouldBeMoving = isMotionDetected || timeSinceLastMotion < config.stillnessTimeout;

      return {
        isMoving: shouldBeMoving,
        motionIntensity: magnitude,
        lastMotionTime: isMotionDetected ? currentTime : prev.lastMotionTime
      };
    });

    return { magnitude, isMotionDetected };
  }, [config.motionThreshold, config.stillnessTimeout]);

  // Initialize motion detection
  useEffect(() => {
    console.log('🚀 Motion detection hook initializing...');
    
    let animationFrame: number;
    let lastSample = 0;
    let sampleCount = 0;

    const handleDeviceMotion = (event: DeviceMotionEvent) => {
      sampleCount++;
      const now = Date.now();
      
      // Debug every 50th sample to avoid spam
      if (sampleCount % 50 === 0) {
        console.log('📱 Motion sample #', sampleCount, event.accelerationIncludingGravity);
      }
      
      if (now - lastSample < config.sampleRate) return;
      lastSample = now;

      if (!event.accelerationIncludingGravity) {
        console.log('⚠️ No acceleration data available');
        return;
      }
      
      const { x, y, z } = event.accelerationIncludingGravity;
      if (x === null || y === null || z === null) {
        console.log('⚠️ Null acceleration values:', { x, y, z });
        return;
      }

      const result = detectMotion({ x, y, z });
      
      // Log significant motion
      if (result.magnitude > 1) {
        console.log('🏃 Motion detected:', {
          magnitude: result.magnitude.toFixed(2),
          threshold: config.motionThreshold,
          detected: result.isMotionDetected
        });
      }
    };

    const startDetection = async () => {
      try {
        console.log('🔍 Checking device motion support...');
        
        if (typeof DeviceMotionEvent === 'undefined') {
          throw new Error('DeviceMotionEvent not supported');
        }
        
        console.log('📱 Device motion API available');
        
        // Request permission for iOS 13+
        if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
          console.log('🍎 iOS device detected, requesting permission...');
          const permission = await (DeviceMotionEvent as any).requestPermission();
          console.log('🔐 Permission result:', permission);
          if (permission !== 'granted') {
            throw new Error('Motion permission denied');
          }
        } else {
          console.log('🤖 Android/Web device detected, no permission needed');
        }

        window.addEventListener('devicemotion', handleDeviceMotion, { passive: true });
        setIsSupported(true);
        console.log('✅ Motion detection started successfully');
        
        // Test with a timeout to see if events are firing
        setTimeout(() => {
          console.log('📊 Motion samples received after 5s:', sampleCount);
          if (sampleCount === 0) {
            console.error('❌ No motion events received! Device motion may not be working.');
          }
        }, 5000);
        
      } catch (error) {
        console.error('❌ Motion detection failed:', error);
        setIsSupported(false);
      }
    };

    startDetection();

    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
      window.removeEventListener('devicemotion', handleDeviceMotion);
      console.log('🛑 Motion detection stopped');
    };
  }, [config.sampleRate, detectMotion]);

  return {
    motionState,
    isSupported
  };
};