import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface StepData {
  steps: number;
  lastUpdated: Date;
}

// Simple step tracker for manual entry only
class ManualStepTracker {
  private static instance: ManualStepTracker;
  private stepCount = 0;
  private syncInterval: NodeJS.Timeout | null = null;

  private constructor() {
    this.loadPersistedData();
    this.setupSync();
  }

  public static getInstance(): ManualStepTracker {
    if (!ManualStepTracker.instance) {
      ManualStepTracker.instance = new ManualStepTracker();
    }
    return ManualStepTracker.instance;
  }

  private loadPersistedData() {
    try {
      const today = new Date().toISOString().split('T')[0];
      const savedData = localStorage.getItem(`steps_${today}`);
      if (savedData) {
        const parsed = JSON.parse(savedData);
        this.stepCount = parsed.steps || 0;
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
        timestamp: Date.now()
      };
      localStorage.setItem(`steps_${today}`, JSON.stringify(dataToSave));
    } catch (error) {
      console.error('Error persisting data:', error);
    }
  }

  private setupSync() {
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
      
      console.log('🔄 Steps saved to database:', this.stepCount);
      
      // Persist to localStorage as backup
      this.persistData();
    } catch (error) {
      console.error('Error syncing to database:', error);
    }
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
  const manualTracker = ManualStepTracker.getInstance();

  // Update step data and sync with parent components
  const updateStepData = useCallback((newSteps: number) => {
    const newData = { steps: newSteps, lastUpdated: new Date() };
    setStepData(newData);
  }, []);

  useEffect(() => {
    const initializeTracking = async () => {
      // Fetch initial data
      const initialSteps = await manualTracker.fetchTodaySteps();
      updateStepData(initialSteps);
      console.log('🎯 Manual step tracking initialized');
    };

    initializeTracking();

    // Listen for step updates
    const handleStepsUpdate = (event: CustomEvent) => {
      updateStepData(event.detail.steps);
    };

    window.addEventListener('stepsUpdated', handleStepsUpdate as EventListener);
    
    // Cleanup function
    return () => {
      window.removeEventListener('stepsUpdated', handleStepsUpdate as EventListener);
    };
  }, [updateStepData]);

  // Manual step addition
  const manuallyAddSteps = useCallback(async (additionalSteps: number) => {
    manualTracker.addManualSteps(additionalSteps);
    const newSteps = manualTracker.getCurrentSteps();
    updateStepData(newSteps);
    console.log('➕ Adding manual steps:', additionalSteps, 'New total:', newSteps);
  }, [updateStepData]);

  // Force sync with database
  const saveStepsToDatabase = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const today = new Date().toISOString().split('T')[0];
      const currentSteps = manualTracker.getCurrentSteps();
      
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
    isTracking: false, // Manual only, no automatic tracking
    manuallyAddSteps,
    saveStepsToDatabase
  };
};
