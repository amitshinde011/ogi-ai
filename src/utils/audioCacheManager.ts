
import { openDB, DBSchema } from 'idb';

interface AudioCacheDB extends DBSchema {
  audioCache: {
    key: string;
    value: {
      id: string;
      blob: Blob;
      timestamp: number;
    };
  };
}

const DB_NAME = 'dhatu-audio-cache';
const DB_VERSION = 1;
const STORE_NAME = 'audioCache';
const CACHE_KEY = 'meditation-audio';

class AudioCacheManager {
  private dbPromise;

  constructor() {
    this.dbPromise = openDB<AudioCacheDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      },
    });
  }

  async getCachedAudio(): Promise<string | null> {
    try {
      const db = await this.dbPromise;
      const cached = await db.get(STORE_NAME, CACHE_KEY);
      
      if (cached) {
        const today = new Date().toDateString();
        const cachedDate = new Date(cached.timestamp).toDateString();
        
        if (today === cachedDate) {
          console.log('Found valid cached audio in IndexedDB');
          return URL.createObjectURL(cached.blob);
        } else {
          console.log('Cached audio expired, clearing cache');
          await this.clearCache();
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error accessing IndexedDB cache:', error);
      await this.clearCache();
      return null;
    }
  }

  async setCachedAudio(audioBlob: Blob): Promise<void> {
    try {
      const db = await this.dbPromise;
      await db.put(STORE_NAME, {
        id: CACHE_KEY,
        blob: audioBlob,
        timestamp: Date.now(),
      });
      console.log('Audio cached successfully in IndexedDB');
    } catch (error) {
      console.warn('Failed to cache audio in IndexedDB:', error);
    }
  }

  async clearCache(): Promise<void> {
    try {
      const db = await this.dbPromise;
      await db.delete(STORE_NAME, CACHE_KEY);
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }
}

export const audioCacheManager = new AudioCacheManager();
