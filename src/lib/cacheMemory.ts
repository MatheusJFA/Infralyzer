interface CacheItem {
  data: any;
  expiry: number;
}
export const localCache = new Map<string, CacheItem>();
export const CACHE_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours
