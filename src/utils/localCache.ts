export interface CachedWellness {
  water_litres: number;
  surya_namaskar_count: number;
  meditation_completed: boolean;
  meditation_minutes?: number;
}

const safeParse = <T>(str: string | null): T | null => {
  if (!str) return null;
  try { return JSON.parse(str) as T; } catch { return null; }
};

const keyWellness = (userId: string, date: string) => `wellness_${userId}_${date}`;
const keyMeals = (userId: string, date: string) => `offline_meals_${userId}_${date}`;
const keySteps = (userId: string, date: string) => `steps_${userId}_${date}`;

export const localCache = {
  setTodayWellness(userId: string, date: string, data: CachedWellness) {
    const payload = {
      water_litres: data.water_litres ?? 0,
      surya_namaskar_count: data.surya_namaskar_count ?? 0,
      meditation_completed: !!data.meditation_completed,
      meditation_minutes: data.meditation_minutes ?? 0,
      timestamp: Date.now(),
    };
    localStorage.setItem(keyWellness(userId, date), JSON.stringify(payload));
  },
  getTodayWellness(userId: string, date: string): (CachedWellness & { timestamp?: number }) | null {
    return safeParse(localStorage.getItem(keyWellness(userId, date)));
  },

  addOfflineMeal(userId: string, date: string, mealType: string) {
    const current = safeParse<string[]>(localStorage.getItem(keyMeals(userId, date))) || [];
    if (!current.includes(mealType)) current.push(mealType);
    localStorage.setItem(keyMeals(userId, date), JSON.stringify(current));
  },
  removeOfflineMeal(userId: string, date: string, mealType: string) {
    const current = safeParse<string[]>(localStorage.getItem(keyMeals(userId, date))) || [];
    const next = current.filter(m => m !== mealType);
    localStorage.setItem(keyMeals(userId, date), JSON.stringify(next));
  },
  getOfflineMeals(userId: string, date: string): string[] {
    return safeParse<string[]>(localStorage.getItem(keyMeals(userId, date))) || [];
  },
  clearOfflineMeals(userId: string, date: string) {
    localStorage.removeItem(keyMeals(userId, date));
  },

  getLocalSteps(userId: string, date: string): number {
    const data = safeParse<{ steps: number }>(localStorage.getItem(keySteps(userId, date)));
    return data?.steps ?? 0;
  },
  setLocalSteps(userId: string, date: string, steps: number) {
    localStorage.setItem(keySteps(userId, date), JSON.stringify({ steps, timestamp: Date.now() }));
  }
};
