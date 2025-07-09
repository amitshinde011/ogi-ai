
import { useIntelligentStepTracking } from './step-tracking/useIntelligentStepTracking';

export const useStepTracking = () => {
  const {
    trackingState,
    isSupported,
    manuallyAddSteps,
    manuallySetSteps,
    forceSync,
    resetSteps
  } = useIntelligentStepTracking();

  // Legacy compatibility interface
  const stepData = {
    steps: trackingState.steps,
    lastUpdated: trackingState.lastUpdated
  };

  const isTracking = trackingState.isActive && isSupported;

  // Legacy compatibility methods
  const saveStepsToDatabase = () => forceSync();

  return {
    stepData,
    isTracking,
    manuallyAddSteps,
    saveStepsToDatabase,
    // New intelligent features
    trackingState,
    isSupported,
    manuallySetSteps,
    forceSync,
    resetSteps
  };
};
