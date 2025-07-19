import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.9'

// Optimized Supabase client with connection pooling and caching
class OptimizedSupabaseClient {
  private static instance: OptimizedSupabaseClient;
  private client: any;
  private cache: Map<string, { data: any, timestamp: number }> = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  private constructor() {
    this.client = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
  }

  public static getInstance(): OptimizedSupabaseClient {
    if (!OptimizedSupabaseClient.instance) {
      OptimizedSupabaseClient.instance = new OptimizedSupabaseClient();
    }
    return OptimizedSupabaseClient.instance;
  }

  public get supabase() {
    return this.client;
  }

  // Cached query for frequently accessed data
  async cachedQuery(cacheKey: string, queryFn: () => Promise<any>): Promise<any> {
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      console.log(`📦 Cache hit for ${cacheKey}`);
      return cached.data;
    }

    console.log(`🔄 Cache miss for ${cacheKey}, executing query`);
    const result = await queryFn();
    this.cache.set(cacheKey, { data: result, timestamp: Date.now() });
    return result;
  }

  // Batch insert with automatic chunking and deadlock retry
  async batchInsert(table: string, records: any[], chunkSize = 25): Promise<any[]> {
    const chunks = [];
    for (let i = 0; i < records.length; i += chunkSize) {
      chunks.push(records.slice(i, i + chunkSize));
    }

    // Add smaller random delay to spread out operations
    await new Promise(resolve => setTimeout(resolve, Math.random() * 500));

    const results = await Promise.allSettled(
      chunks.map(async (chunk, index) => {
        // Add smaller delay between chunks
        await new Promise(resolve => setTimeout(resolve, index * 50 + Math.random() * 100));
        
        return await this.retryOnDeadlock(async () => {
          return await this.client.from(table).insert(chunk);
        });
      })
    );

    const successful = results.filter(r => r.status === 'fulfilled' && !r.value.error).length;
    const failed = results.filter(r => r.status === 'rejected' || (r.status === 'fulfilled' && r.value.error)).length;
    
    // Log any errors for debugging
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        console.error(`❌ Chunk ${index} rejected:`, result.reason);
      } else if (result.value.error) {
        console.error(`❌ Chunk ${index} error:`, result.value.error);
      }
    });
    
    console.log(`📊 Batch insert results: ${successful} chunks succeeded, ${failed} failed`);
    return results;
  }

  // Retry logic for deadlock handling
  private async retryOnDeadlock<T>(operation: () => Promise<T>, maxRetries = 3): Promise<T> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error: any) {
        const isDeadlock = error?.code === '40P01' || error?.message?.includes('deadlock');
        
        if (isDeadlock && attempt < maxRetries) {
          // Exponential backoff with jitter
          const delay = Math.min(1000 * Math.pow(2, attempt - 1) + Math.random() * 1000, 5000);
          console.log(`🔄 Deadlock detected, retrying in ${delay}ms (attempt ${attempt}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        
        throw error;
      }
    }
    
    throw new Error('Max retries exceeded');
  }

  // Batch update with automatic chunking
  async batchUpdate(table: string, updates: { filter: any, data: any }[], chunkSize = 50): Promise<any[]> {
    const chunks = [];
    for (let i = 0; i < updates.length; i += chunkSize) {
      chunks.push(updates.slice(i, i + chunkSize));
    }

    const results = await Promise.allSettled(
      chunks.map(chunk => 
        Promise.all(chunk.map(update => 
          this.client.from(table).update(update.data).match(update.filter)
        ))
      )
    );

    return results;
  }

  // Batch delete with automatic chunking
  async batchDelete(table: string, filters: any[], chunkSize = 50): Promise<any[]> {
    const chunks = [];
    for (let i = 0; i < filters.length; i += chunkSize) {
      chunks.push(filters.slice(i, i + chunkSize));
    }

    const results = await Promise.allSettled(
      chunks.map(chunk => 
        Promise.all(chunk.map(filter => 
          this.client.from(table).delete().match(filter)
        ))
      )
    );

    return results;
  }

  // Parallel query execution
  async parallelQueries(queries: (() => Promise<any>)[]): Promise<any[]> {
    return await Promise.allSettled(queries.map(query => query()));
  }

  // Clear cache
  clearCache(): void {
    this.cache.clear();
  }

  // Get cache stats
  getCacheStats(): { size: number, keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

export const optimizedSupabase = OptimizedSupabaseClient.getInstance();