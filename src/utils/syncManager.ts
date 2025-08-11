import { offlineQueue, OfflineTask } from './offlineQueue';
import { supabase } from '@/integrations/supabase/client';
import { localCache } from './localCache';
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';

class SyncManager {
  private started = false;
  private timer: number | undefined;
  private syncing = false;

  start() {
    if (this.started) return;
    this.started = true;

    // Flush soon after startup
    setTimeout(() => this.processQueue(), 2000);

    // Flush on connectivity regain
    window.addEventListener('online', () => this.processQueue());

    // Flush periodically
    this.timer = window.setInterval(() => this.processQueue(), 60_000);

    // Flush on app resume (mobile)
    if (Capacitor.isNativePlatform()) {
      App.addListener('appStateChange', ({ isActive }) => {
        if (isActive) this.processQueue();
      });
    }
  }

  async processQueue() {
    if (this.syncing) return;
    if (!navigator.onLine) {
      console.log('[SyncManager] Offline, skip processing');
      return;
    }

    this.syncing = true;
    try {
      const tasks = await offlineQueue.getAll();
      if (!tasks.length) return;

      console.log(`[SyncManager] Processing ${tasks.length} tasks`);
      for (const task of tasks) {
        const ok = await this.handleTask(task);
        if (ok) {
          await offlineQueue.remove(task.id);
        } else {
          // Exponential backoff handling can be added here
          task.tries += 1;
          await offlineQueue.update(task);
        }
      }
    } catch (e) {
      console.error('[SyncManager] Error processing queue', e);
    } finally {
      this.syncing = false;
    }
  }

  private async handleTask(task: OfflineTask): Promise<boolean> {
    try {
      switch (task.type) {
        case 'wellness_upsert':
          return await this.handleWellness(task);
        case 'steps_upsert':
          return await this.handleSteps(task);
        case 'meal_insert':
          return await this.handleMeal(task);
        default:
          console.warn('[SyncManager] Unknown task type', task.type);
          return true; // drop unknown
      }
    } catch (e) {
      console.error('[SyncManager] Task failed', task.type, e);
      return false;
    }
  }

  private async handleWellness(task: OfflineTask): Promise<boolean> {
    const { user_id, date, water_litres, surya_namaskar_count, meditation_completed, meditation_minutes = 0 } = task.payload;
    const { error, data } = await supabase
      .from('daily_wellness')
      .upsert({
        user_id,
        date,
        water_litres,
        surya_namaskar_count,
        meditation_completed,
        meditation_minutes,
      }, { onConflict: 'user_id,date' })
      .select()
      .single();

    if (error) throw error;

    localCache.setTodayWellness(user_id, date, {
      water_litres,
      surya_namaskar_count,
      meditation_completed,
      meditation_minutes,
    });

    console.log('[SyncManager] Wellness upserted', data?.id);
    return true;
  }

  private async handleSteps(task: OfflineTask): Promise<boolean> {
    const { user_id, date, steps } = task.payload;
    const { error } = await supabase
      .from('steps_tracking')
      .upsert({ user_id, date, steps_count: steps }, { onConflict: 'user_id,date' });
    if (error) throw error;
    localCache.setLocalSteps(user_id, date, steps);
    console.log('[SyncManager] Steps upserted', steps);
    return true;
  }

  private async handleMeal(task: OfflineTask): Promise<boolean> {
    const { user_id, date, meal_type, food_item } = task.payload;
    const { error } = await supabase
      .from('meal_tracking')
      .insert({ user_id, date, meal_type, food_item });
    if (error) throw error;

    localCache.removeOfflineMeal(user_id, date, meal_type);
    console.log('[SyncManager] Meal inserted', meal_type);
    return true;
  }
}

export const syncManager = new SyncManager();
