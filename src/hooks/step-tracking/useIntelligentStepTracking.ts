import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useMotionDetection } from './useMotionDetection';
import { useStepCounter } from './useStepCounter';
import { useBackgroundSync } from './useBackgroundSync';

interface StepTrackingState {
  steps: number;
  isActive: boolean;
  isMoving: boolean;
  confidence: number;
  lastUpdated: Date;
  syncStatus: 'synced' | 'pending' | 'syncing' | 'error';
}

const MOTION_CONFIG = {
  motionThreshold: 2.0, // Sensitive motion detection
  stillnessTimeout: 3000, // 3 seconds to consider still
  sampleRate: 100 // Sample every 100ms
};

const STEP_CONFIG = {
  stepThreshold: 3.5, // Lower threshold for sensitivity
  minStepInterval: 200, // Min 200ms between steps
  maxStepInterval: 2000, // Max 2s between steps
  filterWindowSize: 5
};

const SYNC_CONFIG = {
  batchSize: 50, // Sync every 50 steps
  syncInterval: 300000, // Sync every 5 minutes
  maxRetries: 3
};

export const useIntelligentStepTracking = () => {
  const { toast } = useToast();
  
  const [trackingState, setTrackingState] = useState<StepTrackingState>({
    steps: 0,
    isActive: false,
    isMoving: false,
    confidence: 1.0,
    lastUpdated: new Date(),
    syncStatus: 'synced'
  });

  // Initialize sub-hooks
  const { motionState, isSupported: motionSupported } = useMotionDetection(MOTION_CONFIG);
  const { 
    stepData, 
    processMotionSample, 
    isValidMovementPattern, 
    adjustSteps, 
    resetSteps,
    setSteps 
  } = useStepCounter(STEP_CONFIG);
  const { 
    syncState, 
    syncStepsToDatabase, 
    loadStepsFromDatabase, 
    scheduleSync 
  } = useBackgroundSync(SYNC_CONFIG);

  // Initialize step tracking
  useEffect(() => {
    const initializeTracking = async () => {
      console.log('🚀 Initializing intelligent step tracking', {
        motionSupported,
        hasLoadFunction: !!loadStepsFromDatabase,
        hasSetFunction: !!setSteps
      });
      
      if (!motionSupported) {
        console.log('❌ Motion not supported, aborting step tracking initialization');
        toast({
          title: "Motion Detection Unavailable",
          description: "Step tracking requires motion sensors. You can still manually add steps.",
          variant: "destructive"
        });
        return;
      }

      try {
        // Load existing steps from database
        console.log('📊 Loading existing steps from database...');
        const existingSteps = await loadStepsFromDatabase();
        if (existingSteps > 0) {
          setSteps(existingSteps);
          console.log('📊 Loaded existing steps:', existingSteps);
        } else {
          console.log('📊 No existing steps found in database');
        }

        console.log('✅ Setting tracking state to active');
        setTrackingState(prev => ({ ...prev, isActive: true }));
        
        console.log('✅ Step tracking initialization completed successfully');
        toast({
          title: "Step Tracking Active",
          description: "Intelligent background step tracking is now running",
        });
      } catch (error) {
        console.error('❌ Step tracking initialization failed:', error);
        toast({
          title: "Step Tracking Error", 
          description: "Failed to initialize step tracking",
          variant: "destructive"
        });
      }
    };

    if (motionSupported !== undefined) {
      initializeTracking();
    } else {
      console.log('⏳ Waiting for motion support detection...');
    }
  }, [motionSupported, loadStepsFromDatabase, setSteps, toast]);

  // Process motion data when user is moving
  useEffect(() => {
    console.log('🔄 Motion processing useEffect triggered with:', {
      isActive: trackingState.isActive,
      isMoving: motionState.isMoving,
      intensity: motionState.motionIntensity,
      lastMotionTime: motionState.lastMotionTime,
      hasMotionState: !!motionState,
      hasTrackingState: !!trackingState
    });
    
    if (!trackingState.isActive || !motionState.isMoving) {
      console.log('⏸️ Motion processing skipped:', {
        isActive: trackingState.isActive,
        isMoving: motionState.isMoving,
        reason: !trackingState.isActive ? 'not active' : 'not moving'
      });
      return;
    }

    const isValidPattern = isValidMovementPattern(motionState.motionIntensity);
    console.log('✅ Movement pattern check:', {
      intensity: motionState.motionIntensity,
      isValid: isValidPattern,
      threshold: 'between 1 and 50'
    });

    if (isValidPattern) {
      console.log('🎯 Processing motion sample for step counting...');
      processMotionSample(motionState.motionIntensity, motionState.lastMotionTime);
    } else {
      console.log('❌ Motion pattern rejected - too intense or too gentle');
    }
  }, [
    trackingState.isActive, 
    motionState.isMoving, 
    motionState.motionIntensity, 
    motionState.lastMotionTime,
    isValidMovementPattern,
    processMotionSample
  ]);

  // Update tracking state when step data changes
  useEffect(() => {
    setTrackingState(prev => ({
      ...prev,
      steps: stepData.steps,
      confidence: stepData.confidence,
      lastUpdated: new Date()
    }));

    // Schedule background sync
    if (stepData.steps > 0) {
      scheduleSync(stepData.steps);
    }

    // Dispatch global event for other components
    window.dispatchEvent(new CustomEvent('stepsUpdated', {
      detail: { 
        steps: stepData.steps, 
        lastUpdated: new Date(),
        confidence: stepData.confidence
      }
    }));

  }, [stepData.steps, stepData.confidence, scheduleSync]);

  // Update motion state
  useEffect(() => {
    setTrackingState(prev => ({
      ...prev,
      isMoving: motionState.isMoving
    }));
  }, [motionState.isMoving]);

  // Update sync status
  useEffect(() => {
    let status: StepTrackingState['syncStatus'] = 'synced';
    
    if (syncState.isSyncing) {
      status = 'syncing';
    } else if (syncState.syncError) {
      status = 'error';
    } else if (syncState.pendingSteps > 0) {
      status = 'pending';
    }

    setTrackingState(prev => ({ ...prev, syncStatus: status }));
  }, [syncState.isSyncing, syncState.syncError, syncState.pendingSteps]);

  // Manual step operations
  const manuallyAddSteps = useCallback(async (additionalSteps: number) => {
    adjustSteps(additionalSteps);
    const newTotal = trackingState.steps + additionalSteps;
    await syncStepsToDatabase(newTotal, true);
    
    toast({
      title: "Steps Added",
      description: `Added ${additionalSteps} steps manually`,
    });
  }, [adjustSteps, trackingState.steps, syncStepsToDatabase, toast]);

  const manuallySetSteps = useCallback(async (totalSteps: number) => {
    const adjustment = totalSteps - trackingState.steps;
    adjustSteps(adjustment);
    await syncStepsToDatabase(totalSteps, true);
    
    toast({
      title: "Steps Updated",
      description: `Step count set to ${totalSteps}`,
    });
  }, [adjustSteps, trackingState.steps, syncStepsToDatabase, toast]);

  const forceSync = useCallback(async () => {
    await syncStepsToDatabase(trackingState.steps, true);
  }, [syncStepsToDatabase, trackingState.steps]);

  return {
    trackingState,
    isSupported: motionSupported,
    manuallyAddSteps,
    manuallySetSteps,
    forceSync,
    resetSteps
  };
};