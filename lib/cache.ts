// Cache utility - Redis-ready implementation
// For now, uses in-memory cache, but can be easily swapped for Redis

interface CacheEntry<T> {
  value: T
  expiresAt: number
}

class MemoryCache {
  private cache: Map<string, CacheEntry<any>> = new Map()

  set<T>(key: string, value: T, ttlSeconds: number): void {
    const expiresAt = Date.now() + ttlSeconds * 1000
    this.cache.set(key, { value, expiresAt })
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    if (!entry) return null

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key)
      return null
    }

    return entry.value as T
  }

  delete(key: string): void {
    this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  // Clean expired entries periodically
  cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key)
      }
    }
  }
}

// Singleton instance
const memoryCache = new MemoryCache()

// Cleanup expired entries every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    memoryCache.cleanup()
  }, 5 * 60 * 1000)
}

// Cache key generators
export const CacheKeys = {
  userSession: (userId: string) => `session:${userId}`,
  calculation: (projectId: string, type: string, month?: string) =>
    `calc:${projectId}:${type}${month ? `:${month}` : ""}`,
  report: (projectId: string, type: string) => `report:${projectId}:${type}`,
  equipment: (projectId: string) => `equipment:${projectId}`,
  project: (projectId: string) => `project:${projectId}`,
}

// Cache TTLs (in seconds)
export const CacheTTL = {
  SESSION: 24 * 60 * 60, // 24 hours
  CALCULATION: 60 * 60, // 1 hour
  REPORT: 4 * 60 * 60, // 4 hours
  EQUIPMENT: 30 * 60, // 30 minutes
  PROJECT: 10 * 60, // 10 minutes
}

export const cache = {
  get: <T>(key: string): T | null => {
    // In production, this would use Redis
    // For now, use memory cache
    return memoryCache.get<T>(key)
  },

  set: <T>(key: string, value: T, ttl: number = CacheTTL.CALCULATION): void => {
    memoryCache.set(key, value, ttl)
  },

  delete: (key: string): void => {
    memoryCache.delete(key)
  },

  deletePattern: (pattern: string): void => {
    // In Redis: KEYS pattern | DEL
    // For memory cache, iterate and delete matching keys
    const regex = new RegExp(pattern.replace("*", ".*"))
    for (const key of memoryCache["cache"].keys()) {
      if (regex.test(key)) {
        memoryCache.delete(key)
      }
    }
  },

  clear: (): void => {
    memoryCache.clear()
  },
}

// Helper to invalidate project-related cache
export function invalidateProjectCache(projectId: string): void {
  cache.deletePattern(`*:${projectId}*`)
  cache.delete(CacheKeys.project(projectId))
  cache.delete(CacheKeys.equipment(projectId))
  cache.deletePattern(`calc:${projectId}*`)
  cache.deletePattern(`report:${projectId}*`)
}
