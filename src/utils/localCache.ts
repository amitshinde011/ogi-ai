import { openDB, DBSchema } from 'idb';

export interface CachedWellness {
  water_litres: number;
  surya_namaskar_count: number;
  meditation_completed: boolean;
  meditation_minutes?: number;
}

interface LocalCacheDB extends DBSchema {
  wellness: {
    key: string; // `${userId}_${date}`
    value: {
      key: string;
      userId: string;
      date: string;
      data: CachedWellness & { timestamp: number };
    };
  };
  meals: {
    key: string; // `${userId}_${date}`
    value: {
      key: string;
      userId: string;
      date: string;
      meals: string[]; // unique meal types
      timestamp: number;
    };
  };
  steps: {
    key: string; // `${userId}_${date}`
    value: {
      key: string;
      userId: string;
      date: string;
      steps: number;
      timestamp: number;
    };
  };
}

const DB_NAME = 'local-cache-db';
const DB_VERSION = 1;

const dbPromise = openDB<LocalCacheDB>(DB_NAME, DB_VERSION, {
  upgrade(db) {
    if (!db.objectStoreNames.contains('wellness')) {
      db.createObjectStore('wellness');
    }
    if (!db.objectStoreNames.contains('meals')) {
      db.createObjectStore('meals');
    }
    if (!db.objectStoreNames.contains('steps')) {
      db.createObjectStore('steps');
    }
  },
});

const keyWellness = (userId: string, date: string) => `${userId}_${date}`;
const keyMeals = (userId: string, date: string) => `${userId}_${date}`;
const keySteps = (userId: string, date: string) => `${userId}_${date}`;

export const localCache = {
  async setTodayWellness(userId: string, date: string, data: CachedWellness, timestampOverride?: number) {
    const db = await dbPromise;
    const key = keyWellness(userId, date);
    const payload = {
      key,
      userId,
      date,
      data: {
        water_litres: data.water_litres ?? 0,
        surya_namaskar_count: data.surya_namaskar_count ?? 0,
        meditation_completed: !!data.meditation_completed,
        meditation_minutes: data.meditation_minutes ?? 0,
        timestamp: timestampOverride ?? Date.now(),
      },
    };
    await db.put('wellness', payload, key);
  },

  async getTodayWellness(userId: string, date: string): Promise<(CachedWellness & { timestamp?: number }) | null> {
    const db = await dbPromise;
    const key = keyWellness(userId, date);
    const rec = await db.get('wellness', key);
    return rec?.data || null;
  },

  async addOfflineMeal(userId: string, date: string, mealType: string) {
    const db = await dbPromise;
    const key = keyMeals(userId, date);
    const existing = (await db.get('meals', key)) || { key, userId, date, meals: [], timestamp: 0 };
    const meals = new Set(existing.meals || []);
    meals.add(mealType);
    await db.put('meals', { key, userId, date, meals: Array.from(meals), timestamp: Date.now() }, key);
  },

  async removeOfflineMeal(userId: string, date: string, mealType: string) {
    const db = await dbPromise;
    const key = keyMeals(userId, date);
    const existing = (await db.get('meals', key)) || { key, userId, date, meals: [], timestamp: 0 };
    const meals = (existing.meals || []).filter((m: string) => m !== mealType);
    await db.put('meals', { key, userId, date, meals, timestamp: Date.now() }, key);
  },

  async getOfflineMeals(userId: string, date: string): Promise<string[]> {
    const db = await dbPromise;
    const key = keyMeals(userId, date);
    const rec = await db.get('meals', key);
    return rec?.meals || [];
  },

  async clearOfflineMeals(userId: string, date: string) {
    const db = await dbPromise;
    const key = keyMeals(userId, date);
    await db.delete('meals', key);
  },

  async getLocalSteps(userId: string, date: string): Promise<number> {
    const db = await dbPromise;
    const key = keySteps(userId, date);
    const rec = await db.get('steps', key);
    return rec?.steps ?? 0;
  },

  async getLocalStepsMeta(userId: string, date: string): Promise<{ steps: number; timestamp: number }> {
    const db = await dbPromise;
    const key = keySteps(userId, date);
    const rec = await db.get('steps', key);
    return { steps: rec?.steps ?? 0, timestamp: rec?.timestamp ?? 0 };
  },

  async setLocalSteps(userId: string, date: string, steps: number) {
    const db = await dbPromise;
    const key = keySteps(userId, date);
    await db.put('steps', { key, userId, date, steps, timestamp: Date.now() }, key);
  },
};
