/**
 * Simple in-memory cache for database results
 * Reduces database load for frequently accessed data
 */
class DatabaseCache {
  private cache: Map<string, { data: any; timestamp: number; ttl: number }>;
  private defaultTTL: number = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.cache = new Map();
    
    // Clean up expired entries every minute
    setInterval(() => this.cleanup(), 60 * 1000);
  }

  /**
   * Get cached data
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    console.log(`📦 Cache hit: ${key}`);
    return entry.data as T;
  }

  /**
   * Set cached data
   */
  set(key: string, data: any, ttl: number = this.defaultTTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });

    console.log(`💾 Cache set: ${key} (TTL: ${ttl}ms)`);
  }

  /**
   * Delete cached data
   */
  delete(key: string): void {
    this.cache.delete(key);
    console.log(`🗑️ Cache deleted: ${key}`);
  }

  /**
   * Clear all cached data
   */
  clear(): void {
    this.cache.clear();
    console.log('🧹 Cache cleared');
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      console.log(`🧹 Cache cleanup: removed ${cleaned} expired entries`);
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    size: number;
    keys: string[];
    memoryUsage: number;
  } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
      memoryUsage: JSON.stringify(Array.from(this.cache.values())).length,
    };
  }
}

export const dbCache = new DatabaseCache();

/**
 * Cache decorator for repository methods
 */
export function cached(ttl: number = 5 * 60 * 1000) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const cacheKey = `${target.constructor.name}.${propertyName}:${JSON.stringify(args)}`;
      
      // Try to get from cache first
      const cached = dbCache.get(cacheKey);
      if (cached !== null) {
        return cached;
      }

      // Execute method and cache result
      const result = await method.apply(this, args);
      dbCache.set(cacheKey, result, ttl);
      
      return result;
    };
  };
}