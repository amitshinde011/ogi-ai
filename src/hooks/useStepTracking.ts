import { useState, useEffect, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface StepData {
  steps: number;
  lastUpdated: Date;
}

// Background Service Worker for continuous step tracking
class BackgroundStepTracker {
  private static instance: BackgroundStepTracker;
  private isRunning = false;
  private stepCount = 0;
  private lastStepTime = 0;
  private accelerationHistory: { x: number, y: number, z: number, timestamp: number }[] = [];
  private magnitudeHistory: number[] = [];
  private isPeakPhase = false;
  private lastSaveTime = 0;
  private syncInterval: NodeJS.Timeout | null = null;

  // Step detection parameters
  private readonly minStepThreshold = 12.5;
  private readonly maxStepThreshold = 40;
  private readonly minTimeBetweenSteps = 300;
  private readonly maxTimeBetweenSteps = 2500;
  private readonly windowSize = 10;
  private readonly saveInterval = 30000; // 30 seconds

  private constructor() {
    this.loadPersistedData();
    this.setupBackgroundSync();
  }

  public static getInstance(): BackgroundStepTracker {
    if (!BackgroundStepTracker.instance) {
      BackgroundStepTracker.instance = new BackgroundStepTracker();
    }
    return BackgroundStepTracker.instance;
  }

  private loadPersistedData() {
    try {
      const today = new Date().toISOString().split('T')[0];
      const savedData = localStorage.getItem(`steps_${today}`);
      if (savedData) {
        const parsed = JSON.parse(savedData);
        this.stepCount = parsed.steps || 0;
        this.lastStepTime = parsed.lastStepTime || 0;
        console.log('📁 Loaded persisted step data:', this.stepCount);
      }
    } catch (error) {
      console.error('Error loading persisted data:', error);
    }
  }

  private persistData() {
    try {
      const today = new Date().toISOString().split('T')[0];
      const dataToSave = {
        steps: this.stepCount,
        lastStepTime: this.lastStepTime,
        timestamp: Date.now()
      };
      localStorage.setItem(`steps_${today}`, JSON.stringify(dataToSave));
    } catch (error) {
      console.error('Error persisting data:', error);
    }
  }

  private setupBackgroundSync() {
    // Sync to database periodically
    this.syncInterval = setInterval(() => {
      this.syncToDatabase();
    }, this.saveInterval);

    // Sync when app visibility changes
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        console.log('📱 App foregrounded - syncing step data');
        this.syncToDatabase();
      }
    });

    // Sync before page unload
    window.addEventListener('beforeunload', () => {
      this.syncToDatabase();
    });

    // Sync when app becomes active again
    window.addEventListener('focus', () => {
      this.syncToDatabase();
    });

    // Keep alive with periodic pings
    setInterval(() => {
      if (this.isRunning) {
        console.log('🔄 Background tracker alive - Steps:', this.stepCount);
      }
    }, 60000); // Every minute
  }

  private async syncToDatabase() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const today = new Date().toISOString().split('T')[0];
      
      const { error } = await supabase
        .from('steps_tracking')
        .upsert({
          user_id: user.id,
          date: today,
          steps_count: this.stepCount
        }, {
          onConflict: 'user_id,date'
        });

      if (error) throw error;
      
      this.lastSaveTime = Date.now();
      console.log('🔄 Background sync - Steps saved to database:', this.stepCount);
      
      // Persist to localStorage as backup
      this.persistData();
    } catch (error) {
      console.error('Error syncing to database:', error);
    }
  }

  private calculateMagnitude(acc: { x: number, y: number, z: number }) {
    return Math.sqrt(acc.x * acc.x + acc.y * acc.y + acc.z * acc.z);
  }

  private handleDeviceMotion = (event: DeviceMotionEvent) => {
    if (!event.accelerationIncludingGravity) return;
    const { x, y, z } = event.accelerationIncludingGravity;
    if (x === null || y === null || z === null) return;
    
    const currentTime = Date.now();
    
    this.accelerationHistory.push({ x, y, z, timestamp: currentTime });
    if (this.accelerationHistory.length > this.windowSize) {
      this.accelerationHistory.shift();
    }

    if (this.accelerationHistory.length < 3) return;

    const magnitude = this.calculateMagnitude({ x, y, z });
    this.magnitudeHistory.push(magnitude);
    if (this.magnitudeHistory.length > this.windowSize) {
      this.magnitudeHistory.shift();
    }

    // Valley-then-peak step detection
    if (this.magnitudeHistory.length >= 3) {
      const latest = this.magnitudeHistory[this.magnitudeHistory.length - 1];
      const previous = this.magnitudeHistory[this.magnitudeHistory.length - 2];
      
      // Phase 1: Look for valley
      if (!this.isPeakPhase && previous < latest) {
        this.isPeakPhase = true;
      }
      
      // Phase 2: Look for peak
      if (this.isPeakPhase && previous > latest) {
        if (previous > this.minStepThreshold && 
            currentTime - this.lastStepTime > this.minTimeBetweenSteps) {
          this.stepCount++;
          this.lastStepTime = currentTime;
          console.log('👣 Background step detected! Total:', this.stepCount);
          
          // Notify components
          window.dispatchEvent(new CustomEvent('stepsUpdated', { 
            detail: { steps: this.stepCount, lastUpdated: new Date() } 
          }));
          
          // Auto-save every 10 steps or every 30 seconds
          if (this.stepCount % 10 === 0 || currentTime - this.lastSaveTime > this.saveInterval) {
            this.syncToDatabase();
          }
        }
        this.isPeakPhase = false;
      }
    }
  };

  public async start() {
    if (this.isRunning) return;
    
    console.log('🚀 Starting background step tracker');
    
    try {
      // Request motion permissions
      if (Capacitor.getPlatform() === 'ios' && 
          typeof DeviceMotionEvent !== 'undefined' && 
          typeof (DeviceMotionEvent as any).requestPermission === 'function') {
        const permission = await (DeviceMotionEvent as any).requestPermission();
        if (permission !== 'granted') {
          throw new Error('Motion permission denied');
        }
      }

      // Start motion detection with passive listener for better performance
      window.addEventListener('devicemotion', this.handleDeviceMotion, { passive: true });
      this.isRunning = true;
      
      // Initial sync
      await this.syncToDatabase();
      
      console.log('✅ Background step tracker started');
    } catch (error) {
      console.error('❌ Failed to start background step tracker:', error);
      throw error;
    }
  }

  public stop() {
    if (!this.isRunning) return;
    
    console.log('🛑 Stopping background step tracker');
    
    window.removeEventListener('devicemotion', this.handleDeviceMotion);
    
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
    
    // Final sync
    this.syncToDatabase();
    
    this.isRunning = false;
  }

  public getCurrentSteps(): number {
    return this.stepCount;
  }

  public addManualSteps(steps: number) {
    this.stepCount += steps;
    this.syncToDatabase();
    
    // Notify components
    window.dispatchEvent(new CustomEvent('stepsUpdated', { 
      detail: { steps: this.stepCount, lastUpdated: new Date() } 
    }));
  }

  public isActive(): boolean {
    return this.isRunning;
  }

  public async fetchTodaySteps() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return 0;

      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('steps_tracking')
        .select('steps_count')
        .eq('user_id', user.id)
        .eq('date', today)
        .maybeSingle();

      if (error) throw error;

      if (data && data.steps_count > this.stepCount) {
        console.log('📊 Fetched higher step count from database:', data.steps_count);
        this.stepCount = data.steps_count;
        this.persistData();
      }
      
      return this.stepCount;
    } catch (error) {
      console.error('Error fetching today steps:', error);
      return this.stepCount;
    }
  }
}

