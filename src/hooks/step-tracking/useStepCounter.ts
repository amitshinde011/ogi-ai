import { useState, useCallback } from 'react';

interface StepCounterConfig {
  stepThreshold: number;
  minStepInterval: number; // ms between valid steps
  maxStepInterval: number; // ms for step timeout
  filterWindowSize: number; // number of samples for filtering
}

interface StepData {
  steps: number;
  lastStepTime: number;
  confidence: number; // 0-1, how confident we are in the count
}

export const useStepCounter = (config: StepCounterConfig) => {
  const [stepData, setStepData] = useState<StepData>({
    steps: 0,
    lastStepTime: 0,
    confidence: 1.0
  });

  // Filtering arrays
  const [magnitudeHistory, setMagnitudeHistory] = useState<number[]>([]);
  const [peakHistory, setPeakHistory] = useState<{ time: number; magnitude: number }[]>([]);

  // Advanced step detection with filtering
  const processMotionSample = useCallback((magnitude: number, timestamp: number) => {
    console.log('🔬 Step Counter: Processing motion sample:', {
      magnitude: magnitude.toFixed(2),
      timestamp,
      threshold: config.stepThreshold,
      historyLength: magnitudeHistory.length
    });

    // Update magnitude history for filtering
    setMagnitudeHistory(prev => {
      const newHistory = [...prev, magnitude];
      const trimmedHistory = newHistory.slice(-config.filterWindowSize);
      console.log('📊 Updated magnitude history:', trimmedHistory.map(m => m.toFixed(2)));
      return trimmedHistory;
    });

    // Need at least 3 samples for peak detection
    if (magnitudeHistory.length >= 2) {
      const currentHistory = [...magnitudeHistory, magnitude];
      const recentMagnitudes = currentHistory.slice(-3);
      const [prev, current, next] = recentMagnitudes;
      
      console.log('🔍 Peak detection analysis:', {
        prev: prev?.toFixed(2) || 'none',
        current: current?.toFixed(2) || 'none', 
        next: next?.toFixed(2) || 'none',
        threshold: config.stepThreshold
      });
      
      // Check if current is a peak (simpler detection)
      const isPeak = current && current > config.stepThreshold && 
                    (!prev || current > prev) && 
                    (!next || current > next);
      
      console.log('🎯 Peak detection result:', { isPeak, magnitude: current?.toFixed(2) });
      
      if (isPeak) {
        setStepData(prevData => {
          const timeSinceLastStep = timestamp - prevData.lastStepTime;
          
          console.log('⏱️ Step timing check:', {
            timeSinceLastStep,
            minInterval: config.minStepInterval,
            maxInterval: config.maxStepInterval,
            lastStepTime: prevData.lastStepTime,
            isValidTiming: timeSinceLastStep >= config.minStepInterval
          });
          
          // Validate step timing (be more lenient for the first step)
          if (prevData.lastStepTime === 0 || 
              (timeSinceLastStep >= config.minStepInterval && 
               timeSinceLastStep <= config.maxStepInterval)) {
            
            // Update peak history for rhythm analysis
            setPeakHistory(prevPeaks => {
              const newPeaks = [...prevPeaks, { time: timestamp, magnitude: current }];
              return newPeaks.slice(-5); // Keep last 5 peaks
            });

            // Calculate confidence based on rhythm consistency
            let confidence = 1.0;
            if (peakHistory.length >= 3) {
              const intervals = peakHistory.slice(-3).map((peak, i, arr) => 
                i > 0 ? peak.time - arr[i-1].time : 0
              ).filter(interval => interval > 0);

              if (intervals.length >= 2) {
                const avgInterval = intervals.reduce((a, b) => a + b) / intervals.length;
                const variance = intervals.reduce((acc, interval) => 
                  acc + Math.pow(interval - avgInterval, 2), 0) / intervals.length;
                const stdDev = Math.sqrt(variance);
                confidence = Math.max(0.3, 1 - (stdDev / avgInterval));
              }
            }

            console.log('👣 Step detected!', {
              steps: prevData.steps + 1,
              confidence: confidence.toFixed(2),
              magnitude: current?.toFixed(2) || 'unknown',
              interval: timeSinceLastStep,
              newTotal: prevData.steps + 1
            });

            return {
              steps: prevData.steps + 1,
              lastStepTime: timestamp,
              confidence
            };
          }
          
          console.log('❌ Step timing invalid, skipping');
          return prevData;
        });
      } else {
        console.log('❌ No peak detected');
      }
    } else {
      console.log('⏳ Not enough samples for peak detection, need at least 2');
    }
  }, [magnitudeHistory, peakHistory, config]);

  // Filter out vehicle movement and other false positives
  const isValidMovementPattern = useCallback((motionIntensity: number): boolean => {
    // Too intense might be vehicle movement
    if (motionIntensity > 50) return false;
    
    // Too gentle might be just phone handling
    if (motionIntensity < 1) return false;
    
    return true;
  }, []);

  // Manual step adjustment
  const adjustSteps = useCallback((adjustment: number) => {
    setStepData(prev => ({
      ...prev,
      steps: Math.max(0, prev.steps + adjustment)
    }));
    console.log(`📝 Manual step adjustment: ${adjustment > 0 ? '+' : ''}${adjustment}`);
  }, []);

  // Reset daily steps
  const resetSteps = useCallback(() => {
    setStepData({
      steps: 0,
      lastStepTime: 0,
      confidence: 1.0
    });
    setMagnitudeHistory([]);
    setPeakHistory([]);
    console.log('🔄 Steps reset');
  }, []);

  // Set step count (for sync from backend)
  const setSteps = useCallback((steps: number) => {
    setStepData(prev => ({
      ...prev,
      steps
    }));
  }, []);

  return {
    stepData,
    processMotionSample,
    isValidMovementPattern,
    adjustSteps,
    resetSteps,
    setSteps
  };
};