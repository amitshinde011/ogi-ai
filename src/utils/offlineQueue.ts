import { openDB, DBSchema } from 'idb';

export type QueueTaskType = 'wellness_upsert' | 'steps_upsert' | 'meal_insert';

export interface OfflineTask {
  id: string;
  type: QueueTaskType;
  payload: Record<string, any>;
  createdAt: number;
  tries: number;
}

interface OfflineQueueDB extends DBSchema {
  queue: {
    key: string;
    value: OfflineTask;
    indexes: { 'by-createdAt': number };
  };
}

const DB_NAME = 'offline-queue-db';
const STORE_NAME = 'queue';

const dbPromise = openDB<OfflineQueueDB>(DB_NAME, 1, {
  upgrade(db) {
    if (!db.objectStoreNames.contains(STORE_NAME)) {
      const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      store.createIndex('by-createdAt', 'createdAt');
    }
  },
});

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export const offlineQueue = {
  async enqueue(type: QueueTaskType, payload: Record<string, any>) {
    const task: OfflineTask = {
      id: uid(),
      type,
      payload,
      createdAt: Date.now(),
      tries: 0,
    };
    const db = await dbPromise;
    await db.put(STORE_NAME, task);
    console.log(`[offlineQueue] Enqueued ${type}`, payload);
    return task.id;
  },

  async getAll(): Promise<OfflineTask[]> {
    const db = await dbPromise;
    const tx = db.transaction(STORE_NAME);
    const index = tx.store.index('by-createdAt');
    const tasks = await index.getAll();
    return tasks.sort((a, b) => a.createdAt - b.createdAt);
  },

  async remove(id: string) {
    const db = await dbPromise;
    await db.delete(STORE_NAME, id);
  },

  async update(task: OfflineTask) {
    const db = await dbPromise;
    await db.put(STORE_NAME, task);
  },

  async clear() {
    const db = await dbPromise;
    await db.clear(STORE_NAME);
  },
};