export const useStepTracking = () => {
  const [stepData, setStepData] = useState<StepData>({ steps: 0, lastUpdated: new Date() });
  const [isTracking, setIsTracking] = useState(false);
  const { toast } = useToast();
  const backgroundTracker = BackgroundStepTracker.getInstance();

  // Update step data and sync with parent components
  const updateStepData = useCallback((newSteps: number) => {
    const newData = { steps: newSteps, lastUpdated: new Date() };
    setStepData(newData);
  }, []);

  useEffect(() => {
    const initializeTracking = async () => {
      try {
        // Start the background tracker
        await backgroundTracker.start();
        setIsTracking(true);
        
        // Fetch initial data
        const initialSteps = await backgroundTracker.fetchTodaySteps();
        updateStepData(initialSteps);
        
        console.log('🎯 Background step tracking initialized');
      } catch (error) {
        console.error('Failed to initialize background tracking:', error);
        toast({
          title: "Step Tracking",
          description: "Failed to initialize step tracking. Please enable motion permissions.",
          variant: "destructive"
        });
      }
    };

    initializeTracking();

    // Listen for step updates from background tracker
    const handleStepsUpdate = (event: CustomEvent) => {
      updateStepData(event.detail.steps);
    };

    window.addEventListener('stepsUpdated', handleStepsUpdate as EventListener);
    
    // Cleanup function
    return () => {
      window.removeEventListener('stepsUpdated', handleStepsUpdate as EventListener);
    };
  }, [updateStepData, toast]);

  // Manual step addition
  const manuallyAddSteps = useCallback(async (additionalSteps: number) => {
    backgroundTracker.addManualSteps(additionalSteps);
    const newSteps = backgroundTracker.getCurrentSteps();
    updateStepData(newSteps);
    console.log('➕ Adding manual steps:', additionalSteps, 'New total:', newSteps);
  }, [updateStepData]);

  // Force sync with database
  const saveStepsToDatabase = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const today = new Date().toISOString().split('T')[0];
      const currentSteps = backgroundTracker.getCurrentSteps();
      
      const { error } = await supabase
        .from('steps_tracking')
        .upsert({
          user_id: user.id,
          date: today,
          steps_count: currentSteps
        }, {
          onConflict: 'user_id,date'
        });

      if (error) throw error;
      console.log('💾 Manual sync - Steps saved to database:', currentSteps);
    } catch (error) {
      console.error('Error saving steps:', error);
    }
  }, []);

  return {
    stepData,
    isTracking: backgroundTracker.isActive(),
    manuallyAddSteps,
    saveStepsToDatabase
  };
};
