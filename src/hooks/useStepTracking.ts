import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { getLocalDateString } from '@/utils/dateUtils';

interface StepData {
  steps: number;
  lastUpdated: Date;
}

export const useStepTracking = () => {
  const [stepData, setStepData] = useState<StepData>({ steps: 0, lastUpdated: new Date() });
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Load persisted data from localStorage
  const loadPersistedData = useCallback(() => {
    if (!user) return 0;
    
    try {
      const today = getLocalDateString();
      const savedData = localStorage.getItem(`steps_${user.id}_${today}`);
      if (savedData) {
        const parsed = JSON.parse(savedData);
        return parsed.steps || 0;
      }
      return 0;
    } catch (error) {
      console.error('Error loading persisted data:', error);
      return 0;
    }
  }, [user]);

  // Persist data to localStorage
  const persistData = useCallback((steps: number) => {
    if (!user) return;
    
    try {
      const today = getLocalDateString();
      const dataToSave = {
        steps,
        timestamp: Date.now()
      };
      localStorage.setItem(`steps_${user.id}_${today}`, JSON.stringify(dataToSave));
    } catch (error) {
      console.error('Error persisting data:', error);
    }
  }, [user]);

  // Clear cache when user changes - comprehensive cleanup
  const clearUserCache = useCallback(() => {
    if (!user) return;
    
    const today = getLocalDateString();
    const keysToRemove = [];
    
    // Clear ALL step-related localStorage entries, not just today's
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (
        key.startsWith('steps_') ||
        key.startsWith('step_goal_achieved_') ||
        (key.includes('step') && key !== `steps_${user.id}_${today}`)
      )) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => {
      console.log('🧹 Clearing stale step cache:', key);
      localStorage.removeItem(key);
    });
  }, [user]);

  // Fetch today's steps from database
  const fetchTodaySteps = useCallback(async () => {
    if (!user) return 0;

    try {
      const today = getLocalDateString();
      const { data, error } = await supabase
        .from('steps_tracking')
        .select('steps_count')
        .eq('user_id', user.id)
        .eq('date', today)
        .maybeSingle();

      if (error) throw error;
      return data?.steps_count || 0;
    } catch (error) {
      console.error('Error fetching today steps:', error);
      return loadPersistedData();
    }
  }, [user, loadPersistedData]);

  // Sync steps to database
  const syncToDatabase = useCallback(async (steps: number) => {
    if (!user) return;

    try {
      const today = getLocalDateString();
      
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
      
      console.log('🔄 Steps saved to database:', steps);
      persistData(steps);
    } catch (error) {
      console.error('Error syncing to database:', error);
      // Still persist locally even if sync fails
      persistData(steps);
    }
  }, [user, persistData]);

  // Initialize step tracking
  useEffect(() => {
    const initializeTracking = async () => {
      if (!user) return;

      console.log('🎯 Initializing step tracking for user:', user.id);
      
      // Clear any cached step data from other users first
      clearUserCache();

      setIsLoading(true);
      try {
        // Always prioritize database data over localStorage
        const dbSteps = await fetchTodaySteps();
        
        console.log('📊 Database steps:', dbSteps);
        
        // Start fresh with database data only
        setStepData({ steps: dbSteps, lastUpdated: new Date() });
        
        // Update localStorage with fresh database data
        persistData(dbSteps);
        
        console.log('🎯 Step tracking initialized with', dbSteps, 'steps from database');
      } catch (error) {
        console.error('Error initializing step tracking:', error);
        // Only fallback to 0 if database fails completely
        setStepData({ steps: 0, lastUpdated: new Date() });
        persistData(0);
      } finally {
        setIsLoading(false);
      }
    };

    initializeTracking();
  }, [user]);

  // Setup sync on app visibility change and before unload
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && stepData.steps > 0) {
        console.log('📱 App foregrounded - syncing step data');
        syncToDatabase(stepData.steps);
      }
    };

    const handleBeforeUnload = () => {
      if (stepData.steps > 0) {
        syncToDatabase(stepData.steps);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [stepData.steps, syncToDatabase]);

  // Manual step addition
  const manuallyAddSteps = useCallback(async (additionalSteps: number) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to track steps",
        variant: "destructive"
      });
      return;
    }

    const newTotal = stepData.steps + additionalSteps;
    const newStepData = { steps: newTotal, lastUpdated: new Date() };
    
    setStepData(newStepData);
    await syncToDatabase(newTotal);
    
    console.log('➕ Adding manual steps:', additionalSteps, 'New total:', newTotal);
    
    toast({
      title: "Steps added!",
      description: `Added ${additionalSteps} steps. Total: ${newTotal}`,
    });
  }, [user, stepData.steps, syncToDatabase, toast]);

  // Force sync with database
  const saveStepsToDatabase = useCallback(async () => {
    if (!user) return;

    try {
      await syncToDatabase(stepData.steps);
      toast({
        title: "Steps synced!",
        description: "Your step data has been saved successfully.",
      });
    } catch (error) {
      console.error('Error saving steps:', error);
      toast({
        title: "Sync failed",
        description: "Failed to sync steps. Data saved locally.",
        variant: "destructive"
      });
    }
  }, [user, stepData.steps, syncToDatabase, toast]);

  return {
    stepData,
    isLoading,
    isTracking: false, // Manual only, no automatic tracking
    manuallyAddSteps,
    saveStepsToDatabase
  };
};