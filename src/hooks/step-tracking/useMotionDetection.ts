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
    let animationFrame: number;
    let lastSample = 0;

    const handleDeviceMotion = (event: DeviceMotionEvent) => {
      const now = Date.now();
      if (now - lastSample < config.sampleRate) return;
      lastSample = now;

      if (!event.accelerationIncludingGravity) return;
      const { x, y, z } = event.accelerationIncludingGravity;
      if (x === null || y === null || z === null) return;

      detectMotion({ x, y, z });
    };

    const startDetection = async () => {
      try {
        // Request permission for iOS 13+
        if (typeof DeviceMotionEvent !== 'undefined' && 
            typeof (DeviceMotionEvent as any).requestPermission === 'function') {
          const permission = await (DeviceMotionEvent as any).requestPermission();
          if (permission !== 'granted') {
            throw new Error('Motion permission denied');
          }
        }

        window.addEventListener('devicemotion', handleDeviceMotion, { passive: true });
        setIsSupported(true);
        console.log('🎯 Motion detection started');
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